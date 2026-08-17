from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel


class ProductRead(BaseModel):
    id: int
    product_name: str
    category: str
    image: Optional[str] = None
    price: Decimal
    stock: int
    status: str

    class Config:
        from_attributes = True


class ProductUpdate(BaseModel):
    product_name: str
    price: Decimal
    stock: int
    status: str


class ProductStats(BaseModel):
    total_products: int
    total_stock: int
    low_stock: int  


class PaginatedProducts(BaseModel):
    items: List[ProductRead]
    page: int
    limit: int
    total_products: int
    total_pages: int