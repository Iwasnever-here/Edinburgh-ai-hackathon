import { useEffect, useRef, useState } from 'react'
import { getStanding, submitOffer } from './api.js'
import {
  cityName,
  countdownUrgency,
  formatCountdown,
  formatDateRange,
  formatPence,
  ordinal,
  parsePoundsToPence,
  penceToInput,
  plural,
} from './format.js'
import { usePolling } from './hooks.js'

const MAX_BAGS = 9

export default function BidPanel({ request, airline, myOffer, now, onSubmitted }) {
  const minFare = airline.minFares.find((f) => f.origin === request.origin && f.destination === request.destination)
  const minTotalPence = minFare ? minFare.minFarePence * request.passengers : null

  const [price, setPrice] = useState(() =>
    penceToInput(myOffer ? myOffer.pricePence : Math.round((request.maxPricePence * 0.9) / 100) * 100),
  )
  const [bags, setBags] = useState(myOffer ? myOffer.checkedBags : request.checkedBags)
  const [direct, setDirect] = useState(myOffer ? myOffer.direct : request.directOnly)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const standing = usePolling(() => getStanding(request.id, airline.id), 2000, [request.id, airline.id])
  const rank = standing.data?.priceRank
  const prevRank = useRef(null)
  const [rankChange, setRankChange] = useState(null)
  useEffect(() => {
    if (rank == null) return
    if (prevRank.current != null && prevRank.current !== rank) setRankChange({ from: prevRank.current, to: rank })
    prevRank.current = rank
  }, [rank])

  const msLeft = Date.parse(request.biddingClosesAt) - now
  const closed = msLeft <= 0
  const pricePence = parsePoundsToPence(price)
  const overBudget = pricePence != null && pricePence > request.maxPricePence
  const belowMin = pricePence != null && minTotalPence != null && pricePence < minTotalPence

  async function handleSubmit(e) {
    e.preventDefault()
    if (pricePence == null || closed) return
    setSubmitting(true)
    try {
      const previous = myOffer
      const offer = await submitOffer(request.id, airline.id, { pricePence, checkedBags: bags, direct })
      setResult({ offer, previous })
      if (offer.status === 'VALID') {
        setRankChange(null)
        standing.refresh()
      }
      onSubmitted()
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="ap-panel ap-bid" aria-labelledby="ap-bid-title">
      <div className="ap-bid__head">
        <div>
          <h2 id="ap-bid-title" className="ap-route ap-route--large">
            {request.origin} <span className="ap-route__arrow">→</span> {request.destination}
          </h2>
          <div className="ap-route__cities">
            {cityName(request.origin)} to {cityName(request.destination)} · {formatDateRange(request.earliest, request.latest)}
          </div>
        </div>
        <span className={`ap-countdown ap-countdown--large ap-countdown--${countdownUrgency(msLeft) || 'normal'}`}>
          ⏱ {formatCountdown(msLeft)}
        </span>
      </div>

      <ul className="ap-needs" aria-label="Traveller requirements">
        <li><span>Budget</span><strong>≤ {formatPence(request.maxPricePence)} total</strong></li>
        <li><span>Passengers</span><strong>{request.passengers}</strong></li>
        <li><span>Checked bags</span><strong>≥ {request.checkedBags}</strong></li>
        <li><span>Flight</span><strong>{request.directOnly ? 'Direct only' : 'Any'}</strong></li>
      </ul>

      <form className="ap-bid__form" onSubmit={handleSubmit}>
        <label className="ap-field">
          <span className="ap-field__label">Your price (total for {plural(request.passengers, 'passenger')})</span>
          <span className={`ap-money${overBudget ? ' ap-money--warn' : ''}`}>
            <span className="ap-money__symbol">£</span>
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-describedby="ap-price-hint" />
          </span>
          <span id="ap-price-hint" className="ap-field__hint">
            {minTotalPence != null && (
              <>Your minimum fare here: {formatPence(minTotalPence)} ({formatPence(minFare.minFarePence)} × {request.passengers}). </>
            )}
            {overBudget && <span className="ap-text-warn">Over the traveller's budget: the platform will reject this. </span>}
            {belowMin && <span className="ap-text-warn">Below your minimum fare. </span>}
          </span>
        </label>

        <div className="ap-bid__row">
          <div className="ap-field">
            <span className="ap-field__label" id="ap-bags-label">Checked bags</span>
            <div className="ap-stepper" role="group" aria-labelledby="ap-bags-label">
              <button type="button" onClick={() => setBags((b) => Math.max(0, b - 1))} disabled={bags <= 0} aria-label="Fewer bags">−</button>
              <output aria-live="polite">{bags}</output>
              <button type="button" onClick={() => setBags((b) => Math.min(MAX_BAGS, b + 1))} disabled={bags >= MAX_BAGS} aria-label="More bags">+</button>
            </div>
          </div>
          <label className="ap-switch">
            <input type="checkbox" role="switch" checked={direct} onChange={(e) => setDirect(e.target.checked)} />
            <span className="ap-switch__track" aria-hidden="true" />
            <span className="ap-switch__label">Direct flight</span>
          </label>
        </div>

        <button className="ap-btn ap-btn--primary ap-btn--block" type="submit" disabled={submitting || closed || pricePence == null}>
          {closed ? 'Bidding closed' : submitting ? 'Submitting…' : myOffer ? 'Revise bid' : 'Place bid'}
        </button>
      </form>

      <BidResult result={result} />

      {myOffer && (
        <p className="ap-bid__current">
          Your active bid: <strong>{formatPence(myOffer.pricePence)}</strong> · {plural(myOffer.checkedBags, 'bag')} ·{' '}
          {myOffer.direct ? 'direct' : 'connecting'}
        </p>
      )}

      {standing.data ? (
        <div className="ap-standing" aria-live="polite">
          <div className="ap-standing__label">Your standing</div>
          <div className="ap-standing__rank">
            <span className={`ap-standing__big${rank === 1 ? ' is-leading' : ''}`}>{ordinal(rank)}</span>
            <span>of {standing.data.totalBids} on price</span>
          </div>
          {rankChange && (
            <div className={`ap-standing__change ap-standing__change--${rankChange.to < rankChange.from ? 'up' : 'down'}`}>
              {rankChange.to < rankChange.from ? '▲ Up' : '▼ Down'} from {ordinal(rankChange.from)}
            </div>
          )}
          {standing.data.strengths.length > 0 && (
            <ul className="ap-chips">
              {standing.data.strengths.map((s) => (
                <li key={s} className="ap-chip">✓ {s}</li>
              ))}
            </ul>
          )}
          <p className="ap-standing__note">{standing.data.note}</p>
          <p className="ap-standing__privacy">🔒 Competitor prices are never shown.</p>
        </div>
      ) : (
        standing.loaded && !myOffer && <p className="ap-muted">Place a valid bid to see where you stand.</p>
      )}
    </section>
  )
}

function BidResult({ result }) {
  if (!result) return null
  if (result.error) {
    return <div className="ap-alert ap-alert--error" role="alert">{result.error}</div>
  }
  const { offer, previous } = result
  if (offer.status === 'REJECTED') {
    return (
      <div className="ap-alert ap-alert--error" role="alert">
        <strong>Bid rejected.</strong> {offer.rejectionReason}
      </div>
    )
  }
  return (
    <div className="ap-alert ap-alert--ok" role="status">
      {previous ? (
        <>
          <strong>Bid revised:</strong> {formatPence(previous.pricePence)} → {formatPence(offer.pricePence)}. Your previous offer is now superseded.
        </>
      ) : (
        <>
          <strong>Bid placed</strong> at {formatPence(offer.pricePence)}.
        </>
      )}
    </div>
  )
}
