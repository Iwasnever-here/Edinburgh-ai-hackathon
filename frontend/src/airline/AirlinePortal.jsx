import { useEffect, useMemo, useState } from 'react'
import AgentSettings from './AgentSettings.jsx'
import Header from './Header.jsx'
import Marketplace from './Marketplace.jsx'
import MyBids from './MyBids.jsx'
import SignIn from './SignIn.jsx'
import { SIMULATED, getAirlines, getMarketplace, getMyBids, startSimulatedCompetition } from './api.js'
import { useNow, usePolling } from './hooks.js'
import './airline.css'

const POLL_MS = 2000

const TABS = [
  { id: 'market', label: 'Marketplace' },
  { id: 'bids', label: 'My Bids' },
  { id: 'agent', label: 'AI Bidding Agent' },
]

export default function AirlinePortal() {
  return (
    <div className="ap-root">
      <style>{`
/* BidScanner Airline Portal | visual theme override
   Load AFTER airline.css. Scoped to .ap-root so the traveller site is untouched. */
.ap-root {
  --bs-navy: #05203c;
  --bs-blue: #0069e3;
  --bs-blue-hover: #0057bd;
  --bs-white: #ffffff;
  --bs-muted: #60748b;
  --bs-border: #d5deeb;
  --bs-pale: #eef3f9;
  --bs-shadow: 0 8px 22px rgb(5 32 60 / 8%);
  background: #ffffff;
  color: var(--bs-navy);
  min-height: 100vh;
}
.ap-root .ap-app { background: #ffffff; color: var(--bs-navy); min-height: 100vh; }
.ap-root a { color: inherit; }
.ap-root button, .ap-root input, .ap-root select { font: inherit; }

/* Branding, navy hero header, and summary cards */
.ap-root .ap-header {
  background: var(--bs-navy);
  color: var(--bs-white);
  border-bottom: 0;
}
.ap-root .ap-header__bar { color: var(--bs-white); }
.ap-root .ap-brand__name { color: inherit; font-weight: 850; letter-spacing: -.035em; }
.ap-root .ap-brand__sub, .ap-root .ap-account__label { color: #c7d8e9; }
.ap-root .ap-brand--link { color: var(--bs-white); text-decoration: none; }
.ap-root .ap-brand--link:hover { opacity: .92; }
.ap-root .ap-stats { gap: 14px; }
.ap-root .ap-stat {
  background: #123756;
  border: 1px solid #31526d;
  border-radius: 13px;
  color: #ffffff;
  box-shadow: none;
}
.ap-root .ap-stat--accent { background: #124e53; border-color: #217d78; }
.ap-root .ap-stat__label { color: #cfdeed; letter-spacing: .07em; }
.ap-root .ap-stat__value { color: #ffffff; font-weight: 850; }
.ap-root .ap-stat__hint { color: #d7e6f3; }
.ap-root .ap-account__name { color: #ffffff; }
.ap-root .ap-avatar { color: #ffffff; }

/* Clear, calm workspace, same bright blue as the main page */
.ap-root .ap-main { background: #ffffff; color: var(--bs-navy); }
.ap-root .ap-tabs { gap: 8px; }
.ap-root .ap-tab {
  background: #ffffff;
  border: 1px solid var(--bs-border);
  color: var(--bs-navy);
  border-radius: 10px;
  font-weight: 750;
  box-shadow: none;
}
.ap-root .ap-tab:hover:not(.is-active) { background: var(--bs-pale); }
.ap-root .ap-tab.is-active, .ap-root .ap-tab[aria-selected='true'] {
  background: var(--bs-navy);
  border-color: var(--bs-navy);
  color: #ffffff;
}
.ap-root .ap-tab__count { background: var(--bs-blue); color: #ffffff; }
.ap-root .ap-tab__dot.is-on { background: #10b981; }

/* White cards with clean outlines rather than grey/blue washes */
.ap-root .ap-panel,
.ap-root .ap-card,
.ap-root .ap-marketplace__panel,
.ap-root .ap-market__panel,
.ap-root .ap-request,
.ap-root .ap-request-card,
.ap-root .ap-bid-card,
.ap-root .ap-settings-card {
  background: #ffffff;
  color: var(--bs-navy);
  border-color: var(--bs-border);
  box-shadow: var(--bs-shadow);
}
.ap-root .ap-muted, .ap-root .ap-card__sub, .ap-root .ap-text-muted { color: var(--bs-muted); }
.ap-root .ap-request:hover, .ap-root .ap-request-card:hover { border-color: #78a8ff; }
.ap-root .ap-request.is-selected, .ap-root .ap-request-card.is-selected { border-color: var(--bs-blue); }

/* Actions, inputs, focus states */
.ap-root .ap-btn--primary {
  background: var(--bs-blue);
  border-color: var(--bs-blue);
  color: #ffffff;
}
.ap-root .ap-btn--primary:hover { background: var(--bs-blue-hover); border-color: var(--bs-blue-hover); }
.ap-root .ap-btn--ghost-dark { background: #234765; color: #ffffff; border-color: #365876; }
.ap-root .ap-btn--ghost-dark:hover { background: #355d7c; }
.ap-root .ap-input,
.ap-root .ap-select,
.ap-root input:not([type='checkbox']):not([type='radio']),
.ap-root select,
.ap-root textarea {
  border-color: var(--bs-border);
  color: var(--bs-navy);
  background: #ffffff;
}
.ap-root :is(button, input, select, textarea, a):focus-visible {
  outline: 2px solid var(--bs-blue);
  outline-offset: 2px;
}
.ap-root input[type='checkbox'], .ap-root input[type='radio'] { accent-color: var(--bs-blue); }
.ap-root .ap-alert--error { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }
.ap-root .ap-text-error { color: #be123c; }

/* The logo artwork should not inherit the old coloured "B" tile */
.ap-root .ap-brand img {
  background: transparent;
  border: 0;
  box-shadow: none;
  object-fit: contain;
}

/* Bring common badges, headings and nested panels into the same palette */
.ap-root :is(h1, h2, h3, h4) { color: inherit; }
.ap-root :is(.ap-badge, .ap-chip, .ap-pill) { border-color: var(--bs-border); }
.ap-root :is(.ap-table, .ap-list, .ap-offer, .ap-thread) { color: var(--bs-navy); }
.ap-root :is(.ap-table, .ap-list, .ap-offer, .ap-thread) button.ap-btn--primary {
  background: var(--bs-blue);
  color: #ffffff;
}

/* Partner sign-in uses the same white + navy visual language */
.ap-root .ap-signin { background: var(--bs-navy); color: var(--bs-navy); }
.ap-root .ap-signin__card { background: #ffffff; border-color: var(--bs-border); box-shadow: 0 20px 60px rgb(0 0 0 / 16%); }
.ap-root .ap-signin__title { color: var(--bs-navy); }
.ap-root .ap-signin__lede, .ap-root .ap-signin__note { color: var(--bs-muted); }
.ap-root .ap-signin .ap-brand__name { color: var(--bs-navy); }
.ap-root .ap-signin .ap-brand__sub { color: var(--bs-muted); }
.ap-root .ap-field__label { color: var(--bs-navy); }
.ap-root .ap-signin__divider { color: var(--bs-muted); }
.ap-root .ap-quick { background: #ffffff; color: var(--bs-navy); border-color: var(--bs-border); }
.ap-root .ap-quick:hover { background: var(--bs-pale); border-color: #92b5ea; }
.ap-root .ap-signin__back { color: var(--bs-navy); }
.ap-root .ap-signin__back:hover { color: var(--bs-blue); }

/* Compact mobile-friendly adjustments without changing page structure */
@media (max-width: 700px) {
  .ap-root .ap-tabs { flex-wrap: wrap; }
  .ap-root .ap-stat { min-width: 0; }
}

      `}</style>
      <PortalContent />
    </div>
  )
}

function PortalContent() {
  const [airlines, setAirlines] = useState(null)
  const [error, setError] = useState(null)
  const [airlineId, setAirlineId] = useState(null)

  useEffect(() => {
    getAirlines().then(setAirlines, (err) => setError(err.message))
  }, [])

  if (error) return <div className="ap-center ap-text-error">Couldn't load airlines: {error}</div>
  if (!airlines) return <div className="ap-center ap-muted">Loading…</div>

  const airline = airlines.find((a) => a.id === airlineId)
  if (!airline) return <SignIn airlines={airlines} onSignIn={setAirlineId} />

  return (
    <Workspace
      key={airline.id}
      airline={airline}
      onSignOut={() => setAirlineId(null)}
      onAirlineUpdated={(updated) => setAirlines((list) => list.map((a) => (a.id === updated.id ? updated : a)))}
    />
  )
}

function Workspace({ airline, onSignOut, onAirlineUpdated }) {
  const [tab, setTab] = useState('market')
  const now = useNow(1000)
  const market = usePolling(() => getMarketplace(airline.id), POLL_MS, [airline.id])
  const bids = usePolling(() => getMyBids(airline.id), POLL_MS, [airline.id])
  const { refresh: refreshMarket } = market
  const { refresh: refreshBids } = bids

  useEffect(() => {
    if (!SIMULATED) return undefined
    return startSimulatedCompetition(airline.id, refreshMarket)
  }, [airline.id, refreshMarket])

  const threads = bids.data
  const myActiveOffers = useMemo(() => {
    const map = new Map()
    for (const t of threads ?? []) {
      const active = t.offers.find((o) => o.status === 'VALID')
      if (active) map.set(t.request.id, active)
    }
    return map
  }, [threads])

  const stats = {
    open: market.data?.length,
    active: threads ? myActiveOffers.size : undefined,
    won: threads?.filter((t) => t.offers.some((o) => o.status === 'ACCEPTED')).length,
  }

  function handleSubmitted() {
    refreshMarket()
    refreshBids()
  }

  return (
    <div className="ap-app">
      <Header airline={airline} stats={stats} onSignOut={onSignOut} />

      <main className="ap-container ap-main">
        <div className="ap-tabs" role="tablist" aria-label="Portal sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`ap-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`ap-tabpanel-${t.id}`}
              className={`ap-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'bids' && threads && <span className="ap-tab__count">{threads.length}</span>}
              {t.id === 'agent' && <span className={`ap-tab__dot${airline.strategy.enabled ? ' is-on' : ''}`} aria-hidden="true" />}
            </button>
          ))}
        </div>

        {(market.error || bids.error) && (
          <div className="ap-alert ap-alert--error" role="alert">
            Connection problem: {(market.error || bids.error).message}. Retrying…
          </div>
        )}

        <div role="tabpanel" id={`ap-tabpanel-${tab}`} aria-labelledby={`ap-tab-${tab}`}>
          {tab === 'market' && (
            <Marketplace
              airline={airline}
              requests={market.data}
              myActiveOffers={myActiveOffers}
              now={now}
              simulated={SIMULATED}
              onSubmitted={handleSubmitted}
            />
          )}
          {tab === 'bids' && <MyBids threads={threads} now={now} simulated={SIMULATED} />}
          {tab === 'agent' && <AgentSettings airline={airline} onSaved={onAirlineUpdated} />}
        </div>
      </main>
    </div>
  )
}
