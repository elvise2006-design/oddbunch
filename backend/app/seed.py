"""Seed data for Seedling & Vine.

Idempotent: running it twice will not duplicate rows. Every product uses emoji
and generated CSS/SVG artwork on the frontend, so the demo works fully offline.
"""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import Base, engine, SessionLocal
from app.models import (
    CartItem,
    Category,
    ContactMessage,
    GrowingJournalEntry,
    NewsletterSignup,
    Order,
    OrderItem,
    Product,
    Rarity,
    Wishlist,
)

# --------------------------------------------------------------------------
# LITTLE SPROUTS  (kids) - each pack hides one real, plantable seed
# --------------------------------------------------------------------------

KID_PRODUCTS = [
    {
        "slug": "apple-seed-sprout-pack",
        "name": "Apple Seed Sprout Pack",
        "description": "Cold-pressed apple juice with one real apple seed taped under the sticker. Peel it off, pot the seed, and grow a tree that fruits for decades.",
        "price": 4.75,
        "category": Category.kids.value,
        "fruit_type": "apple",
        "emoji": "🍎",
        "accent": "#E8552F",
        "is_featured": True,
        "stock": 140,
        "seed_grow_guide": (
            "Apple · 1 seed\n"
            "Soil: bury 1 cm deep in a pot of sandy, well-draining soil.\n"
            "Sunlight: 6+ hours of bright light, outdoors or a sunny window.\n"
            "Water: keep the soil damp, never soggy.\n"
            "Sprouts in 14–21 days with a cold spell (put the pot in a fridge for 3 weeks first).\n"
            "First leaf: around day 25. Expect a small tree, not a dwarf."
        ),
    },
    {
        "slug": "sunny-orange-seed-pack",
        "name": "Sunny Orange Seed Pack",
        "description": "A bright, zest-forward orange pack. The seed inside loves warmth and hates being cold — the easiest first tree for a young gardener.",
        "price": 4.75,
        "category": Category.kids.value,
        "fruit_type": "orange",
        "emoji": "🍊",
        "accent": "#FF9F1C",
        "is_featured": True,
        "stock": 120,
        "seed_grow_guide": (
            "Orange · 1 seed\n"
            "Soil: 1 cm deep, half sand and half potting mix.\n"
            "Sunlight: 8+ hours — oranges are sun-hungry.\n"
            "Water: warm water, surface dry between drinks.\n"
            "Sprouts in 14–30 days. No cold period needed.\n"
            "Tip: buy 3 seeds and plant them all — orange seeds often need a partner to germinate well."
        ),
    },
    {
        "slug": "watermelon-wonder-pack",
        "name": "Watermelon Wonder Pack",
        "description": "Big, pink and extra juicy. A watermelon seed sprouts fast enough to fit a child's patience, then races up as vines.",
        "price": 5.25,
        "category": Category.kids.value,
        "fruit_type": "watermelon",
        "emoji": "🍉",
        "accent": "#06D6A0",
        "is_featured": True,
        "stock": 95,
        "seed_grow_guide": (
            "Watermelon · 1 seed\n"
            "Soil: 2 cm deep in a big pot (they need room for long roots).\n"
            "Sunlight: full sun, all day.\n"
            "Water: generous, but let the top 2 cm dry between watering.\n"
            "Sprouts in 7–14 days — the fastest of the bunch.\n"
            "First true leaves: around day 18, with curly little vines."
        ),
    },
    {
        "slug": "mango-magic-pack",
        "name": "Mango Magic Pack",
        "description": "Golden mango juice with a single glossy mango stone under the seal. The seed grows into a tall, elegant tree.",
        "price": 5.95,
        "category": Category.kids.value,
        "fruit_type": "mango",
        "emoji": "🥭",
        "accent": "#FFB703",
        "is_featured": False,
        "stock": 130,
        "seed_grow_guide": (
            "Mango · 1 stone\n"
            "Soil: peel the husk off the stone, then bury it 1 cm deep.\n"
            "Sunlight: bright light, 6 hours minimum.\n"
            "Water: moist soil, mist the leaves in dry weeks.\n"
            "Sprouts in 10–21 days — the paper-like husk keeps it moist.\n"
            "Bonus: the new shoot is often pink or red before it turns green."
        ),
    },
    {
        "slug": "grape-cluster-pack",
        "name": "Grape Cluster Pack",
        "description": "Deep purple grape juice with a seed you can grow on a sunny windowsill and train up a little trellis.",
        "price": 5.25,
        "category": Category.kids.value,
        "fruit_type": "grape",
        "emoji": "🍇",
        "accent": "#9B5DE5",
        "is_featured": False,
        "stock": 76,
        "seed_grow_guide": (
            "Grape · 1 seed\n"
            "Soil: 1 cm deep, gritty mix. Grape roots dislike soggy soil.\n"
            "Sunlight: full sun.\n"
            "Water: moderate — overwatering is the #1 way to kill a grape seed.\n"
            "Sprouts in 21–40 days, so this one needs patience.\n"
            "Tip: once it has 5 leaves, pinch the tip to get two vines instead of one."
        ),
    },
    {
        "slug": "lemon-sunbeam-pack",
        "name": "Lemon Sunbeam Pack",
        "description": "A zingy lemon pack for kids who like tart flavours. One seed, one pot, one very proud tree-blogger.",
        "price": 4.95,
        "category": Category.kids.value,
        "fruit_type": "lemon",
        "emoji": "🍋",
        "accent": "#F4D35E",
        "is_featured": False,
        "stock": 108,
        "seed_grow_guide": (
            "Lemon · 1 seed\n"
            "Soil: 1 cm deep in cactus-friendly gritty soil.\n"
            "Sunlight: 6+ hours of direct sun.\n"
            "Water: let it dry out a little between drinks.\n"
            "Sprouts in 14–21 days.\n"
            "Tip: lemons are usually grafted for fruit, so enjoy the tree as a scented houseplant."
        ),
    },
]

# --------------------------------------------------------------------------
# DAILY FRESH  (normal) - clean, everyday, no gimmicks
# --------------------------------------------------------------------------

NORMAL_PRODUCTS = [
    {
        "slug": "everyday-orange-juice-box",
        "name": "Everyday Orange Juice Box",
        "description": "Not-from-concentrate Valencia orange, gently pasteurised. 2 L, best within 3 days of opening.",
        "price": 6.49,
        "category": Category.normal.value,
        "fruit_type": "orange",
        "emoji": "🍊",
        "accent": "#FF9F1C",
        "is_featured": True,
        "box_size": "2 L",
        "stock": 240,
    },
    {
        "slug": "orchard-apple-juice-box",
        "name": "Orchard Apple Juice Box",
        "description": "Pressed from three Ontario apple varieties for a balanced tart-sweet finish. No added sugar.",
        "price": 5.99,
        "category": Category.normal.value,
        "fruit_type": "apple",
        "emoji": "🍎",
        "accent": "#E8552F",
        "is_featured": True,
        "box_size": "2 L",
        "stock": 310,
    },
    {
        "slug": "pink-grapefruit-juice-box",
        "name": "Pink Grapefruit Juice Box",
        "description": "Ruby grapefruit with a squeeze of lime. Sharp, grown-up, and beautiful in a glass with ice.",
        "price": 7.25,
        "category": Category.normal.value,
        "fruit_type": "grapefruit",
        "emoji": "🍊",
        "accent": "#F472B6",
        "is_featured": False,
        "box_size": "1 L",
        "stock": 180,
    },
    {
        "slug": "smoothie-mango-juice-box",
        "name": "Smoothie Mango Juice Box",
        "description": "Thick, spoonable Alphonso mango pulp — the one you actually drink with a straw bent 90 degrees.",
        "price": 6.75,
        "category": Category.normal.value,
        "fruit_type": "mango",
        "emoji": "🥭",
        "accent": "#FFB703",
        "is_featured": True,
        "box_size": "1 L",
        "stock": 205,
    },
    {
        "slug": "everyday-mixed-citrus-box",
        "name": "Everyday Mixed Citrus Box",
        "description": "Orange, grapefruit and lemon in one carton. Our fridge regular — it never goes to waste.",
        "price": 5.49,
        "category": Category.normal.value,
        "fruit_type": "citrus",
        "emoji": "🍋",
        "accent": "#F4D35E",
        "is_featured": False,
        "box_size": "3 L",
        "stock": 420,
    },
    {
        "slug": "weekly-fruit-box",
        "name": "Weekly Fruit Box",
        "description": "Six seasonal fruits, chosen on Monday and delivered Thursday. Feed a household, no planning required.",
        "price": 42.00,
        "category": Category.normal.value,
        "fruit_type": "mixed",
        "emoji": "🧺",
        "accent": "#7FB069",
        "is_featured": True,
        "box_size": "6 fruits",
        "stock": 90,
    },
    {
        "slug": "family-fruit-box",
        "name": "Family Fruit Box",
        "description": "Twelve fruits plus a seasonal recipe card. Big enough for a full week of lunches.",
        "price": 74.00,
        "category": Category.normal.value,
        "fruit_type": "mixed",
        "emoji": "🍐",
        "accent": "#8AB04E",
        "is_featured": False,
        "box_size": "12 fruits",
        "stock": 65,
    },
    {
        "slug": "cold-pressed-green-juice",
        "name": "Cold-Pressed Green Juice",
        "description": "Kale, cucumber, green apple and lemon. Chilled, not heated, so the good stuff survives.",
        "price": 8.99,
        "category": Category.normal.value,
        "fruit_type": "green",
        "emoji": "🥬",
        "accent": "#4C9A2A",
        "is_featured": False,
        "box_size": "330 ml",
        "stock": 150,
    },
]

# --------------------------------------------------------------------------
# THE RARE COLLECTION  (collector) - sculpted glass bottles
# --------------------------------------------------------------------------

COLLECTOR_PRODUCTS = [
    {
        "slug": "skull-edition-grape-elixir",
        "name": "Skull Edition Grape Elixir",
        "description": "Black Muscat elixir poured into a bottle hand-moulded in the shape of a skull. Bone-white glass, deep violet juice, a stopper sealed with plum wax.",
        "price": 68.00,
        "category": Category.collector.value,
        "fruit_type": "grape",
        "emoji": "💀",
        "accent": "#9B5DE5",
        "is_featured": True,
        "bottle_shape": "skull",
        "rarity": Rarity.legendary.value,
        "stock": 12,
        "edition_size": 250,
    },
    {
        "slug": "apple-classic-cider-rose",
        "name": "Apple Classic Cider Rosé",
        "description": "The original 2019 sculpt, still the shape everyone recognises: an apple, in glass, filled with pink dry cider.",
        "price": 44.00,
        "category": Category.collector.value,
        "fruit_type": "apple",
        "emoji": "🍎",
        "accent": "#E8552F",
        "is_featured": True,
        "bottle_shape": "apple",
        "rarity": Rarity.common.value,
        "stock": 78,
        "edition_size": 1500,
    },
    {
        "slug": "dragon-fruit-spike-neroli",
        "name": "Dragon Fruit Spike Neroli",
        "description": "A spiked glass dragon fruit, the longest shape in the collection. Cloudy pink-white neroli cordial inside.",
        "price": 58.00,
        "category": Category.collector.value,
        "fruit_type": "dragonfruit",
        "emoji": "🐉",
        "accent": "#F472B6",
        "is_featured": True,
        "bottle_shape": "dragon",
        "rarity": Rarity.rare.value,
        "stock": 30,
        "edition_size": 500,
    },
    {
        "slug": "pear-teardrop-saison",
        "name": "Pear Teardrop Saison",
        "description": "A single smooth teardrop of pale pear-glass. Quiet, elegant, and the one collectors start with.",
        "price": 39.00,
        "category": Category.collector.value,
        "fruit_type": "pear",
        "emoji": "🍐",
        "accent": "#C9D8A0",
        "is_featured": False,
        "bottle_shape": "pear",
        "rarity": Rarity.common.value,
        "stock": 96,
        "edition_size": 1200,
    },
    {
        "slug": "tangerine-moon-tangerine",
        "name": "Tangerine Moon",
        "description": "Bottles cast as a crescent tangerine with a puffy rind texture. Contains 18% ABV mandarin liqueur.",
        "price": 52.00,
        "category": Category.collector.value,
        "fruit_type": "tangerine",
        "emoji": "🌙",
        "accent": "#FF9F1C",
        "is_featured": True,
        "bottle_shape": "moon",
        "rarity": Rarity.rare.value,
        "stock": 41,
        "edition_size": 400,
    },
    {
        "slug": "blackberry-hedgehog-gin",
        "name": "Blackberry Hedgehog Gin",
        "description": "A bristly glass blackberry holding 40% ABV blackberry gin. Earns its spines honestly — a proper sour sip.",
        "price": 96.00,
        "category": Category.collector.value,
        "fruit_type": "blackberry",
        "emoji": "🫐",
        "accent": "#4C1D95",
        "is_featured": False,
        "bottle_shape": "hedgehog",
        "rarity": Rarity.legendary.value,
        "stock": 7,
        "edition_size": 150,
    },
]

ALL_PRODUCTS = KID_PRODUCTS + NORMAL_PRODUCTS + COLLECTOR_PRODUCTS

DEMO_NEWSLETTER = [
    {"email": "mia@example.com", "nickname": "Mia", "interest": "kids"},
    {"email": "sam@example.com", "nickname": "Sam", "interest": "collector"},
    {"email": "riley@example.com", "nickname": "Riley", "interest": "everything"},
]

DEMO_JOURNAL = [
    {"child_name_or_nickname": "Mia", "fruit_type": "apple", "note": "Put the pot on the window sill."},
    {"child_name_or_nickname": "Theo", "fruit_type": "watermelon", "note": "Sprouted on day 9!"},
    {"child_name_or_nickname": "Ana", "fruit_type": "orange", "note": "Waiting for the first leaf."},
]

DEMO_WISHLIST_SLUGS = ["skull-edition-grape-elixir", "dragon-fruit-spike-neroli"]

DEMO_ORDERS = [
    {
        "customer_name": "Priya N.",
        "email": "priya@example.com",
        "address": "88 Vine St, Toronto, ON",
        "slugs": [("apple-classic-cider-rose", 2), ("everyday-orange-juice-box", 1)],
    },
    {
        "customer_name": "Devon K.",
        "email": "devon@example.com",
        "address": "14 Orchard Rd, Mississauga, ON",
        "slugs": [("skull-edition-grape-elixir", 1), ("blackberry-hedgehog-gin", 1)],
    },
]

DEMO_CONTACT = [
    {
        "name": "Harper L.",
        "email": "harper@example.com",
        "topic": "wholesale",
        "message": "We run a cafe in Hamilton and would love to stock the Daily Fresh boxes.",
    }
]


def _slug_map(db: Session) -> dict[str, Product]:
    rows = db.scalars(select(Product)).all()
    return {p.slug: p for p in rows}


def seed_products(db: Session) -> int:
    """Insert any missing products. Returns the number created."""
    existing = set(db.scalars(select(Product.slug)).all())
    created = 0
    for data in ALL_PRODUCTS:
        if data["slug"] in existing:
            continue
        db.add(Product(**data))
        created += 1
    db.commit()
    return created


def seed_demo_records(db: Session) -> None:
    """Add a handful of demo rows so the API is not empty on first run."""
    if db.scalar(select(func.count(NewsletterSignup.id))) == 0:
        for row in DEMO_NEWSLETTER:
            db.add(NewsletterSignup(**row))

    if db.scalar(select(func.count(GrowingJournalEntry.id))) == 0:
        for row in DEMO_JOURNAL:
            db.add(GrowingJournalEntry(**row))

    if db.scalar(select(func.count(ContactMessage.id))) == 0:
        for row in DEMO_CONTACT:
            db.add(ContactMessage(**row))

    db.commit()

    products = _slug_map(db)

    if db.scalar(select(func.count(Wishlist.id))) == 0:
        for slug in DEMO_WISHLIST_SLUGS:
            product = products.get(slug)
            if product:
                db.add(Wishlist(product_id=product.id, owner="demo"))
    db.commit()

    if db.scalar(select(func.count(Order.id))) == 0:
        for row in DEMO_ORDERS:
            items: list[OrderItem] = []
            total = 0.0
            for slug, qty in row["slugs"]:
                product = products.get(slug)
                if not product:
                    continue
                items.append(
                    OrderItem(
                        product_id=product.id,
                        product_name=product.name,
                        unit_price=product.price,
                        quantity=qty,
                    )
                )
                total += product.price * qty
            if not items:
                continue
            order = Order(
                customer_name=row["customer_name"],
                email=row["email"],
                address=row["address"],
                total=round(total, 2),
                items=items,
            )
            db.add(order)
    db.commit()


def seed_demo_cart(db: Session) -> None:
    """Put two items in the demo cart session so /api/cart is not empty."""
    if db.scalar(select(func.count(CartItem.id))) > 0:
        return
    products = _slug_map(db)
    for slug, qty in [("everyday-orange-juice-box", 2), ("apple-seed-sprout-pack", 1)]:
        product = products.get(slug)
        if product:
            db.add(CartItem(product_id=product.id, quantity=qty, session_id="demo"))
    db.commit()


def seed_all(reset: bool = False) -> dict[str, int]:
    """Create tables and populate seed data. Safe to call on every startup."""
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        created = seed_products(db)
        seed_demo_records(db)
        seed_demo_cart(db)

    total = len(ALL_PRODUCTS)
    return {
        "products_created": created,
        "products_total": total,
        "kids": len(KID_PRODUCTS),
        "normal": len(NORMAL_PRODUCTS),
        "collector": len(COLLECTOR_PRODUCTS),
    }


if __name__ == "__main__":  # pragma: no cover - manual `python -m app.seed`
    import sys

    result = seed_all(reset="--reset" in sys.argv)
    print("Seed complete:", result)
