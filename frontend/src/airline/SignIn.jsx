import { useState } from 'react'

/** Demo sign-in: pick an airline, no password. */
export default function SignIn({ airlines, onSignIn }) {
  const [airlineId, setAirlineId] = useState(airlines[0]?.id ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    if (airlineId) onSignIn(airlineId)
  }

  return (
    <div className="ap-signin">
      <form className="ap-signin__card" onSubmit={handleSubmit}>
        <div className="ap-brand ap-brand--large">
          <span className="ap-brand__mark" aria-hidden="true">B</span>
          <div>
            <div className="ap-brand__name">BidScanner</div>
            <div className="ap-brand__sub">Airline Portal</div>
          </div>
        </div>
        <h1 className="ap-signin__title">Travellers name their price.<br />You compete for it.</h1>
        <p className="ap-signin__lede">
          Browse live traveller requests, bid against other airlines, and see where you stand without ever seeing a rival's price.
        </p>
        <label className="ap-field">
          <span className="ap-field__label">Sign in as ▾</span>
          <select className="ap-select" value={airlineId} onChange={(e) => setAirlineId(e.target.value)}>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.tagline})
              </option>
            ))}
          </select>
        </label>
        <button className="ap-btn ap-btn--primary ap-btn--block" type="submit">
          Enter the marketplace →
        </button>
        <p className="ap-signin__note">Demo sign-in: no password required.</p>
      </form>
    </div>
  )
}
