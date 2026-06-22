from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
from .models import OrderStatus


class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    quantity: int
    description: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    description: Optional[str] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: OrderStatus
    total_amount: float
    created_at: datetime
    customer: Optional[CustomerResponse] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: List[ProductResponse]
    inventory_value: float = 0.0
    total_revenue: float = 0.0


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
