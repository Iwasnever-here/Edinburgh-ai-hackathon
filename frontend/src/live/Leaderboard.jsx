import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatPence } from '../airline/format.js'

const COMPONENT_CLASS = { Price: 'price', Baggage: 'baggage', Direct: 'direct' }
const NEW_LEADER_MS = 4000

/** Valid offers ranked by total score. Rows are keyed by airline so revisions slide rather than re-mount. */
export default function Leaderboard({ ranked }) {
  const rowRefs = useRef(new Map())
  const prevTops = useRef(new Map())
  const prevLeader = useRef(null)
  const [newLeader, setNewLeader] = useState(null)
  const leaderId = ranked[0]?.airline.id ?? null

  // FLIP: after each render, slide rows from their previous position to the new one.
  // offsetTop ignores in-flight transforms, so interrupted animations still measure correctly.
  useLayoutEffect(() => {
    const tops = new Map()
    for (const [key, el] of rowRefs.current) {
      if (!el) continue
      tops.set(key, el.offsetTop)
      const before = prevTops.current.get(key)
      if (before != null && before !== el.offsetTop) {
        el.animate([{ transform: `translateY(${before - el.offsetTop}px)` }, { transform: 'none' }], {
          duration: 700,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        })
      }
    }
    prevTops.current = tops
  })

  useEffect(() => {
    if (prevLeader.current && leaderId && prevLeader.current !== leaderId) {
      setNewLeader(leaderId)
      const timer = setTimeout(() => setNewLeader(null), NEW_LEADER_MS)
      prevLeader.current = leaderId
      return () => clearTimeout(timer)
    }
    prevLeader.current = leaderId
    return undefined
  }, [leaderId])

  return (
    <section className="lb-panel lb-board" aria-labelledby="lb-board-title">
      <div className="lb-panel__head">
        <h2 id="lb-board-title">Live ranking</h2>
        <ul className="lb-legend" aria-label="Score weights">
          <li><span className="lb-swatch lb-swatch--price" />Price 60%</li>
          <li><span className="lb-swatch lb-swatch--baggage" />Baggage 20%</li>
          <li><span className="lb-swatch lb-swatch--direct" />Direct 20%</li>
        </ul>
      </div>

      {ranked.length === 0 ? (
        <p className="lb-empty">No valid bids yet. They'll be ranked here the moment they pass validation.</p>
      ) : (
        <ol className="lb-rows">
          <li className="lb-row lb-row--head" aria-hidden="true">
            <span>#</span>
            <span>Airline</span>
            <span className="lb-num">Price</span>
            <span className="lb-num">Bags</span>
            <span className="lb-center">Direct</span>
            <span>Score breakdown</span>
            <span className="lb-num">Total</span>
          </li>
          {ranked.map((o, i) => (
            <li
              key={o.airline.id}
              ref={(el) => {
                if (el) rowRefs.current.set(o.airline.id, el)
                else rowRefs.current.delete(o.airline.id)
              }}
              className={`lb-row${i === 0 ? ' is-leader' : ''}${newLeader === o.airline.id ? ' is-new-leader' : ''}`}
            >
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-airline">
                <span className="lb-avatar" style={{ background: o.airline.colour }} aria-hidden="true">{o.airline.code}</span>
                <span className="lb-airline__name">
                  {o.airline.name}
                  {newLeader === o.airline.id && <span className="lb-lead-tag">New leader</span>}
                  {o.status === 'ACCEPTED' && <span className="lb-lead-tag lb-lead-tag--won">Accepted</span>}
                </span>
              </span>
              <span className="lb-num lb-price">{formatPence(o.pricePence)}</span>
              <span className="lb-num">{o.checkedBags}</span>
              <span className={`lb-center lb-direct${o.direct ? ' is-yes' : ''}`}>{o.direct ? '✓' : '—'}</span>
              <ScoreBar breakdown={o.scoreBreakdown} />
              <span className="lb-num lb-total">{o.scoreBreakdown.total.toFixed(1)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ScoreBar({ breakdown }) {
  const label = breakdown.components.map((c) => `${c.name} ${c.contribution.toFixed(1)}`).join(', ')
  return (
    <span className="lb-bar" role="img" aria-label={`Score breakdown: ${label}`} title={label}>
      {breakdown.components.map((c) => (
        <span key={c.name} className={`lb-bar__seg lb-bar__seg--${COMPONENT_CLASS[c.name]}`} style={{ width: `${c.contribution}%` }}>
          {c.contribution >= 8 && c.contribution.toFixed(0)}
        </span>
      ))}
    </span>
  )
}
