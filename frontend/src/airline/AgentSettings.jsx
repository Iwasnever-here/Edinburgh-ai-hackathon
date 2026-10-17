import { useState } from 'react'
import { updateStrategy } from './api.js'
import { cityName, formatPence } from './format.js'

const STRATEGIES = [
  { id: 'AGGRESSIVE', label: 'Aggressive', icon: '⚡', description: 'Undercuts to win: bids close to your minimum fare.' },
  { id: 'BALANCED', label: 'Balanced', icon: '⚖', description: 'Competitive prices that still protect your margin.' },
  { id: 'PREMIUM', label: 'Premium', icon: '★', description: 'Bids higher and wins on bags, direct flights and service.' },
]

export default function AgentSettings({ airline, onSaved }) {
  const [enabled, setEnabled] = useState(airline.strategy.enabled)
  const [mode, setMode] = useState(airline.strategy.mode)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const dirty = enabled !== airline.strategy.enabled || mode !== airline.strategy.mode

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const updated = await updateStrategy(airline.id, { enabled, mode })
      onSaved(updated)
      setStatus({ ok: true, message: 'Strategy saved.' })
    } catch (err) {
      setStatus({ ok: false, message: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ap-agent">
      <form className="ap-panel ap-agent__form" onSubmit={handleSave}>
        <div className="ap-agent__head">
          <div>
            <h2>AI Bidding Agent</h2>
            <p className="ap-muted">
              Your agent watches new requests and bids for you. The platform still enforces every traveller limit, so the agent can't bid over budget.
            </p>
          </div>
          <label className="ap-switch ap-switch--large">
            <input type="checkbox" role="switch" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span className="ap-switch__track" aria-hidden="true" />
            <span className="ap-switch__label">{enabled ? 'Agent on' : 'Agent off'}</span>
          </label>
        </div>

        <fieldset className="ap-strategies" disabled={!enabled}>
          <legend className="ap-field__label">Strategy</legend>
          {STRATEGIES.map((s) => (
            <label key={s.id} className={`ap-strategy${mode === s.id ? ' is-selected' : ''}`}>
              <input type="radio" name="strategy" value={s.id} checked={mode === s.id} onChange={() => setMode(s.id)} />
              <span className="ap-strategy__icon" aria-hidden="true">{s.icon}</span>
              <span className="ap-strategy__label">{s.label}</span>
              <span className="ap-strategy__desc">{s.description}</span>
            </label>
          ))}
        </fieldset>

        <div className="ap-agent__actions">
          <button className="ap-btn ap-btn--primary" type="submit" disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save strategy'}
          </button>
          {status && (
            <span className={status.ok ? 'ap-text-ok' : 'ap-text-error'} role="status">
              {status.message}
            </span>
          )}
        </div>
      </form>

      <section className="ap-panel ap-minfares" aria-labelledby="ap-minfares-title">
        <h3 id="ap-minfares-title">Minimum fares</h3>
        <p className="ap-muted">Per passenger. Set by your revenue team and read-only here. The agent never bids below these.</p>
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col" className="ap-num">Min fare</th>
              </tr>
            </thead>
            <tbody>
              {airline.minFares.map((f) => (
                <tr key={`${f.origin}-${f.destination}`}>
                  <td>
                    <strong>{f.origin} → {f.destination}</strong>
                    <span className="ap-muted"> {cityName(f.origin)} to {cityName(f.destination)}</span>
                  </td>
                  <td className="ap-num">{formatPence(f.minFarePence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
