import { useState } from 'react'
import { Link } from 'react-router-dom'

/** Demo-only credentials. There is no real authentication. */
const DEMO_ACCOUNTS = [
  { username: 'aeronova', password: 'demo', airlineId: 'aeronova' },
  { username: 'budgetjet', password: 'demo', airlineId: 'budgetjet' },
  { username: 'skyways', password: 'demo', airlineId: 'skyways' },
]

/** Partner login, checked against DEMO_ACCOUNTS. */
export default function SignIn({ airlines, onSignIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const quickAccounts = DEMO_ACCOUNTS.map((account) => ({
    ...account,
    airline: airlines.find((a) => a.id === account.airlineId),
  })).filter((account) => account.airline)

  function handleSubmit(e) {
    e.preventDefault()
    const account = DEMO_ACCOUNTS.find((a) => a.username === username.trim().toLowerCase() && a.password === password)
    if (!account) {
      setError('Incorrect username or password.')
      return
    }
    onSignIn(account.airlineId)
  }

  function clearError() {
    if (error) setError(null)
  }

  return (
    <div className="ap-signin">
      <div className="ap-signin__card">
        <div className="ap-brand ap-brand--large">
          <span className="ap-brand__mark" aria-hidden="true">B</span>
          <div>
            <div className="ap-brand__name">BidScanner</div>
            <div className="ap-brand__sub">Partner login</div>
          </div>
        </div>
        <div>
          <h1 className="ap-signin__title">Airline login</h1>
          <p className="ap-signin__lede">Travellers name their price. Sign in to bid on live requests.</p>
        </div>

        <form className="ap-signin__form" onSubmit={handleSubmit} noValidate>
          <label className="ap-field">
            <span className="ap-field__label">Username</span>
            <input
              className="ap-input"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                clearError()
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'ap-signin-error' : undefined}
              required
            />
          </label>
          <label className="ap-field">
            <span className="ap-field__label">Password</span>
            <input
              className="ap-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'ap-signin-error' : undefined}
              required
            />
          </label>
          {error && (
            <p id="ap-signin-error" className="ap-signin__error" role="alert">
              {error}
            </p>
          )}
          <button className="ap-btn ap-btn--primary ap-btn--block" type="submit">
            Sign in
          </button>
        </form>

        <div className="ap-signin__quick">
          <div className="ap-signin__divider"><span>or</span></div>
          <div className="ap-signin__quick-list">
            {quickAccounts.map(({ username: name, airlineId, airline }) => (
              <button key={name} type="button" className="ap-quick" onClick={() => onSignIn(airlineId)}>
                <span className="ap-avatar ap-avatar--small" style={{ background: airline.colour }} aria-hidden="true">
                  {airline.code}
                </span>
                Sign in as {airline.name}
              </button>
            ))}
          </div>
          <p className="ap-signin__note">
            Demo accounts, not real authentication. Username is the airline name, password <code>demo</code>.
          </p>
        </div>

        <Link className="ap-signin__back" to="/">
          ← Back to BidScanner
        </Link>
      </div>
    </div>
  )
}
