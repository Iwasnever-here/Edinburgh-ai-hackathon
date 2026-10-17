import { formatPence } from '../airline/format.js'

/**
 * Offers that passed validation (they carry a scoreBreakdown), best first:
 * total score desc, then cheaper, then earlier.
 * @param {import('../airline/types.js').JudgeOffer[]} offers
 */
export function rankOffers(offers) {
  return offers
    .filter((o) => o.scoreBreakdown)
    .sort(
      (a, b) =>
        b.scoreBreakdown.total - a.scoreBreakdown.total ||
        a.pricePence - b.pricePence ||
        a.createdAt.localeCompare(b.createdAt),
    )
}

const points = (n) => (Math.round(n * 10) / 10).toFixed(1)
const contribution = (offer, name) => offer.scoreBreakdown.components.find((c) => c.name === name)?.contribution ?? 0

/** Non-price reasons `a` outscores `b`, as noun phrases ("direct flight", "included bag"). */
function advantagesOver(a, b) {
  const phrases = []
  if (contribution(a, 'Baggage') > contribution(b, 'Baggage')) {
    const extra = a.checkedBags - b.checkedBags
    if (b.checkedBags === 0) phrases.push(a.checkedBags === 1 ? 'included bag' : `${a.checkedBags} included bags`)
    else phrases.push(extra === 1 ? 'extra checked bag' : `${extra} extra checked bags`)
  }
  if (contribution(a, 'Direct') > contribution(b, 'Direct')) phrases.push('direct flight')
  return phrases
}

const joinAnd = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`)

/**
 * Plain-English reason the top-ranked offer is ahead, built only from the score breakdowns.
 *
 * TODO(llm): the backend's RankingExplainer will have an LLM rephrase this from the same
 * numbers. Keep this version deterministic: it must only restate the breakdowns, never add facts.
 *
 * @param {import('../airline/types.js').JudgeOffer[]} ranked output of rankOffers
 * @returns {{ headline: string, body: string } | null}
 */
export function explainLeader(ranked) {
  if (ranked.length === 0) return null
  const [leader, runnerUp] = ranked
  const L = leader.airline.name
  const headline = `Why ${L} is #1`

  if (!runnerUp) {
    return { headline, body: `${L} is the only valid bid so far, scoring ${points(leader.scoreBreakdown.total)} out of 100.` }
  }

  const cheapest = ranked.reduce((min, o) => (o.pricePence < min.pricePence ? o : min))
  let body
  if (cheapest.pricePence >= leader.pricePence) {
    const saving = runnerUp.pricePence - leader.pricePence
    const extras = advantagesOver(leader, runnerUp)
    body =
      saving > 0
        ? `${L} leads with the lowest fare, ${formatPence(saving)} below ${runnerUp.airline.name}`
        : `${L} matches the lowest fare`
    if (extras.length) body += `${saving > 0 ? ', and adds' : ' and adds'} a ${joinAnd(extras)}`
    body += '.'
  } else {
    const extras = advantagesOver(leader, cheapest)
    const gap = formatPence(leader.pricePence - cheapest.pricePence)
    body = extras.length
      ? `${L} leads despite not being cheapest: its ${joinAnd(extras)} outweigh${extras.length === 1 ? 's' : ''} ${cheapest.airline.name}'s ${gap} lower fare.`
      : `${L} leads despite ${cheapest.airline.name}'s ${gap} lower fare.`
    const priceGap = contribution(cheapest, 'Price') - contribution(leader, 'Price')
    const gains = ['Baggage', 'Direct'].filter((name) => contribution(leader, name) > contribution(cheapest, name))
    if (gains.length) {
      const gain = gains.reduce((sum, name) => sum + contribution(leader, name) - contribution(cheapest, name), 0)
      const labels = { Baggage: 'baggage', Direct: 'direct flight' }
      body += ` Price gives ${cheapest.airline.name} +${points(priceGap)} points; ${L} wins back +${points(gain)} on ${joinAnd(gains.map((g) => labels[g]))}.`
    }
  }

  const margin = leader.scoreBreakdown.total - runnerUp.scoreBreakdown.total
  body +=
    margin < 2
      ? ` It's tight: ${runnerUp.airline.name} is only ${points(margin)} points behind.`
      : ` ${runnerUp.airline.name} trails by ${points(margin)} points.`

  return { headline, body }
}
