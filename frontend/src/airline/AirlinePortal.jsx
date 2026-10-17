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
