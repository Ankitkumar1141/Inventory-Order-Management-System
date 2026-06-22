from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel, field_validator
from ..database import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductUpdate, ProductResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["Products"], dependencies=[Depends(get_current_user)])


class StockAdjustment(BaseModel):
    quantity: int

    @field_validator("quantity")
    @classmethod
    def must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == product.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product with SKU '{product.sku}' already exists")
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product)
    if search:
        q = q.filter(or_(Product.name.ilike(f"%{search}%"), Product.sku.ilike(f"%{search}%")))
    if low_stock is True:
        q = q.filter(Product.quantity <= 10)
    return q.offset(skip).limit(limit).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    if product_update.sku and product_update.sku != product.sku:
        existing = db.query(Product).filter(Product.sku == product_update.sku).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product with SKU '{product_update.sku}' already exists")
    for field, value in product_update.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_stock(product_id: int, body: StockAdjustment, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    product.quantity = body.quantity
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {product_id} not found")
    db.delete(product)
    db.commit()
