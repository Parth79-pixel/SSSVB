from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class CustomerCreate(BaseModel):
    customer_name: str
    mobile: str
    email: Optional[str] = None


class CustomerUpdate(BaseModel):
    customer_name: str
    mobile: str
    email: Optional[str] = None


class CustomerRead(BaseModel):
    id: int
    customer_name: str
    mobile: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True