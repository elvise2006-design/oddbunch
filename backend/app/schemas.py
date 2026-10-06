"""Pydantic v2 schemas used for request validation and response shaping."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# --------------------------------------------------------------------------
# Products
# --------------------------------------------------------------------------


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    description: str
    price: float
    category: str
    fruit_type: str
    emoji: str
    accent: str
    is_featured: bool
    seed_grow_guide: str | None = None
    bottle_shape: str | None = None
    rarity: str | None = None
    stock: int = 0
    edition_size: int | None = None
    box_size: str | None = None


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=2)
    price: float = Field(gt=0, le=10_000)
    category: str = Field(pattern="^(kids|normal|collector)$")
    fruit_type: str = Field(min_length=2, max_length=40)
    emoji: str = "🍎"
    seed_grow_guide: str | None = None
    bottle_shape: str | None = None
    rarity: str | None = Field(default=None, pattern="^(Common|Rare|Legendary)$")
    stock: int = Field(default=0, ge=0)
    box_size: str | None = None


# --------------------------------------------------------------------------
# Cart
# --------------------------------------------------------------------------


class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1, le=99)
    session_id: str = Field(default="demo", max_length=64)
    is_subscription: bool = False
    subscription_cadence: str | None = Field(default=None, pattern="^(weekly|bi-weekly)$")


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=0, le=99)
    is_subscription: bool | None = None
    subscription_cadence: str | None = Field(default=None, pattern="^(weekly|bi-weekly)$")


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    is_subscription: bool
    subscription_cadence: str | None
    product: ProductOut


class CartOut(BaseModel):
    items: list[CartItemOut]
    item_count: int
    subtotal: float


# --------------------------------------------------------------------------
# Orders
# --------------------------------------------------------------------------


class OrderItemIn(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    address: str = Field(min_length=6, max_length=240)
    session_id: str = Field(default="demo", max_length=64)
    # When provided, the order is built from the server-side cart for that session
    # so totals can never be tampered with by the client.
    from_cart: bool = True
    items: list[OrderItemIn] | None = None

    @field_validator("customer_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class OrderItemOut(BaseModel):
    id: int
    product_name: str
    unit_price: float
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    email: str
    address: str
    total: float
    created_at: datetime
    items: list[OrderItemOut]


# --------------------------------------------------------------------------
# Newsletter / contact
# --------------------------------------------------------------------------


class NewsletterCreate(BaseModel):
    email: EmailStr
    nickname: str | None = Field(default=None, max_length=80)
    interest: str | None = Field(default=None, pattern="^(kids|normal|collector|everything)$")

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower().strip()


class NewsletterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    nickname: str | None
    interest: str | None
    created_at: datetime


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    topic: str = Field(default="general", pattern="^(general|wholesale|press|care)$")
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower().strip()


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    topic: str
    message: str
    created_at: datetime


# --------------------------------------------------------------------------
# Wishlist
# --------------------------------------------------------------------------


class WishlistCreate(BaseModel):
    product_id: int = Field(gt=0)
    owner: str = Field(default="demo", max_length=64)


class WishlistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    owner: str
    created_at: datetime
    product: ProductOut


# --------------------------------------------------------------------------
# Growing journal
# --------------------------------------------------------------------------


class JournalCreate(BaseModel):
    child_name_or_nickname: str = Field(min_length=1, max_length=80)
    fruit_type: str = Field(min_length=2, max_length=40)
    planted_date: date | None = None
    sprout_date: date | None = None
    note: str | None = Field(default=None, max_length=240)

    @field_validator("child_name_or_nickname", "fruit_type")
    @classmethod
    def strip(cls, v: str) -> str:
        return v.strip()


class JournalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    child_name_or_nickname: str
    fruit_type: str
    planted_date: date
    sprout_date: date | None
    note: str | None
    created_at: datetime


# --------------------------------------------------------------------------
# Stats
# --------------------------------------------------------------------------


class StatsOut(BaseModel):
    seeds_planted: int
    trees_grown: int
    bottles_collected: int
    families_planting: int
    countries_reached: int
