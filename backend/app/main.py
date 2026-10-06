"""FastAPI application entrypoint for Seedling & Vine.

Run with:  uvicorn app.main:app --reload --port 8000
Docs at:   http://localhost:8000/docs
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import cart, misc, orders, products

logger = logging.getLogger("seedling_and_vine")

DESCRIPTION = """
**Seedling & Vine** — a fruit brand with two secret ideas baked into every pack.

* **Little Sprouts** — kids' juice packs with a *real, plantable seed* sealed under the sticker.
* **Daily Fresh** — plain, good, everyday fruit juice and fruit boxes.
* **The Rare Collection** — fruit juice in sculpted glass bottles (skull, apple, dragon fruit, and more).

All prices are in CAD. This is a demo storefront: checkout takes no payment.
""".strip()

TAGS_METADATA = [
    {"name": "products", "description": "Browse and filter the catalogue."},
    {"name": "cart", "description": "Server-side demo cart (session id `demo`)."},
    {"name": "orders", "description": "Demo checkout — no real payment."},
    {"name": "newsletter", "description": "Home page signup."},
    {"name": "contact", "description": "Contact form submissions."},
    {"name": "wishlist", "description": "Rare Collection watchlist."},
    {"name": "growing-journal", "description": "Little Sprouts planted-seed tracker."},
    {"name": "stats", "description": "Public impact counters."},
]


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description=DESCRIPTION,
        version="1.0.0",
        openapi_tags=TAGS_METADATA,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Wide-open CORS keeps the Vite dev server (any port) happy while independent.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,  # cannot be combined with wildcard origins
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Never leak a stack trace to the browser in the demo."""
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Something went wrong on our side. Please try again."},
        )

    app.include_router(products.router, prefix=settings.api_prefix)
    app.include_router(cart.router, prefix=settings.api_prefix)
    app.include_router(orders.router, prefix=settings.api_prefix)

    for sub_router in (
        misc.newsletter,
        misc.contact,
        misc.wishlist,
        misc.journal,
        misc.stats,
    ):
        app.include_router(sub_router, prefix=settings.api_prefix)

    @app.get("/api/health", tags=["meta"], summary="Health check")
    def health() -> dict[str, str]:
        return {"status": "ok", "brand": "Seedling & Vine"}

    @app.get("/api/meta", tags=["meta"], summary="Brand metadata for the frontend")
    def meta() -> dict[str, object]:
        return {
            "brand": "Seedling & Vine",
            "currency": "CAD",
            "categories": [
                {
                    "key": "kids",
                    "title": "Little Sprouts",
                    "path": "/little-sprouts",
                    "tagline": "Peel, reveal a real seed, and grow your own fruit tree",
                },
                {
                    "key": "normal",
                    "title": "Daily Fresh",
                    "path": "/daily-fresh",
                    "tagline": "Simple, everyday fruit juices and boxes",
                },
                {
                    "key": "collector",
                    "title": "The Rare Collection",
                    "path": "/rare-collection",
                    "tagline": "Sculpted glass bottles. Limited edition flavors",
                },
            ],
        }

    @app.on_event("startup")
    def on_startup() -> None:
        if settings.auto_seed:
            from app.seed import seed_all

            result = seed_all()
            logger.info("Database ready: %s", result)

    return app


app = create_app()


if __name__ == "__main__":  # pragma: no cover - `python -m app.main`
    import uvicorn

    # `PORT`/`HOST` from the environment keep the demo portable to busy machines.
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
