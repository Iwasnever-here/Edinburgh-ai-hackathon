import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SIMULATED, getAllRequests, getRequestOffers, startSimulatedCompetition } from '../airline/api.js'
import { useNow, usePolling } from '../airline/hooks.js'
import ActivityFeed from './ActivityFeed.jsx'
import Leaderboard from './Leaderboard.jsx'
import RejectedPanel from './RejectedPanel.jsx'
import RequestSelector from './RequestSelector.jsx'
import { explainLeader, rankOffers } from './ranking.js'
import { formatClock } from './time.js'
import './live.css'

const POLL_MS = 2000

/** Live bidding: the whole auction, including every competitor's price. */
export default function LiveBidding() {
  useEffect(() => {
    const previous = document.title
    document.title = 'Live bidding · BidScanner'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="lb-root">
      <LiveScreen />
    </div>
  )
}

function LiveScreen() {
  const now = useNow(1000)
  const [params, setParams] = useSearchParams()
  const requests = usePolling(() => getAllRequests(), POLL_MS, [])
  const paramId = params.get('request')
  const selected = requests.data?.find((r) => r.id === paramId) ?? null

  // With no (valid) ?request=, pin the open request with the most bids so the screen doesn't jump.
  useEffect(() => {
    if (selected || !requests.data?.length) return
    const open = requests.data.filter((r) => Date.parse(r.biddingClosesAt) > Date.now())
    const pick = [...(open.length ? open : requests.data)].sort((a, b) => b.bidCount - a.bidCount)[0]
    setParams({ request: pick.id }, { replace: true })
  }, [selected, requests.data, setParams])

  const selectedId = selected?.id ?? null
  const offersPoll = usePolling(() => (selectedId ? getRequestOffers(selectedId) : Promise.resolve([])), POLL_MS, [selectedId])
  const { refresh: refreshRequests } = requests
  const { refresh: refreshOffers } = offersPoll

  useEffect(() => {
    if (!SIMULATED) return undefined
    return startSimulatedCompetition(null, () => {
      refreshRequests()
      refreshOffers()
    })
  }, [refreshRequests, refreshOffers])

  // Polled data lags a request switch by one response; never show another request's offers.
  const offers = useMemo(() => (offersPoll.data ?? []).filter((o) => o.requestId === selectedId), [offersPoll.data, selectedId])
  const ranked = useMemo(() => rankOffers(offers), [offers])
  const explanation = useMemo(() => explainLeader(ranked), [ranked])
  const error = requests.error || offersPoll.error

  return (
    <div className="lb-screen">
      <header className="lb-top">
        <div className="lb-brand">
          <span className="lb-brand__mark" aria-hidden="true">B</span>
          <span className="lb-brand__name">BidScanner</span>
          <span className="lb-brand__view">Live bidding</span>
        </div>
        <p className="lb-top__tagline">Every bid and every price. Airlines never see this screen.</p>
        <div className="lb-top__right">
          {SIMULATED && <span className="lb-sim">Simulated competition</span>}
          <span className="lb-live"><span className="lb-live__dot" aria-hidden="true" />Live</span>
          <time className="lb-clock">{formatClock(now)}</time>
        </div>
      </header>

      {error && <div className="lb-error" role="alert">Connection problem: {error.message}. Retrying…</div>}

      <RequestSelector
        requests={requests.data}
        selected={selected}
        offers={offers}
        now={now}
        onSelect={(id) => setParams({ request: id })}
      />

      <main className="lb-main">
        <div className="lb-col lb-col--main">
          <Leaderboard key={selectedId} ranked={ranked} />
          <section className="lb-panel lb-why" aria-labelledby="lb-why-title">
            <h2 id="lb-why-title">{explanation ? explanation.headline : 'Why #1 is winning'}</h2>
            <p>{explanation ? explanation.body : 'An explanation appears once there is a valid bid.'}</p>
          </section>
        </div>
        <div className="lb-col lb-col--side">
          <RejectedPanel offers={offers} />
          <ActivityFeed key={selectedId} offers={offers} simulated={SIMULATED} />
        </div>
      </main>
    </div>
  )
}
