/**
 * Typed API layer for the Seedling & Vine backend.
 *
 * The base URL comes from a single env var (`VITE_API_BASE_URL`) so the frontend
 * can be pointed at any backend without touching component code.
 */

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

/** Trailing slashes are stripped so joins never produce `//api`. */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '')

/** Demo "session" key — stands in for auth in this storefront demo. */
export const SESSION_ID = import.meta.env.VITE_SESSION_ID ?? 'demo'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const isFormData = body instanceof FormData
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(isFormData || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  if (response.status === 204) return undefined as T

  const raw = await response.text()
  let parsed: unknown = null
  if (raw) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = raw
    }
  }

  if (!response.ok) {
    const detail =
      parsed && typeof parsed === 'object' && 'detail' in parsed
        ? String((parsed as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`
    throw new ApiError(detail, response.status)
  }

  return parsed as T
}

/** Builds a querystring, dropping empty values so URLs stay clean. */
function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

// ---------------------------------------------------------------------------
// Types (mirror the Pydantic schemas in backend/app/schemas.py)
// ---------------------------------------------------------------------------

export type ProductCategory = 'kids' | 'normal' | 'collector'
export type Rarity = 'Common' | 'Rare' | 'Legendary'
export type SubscriptionCadence = 'weekly' | 'bi-weekly'

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number
  category: ProductCategory
  fruit_type: string
  emoji: string
  accent: string
  is_featured: boolean
  seed_grow_guide: string | null
  bottle_shape: BottleShape | null
  rarity: Rarity | null
  stock: number
  edition_size: number | null
  box_size: string | null
}

export type BottleShape = 'skull' | 'apple' | 'dragon' | 'pear' | 'moon' | 'hedgehog'

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  is_subscription: boolean
  subscription_cadence: SubscriptionCadence | null
  product: Product
}

export interface Cart {
  items: CartItem[]
  item_count: number
  subtotal: number
}

export interface Order {
  id: number
  customer_name: string
  email: string
  address: string
  total: number
  created_at: string
  items: { id: number; product_name: string; unit_price: number; quantity: number }[]
}

export interface JournalEntry {
  id: number
  child_name_or_nickname: string
  fruit_type: string
  planted_date: string
  sprout_date: string | null
  note: string | null
  created_at: string
}

export interface WishlistEntry {
  id: number
  product_id: number
  owner: string
  created_at: string
  product: Product
}

export interface ImpactStats {
  seeds_planted: number
  trees_grown: number
  bottles_collected: number
  families_planting: number
  countries_reached: number
}

export type SortOption =
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'newest'
  | 'rarity'

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export interface ProductQuery {
  category?: ProductCategory
  fruit_type?: string
  search?: string
  min_price?: number
  max_price?: number
  featured?: boolean
  sort?: SortOption
  limit?: number
  offset?: number
}

export const api = {
  health: () => request<{ status: string; brand: string }>('/health'),

  listProducts: (query: ProductQuery = {}) =>
    request<Product[]>(`/products${qs(query as Record<string, string | number | boolean | null>)}`),

  getProduct: (id: number) => request<Product>(`/products/${id}`),

  listFruitTypes: () => request<string[]>('/products/fruit-types'),

  getCart: (sessionId = SESSION_ID) => request<Cart>(`/cart${qs({ session_id: sessionId })}`),

  addToCart: (input: {
    product_id: number
    quantity?: number
    session_id?: string
    is_subscription?: boolean
    subscription_cadence?: SubscriptionCadence
  }) => request<Cart>('/cart', { method: 'POST', body: input }),

  updateCartItem: (
    id: number,
    input: {
      quantity: number
      is_subscription?: boolean
      subscription_cadence?: SubscriptionCadence
    },
    sessionId = SESSION_ID,
  ) => request<Cart>(`/cart/${id}${qs({ session_id: sessionId })}`, { method: 'PATCH', body: input }),

  removeCartItem: (id: number, sessionId = SESSION_ID) =>
    request<Cart>(`/cart/${id}${qs({ session_id: sessionId })}`, { method: 'DELETE' }),

  clearCart: (sessionId = SESSION_ID) =>
    request<Cart>(`/cart${qs({ session_id: sessionId })}`, { method: 'DELETE' }),

  createOrder: (input: {
    customer_name: string
    email: string
    address: string
    session_id?: string
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      // Defaults to the same session the cart was loaded from, so a custom
      // VITE_SESSION_ID can't leave the cart behind after checkout.
      body: { session_id: SESSION_ID, ...input },
    }),

  subscribeNewsletter: (input: { email: string; nickname?: string; interest?: string }) =>
    request<{ id: number; email: string }>('/newsletter', { method: 'POST', body: input }),

  sendContact: (input: { name: string; email: string; topic: string; message: string }) =>
    request<{ id: number; message: string }>('/contact', { method: 'POST', body: input }),

  getWishlist: (owner = SESSION_ID) =>
    request<WishlistEntry[]>(`/wishlist${qs({ owner })}`),

  addWishlist: (productId: number, owner = SESSION_ID) =>
    request<WishlistEntry>('/wishlist', { method: 'POST', body: { product_id: productId, owner } }),

  removeWishlist: (productId: number, owner = SESSION_ID) =>
    request<void>(`/wishlist/${productId}${qs({ owner })}`, { method: 'DELETE' }),

  getJournal: (fruitType?: string) =>
    request<JournalEntry[]>(`/growing-journal${qs({ fruit_type: fruitType })}`),

  addJournalEntry: (input: {
    child_name_or_nickname: string
    fruit_type: string
    planted_date?: string
    sprout_date?: string | null
    note?: string
  }) => request<JournalEntry>('/growing-journal', { method: 'POST', body: input }),

  deleteJournalEntry: (id: number) =>
    request<void>(`/growing-journal/${id}`, { method: 'DELETE' }),

  getStats: () => request<ImpactStats>('/stats'),

  recentPlantings: (limit = 6) =>
    request<JournalEntry[]>(`/stats/recent${qs({ limit })}`),
}
