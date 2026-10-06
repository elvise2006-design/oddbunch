"""ORM models for Seedling & Vine.

Three product categories drive the whole demo:
  * ``kids``      -> Little Sprouts juice packs with a hidden, plantable seed
  * ``normal``    -> Daily Fresh everyday juice boxes and fruit boxes
  * ``collector`` -> The Rare Collection sculpted-glass bottles
"""

from __future__ import annotations

import enum
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(str, enum.Enum):
    kids = "kids"
    normal = "normal"
    collector = "collector"


class Rarity(str, enum.Enum):
    common = "Common"
    rare = "Rare"
    legendary = "Legendary"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float)  # CAD
    category: Mapped[str] = mapped_column(String(20), index=True)
    fruit_type: Mapped[str] = mapped_column(String(40), index=True)
    emoji: Mapped[str] = mapped_column(String(16), default="🍎")
    accent: Mapped[str] = mapped_column(String(32), default="#7FB069")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # --- kids only -------------------------------------------------------
    seed_grow_guide: Mapped[str | None] = mapped_column(Text, nullable=True)

    # --- collector only --------------------------------------------------
    bottle_shape: Mapped[str | None] = mapped_column(String(60), nullable=True)
    rarity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    edition_size: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # --- normal only -----------------------------------------------------
    box_size: Mapped[str | None] = mapped_column(String(40), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[str] = mapped_column(String(64), index=True, default="demo")
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    is_subscription: Mapped[bool] = mapped_column(Boolean, default=False)
    subscription_cadence: Mapped[str | None] = mapped_column(String(20), nullable=True)

    product: Mapped["Product"] = relationship(back_populates="cart_items")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), index=True)
    address: Mapped[str] = mapped_column(String(240))
    total: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(160))
    unit_price: Mapped[float] = mapped_column(Float)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")


class NewsletterSignup(Base):
    __tablename__ = "newsletter_signups"
    __table_args__ = (UniqueConstraint("email", name="uq_newsletter_email"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(180), index=True)
    nickname: Mapped[str | None] = mapped_column(String(80), nullable=True)
    interest: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), index=True)
    topic: Mapped[str] = mapped_column(String(60), default="general")
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Wishlist(Base):
    __tablename__ = "wishlist"
    # Scoped per owner: the same bottle can be on several collectors' wishlists.
    __table_args__ = (
        UniqueConstraint("product_id", "owner", name="uq_wishlist_product_owner"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    owner: Mapped[str] = mapped_column(String(64), index=True, default="demo")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    product: Mapped["Product"] = relationship()


class GrowingJournalEntry(Base):
    """A kid's planted-seed tracker, e.g. 'Mia planted an apple seed on March 3'."""

    __tablename__ = "growing_journal"

    id: Mapped[int] = mapped_column(primary_key=True)
    child_name_or_nickname: Mapped[str] = mapped_column(String(80))
    fruit_type: Mapped[str] = mapped_column(String(40), index=True)
    planted_date: Mapped[date] = mapped_column(Date, default=lambda: utcnow().date())
    sprout_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    note: Mapped[str | None] = mapped_column(String(240), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
