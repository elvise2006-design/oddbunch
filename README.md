# Seedling & Vine

**Fruit with a future.** An original, fictional DTC brand demo: every juice bottle
ships with a seed, and every seed grows into a story.

Three storefronts share one system:

| Route | Storefront | What's special about it |
| --- | --- | --- |
| `/little-sprouts` | **Little Sprouts** | Peel-to-reveal seed cards, a falling-seed mini-game, and a growing journal that persists to the API |
| `/daily-fresh` | **Daily Fresh** | Everyday juice boxes with search, filters, sorting, and a subscription cadence |
| `/rare-collection` | **Rare Collection** | Dark "collector shelf" with rarity tiers, live stock counters, wishlist, and SVG bottle art |

Plus `/cart` (demo checkout), `/about`, `/contact`, and a 404 page.

---

## Quick start

```bash
git clone <your-fork> && cd odd
./start.sh setup   # once: installs frontend deps, creates the venv, seeds SQLite
./start.sh         # starts both servers together
```

Then open **http://localhost:5173** (the URL is printed on start).

If those ports are already in use by another app, the script automatically
shifts to the next free pair (e.g. `5174` / `8001`) and tells you — you never
have to kill anything to try the demo.

### Useful subcommands

```bash
./start.sh setup     # install everything and (re)seed the database
./start.sh           # run frontend + backend together (Ctrl-C stops both)
./start.sh backend   # backend only
./start.sh frontend  # frontend only
./start.sh seed      # reseed the database
./start.sh seed --reset   # drop + reseed the database
```

---

## Requirements

- **Node 20+** (Node 22 verified) — <https://nodejs.org>
- **Python 3.11+** (3.13 verified) and [`uv`](https://docs.astral.sh/uv/) *or* plain `venv`
- No database server: SQLite is created and seeded automatically

### Run it manually instead

**Terminal 1 — backend**

```bash
cd backend
python3 -m venv .venv                 # or: uv venv --python 3.13
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m app.seed --reset   # 20 products
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

API docs: **http://localhost:8000/docs**

---

## Configuration

Everything comes from two small env files. There is exactly **one** URL setting —
the frontend never hardcodes a backend address.

**`frontend/.env`**

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api   # single source of truth
VITE_SESSION_ID=demo                          # demo cart / wishlist owner
VITE_PORT=5173                                # dev server port
```

**`backend/.env`**

```dotenv
DATABASE_URL=sqlite:///./seedling_and_vine.db
CORS_ORIGINS=*
AUTO_SEED=true
PORT=8000
HOST=127.0.0.1
```

Copy either `*.env.example` to `*.env` to customise. `.env` files are committed
here only because this is a local demo — in a real project they would be
gitignored.

---

## API

All endpoints are prefixed with `/api`.

**Products** — `GET /products`
query params: `category` (`kids` | `normal` | `collector`), `search`, `fruit_type`,
`min_price`, `max_price`, `rarity`, `in_stock`, `featured`, `sort`
(`featured` | `price_asc` | `price_desc` | `newest` | `name` | `rarity`),
`page`, `page_size`

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/products` | Filter / search / sort / paginate |
| `GET` | `/products/fruit-types` | Distinct fruit types for filters |
| `GET` | `/products/{id}` | Single product |
| `GET` | `/cart?session_id=demo` | Cart with computed subtotal |
| `POST` | `/cart` | Add (merges by session + product + subscription) |
| `PATCH` | `/cart/{id}?session_id=demo` | Change quantity (`0` removes) |
| `DELETE` | `/cart/{id}` · `/cart` | Remove one / clear all |
| `POST` | `/orders` | Place a demo order from the server-side cart |
| `GET` | `/orders` | Recent orders |
| `POST` | `/newsletter` | Subscribe (`409` on duplicates) |
| `POST` | `/contact` | Contact message |
| `GET`/`POST` | `/wishlist` · `DELETE /wishlist/{id}` | Per-owner wishlist |
| `GET`/`POST`/`DELETE` | `/growing-journal` | Kids' growing journal |
| `GET` | `/stats` · `/stats/recent` | Impact counters + recent journal entries |
| `GET` | `/health` · `/meta` | Health check + brand metadata |

**Integrity guarantees** (verified by the test run in this repo):

- Stock is checked against the *resulting* quantity on both `POST` and `PATCH` —
  you cannot over-add.
- Checkout decrements stock by the full quantity ordered, and rejects oversells
  with `409` before any money-equivalent state changes.
- The order total is computed **server-side** from the session cart, so a
  tampered client payload can't change what you're charged.
- The cart is cleared only after the order row is successfully flushed.
- Wishlist uniqueness is scoped per `(product, owner)`, so two collectors can
  wishlist the same bottle.

---

## Frontend routes

```
/                 Home — hero, three-pack chooser, how it works, featured,
                  impact stats, testimonials, newsletter
/little-sprouts   Kids' storefront + seed-reveal, mini-game, growing journal
/daily-fresh      Everyday storefront + filters, search, sort, subscription
/rare-collection  Collector storefront + rarity, wishlist, bottle shelf
/cart             Cart + demo checkout + confirmation
/about            Brand story, values, process
/contact          Contact form
/anything-else    404
```

---

## Project structure

```
odd/
├── start.sh              # setup / run / seed both services
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, CORS, startup seed, /docs
│   │   ├── config.py      # env-driven settings
│   │   ├── db.py          # SQLAlchemy engine + session
│   │   ├── models.py      # products, cart, orders, journal, wishlist, …
│   │   ├── schemas.py     # Pydantic request/response validation
│   │   ├── seed.py        # 20 original products + demo records
│   │   └── routers/       # products, cart, orders, misc
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── vite.config.ts     # React, Tailwind, `@` alias, port
    ├── src/
    │   ├── lib/           # typed API client, money/date helpers
    │   ├── hooks/         # useCart, useAsync
    │   ├── components/    # cards, illustrations, navbar, footer, states
    │   ├── pages/         # one file per route
    │   ├── App.tsx        # routes + layout + page transitions
    │   └── index.css      # design tokens, type scale, motion utilities
    └── .env.example
```

---

## Design notes

- **Original by construction.** No third-party brand assets are referenced:
  illustrations are inline SVG, "product photography" is layered CSS/SVG bottle
  art, and fruit is rendered with emoji glyphs as a deliberate visual language.
- **Motion with intent.** Framer Motion drives scroll reveals, parallax,
  counters, the flying-to-cart animation, and page transitions — all behind
  `prefers-reduced-motion`, which the design also honours via CSS.
- **Accessible.** Focus-visible rings, labelled controls, keyboard-operable
  drag interactions (the peel action also responds to Enter/Space), ARIA live
  regions on forms, and semantic landmarks.
- **Responsive.** Fluid `clamp()` type scale and a mobile-first layout; the
  collector shelf reflows from a 3-up grid to a single column.

### Checks that pass

```bash
cd frontend
npx tsc -b --noEmit   # typecheck: clean
npm run lint          # oxlint: 0 errors
npm run build         # production build: 465 modules
```

---

## Roadmap — five sensible next steps

1. **Real accounts.** Replace the shared `demo` session key with signed
   auth (magic link or OAuth) so carts, wishlists, and journals are per-user and
   survive across devices.
2. **Order lifecycle + payments.** Add `pending → packed → shipped → delivered`
   transitions with `GET /orders/{id}`, and wire a test-mode payment provider
   behind an interface that's stubbed for the demo.
3. **Real art direction.** Swap emoji markers for a designed illustration/photo
   system with `srcset` and per-fruit colourways, plus an asset pipeline for the
   collector editions.
4. **Automated test coverage.** `pytest` + `httpx` for the API (stock,
   oversell, cart merge, pagination), Vitest + Testing Library for components,
   and one Playwright flow covering reveal → add to cart → checkout.
5. **Performance & SEO.** Paginate/cursor the catalogue, add ETag caching,
   set per-route `<title>`/`og:` tags, split the above-the-fold bundle, and
   enforce a bundle budget in CI.
