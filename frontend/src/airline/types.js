/**
 * Shared types for the airline portal, as JSDoc (the frontend is JavaScript).
 * Money is always integer pence; format as £ only in the UI.
 */

/** @typedef {'VALID' | 'REJECTED' | 'SUPERSEDED' | 'ACCEPTED' | 'LOST' | 'EXPIRED'} OfferStatus */

export const OFFER_STATUSES = /** @type {const} */ ([
  'VALID',
  'REJECTED',
  'SUPERSEDED',
  'ACCEPTED',
  'LOST',
  'EXPIRED',
])

/** @typedef {'AGGRESSIVE' | 'BALANCED' | 'PREMIUM'} StrategyMode */

/**
 * @typedef {Object} Strategy
 * @property {boolean} enabled
 * @property {StrategyMode} mode
 */

/**
 * @typedef {Object} MinFare
 * @property {string} origin       IATA code
 * @property {string} destination  IATA code
 * @property {number} minFarePence per passenger
 */

/**
 * @typedef {Object} Airline
 * @property {string} id
 * @property {string} name
 * @property {string} code      two-letter display code
 * @property {string} tagline
 * @property {string} colour    brand colour for the avatar
 * @property {MinFare[]} minFares
 * @property {Strategy} strategy
 */

/**
 * @typedef {Object} TravellerRequest
 * @property {string} id
 * @property {string} origin          IATA code
 * @property {string} destination     IATA code
 * @property {string} earliest        ISO date (YYYY-MM-DD)
 * @property {string} latest          ISO date (YYYY-MM-DD)
 * @property {number} passengers
 * @property {number} maxPricePence   total budget for all passengers
 * @property {number} checkedBags     minimum checked bags required in total
 * @property {boolean} directOnly
 * @property {string} biddingClosesAt ISO timestamp
 * @property {number} bidCount        currently active (VALID) bids
 */

/**
 * @typedef {Object} Offer
 * @property {string} id
 * @property {string} requestId
 * @property {string} airlineId
 * @property {number} pricePence
 * @property {number} checkedBags
 * @property {boolean} direct
 * @property {OfferStatus} status
 * @property {string} reasoning
 * @property {string} createdAt            ISO timestamp
 * @property {string} [rejectionReason]    set when status is REJECTED
 * @property {string} [supersedesOfferId]  set when this offer revised an earlier one
 */

/**
 * @typedef {Object} OfferInput
 * @property {number} pricePence
 * @property {number} checkedBags
 * @property {boolean} direct
 */

/**
 * Where an airline's active bid sits. Never contains competitors' prices.
 * @typedef {Object} Standing
 * @property {number} priceRank  1 = cheapest
 * @property {number} totalBids
 * @property {string[]} strengths
 * @property {string} note
 */

/**
 * One request the airline has bid on, with all of its offers (oldest first).
 * @typedef {Object} BidThread
 * @property {TravellerRequest} request
 * @property {Offer[]} offers
 */

/* ---------- Judges' view ---------- */

/**
 * @typedef {Object} ScoreComponent
 * @property {'Price' | 'Baggage' | 'Direct'} name
 * @property {number} weight        0–1; all weights sum to 1
 * @property {number} score         0–1
 * @property {number} contribution  points out of 100 (weight × score × 100)
 */

/**
 * @typedef {Object} ScoreBreakdown
 * @property {number} total  0–100, the sum of the component contributions
 * @property {ScoreComponent[]} components
 */

/**
 * @typedef {Object} AirlineSummary
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} colour
 */

/**
 * An offer as the judges see it: every field, plus who placed it and, for offers
 * that passed validation (VALID, ACCEPTED, LOST), how it scores.
 * @typedef {Offer & { airline: AirlineSummary, scoreBreakdown?: ScoreBreakdown }} JudgeOffer
 */
