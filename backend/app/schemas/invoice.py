from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class InvoiceItemIn(BaseModel):
    product_id: int
    qty: int
    price: Decimal


class InvoiceCreate(BaseModel):
    customer_id: int
    status: str = "Paid"
    discount: Decimal = Decimal("0")
    amount_paid: Decimal = Decimal("0")
    balance_due: Decimal = Decimal("0")
    items: List[InvoiceItemIn]


class InvoiceUpdate(BaseModel):
    customer_name: str
    customer_mobile: str
    status: str
    amount_paid: Decimal = Decimal("0")
    balance_due: Decimal = Decimal("0")


class InvoiceItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    price_per_unit: Decimal
    quantity: int
    item_total: Decimal

    class Config:
        from_attributes = True


class InvoiceRead(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_mobile: str
    subtotal: Decimal
    discount: Decimal
    final_amount: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    status: str
    created_at: Optional[datetime] = None
    items: List[InvoiceItemRead] = []

    class Config:
        from_attributes = True


class InvoiceSummary(BaseModel):
    customer_name: str
    customer_mobile: str
    status: str
    final_amount: Decimal
    amount_paid: Decimal
    balance_due: Decimal


class InvoiceListItem(BaseModel):
    id: int
    customer_name: str
    customer_mobile: str
    final_amount: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceCreateResponse(BaseModel):
    success: bool
    invoice_id: Optional[int] = None
    message: Optional[str] = None