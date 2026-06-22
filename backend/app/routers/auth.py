from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, Token, UserResponse
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.secret_key, algorithm=settings.algorithm)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
