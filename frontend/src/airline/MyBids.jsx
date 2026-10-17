import StatusBadge from './StatusBadge.jsx'
import { cityName, countdownUrgency, formatCountdown, formatDateRange, formatPence, plural } from './format.js'

export default function MyBids({ threads, now, simulated }) {
  if (!threads) return <p className="ap-muted">Loading your bids…</p>
  if (threads.length === 0) {
    return (
      <div className="ap-panel ap-empty">
        <h3>No bids yet</h3>
        <p>Head to the Marketplace and place your first bid.</p>
      </div>
    )
  }
  return (
    <div className="ap-mybids">
      {simulated && (
        <p className="ap-sim-note">
          <span className="ap-sim-pill">Simulated</span> When bidding closes, the cheapest valid bid is accepted on the traveller's behalf.
        </p>
      )}
      {threads.map((t) => (
        <BidThread key={t.request.id} thread={t} now={now} />
      ))}
    </div>
  )
}

function BidThread({ thread, now }) {
  const { request, offers } = thread
  // Headline status: the latest offer that isn't a rejected attempt.
  const current = offers.findLast((o) => o.status !== 'REJECTED') ?? offers.at(-1)
  const msLeft = Date.parse(request.biddingClosesAt) - now
  const priced = offers.filter((o) => o.status !== 'REJECTED')

  return (
    <article className={`ap-panel ap-thread ap-thread--${current.status.toLowerCase()}`}>
      <header className="ap-thread__head">
        <div>
          <div className="ap-route">
            {request.origin} <span className="ap-route__arrow">→</span> {request.destination}
          </div>
          <div className="ap-route__cities">
            {cityName(request.origin)} to {cityName(request.destination)} · {formatDateRange(request.earliest, request.latest)} ·{' '}
            {plural(request.passengers, 'passenger')} · max {formatPence(request.maxPricePence)}
          </div>
        </div>
        <div className="ap-thread__status">
          <StatusBadge status={current.status} />
          <span className={`ap-countdown ap-countdown--${msLeft > 0 ? countdownUrgency(msLeft) || 'normal' : 'closed'}`}>
            {msLeft > 0 ? `⏱ ${formatCountdown(msLeft)}` : 'Closed'}
          </span>
        </div>
      </header>

      <div className="ap-thread__current">
        <span className="ap-thread__price">{formatPence(current.pricePence)}</span>
        <span className="ap-muted">
          {plural(current.checkedBags, 'bag')} · {current.direct ? 'direct' : 'connecting'}
        </span>
      </div>

      {offers.length > 1 && (
        <>
          <div className="ap-history__label">
            Price history{priced.length > 1 && ` · ${formatPence(priced[0].pricePence)} → ${formatPence(priced.at(-1).pricePence)}`}
          </div>
          <ol className="ap-history">
            {offers.map((o) => (
              <li key={o.id} className={`ap-history__item ap-history__item--${o.status.toLowerCase()}`}>
                <span className="ap-history__price">{formatPence(o.pricePence)}</span>
                <StatusBadge status={o.status} />
                {o.rejectionReason && <span className="ap-history__reason">{o.rejectionReason}</span>}
              </li>
            ))}
          </ol>
        </>
      )}
      {offers.length === 1 && current.rejectionReason && <p className="ap-text-error">{current.rejectionReason}</p>}
      {current.reasoning && <p className="ap-thread__reasoning">{current.reasoning}</p>}
    </article>
  )
}
