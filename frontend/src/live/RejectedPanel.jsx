import { formatPence } from '../airline/format.js'

export default function RejectedPanel({ offers }) {
  const rejected = offers.filter((o) => o.status === 'REJECTED').reverse()
  return (
    <section className="lb-panel lb-rejected" aria-labelledby="lb-rejected-title">
      <div className="lb-panel__head">
        <h2 id="lb-rejected-title">Rejected bids</h2>
        <span className="lb-count lb-count--red">{rejected.length}</span>
      </div>
      {rejected.length === 0 ? (
        <p className="lb-empty">None yet. Every bid so far has met the traveller's limits.</p>
      ) : (
        <ul className="lb-list">
          {rejected.map((o) => (
            <li key={o.id} className="lb-rejected__item">
              <span className="lb-avatar lb-avatar--small" style={{ background: o.airline.colour }} aria-hidden="true">{o.airline.code}</span>
              <div>
                <div className="lb-rejected__line">
                  <strong>{o.airline.name}</strong> <span className="lb-rejected__price">{formatPence(o.pricePence)}</span>
                </div>
                <div className="lb-rejected__reason">{o.rejectionReason}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
