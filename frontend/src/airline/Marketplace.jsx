import { useEffect, useRef, useState } from 'react'
import BidPanel from './BidPanel.jsx'
import { cityName, countdownUrgency, formatCountdown, formatDateRange, formatPence, plural } from './format.js'

const PULSE_MS = 2000

export default function Marketplace({ airline, requests, myActiveOffers, now, simulated, onSubmitted }) {
  const [selectedId, setSelectedId] = useState(null)
  const [pulses, setPulses] = useState({})
  const [activity, setActivity] = useState([])
  const prevCounts = useRef(null)
  const sideRef = useRef(null)

  function select(id) {
    setSelectedId(id)
    // On narrow screens the bid panel stacks above the list; bring it into view.
    if (window.matchMedia('(max-width: 960px)').matches) sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Detect new bids by watching bidCount rise between polls (works for mock and real data).
  useEffect(() => {
    if (!requests) return
    const prev = prevCounts.current
    prevCounts.current = Object.fromEntries(requests.map((r) => [r.id, r.bidCount]))
    if (!prev) return
    const bumped = requests.filter((r) => prev[r.id] !== undefined && r.bidCount > prev[r.id])
    if (!bumped.length) return
    const at = Date.now()
    setPulses((p) => ({ ...p, ...Object.fromEntries(bumped.map((r) => [r.id, at])) }))
    setActivity((a) => [...bumped.map((r) => ({ key: `${r.id}-${at}`, request: r, at })), ...a].slice(0, 5))
  }, [requests])

  const selected = requests?.find((r) => r.id === selectedId)

  return (
    <div className="ap-market">
      <section className="ap-panel ap-market__list" aria-labelledby="ap-open-requests">
        <div className="ap-section-head">
          <h2 id="ap-open-requests">Open requests</h2>
          <span className="ap-live">
            <span className="ap-live__dot" aria-hidden="true" /> Live
          </span>
          {simulated && <span className="ap-sim-pill">Simulated competition</span>}
        </div>

        {!requests && <p className="ap-muted">Loading the marketplace…</p>}
        {requests?.length === 0 && <p className="ap-muted">No open requests right now. New ones appear here as travellers post them.</p>}

        <ul className="ap-requests">
          {requests?.map((r) => {
            const msLeft = Date.parse(r.biddingClosesAt) - now
            const pulsing = pulses[r.id] && now - pulses[r.id] < PULSE_MS
            const mine = myActiveOffers.get(r.id)
            return (
              <li key={r.id}>
                <button
                  type="button"
                  className={`ap-request${r.id === selectedId ? ' is-selected' : ''}${pulsing ? ' is-pulsing' : ''}`}
                  aria-pressed={r.id === selectedId}
                  onClick={() => select(r.id)}
                >
                  <div className="ap-request__route">
                    <div className="ap-route">
                      {r.origin} <span className="ap-route__arrow">→</span> {r.destination}
                    </div>
                    <div className="ap-route__cities">
                      {cityName(r.origin)} to {cityName(r.destination)}
                    </div>
                  </div>
                  <div className="ap-request__meta">
                    <span>{formatDateRange(r.earliest, r.latest)}</span>
                    <span>{plural(r.passengers, 'passenger')}</span>
                    {r.checkedBags > 0 && <span>{plural(r.checkedBags, 'bag')}</span>}
                    {r.directOnly && <span className="ap-tag">Direct only</span>}
                    {mine && <span className="ap-tag ap-tag--mine">Your bid {formatPence(mine.pricePence)}</span>}
                  </div>
                  <div className="ap-request__budget">
                    <div className="ap-request__budget-label">Max budget</div>
                    <div className="ap-request__budget-value">{formatPence(r.maxPricePence)}</div>
                  </div>
                  <div className="ap-request__live">
                    <span key={pulses[r.id] ?? 0} className={`ap-bidcount${pulsing ? ' ap-bidcount--new' : ''}`}>
                      {plural(r.bidCount, 'bid')}
                    </span>
                    <span className={`ap-countdown ap-countdown--${countdownUrgency(msLeft) || 'normal'}`}>
                      ⏱ {formatCountdown(msLeft)}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <aside className="ap-market__side" ref={sideRef}>
        {selected ? (
          <BidPanel
            key={selected.id}
            request={selected}
            airline={airline}
            myOffer={myActiveOffers.get(selected.id)}
            now={now}
            onSubmitted={onSubmitted}
          />
        ) : (
          <div className="ap-panel ap-empty">
            {selectedId ? (
              <>
                <h3>Bidding has closed</h3>
                <p>Check My Bids for the outcome.</p>
              </>
            ) : (
              <>
                <h3>Pick a request to bid on</h3>
                <p>Set your price, bags and direct option. The platform checks it against the traveller's limits instantly.</p>
              </>
            )}
          </div>
        )}

        <section className="ap-panel ap-activity" aria-labelledby="ap-activity-title">
          <div className="ap-section-head">
            <h3 id="ap-activity-title">Market activity</h3>
            {simulated && <span className="ap-sim-pill">Simulated</span>}
          </div>
          {activity.length === 0 ? (
            <p className="ap-muted">Waiting for new bids…</p>
          ) : (
            <ul className="ap-activity__list">
              {activity.map((e) => (
                <li key={e.key} className="ap-activity__item">
                  <span className="ap-activity__dot" aria-hidden="true" />
                  New bid on <strong>{e.request.origin} → {e.request.destination}</strong>
                  <span className="ap-muted"> · {Math.max(0, Math.round((now - e.at) / 1000))}s ago</span>
                </li>
              ))}
            </ul>
          )}
          <p className="ap-activity__privacy">Competitor identities and prices are hidden.</p>
        </section>
      </aside>
    </div>
  )
}
