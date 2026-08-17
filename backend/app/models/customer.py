from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class Customer(SQLModel, table=True):
    __tablename__ = "customers"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str
    mobile: str
    email: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)