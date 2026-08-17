from typing import Optional
from decimal import Decimal
from pydantic import BaseModel


class ShopSettingsRead(BaseModel):
    id: int
    shop_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    invoice_prefix: str
    tax_percent: Decimal

    class Config:
        from_attributes = True


class ShopSettingsUpdate(BaseModel):
    shop_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    invoice_prefix: str
    tax_percent: Decimal