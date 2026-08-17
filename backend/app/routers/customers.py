from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select, func

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.customer import Customer
from app.models.invoice import Invoice
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerRead
from app.schemas.customer_stats import CustomerStats

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/stats", response_model=CustomerStats)
def get_customer_stats(session: SessionDep, current_user: CurrentUserDep):
    total_customers = session.exec(select(func.count(Customer.id))).one()

    top_row = session.exec(
        select(Customer.customer_name, func.sum(Invoice.final_amount).label("spent"))
        .join(Invoice, Invoice.customer_id == Customer.id)
        .group_by(Customer.id)
        .order_by(func.sum(Invoice.final_amount).desc())
        .limit(1)
    ).first()

    if top_row:
        return CustomerStats(
            total_customers=total_customers,
            top_spender_name=top_row[0],
            top_spender_amount=float(top_row[1]) if top_row[1] is not None else 0.0,
        )
    return CustomerStats(total_customers=total_customers)


@router.get("", response_model=List[CustomerRead])
def list_customers(session: SessionDep, current_user: CurrentUserDep):
    customers = session.exec(select(Customer).order_by(Customer.id.desc())).all()
    return customers


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, session: SessionDep, current_user: CurrentUserDep):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, session: SessionDep, current_user: CurrentUserDep):
    customer = Customer(**payload.model_dump())
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int, payload: CustomerUpdate, session: SessionDep, current_user: CurrentUserDep
):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    for field, value in payload.model_dump().items():
        setattr(customer, field, value)

    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, session: SessionDep, current_user: CurrentUserDep):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    session.delete(customer)
    session.commit()
    return {"success": True}