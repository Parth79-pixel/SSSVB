from typing import List
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter
from sqlmodel import select, func

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.reports import ReportsSummary, DailyRevenuePoint, TopProduct

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=ReportsSummary)
def get_reports_summary(session: SessionDep, current_user: CurrentUserDep):
    total_revenue = session.exec(
        select(func.coalesce(func.sum(Invoice.final_amount), 0)).where(Invoice.status != "Cancelled")
    ).one()
    total_invoices = session.exec(select(func.count(Invoice.id))).one()
    total_paid = session.exec(
        select(func.coalesce(func.sum(Invoice.amount_paid), 0)).where(Invoice.status != "Cancelled")
    ).one()
    pending_amount = session.exec(
        select(func.coalesce(func.sum(Invoice.balance_due), 0)).where(Invoice.status != "Cancelled")
    ).one()

    today = date.today()
    this_month_start = today.replace(day=1)

    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    this_month = session.exec(
        select(func.coalesce(func.sum(Invoice.final_amount), 0)).where(
            func.date(Invoice.created_at) >= this_month_start,
            func.date(Invoice.created_at) <= today,
            Invoice.status != "Cancelled",
        )
    ).one()

    last_month = session.exec(
        select(func.coalesce(func.sum(Invoice.final_amount), 0)).where(
            func.date(Invoice.created_at) >= last_month_start,
            func.date(Invoice.created_at) <= last_month_end,
            Invoice.status != "Cancelled",
        )
    ).one()

    growth = float((this_month - last_month) / last_month * 100) if last_month else 0.0

    return ReportsSummary(
        total_revenue=Decimal(total_revenue),
        total_invoices=total_invoices,
        total_paid=Decimal(total_paid),
        pending_amount=Decimal(pending_amount),
        this_month_revenue=Decimal(this_month),
        growth_percent=round(growth, 1),
    )


@router.get("/weekly-revenue", response_model=List[DailyRevenuePoint])
def get_weekly_revenue(session: SessionDep, current_user: CurrentUserDep):
    seven_days_ago = date.today() - timedelta(days=6)

    rows = session.exec(
        select(func.date(Invoice.created_at).label("d"), func.sum(Invoice.final_amount).label("t"))
        .where(Invoice.status != "Cancelled", func.date(Invoice.created_at) >= seven_days_ago)
        .group_by(func.date(Invoice.created_at))
    ).all()

    totals_by_date = {row[0]: float(row[1]) for row in rows}

    result = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        result.append(DailyRevenuePoint(label=d.strftime("%a"), total=Decimal(totals_by_date.get(d, 0))))
    return result


@router.get("/top-products", response_model=List[TopProduct])
def get_top_products(session: SessionDep, current_user: CurrentUserDep):
    rows = session.exec(
        select(InvoiceItem.product_name, func.sum(InvoiceItem.quantity).label("total_qty"))
        .group_by(InvoiceItem.product_id, InvoiceItem.product_name)
        .order_by(func.sum(InvoiceItem.quantity).desc())
        .limit(5)
    ).all()
    return [TopProduct(product_name=row[0], total_qty=int(row[1])) for row in rows]