from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Product, Customer, Order
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock_products = db.query(Product).filter(Product.quantity <= LOW_STOCK_THRESHOLD).all()

    inventory_value = db.query(
        func.coalesce(func.sum(Product.price * Product.quantity), 0.0)
    ).scalar()

    total_revenue = db.query(
        func.coalesce(func.sum(Order.total_amount), 0.0)
    ).scalar()

    return DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
        inventory_value=round(float(inventory_value), 2),
        total_revenue=round(float(total_revenue), 2),
    )
