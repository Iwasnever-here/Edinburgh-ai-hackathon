const LABELS = {
  VALID: 'Active',
  REJECTED: 'Rejected',
  SUPERSEDED: 'Superseded',
  ACCEPTED: 'Won',
  LOST: 'Lost',
  EXPIRED: 'Expired',
}

/** @param {{ status: import('./types.js').OfferStatus }} props */
export default function StatusBadge({ status }) {
  return (
    <span className={`ap-badge ap-badge--${status.toLowerCase()}`} title={status}>
      {LABELS[status] ?? status}
    </span>
  )
}
