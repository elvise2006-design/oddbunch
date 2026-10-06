"""Cart endpoints. The demo uses a single 'demo' session id instead of real auth."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import CartItem, Product
from app.schemas import CartItemCreate, CartItemOut, CartItemUpdate, CartOut

router = APIRouter(prefix="/cart", tags=["cart"])


def _assert_in_stock(product: Product, quantity: int) -> None:
    """Raise 409 unless `quantity` units of `product` are actually available."""
    if quantity > product.stock:
        if product.stock == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"'{product.name}' is sold out.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {product.stock} of '{product.name}' are still in stock.",
        )


def _serialize(db: Session, session_id: str) -> CartOut:
    items = db.scalars(
        select(CartItem)
        .options(selectinload(CartItem.product))
        .where(CartItem.session_id == session_id)
        .order_by(CartItem.id)
    ).all()
    subtotal = round(sum(i.product.price * i.quantity for i in items), 2)
    return CartOut(
        items=[CartItemOut.model_validate(i) for i in items],
        item_count=sum(i.quantity for i in items),
        subtotal=subtotal,
    )


@router.get("", response_model=CartOut)
def get_cart(
    db: Session = Depends(get_db),
    session_id: str = Query(default="demo", max_length=64),
):
    return _serialize(db, session_id)


@router.post("", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(payload: CartItemCreate, db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {payload.product_id} was not found.",
        )

    # One row per (session, product, subscription choice) so the same bottle can
    # be bought once as a one-off and once as a standing order.
    existing = db.scalars(
        select(CartItem).where(
            CartItem.session_id == payload.session_id,
            CartItem.product_id == payload.product_id,
            CartItem.is_subscription.is_(payload.is_subscription),
        )
    ).first()

    # Validate the *resulting* quantity so a repeat add can't exceed stock.
    resulting_quantity = (existing.quantity if existing else 0) + payload.quantity
    _assert_in_stock(product, resulting_quantity)

    if existing:
        existing.quantity = resulting_quantity
        db.commit()
    else:
        db.add(
            CartItem(
                product_id=payload.product_id,
                quantity=payload.quantity,
                session_id=payload.session_id,
                is_subscription=payload.is_subscription,
                subscription_cadence=payload.subscription_cadence,
            )
        )
        db.commit()

    return _serialize(db, payload.session_id)


@router.patch("/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    session_id: str = Query(default="demo", max_length=64),
):
    item = db.scalars(
        select(CartItem).where(CartItem.id == item_id, CartItem.session_id == session_id)
    ).first()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found."
        )

    # Quantity 0 is treated as a removal from the UI's perspective.
    if payload.quantity == 0:
        db.delete(item)
    else:
        _assert_in_stock(item.product, payload.quantity)
        item.quantity = payload.quantity
        if payload.is_subscription is not None:
            item.is_subscription = payload.is_subscription
        if payload.subscription_cadence is not None:
            item.subscription_cadence = payload.subscription_cadence

    db.commit()
    return _serialize(db, session_id)


@router.delete("/{item_id}", response_model=CartOut)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    session_id: str = Query(default="demo", max_length=64),
):
    item = db.scalars(
        select(CartItem).where(CartItem.id == item_id, CartItem.session_id == session_id)
    ).first()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found."
        )
    db.delete(item)
    db.commit()
    return _serialize(db, session_id)


@router.delete("", response_model=CartOut)
def clear_cart(
    db: Session = Depends(get_db),
    session_id: str = Query(default="demo", max_length=64),
):
    db.execute(delete(CartItem).where(CartItem.session_id == session_id))
    db.commit()
    return _serialize(db, session_id)
