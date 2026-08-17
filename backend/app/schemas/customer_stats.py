from typing import Optional
from pydantic import BaseModel


class CustomerStats(BaseModel):
    total_customers: int
    top_spender_name: Optional[str] = None
    top_spender_amount: Optional[float] = None