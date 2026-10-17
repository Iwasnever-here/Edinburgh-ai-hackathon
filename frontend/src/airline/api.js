/**
 * Airline portal API. Every function currently resolves mock data from an
 * in-memory store after ~300ms; each one names the backend endpoint it will call.
 * Results are deep-cloned so callers can't mutate the store.
 */
import { AIRLINES, COMPETITOR_IDS, createSeedOffers, createSeedRequests } from './mockData.js'

/** True while this module serves mock data. The UI labels competitor activity as simulated. */
export const SIMULATED = true

const LATENCY_MS = 300
const STRATEGY_MODES = ['AGGRESSIVE', 'BALANCED', 'PREMIUM']

const db = (() => {
  const now = Date.now()
  const requests = createSeedRequests(now)
  return {
    airlines: structuredClone(AIRLINES),
    requests,
    offers: createSeedOffers(requests, now),
    nextId: 1,
  }
})()

function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), LATENCY_MS))
}

function fail(message) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), LATENCY_MS))
}

const pounds = (pence) => `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`
const isOpen = (request, now = Date.now()) => Date.parse(request.biddingClosesAt) > now
const activeOffers = (requestId) => db.offers.filter((o) => o.requestId === requestId && o.status === 'VALID')
const withBidCount = (request) => ({ ...request, bidCount: activeOffers(request.id).length })
const findAirline = (id) => db.airlines.find((a) => a.id === id)
const findRequest = (id) => db.requests.find((r) => r.id === id)

/**
 * Mock stand-in for the traveller's decision: once bidding closes, the cheapest
 * valid bid is ACCEPTED and the rest are LOST.
 */
function settleClosedRequests() {
  const now = Date.now()
  for (const request of db.requests) {
    if (isOpen(request, now)) continue
    const valid = activeOffers(request.id).sort((a, b) => a.pricePence - b.pricePence || a.createdAt.localeCompare(b.createdAt))
    valid.forEach((offer, i) => {
      offer.status = i === 0 ? 'ACCEPTED' : 'LOST'
    })
  }
}

/** Hard constraints. Returns a rejection reason, or null if the offer is valid. */
function validateOffer(request, offer) {
  if (!Number.isInteger(offer.pricePence) || offer.pricePence <= 0) return 'Price must be a positive amount.'
  if (offer.pricePence > request.maxPricePence) {
    return `Price ${pounds(offer.pricePence)} is over the traveller's maximum budget of ${pounds(request.maxPricePence)}.`
  }
  if (offer.checkedBags < request.checkedBags) {
    return `Traveller needs at least ${request.checkedBags} checked bag${request.checkedBags === 1 ? '' : 's'}; this offer includes ${offer.checkedBags}.`
  }
  if (request.directOnly && !offer.direct) return 'Traveller only accepts direct flights.'
  return null
}

function addOffer(fields) {
  const offer = { id: `off-${db.nextId++}`, createdAt: new Date().toISOString(), ...fields }
  db.offers.push(offer)
  return offer
}

/**
 * GET /api/airlines
 * @returns {Promise<import('./types.js').Airline[]>}
 */
export function getAirlines() {
  return respond(db.airlines)
}

/**
 * GET /api/airlines/{id}/marketplace
 * Open requests, soonest-closing first.
 * @param {string} airlineId
 * @returns {Promise<import('./types.js').TravellerRequest[]>}
 */
export function getMarketplace(airlineId) {
  settleClosedRequests()
  if (!findAirline(airlineId)) return fail('Unknown airline.')
  const open = db.requests
    .filter((r) => isOpen(r))
    .sort((a, b) => a.biddingClosesAt.localeCompare(b.biddingClosesAt))
    .map(withBidCount)
  return respond(open)
}

/**
 * POST /api/requests/{id}/offers
 * Always records the offer: invalid ones come back REJECTED with a reason.
 * A valid offer supersedes the airline's previous valid offer on the request.
 * @param {string} requestId
 * @param {string} airlineId
 * @param {import('./types.js').OfferInput} offer
 * @returns {Promise<import('./types.js').Offer>}
 */
export function submitOffer(requestId, airlineId, offer) {
  settleClosedRequests()
  const request = findRequest(requestId)
  if (!request) return fail('Unknown request.')
  if (!findAirline(airlineId)) return fail('Unknown airline.')
  if (!isOpen(request)) return fail('Bidding on this request has closed.')

  const rejectionReason = validateOffer(request, offer)
  if (rejectionReason) {
    return respond(addOffer({ requestId, airlineId, ...offer, status: 'REJECTED', rejectionReason, reasoning: 'Placed manually from the airline portal.' }))
  }

  const previous = activeOffers(requestId).find((o) => o.airlineId === airlineId)
  if (previous) previous.status = 'SUPERSEDED'
  return respond(
    addOffer({
      requestId,
      airlineId,
      ...offer,
      status: 'VALID',
      reasoning: 'Placed manually from the airline portal.',
      ...(previous && { supersedesOfferId: previous.id }),
    }),
  )
}

/**
 * GET /api/requests/{id}/standing?airlineId=
 * Rank and strengths of the airline's active bid. Never exposes competitor prices.
 * Resolves null when the airline has no active bid on the request.
 * @param {string} requestId
 * @param {string} airlineId
 * @returns {Promise<import('./types.js').Standing | null>}
 */
export function getStanding(requestId, airlineId) {
  settleClosedRequests()
  const request = findRequest(requestId)
  if (!request) return fail('Unknown request.')
  const active = activeOffers(requestId)
  const mine = active.find((o) => o.airlineId === airlineId)
  if (!mine) return respond(null)

  const others = active.filter((o) => o !== mine)
  const priceRank = 1 + others.filter((o) => o.pricePence < mine.pricePence).length
  const strengths = []
  if (priceRank === 1) strengths.push(others.length ? 'Lowest price' : 'Only bid so far')
  if (mine.checkedBags > request.checkedBags && others.every((o) => o.checkedBags < mine.checkedBags)) {
    strengths.push('Best baggage offer')
  }
  if (mine.direct && others.some((o) => !o.direct)) strengths.push('Direct flight (not every bidder offers one)')

  const cheaper = priceRank - 1
  const note =
    priceRank === 1
      ? 'You are the cheapest valid bid right now. Rivals can still undercut you before bidding closes.'
      : `${cheaper} bid${cheaper === 1 ? ' is' : 's are'} cheaper than yours. Lower your price or add value to climb.`

  return respond({ priceRank, totalBids: active.length, strengths, note })
}

/**
 * GET /api/airlines/{id}/bids
 * Every request the airline has bid on, with its offers oldest-first.
 * Open requests come first (soonest-closing), then closed ones (most recent first).
 * @param {string} airlineId
 * @returns {Promise<import('./types.js').BidThread[]>}
 */
export function getMyBids(airlineId) {
  settleClosedRequests()
  if (!findAirline(airlineId)) return fail('Unknown airline.')
  const now = Date.now()
  const byRequest = new Map()
  for (const offer of db.offers) {
    if (offer.airlineId !== airlineId) continue
    if (!byRequest.has(offer.requestId)) byRequest.set(offer.requestId, [])
    byRequest.get(offer.requestId).push(offer)
  }
  const threads = [...byRequest].map(([requestId, offers]) => ({
    request: withBidCount(findRequest(requestId)),
    offers: offers.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }))
  threads.sort((a, b) => {
    const aOpen = isOpen(a.request, now)
    const bOpen = isOpen(b.request, now)
    if (aOpen !== bOpen) return aOpen ? -1 : 1
    const order = a.request.biddingClosesAt.localeCompare(b.request.biddingClosesAt)
    return aOpen ? order : -order
  })
  return respond(threads)
}

/**
 * PUT /api/airlines/{id}/strategy
 * @param {string} airlineId
 * @param {import('./types.js').Strategy} strategy
 * @returns {Promise<import('./types.js').Airline>}
 */
export function updateStrategy(airlineId, strategy) {
  const airline = findAirline(airlineId)
  if (!airline) return fail('Unknown airline.')
  if (!STRATEGY_MODES.includes(strategy.mode)) return fail('Unknown strategy.')
  airline.strategy = { enabled: Boolean(strategy.enabled), mode: strategy.mode }
  return respond(airline)
}

/* ------------------------------------------------------------------------ */
/* MOCK ONLY: simulated competition. Delete once real airline agents bid     */
/* through the backend; the UI already picks up new bids by polling.         */
/* ------------------------------------------------------------------------ */

const pick = (list) => list[Math.floor(Math.random() * list.length)]

function placeSimulatedCompetitorBid(signedInAirlineId) {
  settleClosedRequests()
  const open = db.requests.filter((r) => isOpen(r))
  if (!open.length) return
  const request = pick(open)
  const bidderId = pick([...db.airlines.map((a) => a.id), ...COMPETITOR_IDS].filter((id) => id !== signedInAirlineId))
  const active = activeOffers(request.id)
  const mine = active.find((o) => o.airlineId === signedInAirlineId)
  const current = active.find((o) => o.airlineId === bidderId)

  let price
  if (mine && Math.random() < 0.5) price = mine.pricePence - (1 + Math.floor(Math.random() * 6)) * 100
  else if (current) price = Math.round(current.pricePence * (0.93 + Math.random() * 0.05))
  else price = Math.round(request.maxPricePence * (0.78 + Math.random() * 0.2))
  price = Math.round(Math.min(request.maxPricePence, Math.max(request.maxPricePence * 0.6, price)) / 100) * 100

  if (current) current.status = 'SUPERSEDED'
  addOffer({
    requestId: request.id,
    airlineId: bidderId,
    pricePence: price,
    checkedBags: request.checkedBags + (Math.random() < 0.3 ? 1 : 0),
    direct: request.directOnly || Math.random() < 0.5,
    status: 'VALID',
    reasoning: 'Simulated competitor bid.',
    ...(current && { supersedesOfferId: current.id }),
  })
}

/**
 * Starts placing simulated competitor bids every 3–6s. Returns a stop function.
 * @param {string} signedInAirlineId never bids as this airline
 * @param {() => void} [onBid]
 */
export function startSimulatedCompetition(signedInAirlineId, onBid) {
  let timer
  const schedule = () => {
    timer = setTimeout(() => {
      placeSimulatedCompetitorBid(signedInAirlineId)
      onBid?.()
      schedule()
    }, 3000 + Math.random() * 3000)
  }
  schedule()
  return () => clearTimeout(timer)
}
