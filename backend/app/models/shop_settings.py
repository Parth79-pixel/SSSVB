from typing import Optional
from decimal import Decimal
from sqlmodel import SQLModel, Field


class ShopSettings(SQLModel, table=True):
    __tablename__ = "settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    shop_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    invoice_prefix: str = Field(default="INV-")
    tax_percent: Decimal = Field(default=0, max_digits=5, decimal_places=2)