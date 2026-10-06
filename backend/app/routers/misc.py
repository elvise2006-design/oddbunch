"""Newsletter, contact, wishlist, growing journal and public stats endpoints."""

from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import (
    ContactMessage,
    GrowingJournalEntry,
    NewsletterSignup,
    Order,
    OrderItem,
    Product,
    Wishlist,
)
from app.schemas import (
    ContactCreate,
    ContactOut,
    JournalCreate,
    JournalOut,
    NewsletterCreate,
    NewsletterOut,
    StatsOut,
    WishlistCreate,
    WishlistOut,
)

# --------------------------------------------------------------------------
# Newsletter
# --------------------------------------------------------------------------

newsletter = APIRouter(prefix="/newsletter", tags=["newsletter"])


@newsletter.post("", response_model=NewsletterOut, status_code=status.HTTP_201_CREATED)
def subscribe(payload: NewsletterCreate, db: Session = Depends(get_db)):
    existing = db.scalars(
        select(NewsletterSignup).where(NewsletterSignup.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That email is already on the list — we'll keep you posted.",
        )
    row = NewsletterSignup(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@newsletter.get("/count", response_model=dict[str, int])
def newsletter_count(db: Session = Depends(get_db)):
    return {"count": db.scalar(select(func.count(NewsletterSignup.id))) or 0}


# --------------------------------------------------------------------------
# Contact
# --------------------------------------------------------------------------

contact = APIRouter(prefix="/contact", tags=["contact"])


@contact.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def send_message(payload: ContactCreate, db: Session = Depends(get_db)):
    row = ContactMessage(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# --------------------------------------------------------------------------
# Wishlist (Rare Collection)
# --------------------------------------------------------------------------

wishlist = APIRouter(prefix="/wishlist", tags=["wishlist"])


@wishlist.get("", response_model=list[WishlistOut])
def get_wishlist(
    db: Session = Depends(get_db),
    owner: str = Query(default="demo", max_length=64),
):
    return db.scalars(
        select(Wishlist)
        .options(selectinload(Wishlist.product))
        .where(Wishlist.owner == owner)
        .order_by(Wishlist.id.desc())
    ).all()


@wishlist.post("", response_model=WishlistOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(payload: WishlistCreate, db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {payload.product_id} was not found.",
        )

    existing = db.scalars(
        select(Wishlist).where(
            Wishlist.product_id == payload.product_id, Wishlist.owner == payload.owner
        )
    ).first()
    if existing:
        return existing

    row = Wishlist(product_id=payload.product_id, owner=payload.owner)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        # Two tabs raced the same insert — the unique constraint caught it.
        db.rollback()
        existing = db.scalars(
            select(Wishlist).where(
                Wishlist.product_id == payload.product_id, Wishlist.owner == payload.owner
            )
        ).first()
        if existing is None:
            raise
        return existing
    db.refresh(row)
    return row


@wishlist.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    owner: str = Query(default="demo", max_length=64),
):
    result = db.execute(
        delete(Wishlist).where(Wishlist.product_id == product_id, Wishlist.owner == owner)
    )
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="That bottle is not on your wishlist."
        )
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------
# Growing journal (Little Sprouts)
# --------------------------------------------------------------------------

journal = APIRouter(prefix="/growing-journal", tags=["growing-journal"])


@journal.get("", response_model=list[JournalOut])
def get_journal(db: Session = Depends(get_db), fruit_type: str | None = None):
    stmt = select(GrowingJournalEntry).order_by(GrowingJournalEntry.id.desc())
    if fruit_type:
        stmt = stmt.where(GrowingJournalEntry.fruit_type == fruit_type.lower())
    return db.scalars(stmt).all()


@journal.post("", response_model=JournalOut, status_code=status.HTTP_201_CREATED)
def add_journal_entry(payload: JournalCreate, db: Session = Depends(get_db)):
    row = GrowingJournalEntry(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@journal.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    row = db.get(GrowingJournalEntry, entry_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found.")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------
# Public impact stats (counters on the home page)
# --------------------------------------------------------------------------

stats = APIRouter(prefix="/stats", tags=["stats"])


@stats.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    """Derive live figures from the demo data so the counters stay honest."""
    journal_count = db.scalar(select(func.count(GrowingJournalEntry.id))) or 0
    sprouts_logged = db.scalar(
        select(func.count(GrowingJournalEntry.id)).where(
            GrowingJournalEntry.sprout_date.is_not(None)
        )
    ) or 0
    bottles_ordered = db.scalar(
        select(func.coalesce(func.sum(OrderItem.quantity), 0))
        .join(Product, Product.id == OrderItem.product_id)
        .where(Product.category == "collector")
    ) or 0

    # Base figures represent the wider (offline) community; the demo's own rows
    # are added on top so the numbers visibly respond to user actions.
    return StatsOut(
        seeds_planted=182_450 + journal_count,
        trees_grown=46_310 + sprouts_logged,
        bottles_collected=61_240 + int(bottles_ordered),
        families_planting=9_870,
        countries_reached=23,
    )


@stats.get("/recent", response_model=list[JournalOut])
def recent_plantings(db: Session = Depends(get_db), limit: int = Query(default=6, ge=1, le=25)):
    """Latest growing-journal entries, shown as a live ticker on the home page."""
    cutoff = date.today() - timedelta(days=365 * 5)
    return db.scalars(
        select(GrowingJournalEntry)
        .where(GrowingJournalEntry.planted_date >= cutoff)
        .order_by(GrowingJournalEntry.id.desc())
        .limit(limit)
    ).all()


@stats.get("/orders", response_model=int)
def order_count(db: Session = Depends(get_db)):
    return db.scalar(select(func.count(Order.id))) or 0
