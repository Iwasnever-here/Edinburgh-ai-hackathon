const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

/** ISO timestamp or epoch ms → "14:03:27" */
export const formatClock = (time) => clock.format(new Date(time))

/** Milliseconds left until an ISO timestamp, from `now` (epoch ms). */
export const msUntil = (iso, now) => Date.parse(iso) - now
