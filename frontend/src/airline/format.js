/** Display helpers. Money stays in pence everywhere else. */

const AIRPORTS = {
  AMS: 'Amsterdam',
  BCN: 'Barcelona',
  BER: 'Berlin',
  CDG: 'Paris',
  CPH: 'Copenhagen',
  DUB: 'Dublin',
  EDI: 'Edinburgh',
  FAO: 'Faro',
  GLA: 'Glasgow',
  JFK: 'New York',
  LHR: 'London',
  LIS: 'Lisbon',
  MAN: 'Manchester',
  RAK: 'Marrakesh',
}

export const cityName = (code) => AIRPORTS[code] ?? code

/** 15000 → "£150", 12950 → "£129.50" */
export function formatPence(pence) {
  const pounds = pence / 100
  return `£${pounds.toLocaleString('en-GB', {
    minimumFractionDigits: pence % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/** 15000 → "150", 12950 → "129.50" (for prefilling inputs) */
export const penceToInput = (pence) => (pence % 100 ? (pence / 100).toFixed(2) : String(pence / 100))

/** "£129.50" / "129.5" → 12950; null if not a positive amount. */
export function parsePoundsToPence(text) {
  const value = Number(String(text).replace(/[£,\s]/g, ''))
  if (!String(text).trim() || !Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 100)
}

const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** "2027-07-12", "2027-07-16" → "12–16 Jul"; across months → "30 Jun – 2 Jul" */
export function formatDateRange(earliest, latest) {
  const a = dayMonth.formatToParts(new Date(earliest))
  const b = dayMonth.formatToParts(new Date(latest))
  const part = (parts, type) => parts.find((p) => p.type === type)?.value
  if (part(a, 'month') === part(b, 'month')) return `${part(a, 'day')}–${part(b, 'day')} ${part(b, 'month')}`
  return `${dayMonth.format(new Date(earliest))} – ${dayMonth.format(new Date(latest))}`
}

/** Milliseconds left → "1h 05m", "4:07", or "Closed". */
export function formatCountdown(ms) {
  if (ms <= 0) return 'Closed'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(s).padStart(2, '0')}`
}

/** "urgent" under 1 minute, "soon" under 5, otherwise "" (used as a CSS modifier). */
export function countdownUrgency(ms) {
  if (ms <= 60_000) return 'urgent'
  if (ms <= 5 * 60_000) return 'soon'
  return ''
}

export function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'
  return `${n}${suffix}`
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
