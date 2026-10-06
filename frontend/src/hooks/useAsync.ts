/** Shared data-fetching hooks with loading + error state. */

import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/lib/api'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  /** Re-runs the fetcher. */
  reload: () => void
}

/**
 * Runs an async fetcher on mount and whenever `deps` change.
 * Guards against setting state after unmount and against out-of-order responses.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // Keep the latest fetcher in a ref so it never becomes a dependency.
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof ApiError
            ? err.message
            : 'We could not reach the Seedling & Vine kitchen. Is the backend running?'
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  return { data, loading, error, reload }
}

/** Debounces a rapidly-changing value (search inputs). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
