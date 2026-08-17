from typing import List
from decimal import Decimal
from pydantic import BaseModel


class ReportsSummary(BaseModel):
    total_revenue: Decimal      
    total_invoices: int
    total_paid: Decimal         
    pending_amount: Decimal     
    this_month_revenue: Decimal
    growth_percent: float       


class DailyRevenuePoint(BaseModel):
    label: str    # e.g. "Mon"
    total: Decimal


class TopProduct(BaseModel):
    product_name: str
    total_qty: int