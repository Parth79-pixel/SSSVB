import csv
import io
from datetime import date, datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlmodel import select

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.customer import Customer
from app.models.product import Product
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceRead,
    InvoiceSummary,
    InvoiceListItem,
    InvoiceCreateResponse,
)

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("/export")
def export_invoices(
    session: SessionDep,
    current_user: CurrentUserDep,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
):
    query = select(Invoice)
    if from_date and to_date:
        query = query.where(
            Invoice.created_at >= datetime.combine(from_date, datetime.min.time()),
            Invoice.created_at <= datetime.combine(to_date, datetime.max.time()),
        )
    query = query.order_by(Invoice.id.desc())
    invoices = session.exec(query).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Invoice ID", "Customer Name", "Mobile", "Amount (INR)", "Status", "Date"])
    for inv in invoices:
        writer.writerow([
            f"#{inv.id}",
            inv.customer_name,
            inv.customer_mobile,
            str(inv.final_amount),
            inv.status,
            inv.created_at.strftime("%d %b %Y") if inv.created_at else "",
        ])
    buffer.seek(0)

    filename = f"Invoices_Export_{datetime.now().strftime('%Y-%m-%d_%H-%M')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("", response_model=List[InvoiceListItem])
def list_invoices(
    session: SessionDep,
    current_user: CurrentUserDep,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
):
    query = select(Invoice)
    if from_date and to_date:
        query = query.where(
            Invoice.created_at >= datetime.combine(from_date, datetime.min.time()),
            Invoice.created_at <= datetime.combine(to_date, datetime.max.time()),
        )
    query = query.order_by(Invoice.id.desc())
    invoices = session.exec(query).all()
    return invoices


@router.get("/{invoice_id}/summary", response_model=InvoiceSummary)
def get_invoice_summary(invoice_id: int, session: SessionDep, current_user: CurrentUserDep):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(invoice_id: int, session: SessionDep, current_user: CurrentUserDep):
    """Equivalent to view_invoice.php's data-fetching (invoice + items),
    used both by the Angular print view and any full-detail lookups."""
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    _ = invoice.items
    return invoice


@router.post("", response_model=InvoiceCreateResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, session: SessionDep, current_user: CurrentUserDep):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Please add at least one product.")

    customer = session.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    try:
        subtotal = sum(item.price * item.qty for item in payload.items)
        final_amount = subtotal - payload.discount

        invoice = Invoice(
            customer_id=customer.id,
            customer_name=customer.customer_name,
            customer_mobile=customer.mobile,
            subtotal=subtotal,
            discount=payload.discount,
            final_amount=final_amount,
            amount_paid=payload.amount_paid,
            balance_due=payload.balance_due,
            status=payload.status,
        )
        session.add(invoice)
        session.flush()  

        for item in payload.items:
            product = session.get(Product, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found.")

            item_total = item.price * item.qty
            invoice_item = InvoiceItem(
                invoice_id=invoice.id,
                product_id=product.id,
                product_name=product.product_name,
                price_per_unit=item.price,
                quantity=item.qty,
                item_total=item_total,
            )
            session.add(invoice_item)
            product.stock -= item.qty
            session.add(product)

        session.commit()
        session.refresh(invoice)
        return InvoiceCreateResponse(success=True, invoice_id=invoice.id)

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        return InvoiceCreateResponse(success=False, message=str(e))


@router.put("/{invoice_id}", response_model=InvoiceRead)
def update_invoice(
    invoice_id: int, payload: InvoiceUpdate, session: SessionDep, current_user: CurrentUserDep
):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    invoice.customer_name = payload.customer_name
    invoice.customer_mobile = payload.customer_mobile
    invoice.status = payload.status
    invoice.amount_paid = payload.amount_paid
    invoice.balance_due = payload.balance_due

    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, session: SessionDep, current_user: CurrentUserDep):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    try:
        items = session.exec(
            select(InvoiceItem).where(InvoiceItem.invoice_id == invoice_id)
        ).all()

        for item in items:
            product = session.get(Product, item.product_id)
            if product:
                product.stock += item.quantity
                session.add(product)

        for item in items:
            session.delete(item)

        session.delete(invoice)
        session.commit()
        return {"success": True}

    except Exception as e:
        session.rollback()
        return {"success": False, "message": str(e)}