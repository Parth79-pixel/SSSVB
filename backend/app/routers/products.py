import math
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from sqlmodel import select, func

from app.core.dependencies import SessionDep, CurrentUserDep
from app.models.product import Product
from app.schemas.product import ProductRead, ProductUpdate, ProductStats, PaginatedProducts
from app.utils.file_upload import save_product_image, delete_product_image

router = APIRouter(prefix="/products", tags=["products"])

LOW_STOCK_THRESHOLD = 5


@router.get("/stats", response_model=ProductStats)
def get_product_stats(session: SessionDep, current_user: CurrentUserDep):
    total_products = session.exec(select(func.count(Product.id))).one()
    total_stock = session.exec(select(func.coalesce(func.sum(Product.stock), 0))).one()
    low_stock = session.exec(
        select(func.count(Product.id)).where(Product.stock < LOW_STOCK_THRESHOLD)
    ).one()

    return ProductStats(
        total_products=total_products,
        total_stock=int(total_stock),
        low_stock=low_stock,
    )


@router.get("/search", response_model=list[ProductRead])
def search_products(keyword: str, session: SessionDep, current_user: CurrentUserDep):
    pattern = f"%{keyword}%"
    products = session.exec(
        select(Product)
        .where((Product.product_name.like(pattern)) | (Product.category.like(pattern)))
        .order_by(Product.id.desc())
    ).all()
    return products


@router.get("", response_model=PaginatedProducts)
def list_products(
    session: SessionDep,
    current_user: CurrentUserDep,
    page: int = 1,
    limit: int = 10,
):
    if page < 1:
        page = 1

    total_products = session.exec(select(func.count(Product.id))).one()
    total_pages = math.ceil(total_products / limit) if total_products else 0
    offset = (page - 1) * limit

    products = session.exec(
        select(Product).order_by(Product.id.desc()).limit(limit).offset(offset)
    ).all()

    return PaginatedProducts(
        items=products,
        page=page,
        limit=limit,
        total_products=total_products,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: SessionDep, current_user: CurrentUserDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    session: SessionDep,
    current_user: CurrentUserDep,
    product_name: str = Form(...),
    category: str = Form(...),
    price: Decimal = Form(...),
    stock: int = Form(...),
    status_: str = Form("active", alias="status"),
    image: Optional[UploadFile] = File(None),
):
    image_filename = None
    if image is not None and image.filename:
        image_filename = save_product_image(image)

    product = Product(
        product_name=product_name,
        category=category,
        image=image_filename,
        price=price,
        stock=stock,
        status=status_,
    )
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int, payload: ProductUpdate, session: SessionDep, current_user: CurrentUserDep
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.product_name = payload.product_name
    product.price = payload.price
    product.stock = payload.stock
    product.status = payload.status

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, session: SessionDep, current_user: CurrentUserDep):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    stock = product.stock
    delete_product_image(product.image)

    session.delete(product)
    session.commit()
    return {"success": True, "stock": stock}