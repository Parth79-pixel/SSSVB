from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_revenue: Decimal       
    pending_amount: Decimal      
    total_invoices: int
    low_stock_count: int


class RecentInvoice(BaseModel):
    id: int
    customer_name: str
    final_amount: Decimal
    balance_due: Decimal
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MonthlySalesPoint(BaseModel):
    month: str   # e.g. "Jan"
    total: Decimal