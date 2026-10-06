"""Demo checkout. No real payment is ever taken."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import CartItem, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Build an order from the server-side cart (or an explicit item list)."""
    lines: list[tuple[Product, int]] = []

    if payload.items and not payload.from_cart:
        # An explicit item list was sent instead of the server-side cart.
        for item in payload.items:
            product = db.get(Product, item.product_id)
            if product is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} was not found.",
                )
            lines.append((product, item.quantity))
    else:
        # Server-side cart is authoritative so the total can't be tampered with.
        cart_rows = db.scalars(
            select(CartItem)
            .options(selectinload(CartItem.product))
            .where(CartItem.session_id == payload.session_id)
        ).all()
        lines = [(row.product, row.quantity) for row in cart_rows]

    if not lines:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place an order with an empty cart.",
        )

    order_items: list[OrderItem] = []
    total = 0.0
    for product, quantity in lines:
        # Every category has a stock limit; refuse oversells politely.
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
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
            )
        )
        total += product.price * quantity

    order = Order(
        customer_name=payload.customer_name,
        email=payload.email,
        address=payload.address,
        total=round(total, 2),
        items=order_items,
    )
    db.add(order)
    db.flush()  # assign order.id before we clear the cart

    for product, quantity in lines:
        # Multiplied by quantity — buying five packs must reduce stock by five.
        product.stock = max(0, product.stock - quantity)

    db.execute(delete(CartItem).where(CartItem.session_id == payload.session_id))
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), limit: int = 20):
    return db.scalars(
        select(Order).options(selectinload(Order.items)).order_by(Order.id.desc()).limit(limit)
    ).all()
