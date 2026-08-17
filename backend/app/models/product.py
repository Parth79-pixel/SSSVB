from typing import Optional
from decimal import Decimal
from sqlmodel import SQLModel, Field


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_name: str
    category: str  
    image: Optional[str] = None  
    price: Decimal = Field(max_digits=10, decimal_places=2)
    stock: int
    status: str = Field(default="active")  