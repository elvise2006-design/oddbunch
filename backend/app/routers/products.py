"""Product browsing endpoints: list, filter, search, sort, single fetch."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, asc, case, desc, func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Category, Product
from app.schemas import ProductOut

router = APIRouter(tags=["products"])

SortOption = Literal[
    "price_asc", "price_desc", "name_asc", "name_desc", "newest", "rarity", "featured"
]

# Rarity must rank, not alphabetise: otherwise "Legendary" would sort before "Rare".
_RARITY_RANK = case(
    (Product.rarity == "Common", 1),
    (Product.rarity == "Rare", 2),
    (Product.rarity == "Legendary", 3),
    else_=0,
)


def _apply_sort(stmt: Select, sort: SortOption) -> Select:
    if sort == "price_asc":
        return stmt.order_by(asc(Product.price))
    if sort == "price_desc":
        return stmt.order_by(desc(Product.price))
    if sort == "name_asc":
        return stmt.order_by(asc(Product.name))
    if sort == "name_desc":
        return stmt.order_by(desc(Product.name))
    if sort == "newest":
        return stmt.order_by(desc(Product.created_at), desc(Product.id))
    if sort == "rarity":
        # Products with no rarity (kids/normal) sink to the bottom via else_=0.
        return stmt.order_by(desc(_RARITY_RANK), asc(Product.name))
    if sort == "featured":
        return stmt.order_by(desc(Product.is_featured), asc(Product.name))
    return stmt.order_by(asc(Product.name))


@router.get("/products", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    category: Category | None = Query(default=None, description="kids | normal | collector"),
    fruit_type: str | None = Query(default=None, description="e.g. apple, orange, grape"),
    search: str | None = Query(default=None, min_length=1, max_length=80),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    featured: bool | None = Query(default=None),
    sort: SortOption = Query(default="featured"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    stmt = select(Product)

    if category is not None:
        stmt = stmt.where(Product.category == category.value)
    if fruit_type:
        stmt = stmt.where(Product.fruit_type == fruit_type.lower())
    if featured is not None:
        stmt = stmt.where(Product.is_featured.is_(featured))
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if search:
        needle = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Product.name).like(needle),
                func.lower(Product.description).like(needle),
                func.lower(Product.fruit_type).like(needle),
            )
        )

    return db.scalars(_apply_sort(stmt, sort).limit(limit).offset(offset)).all()


@router.get("/products/fruit-types", response_model=list[str])
def list_fruit_types(db: Session = Depends(get_db)):
    """Distinct fruit types across the catalogue, used to build filter chips."""
    rows = db.execute(
        select(Product.fruit_type).distinct().order_by(Product.fruit_type)
    ).all()
    return [fruit for (fruit,) in rows]


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} was not found.",
        )
    return product
