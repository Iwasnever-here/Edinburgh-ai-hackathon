import { cityName, countdownUrgency, formatCountdown, formatDateRange, formatPence, plural } from '../airline/format.js'
import { msUntil } from './time.js'

/** Strip of every request, plus the selected request's details. */
export default function RequestSelector({ requests, selected, offers, now, onSelect }) {
  return (
    <section className="lb-requests" aria-label="Requests">
      <div className="lb-chips" role="tablist" aria-label="Choose a request">
        {requests?.map((r) => {
          const ms = msUntil(r.biddingClosesAt, now)
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === selected?.id}
              className={`lb-chip${r.id === selected?.id ? ' is-selected' : ''}${ms <= 0 ? ' is-closed' : ''}`}
              onClick={() => onSelect(r.id)}
            >
              <span className="lb-chip__route">{r.origin}→{r.destination}</span>
              <span className="lb-chip__meta">
                {plural(r.bidCount, 'bid')} · {ms > 0 ? formatCountdown(ms) : 'closed'}
              </span>
            </button>
          )
        })}
      </div>

      {selected && <RequestDetail request={selected} offers={offers} now={now} />}
    </section>
  )
}

function RequestDetail({ request, offers, now }) {
  const ms = msUntil(request.biddingClosesAt, now)
  const accepted = offers?.find((o) => o.status === 'ACCEPTED')
  let status
  if (ms > 0) status = countdownUrgency(ms) ? { label: 'Closing soon', tone: 'amber' } : { label: 'Bidding open', tone: 'green' }
  else status = accepted ? { label: `Awarded to ${accepted.airline.name}`, tone: 'blue' } : { label: 'Closed', tone: 'grey' }

  return (
    <div className="lb-detail">
      <div className="lb-detail__route">
        <h1>
          {request.origin} <span className="lb-arrow">→</span> {request.destination}
        </h1>
        <div className="lb-detail__sub">
          {cityName(request.origin)} to {cityName(request.destination)} · {formatDateRange(request.earliest, request.latest)} ·{' '}
          {plural(request.passengers, 'passenger')} · {request.checkedBags > 0 ? `≥ ${plural(request.checkedBags, 'bag')}` : 'no bags needed'}
          {request.directOnly && ' · direct only'}
        </div>
      </div>
      <div className="lb-stat">
        <span className="lb-stat__label">Budget</span>
        <span className="lb-stat__value">{formatPence(request.maxPricePence)}</span>
      </div>
      <div className="lb-stat">
        <span className="lb-stat__label">Bidding</span>
        <span className={`lb-stat__value lb-countdown lb-countdown--${ms > 0 ? countdownUrgency(ms) || 'normal' : 'closed'}`}>
          {ms > 0 ? formatCountdown(ms) : 'Closed'}
        </span>
      </div>
      <span className={`lb-badge lb-badge--${status.tone}`}>{status.label}</span>
    </div>
  )
}
