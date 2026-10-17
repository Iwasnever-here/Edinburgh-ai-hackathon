import { useCallback, useEffect, useState } from 'react'

/** Current time in ms, re-rendering every `intervalMs` (drives countdowns). */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/**
 * Calls `load` now and then every `intervalMs` after each response (no overlapping
 * requests). Re-starts when `deps` change. `refresh()` fetches immediately.
 * Keeps the last good data while a new request is in flight.
 */
export function usePolling(load, intervalMs, deps) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    let timer
    async function run() {
      try {
        const result = await load()
        if (cancelled) return
        setData(result)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) {
          setLoaded(true)
          timer = setTimeout(run, intervalMs)
        }
      }
    }
    run()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // `load` is intentionally excluded: callers pass an inline function and list its inputs in `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intervalMs, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  return { data, error, loaded, refresh }
}
