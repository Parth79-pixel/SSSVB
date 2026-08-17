from typing import List
from decimal import Decimal

from fastapi import APIRouter
from sqlmodel import select, func

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.invoice import Invoice
from app.models.product import Product
from app.schemas.dashboard import DashboardStats, RecentInvoice, MonthlySalesPoint

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 5


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(session: SessionDep, current_user: CurrentUserDep):
    total_revenue = session.exec(
        select(func.coalesce(func.sum(Invoice.amount_paid), 0)).where(Invoice.status != "Cancelled")
    ).one()

    pending_amount = session.exec(
        select(func.coalesce(func.sum(Invoice.balance_due), 0)).where(Invoice.status == "Unpaid")
    ).one()

    total_invoices = session.exec(select(func.count(Invoice.id))).one()

    low_stock_count = session.exec(
        select(func.count(Product.id)).where(Product.stock < LOW_STOCK_THRESHOLD)
    ).one()

    return DashboardStats(
        total_revenue=Decimal(total_revenue),
        pending_amount=Decimal(pending_amount),
        total_invoices=total_invoices,
        low_stock_count=low_stock_count,
    )


@router.get("/recent-invoices", response_model=List[RecentInvoice])
def get_recent_invoices(session: SessionDep, current_user: CurrentUserDep):
    invoices = session.exec(select(Invoice).order_by(Invoice.id.desc()).limit(5)).all()
    return invoices


@router.get("/monthly-sales", response_model=List[MonthlySalesPoint])
def get_monthly_sales(session: SessionDep, current_user: CurrentUserDep):
    rows = session.exec(
        select(
            func.date_format(Invoice.created_at, "%b").label("month"),
            func.sum(Invoice.amount_paid).label("total"),
        )
        .where(Invoice.status != "Cancelled")
        .group_by(func.date_format(Invoice.created_at, "%b"))
        .order_by(func.max(Invoice.created_at).asc())
        .limit(6)
    ).all()

    return [MonthlySalesPoint(month=row[0], total=Decimal(row[1])) for row in rows]