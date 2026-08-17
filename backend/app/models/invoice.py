from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship


class Invoice(SQLModel, table=True):
    __tablename__ = "invoices"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id")
    customer_name: str  
    customer_mobile: str
    subtotal: Decimal = Field(max_digits=10, decimal_places=2)
    discount: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    final_amount: Decimal = Field(max_digits=10, decimal_places=2)
    amount_paid: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    balance_due: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    status: str = Field(default="Paid")  
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    items: List["InvoiceItem"] = Relationship(back_populates="invoice")


class InvoiceItem(SQLModel, table=True):
    __tablename__ = "invoice_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    invoice_id: int = Field(foreign_key="invoices.id")
    product_id: int = Field(foreign_key="products.id")
    product_name: str  # denormalized snapshot at time of billing
    price_per_unit: Decimal = Field(max_digits=10, decimal_places=2)
    quantity: int
    item_total: Decimal = Field(max_digits=10, decimal_places=2)

    invoice: Optional[Invoice] = Relationship(back_populates="items")