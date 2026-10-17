import { useEffect, useRef, useState } from 'react'
import BidPanel from './BidPanel.jsx'
import { cityName, countdownUrgency, formatCountdown, formatDateRange, formatPence, plural } from './format.js'

const PULSE_MS = 2000

const marketplaceStyles = `
  .ap-market {
    --market-navy: #05203c;
    --market-blue: #0069e3;
    --market-muted: #63778c;
    --market-border: #dce5ef;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, 1fr);
    gap: 22px;
    align-items: start;
    color: var(--market-navy);
  }

  .ap-market .ap-panel {
    background: #ffffff;
    border: 1px solid var(--market-border);
    border-radius: 18px;
    box-shadow: 0 8px 28px rgba(5, 32, 60, .06);
  }

  .ap-market .ap-market__list { min-width: 0; padding: 24px; }
  .ap-market .ap-section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .ap-market .ap-section-head h2,
  .ap-market .ap-section-head h3 {
    color: var(--market-navy);
    font-size: 21px;
    font-weight: 850;
    letter-spacing: -.6px;
    margin: 0;
  }
  .ap-market .ap-section-head h3 { font-size: 17px; }
  .ap-market .ap-live {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border: 1px solid #b8e5c8;
    border-radius: 99px;
    background: #edfdf3;
    color: #167044;
    font-size: 11px;
    font-weight: 800;
  }
  .ap-market .ap-live__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, .13);
  }
  .ap-market .ap-sim-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 99px;
    background: #edf4fd;
    color: #385e81;
    font-size: 11px;
    font-weight: 750;
  }
  .ap-market .ap-muted { color: var(--market-muted); line-height: 1.6; }

  .ap-market .ap-requests { display: grid; gap: 12px; padding: 0; margin: 0; list-style: none; }
  .ap-market .ap-requests > li { min-width: 0; }
  .ap-market .ap-request {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 18px;
    row-gap: 12px;
    padding: 19px;
    text-align: left;
    background: #ffffff;
    color: var(--market-navy);
    border: 1px solid var(--market-border);
    border-radius: 14px;
    cursor: pointer;
    transition: border-color .16s, box-shadow .16s, background .16s, transform .16s;
  }
  .ap-market .ap-request:hover {
    background: #f8fbff;
    border-color: #91bcf4;
    box-shadow: 0 4px 14px rgba(5, 32, 60, .06);
    transform: translateY(-1px);
  }
  .ap-market .ap-request.is-selected {
    background: #f0f7ff;
    border: 2px solid var(--market-blue);
    padding: 18px;
    box-shadow: 0 0 0 3px rgba(0, 105, 227, .09);
  }
  .ap-market .ap-request:focus-visible { outline: 3px solid #7cb7ff; outline-offset: 3px; }
  .ap-market .ap-request.is-pulsing { animation: market-bid-pulse 1.15s ease-out; }
  @keyframes market-bid-pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 105, 227, .24); }
    100% { box-shadow: 0 0 0 10px rgba(0, 105, 227, 0); }
  }
  .ap-market .ap-request__route { min-width: 0; }
  .ap-market .ap-request .ap-route {
    color: var(--market-navy);
    font-size: clamp(17px, 1.7vw, 21px);
    font-weight: 850;
    letter-spacing: -.65px;
    line-height: 1.25;
  }
  .ap-market .ap-request .ap-route__arrow { color: var(--market-blue); }
  .ap-market .ap-request .ap-route__cities { margin-top: 5px; color: var(--market-muted); font-size: 12px; }
  .ap-market .ap-request__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px 10px;
    grid-column: 1;
    color: var(--market-muted);
    font-size: 12px;
    line-height: 1.5;
  }
  .ap-market .ap-tag {
    padding: 4px 8px;
    border-radius: 7px;
    background: #edf4fd;
    color: #244968;
    font-size: 11px;
    font-weight: 750;
  }
  .ap-market .ap-tag--mine { background: #e4f2ff; color: #0057bd; }
  .ap-market .ap-request__budget {
    grid-column: 2;
    grid-row: 1 / span 2;
    justify-self: end;
    text-align: right;
    white-space: nowrap;
    align-self: center;
  }
  .ap-market .ap-request__budget-label { color: var(--market-muted); font-size: 11px; font-weight: 650; }
  .ap-market .ap-request__budget-value { margin-top: 4px; color: var(--market-navy); font-size: 23px; font-weight: 900; letter-spacing: -.8px; }
  .ap-market .ap-request__live {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    grid-column: 1 / -1;
    padding-top: 11px;
    border-top: 1px solid var(--market-border);
  }
  .ap-market .ap-bidcount {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 8px;
    background: #edf4fd;
    color: #315779;
    font-size: 12px;
    font-weight: 800;
  }
  .ap-market .ap-bidcount--new { background: #e6f5eb; color: #157347; }
  .ap-market .ap-request__live .ap-countdown {
    padding: 6px 10px;
    border: 1px solid #d4e3f4;
    border-radius: 8px;
    background: #ffffff;
    color: #315779;
    font-size: 12px;
    font-weight: 750;
  }
  .ap-market .ap-request__live .ap-countdown--urgent,
  .ap-market .ap-request__live .ap-countdown--critical { background: #fff0f0; border-color: #ffc9c9; color: #b91c1c; }

  .ap-market .ap-market__side { min-width: 0; display: grid; align-content: start; gap: 18px; scroll-margin-top: 18px; }
  .ap-market .ap-empty { padding: 28px; }
  .ap-market .ap-empty h3 { margin: 0 0 10px; color: var(--market-navy); font-size: 20px; font-weight: 850; letter-spacing: -.5px; }
  .ap-market .ap-empty p { margin: 0; color: var(--market-muted); font-size: 14px; line-height: 1.7; }
  .ap-market .ap-activity { padding: 23px; }
  .ap-market .ap-activity__list { display: grid; gap: 12px; padding: 0; margin: 0; list-style: none; }
  .ap-market .ap-activity__item { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; color: var(--market-navy); font-size: 12px; line-height: 1.6; }
  .ap-market .ap-activity__dot { display: inline-block; width: 8px; height: 8px; margin-right: 6px; flex-shrink: 0; border-radius: 50%; background: var(--market-blue); }
  .ap-market .ap-activity__item strong { color: var(--market-navy); }
  .ap-market .ap-activity__privacy { margin: 20px 0 0; padding-top: 14px; border-top: 1px solid var(--market-border); color: var(--market-muted); font-size: 12px; line-height: 1.55; }

  @media (max-width: 960px) {
    .ap-market { grid-template-columns: minmax(0, 1fr); }
    .ap-market .ap-market__side { grid-row: 1; }
  }
  @media (max-width: 600px) {
    .ap-market { gap: 14px; }
    .ap-market .ap-market__list, .ap-market .ap-activity { padding: 16px; }
    .ap-market .ap-request { padding: 14px; gap: 10px; }
    .ap-market .ap-request.is-selected { padding: 13px; }
    .ap-market .ap-request__budget-value { font-size: 19px; }
    .ap-market .ap-request .ap-route { font-size: 17px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ap-market .ap-request { transition: none; }
    .ap-market .ap-request.is-pulsing { animation: none; }
  }
`

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
    <>
      <style>{marketplaceStyles}</style>
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
    </>
  )
}
