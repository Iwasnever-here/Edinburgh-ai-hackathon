export default function Header({ airline, airlines, stats, onSwitch, onSignOut }) {
  return (
    <header className="ap-header">
      <div className="ap-container ap-header__bar">
        <div className="ap-brand">
          <span className="ap-brand__mark" aria-hidden="true">B</span>
          <div>
            <div className="ap-brand__name">BidScanner</div>
            <div className="ap-brand__sub">Airline Portal</div>
          </div>
        </div>
        <div className="ap-account">
          <span className="ap-avatar" style={{ background: airline.colour }} aria-hidden="true">
            {airline.code}
          </span>
          <label className="ap-account__switch">
            <span className="ap-account__label">Signed in as</span>
            <select className="ap-account__select" value={airline.id} onChange={(e) => onSwitch(e.target.value)}>
              {airlines.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <button className="ap-btn ap-btn--ghost-dark" type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <div className="ap-container ap-stats">
        <StatCard label="Open requests" value={stats.open} hint="Bidding now" />
        <StatCard label="Active bids" value={stats.active} hint="Still in the running" />
        <StatCard label="Won" value={stats.won} hint="Accepted by travellers" accent />
      </div>
    </header>
  )
}

function StatCard({ label, value, hint, accent }) {
  return (
    <div className={`ap-stat${accent ? ' ap-stat--accent' : ''}`}>
      <div className="ap-stat__label">{label}</div>
      <div className="ap-stat__value">{value ?? '–'}</div>
      <div className="ap-stat__hint">{hint}</div>
    </div>
  )
}
