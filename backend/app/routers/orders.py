from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Order, OrderItem, Product, Customer, OrderStatus
from ..schemas import OrderCreate, OrderResponse


class OrderStatusUpdate(BaseModel):
    status: OrderStatus

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_data.customer_id} not found"
        )

    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    # Validate stock before making any changes
    products_to_update = []
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        products_to_update.append((product, item.quantity))

    # Calculate total and create order
    total_amount = sum(product.price * qty for product, qty in products_to_update)

    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()

    # Create order items and reduce stock
    for (product, quantity), item in zip(products_to_update, order_data.items):
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=quantity,
            unit_price=product.price
        )
        db.add(order_item)
        product.quantity -= quantity

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, body: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    order.status = body.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    # Restore stock when cancelling
    for item in order.items:
        item.product.quantity += item.quantity

    db.delete(order)
    db.commit()
