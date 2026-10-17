/**
 * Mock seed data for the airline portal. Only api.js imports this; it goes away
 * once the API functions call the backend.
 */

const MINUTE = 60_000

/** Base one-way-equivalent fare per passenger, in pence, used to derive min fares. */
const ROUTE_BASE_FARES = [
  ['EDI', 'BCN', 4800],
  ['EDI', 'AMS', 5200],
  ['GLA', 'FAO', 7400],
  ['EDI', 'CDG', 6000],
  ['EDI', 'DUB', 3200],
  ['MAN', 'JFK', 21000],
  ['EDI', 'RAK', 5600],
  ['LHR', 'LIS', 5000],
  ['EDI', 'BER', 5400],
  ['EDI', 'CPH', 5800],
]

function minFares(factor) {
  return ROUTE_BASE_FARES.map(([origin, destination, base]) => ({
    origin,
    destination,
    minFarePence: Math.round((base * factor) / 100) * 100,
  }))
}

/** @type {import('./types.js').Airline[]} */
export const AIRLINES = [
  {
    id: 'aeronova',
    name: 'AeroNova',
    code: 'AN',
    tagline: 'Full-service carrier',
    colour: '#4338ca',
    minFares: minFares(1.25),
    strategy: { enabled: true, mode: 'PREMIUM' },
  },
  {
    id: 'budgetjet',
    name: 'BudgetJet',
    code: 'BJ',
    tagline: 'Low-cost carrier',
    colour: '#ea580c',
    minFares: minFares(0.8),
    strategy: { enabled: true, mode: 'AGGRESSIVE' },
  },
  {
    id: 'skyways',
    name: 'SkyWays',
    code: 'SW',
    tagline: 'Hybrid carrier',
    colour: '#0891b2',
    minFares: minFares(1),
    strategy: { enabled: false, mode: 'BALANCED' },
  },
]

/** Bidders that aren't portal users; they only exist to create competition. */
export const COMPETITOR_IDS = ['ext-1', 'ext-2', 'ext-3']

const OPEN_REQUESTS = [
  { id: 'req-edi-bcn', origin: 'EDI', destination: 'BCN', earliest: '2027-07-12', latest: '2027-07-16', passengers: 2, maxPricePence: 15000, checkedBags: 2, directOnly: false, closesInMin: 4 },
  { id: 'req-edi-ams', origin: 'EDI', destination: 'AMS', earliest: '2027-08-03', latest: '2027-08-05', passengers: 1, maxPricePence: 12000, checkedBags: 0, directOnly: true, closesInMin: 9 },
  { id: 'req-gla-fao', origin: 'GLA', destination: 'FAO', earliest: '2027-06-20', latest: '2027-06-27', passengers: 2, maxPricePence: 22000, checkedBags: 2, directOnly: false, closesInMin: 16 },
  { id: 'req-edi-cdg', origin: 'EDI', destination: 'CDG', earliest: '2027-05-01', latest: '2027-05-04', passengers: 2, maxPricePence: 18000, checkedBags: 1, directOnly: true, closesInMin: 27 },
  { id: 'req-edi-dub', origin: 'EDI', destination: 'DUB', earliest: '2027-03-14', latest: '2027-03-15', passengers: 1, maxPricePence: 9000, checkedBags: 0, directOnly: false, closesInMin: 42 },
  { id: 'req-man-jfk', origin: 'MAN', destination: 'JFK', earliest: '2027-09-09', latest: '2027-09-19', passengers: 1, maxPricePence: 52000, checkedBags: 2, directOnly: false, closesInMin: 75 },
  { id: 'req-edi-rak', origin: 'EDI', destination: 'RAK', earliest: '2027-04-02', latest: '2027-04-09', passengers: 4, maxPricePence: 26000, checkedBags: 4, directOnly: false, closesInMin: 110 },
  { id: 'req-lhr-lis', origin: 'LHR', destination: 'LIS', earliest: '2027-05-21', latest: '2027-05-24', passengers: 2, maxPricePence: 14000, checkedBags: 1, directOnly: false, closesInMin: 150 },
]

const CLOSED_REQUESTS = [
  { id: 'req-edi-ber', origin: 'EDI', destination: 'BER', earliest: '2027-02-10', latest: '2027-02-13', passengers: 2, maxPricePence: 16000, checkedBags: 1, directOnly: false, closesInMin: -90 },
  { id: 'req-edi-cph', origin: 'EDI', destination: 'CPH', earliest: '2027-02-20', latest: '2027-02-22', passengers: 1, maxPricePence: 9500, checkedBags: 0, directOnly: true, closesInMin: -30 },
]

/**
 * @param {number} now epoch ms
 * @returns {Omit<import('./types.js').TravellerRequest, 'bidCount'>[]}
 */
export function createSeedRequests(now) {
  return [...OPEN_REQUESTS, ...CLOSED_REQUESTS].map(({ closesInMin, ...request }) => ({
    ...request,
    biddingClosesAt: new Date(now + closesInMin * MINUTE).toISOString(),
  }))
}

const SEED_BIDDERS = ['budgetjet', 'skyways', 'ext-1', 'aeronova', 'ext-2', 'ext-3']
const SEED_FRACTIONS = [0.94, 0.86, 0.9]

/**
 * Deterministic starting bids so the market isn't empty and the demo is repeatable.
 * @param {ReturnType<typeof createSeedRequests>} requests
 * @param {number} now epoch ms
 * @returns {import('./types.js').Offer[]}
 */
export function createSeedOffers(requests, now) {
  const offers = []
  let n = 0
  const add = (offer) => offers.push({ id: `seed-${++n}`, reasoning: 'AI agent (Balanced): priced to stay competitive while protecting margin.', ...offer })
  const at = (minutesAgo) => new Date(now - minutesAgo * MINUTE).toISOString()

  OPEN_REQUESTS.forEach((request, i) => {
    const count = (i % 3) + 1
    for (let k = 0; k < count; k++) {
      add({
        requestId: request.id,
        airlineId: SEED_BIDDERS[(i * 2 + k) % SEED_BIDDERS.length],
        pricePence: Math.round((request.maxPricePence * SEED_FRACTIONS[k]) / 100) * 100,
        checkedBags: request.checkedBags,
        direct: request.directOnly || k % 2 === 0,
        status: 'VALID',
        createdAt: at(10 - k),
      })
    }
  })

  // Settled history: EDI → BER won by AeroNova after one revision.
  add({ requestId: 'req-edi-ber', airlineId: 'aeronova', pricePence: 14800, checkedBags: 2, direct: true, status: 'SUPERSEDED', createdAt: at(200) })
  add({ requestId: 'req-edi-ber', airlineId: 'aeronova', pricePence: 13900, checkedBags: 2, direct: true, status: 'ACCEPTED', createdAt: at(150), supersedesOfferId: 'seed-' + n })
  add({ requestId: 'req-edi-ber', airlineId: 'budgetjet', pricePence: 14500, checkedBags: 1, direct: false, status: 'LOST', createdAt: at(180) })
  add({ requestId: 'req-edi-ber', airlineId: 'skyways', pricePence: 14200, checkedBags: 1, direct: true, status: 'LOST', createdAt: at(170) })

  // Settled history: EDI → CPH won by BudgetJet; its first bid was rejected.
  add({ requestId: 'req-edi-cph', airlineId: 'budgetjet', pricePence: 9900, checkedBags: 0, direct: true, status: 'REJECTED', rejectionReason: "Price £99 is over the traveller's maximum budget of £95.", createdAt: at(80) })
  add({ requestId: 'req-edi-cph', airlineId: 'budgetjet', pricePence: 7900, checkedBags: 0, direct: true, status: 'ACCEPTED', createdAt: at(70) })
  add({ requestId: 'req-edi-cph', airlineId: 'aeronova', pricePence: 9200, checkedBags: 1, direct: true, status: 'LOST', createdAt: at(75) })
  add({ requestId: 'req-edi-cph', airlineId: 'skyways', pricePence: 8800, checkedBags: 0, direct: true, status: 'LOST', createdAt: at(60) })

  return offers
}
