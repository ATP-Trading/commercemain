/** Refresh on navigation/return and briefly retry for asynchronous payment fulfillment. */
export function watchReturnRefresh(refresh: () => Promise<void>, retry = true) {
  let disposed = false
  let pending = false
  let deadline = Date.now() + 120_000
  const run = async () => {
    if (disposed || pending || document.visibilityState === 'hidden') return
    pending = true
    try { await refresh() } catch { /* Keep current UI; retry on the next return. */ }
    finally { pending = false }
  }
  const returned = () => { deadline = Date.now() + 120_000; void run() }
  window.addEventListener('focus', returned)
  window.addEventListener('pageshow', returned)
  document.addEventListener('visibilitychange', returned)
  const timer = retry ? window.setInterval(() => {
    if (Date.now() < deadline) void run()
  }, 5000) : undefined
  void run()
  return () => {
    disposed = true
    window.removeEventListener('focus', returned)
    window.removeEventListener('pageshow', returned)
    document.removeEventListener('visibilitychange', returned)
    if (timer !== undefined) window.clearInterval(timer)
  }
}
