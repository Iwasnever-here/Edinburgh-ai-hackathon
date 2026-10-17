import { useEffect, useMemo, useRef, useState } from 'react'
import { formatPence } from '../airline/format.js'
import { formatClock } from './time.js'

const MAX_ITEMS = 14

/** Every offer on the request as a timestamped event, newest first. Remount (key) per request. */
export default function ActivityFeed({ offers, simulated }) {
  const seen = useRef(null)
  const [fresh, setFresh] = useState(() => new Set())

  const events = useMemo(() => {
    const byId = new Map(offers.map((o) => [o.id, o]))
    return [...offers].reverse().slice(0, MAX_ITEMS).map((o) => ({ offer: o, previous: o.supersedesOfferId ? byId.get(o.supersedesOfferId) : null }))
  }, [offers])

  // Pulse only offers that arrive after the first load.
  useEffect(() => {
    const ids = offers.map((o) => o.id)
    if (seen.current === null) {
      seen.current = new Set(ids)
      return
    }
    const added = ids.filter((id) => !seen.current.has(id))
    if (!added.length) return
    added.forEach((id) => seen.current.add(id))
    setFresh(new Set(added))
  }, [offers])

  return (
    <section className="lb-panel lb-feed" aria-labelledby="lb-feed-title">
      <div className="lb-panel__head">
        <h2 id="lb-feed-title">Live activity</h2>
        {simulated && <span className="lb-sim">Simulated competition</span>}
      </div>
      {events.length === 0 ? (
        <p className="lb-empty">Waiting for the first bid…</p>
      ) : (
        <ol className="lb-list lb-feed__list" aria-live="polite">
          {events.map(({ offer: o, previous }) => {
            const kind = o.status === 'REJECTED' ? 'rejected' : previous ? 'revised' : 'bid'
            return (
              <li key={o.id} className={`lb-event lb-event--${kind}${fresh.has(o.id) ? ' is-fresh' : ''}`}>
                <time className="lb-event__time" dateTime={o.createdAt}>{formatClock(o.createdAt)}</time>
                <div className="lb-event__body">
                  <div className="lb-event__line">
                    <strong>{o.airline.name}</strong>{' '}
                    {kind === 'rejected' && (
                      <>bid {formatPence(o.pricePence)}: <span className="lb-text-red">rejected</span></>
                    )}
                    {kind === 'revised' && (
                      <>
                        revised <s className="lb-event__old">{formatPence(previous.pricePence)}</s> → {formatPence(o.pricePence)}{' '}
                        <span className="lb-event__note">old offer superseded</span>
                      </>
                    )}
                    {kind === 'bid' && <>bid {formatPence(o.pricePence)}</>}
                  </div>
                  {kind === 'rejected' && <div className="lb-event__reason">{o.rejectionReason}</div>}
                  {o.reasoning && <div className="lb-event__reasoning">“{o.reasoning}”</div>}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
