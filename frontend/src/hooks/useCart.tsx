/**
 * Global cart state.
 *
 * The cart lives on the server (SQLite) but is mirrored here so the navbar badge,
 * fly-to-cart animation and cart page can react instantly without a round trip.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { api, SESSION_ID, type Cart, type CartItem, type Product, type SubscriptionCadence } from '@/lib/api'
import { shippingFor } from '@/lib/utils'

export interface FlyToCartEvent {
  id: number
  product: Product
  /** Viewport coordinates of the clicked "add" button. */
  origin: { x: number; y: number }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  loading: boolean
  error: string | null
  /** Most recent add-to-cart flight, consumed by <FlyToCartLayer />. */
  flyEvent: FlyToCartEvent | null
  clearFlyEvent: () => void
  addItem: (
    product: Product,
    options?: {
      quantity?: number
      isSubscription?: boolean
      cadence?: SubscriptionCadence
      origin?: { x: number; y: number }
    },
  ) => Promise<void>
  setQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clear: () => Promise<void>
  reload: () => Promise<void>
  /** Flashes the badge — used for optimistic UI when the API is slow. */
  bump: (delta: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const EMPTY_CART: Cart = { items: [], item_count: 0, subtotal: 0 }

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flyEvent, setFlyEvent] = useState<FlyToCartEvent | null>(null)
  const flyId = useRef(0)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const next = await api.getCart(SESSION_ID)
      setCart(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your cart.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const addItem = useCallback<CartContextValue['addItem']>(
    async (product, options = {}) => {
      const { quantity = 1, isSubscription = false, cadence, origin } = options
      setError(null)

      // Trigger the flight animation immediately; the network can take its time.
      if (origin) {
        flyId.current += 1
        setFlyEvent({ id: flyId.current, product, origin })
      }

      try {
        const next = await api.addToCart({
          product_id: product.id,
          quantity,
          session_id: SESSION_ID,
          is_subscription: isSubscription,
          subscription_cadence: cadence ?? undefined,
        })
        setCart(next)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not add that to your cart.')
        throw err
      }
    },
    [],
  )

  const setQuantity = useCallback(async (itemId: number, quantity: number) => {
    setError(null)
    // Optimistic local update keeps the +/- buttons feeling instant.
    setCart((current) => {
      const items = current.items
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
      return recalc(items)
    })
    try {
      setCart(await api.updateCartItem(itemId, { quantity }, SESSION_ID))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that item.')
      void reload()
    }
  }, [reload])

  const removeItem = useCallback(async (itemId: number) => {
    setError(null)
    setCart((current) => recalc(current.items.filter((item) => item.id !== itemId)))
    try {
      setCart(await api.removeCartItem(itemId, SESSION_ID))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that item.')
      void reload()
    }
  }, [reload])

  const clear = useCallback(async () => {
    setError(null)
    setCart(EMPTY_CART)
    try {
      setCart(await api.clearCart(SESSION_ID))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not empty your cart.')
      void reload()
    }
  }, [reload])

  const clearFlyEvent = useCallback(() => setFlyEvent(null), [])

  /** Tiny optimistic nudge for the badge pulse animation. */
  const bump = useCallback((delta: number) => {
    setCart((current) => ({ ...current, item_count: Math.max(0, current.item_count + delta) }))
    // Re-sync shortly after so the optimistic value is replaced by truth.
    window.setTimeout(() => void reload(), 450)
  }, [reload])

  const value = useMemo<CartContextValue>(() => {
    const shipping = shippingFor(cart.subtotal)
    return {
      items: cart.items,
      itemCount: cart.item_count,
      subtotal: cart.subtotal,
      shipping,
      total: Math.round((cart.subtotal + shipping) * 100) / 100,
      loading,
      error,
      flyEvent,
      clearFlyEvent,
      addItem,
      setQuantity,
      removeItem,
      clear,
      reload,
      bump,
    }
  }, [cart, loading, error, flyEvent, clearFlyEvent, addItem, setQuantity, removeItem, clear, reload, bump])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function recalc(items: CartItem[]): Cart {
  return {
    items,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Math.round(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100) / 100,
  }
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
