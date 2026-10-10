/** Explicit, tab-scoped staff/test preference. Never inferred from a customer identity. */
export function measurementMode(): 'normal' | 'debug' | 'off' {
  if (typeof window === 'undefined') return 'normal';
  try {
    const requested = new URL(window.location.href).searchParams.get('atp_measurement');
    if (requested === 'debug' || requested === 'off' || requested === 'normal') {
      sessionStorage.setItem('atp-measurement-mode', requested);
      return requested;
    }
    const saved = sessionStorage.getItem('atp-measurement-mode');
    return saved === 'debug' || saved === 'off' ? saved : 'normal';
  } catch { return 'normal'; }
}
