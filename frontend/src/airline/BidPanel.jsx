
import { useEffect, useRef, useState } from 'react'
import { getStanding, submitOffer } from './api.js'
import {
  cityName,
  countdownUrgency,
  formatCountdown,
  formatDateRange,
  formatPence,
  ordinal,
  parsePoundsToPence,
  penceToInput,
  plural,
} from './format.js'
import { usePolling } from './hooks.js'

const MAX_BAGS = 9

const bidPanelStyles = `
  .ap-bid {
    --bid-navy: #05203c;
    --bid-blue: #0069e3;
    --bid-border: #dce5ef;
    --bid-muted: #61758c;

    background: #ffffff;
    color: var(--bid-navy);
    border: 1px solid var(--bid-border);
    border-radius: 18px;
    padding: clamp(20px, 3vw, 32px);
    box-shadow: 0 8px 28px rgba(5, 32, 60, .07);
  }

  .ap-bid .ap-bid__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--bid-border);
  }

  .ap-bid .ap-route--large {
    color: var(--bid-navy);
    font-size: clamp(23px, 3vw, 32px);
    font-weight: 850;
    letter-spacing: -1.2px;
    line-height: 1.15;
    margin: 0 0 9px;
  }

  .ap-bid .ap-route__arrow {
    color: var(--bid-blue);
  }

  .ap-bid .ap-route__cities {
    color: var(--bid-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .ap-bid .ap-countdown--large {
    flex-shrink: 0;
    background: #eaf3ff;
    border: 1px solid #cfe2ff;
    color: var(--bid-navy);
    border-radius: 10px;
    padding: 10px 14px;
    font-weight: 800;
    font-size: 13px;
  }

  .ap-bid .ap-countdown--urgent,
  .ap-bid .ap-countdown--critical {
    background: #fff0f0;
    border-color: #fecaca;
    color: #b91c1c;
  }

  /* Traveller requirements */

  .ap-bid .ap-needs {
    list-style: none;
    padding: 0;
    margin: 22px 0 28px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .ap-bid .ap-needs li {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    padding: 16px;
    background: #f4f8fc;
    border: 1px solid var(--bid-border);
    border-radius: 12px;
  }

  .ap-bid .ap-needs li span {
    color: var(--bid-muted);
    font-size: 12px;
    font-weight: 650;
  }

  .ap-bid .ap-needs li strong {
    color: var(--bid-navy);
    font-size: 16px;
    font-weight: 800;
  }

  /* Bid form */

  .ap-bid .ap-bid__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ap-bid .ap-field__label {
    display: block;
    color: var(--bid-navy);
    font-size: 13px;
    font-weight: 750;
    margin-bottom: 9px;
  }

  .ap-bid .ap-money {
    display: flex;
    align-items: center;
    min-height: 62px;
    padding: 0 18px;
    border: 2px solid var(--bid-border);
    border-radius: 12px;
    background: #ffffff;
    transition: border-color .15s, box-shadow .15s;
  }

  .ap-bid .ap-money:focus-within {
    border-color: var(--bid-blue);
    box-shadow: 0 0 0 4px rgba(0, 105, 227, .1);
  }

  .ap-bid .ap-money__symbol {
    color: var(--bid-navy);
    font-size: 26px;
    font-weight: 800;
    margin-right: 8px;
  }

  .ap-bid .ap-money input {
    flex: 1;
    width: 100%;
    min-width: 0;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--bid-navy);
    font-size: 29px;
    font-weight: 850;
  }

  .ap-bid .ap-money--warn {
    border-color: #dc2626;
  }

  .ap-bid .ap-field__hint {
    display: block;
    margin-top: 9px;
    color: var(--bid-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .ap-bid .ap-text-warn {
    color: #b91c1c;
    font-weight: 700;
  }

  .ap-bid .ap-bid__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  /* Checked bags */

  .ap-bid .ap-stepper {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    padding: 5px;
    border: 1px solid var(--bid-border);
    border-radius: 11px;
    background: #f4f8fc;
  }

  .ap-bid .ap-stepper button {
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: #ffffff;
    color: var(--bid-navy);
    font-size: 20px;
    font-weight: 800;
    cursor: pointer;
  }

  .ap-bid .ap-stepper button:hover:not(:disabled) {
    background: #e6f0ff;
    color: var(--bid-blue);
  }

  .ap-bid .ap-stepper button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .ap-bid .ap-stepper output {
    min-width: 22px;
    text-align: center;
    color: var(--bid-navy);
    font-size: 17px;
    font-weight: 850;
  }

  /* Direct flight switch */

  .ap-bid .ap-switch {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .ap-bid .ap-switch input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }

  .ap-bid .ap-switch__track {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 26px;
    flex-shrink: 0;
    border-radius: 30px;
    background: #b9c8d8;
    transition: background .2s;
  }

  .ap-bid .ap-switch__track::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,.15);
    transition: transform .2s;
  }

  .ap-bid .ap-switch input:checked + .ap-switch__track {
    background: var(--bid-blue);
  }

  .ap-bid .ap-switch input:checked + .ap-switch__track::after {
    transform: translateX(20px);
  }

  .ap-bid .ap-switch input:focus-visible + .ap-switch__track {
    outline: 3px solid rgba(0, 105, 227, .3);
    outline-offset: 3px;
  }

  .ap-bid .ap-switch__label {
    color: var(--bid-navy);
    font-weight: 700;
  }

  /* Submit bid button */

  .ap-bid .ap-btn--primary {
    width: 100%;
    min-height: 52px;
    padding: 12px 18px;
    border: none;
    border-radius: 11px;
    background: var(--bid-blue);
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: background .15s, transform .15s;
  }

  .ap-bid .ap-btn--primary:hover:not(:disabled) {
    background: #0057bd;
    transform: translateY(-1px);
  }

  .ap-bid .ap-btn--primary:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  /* Active bid information */

  .ap-bid .ap-bid__current {
    margin-top: 18px;
    padding: 14px 16px;
    border: 1px solid #cfe2ff;
    border-radius: 10px;
    background: #eaf3ff;
    color: var(--bid-navy);
    font-size: 13px;
    line-height: 1.6;
  }

  /* Live standing */

  .ap-bid .ap-standing {
    margin-top: 24px;
    padding: 24px;
    border-radius: 14px;
    background: var(--bid-navy);
    color: #ffffff;
  }

  .ap-bid .ap-standing__label {
    color: #c7d9ec;
    font-size: 12px;
    letter-spacing: 1.3px;
    text-transform: uppercase;
    font-weight: 800;
  }

  .ap-bid .ap-standing__rank {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-top: 12px;
    color: #d6e5f5;
  }

  .ap-bid .ap-standing__big {
    color: #ffffff;
    font-size: 43px;
    line-height: 1;
    letter-spacing: -2px;
    font-weight: 900;
  }

  .ap-bid .ap-standing__big.is-leading {
    color: #69b3ff;
  }

  .ap-bid .ap-standing__change {
    margin-top: 12px;
    font-size: 13px;
    font-weight: 800;
  }

  .ap-bid .ap-standing__change--up {
    color: #86efac;
  }

  .ap-bid .ap-standing__change--down {
    color: #fca5a5;
  }

  .ap-bid .ap-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0;
    margin: 18px 0;
    list-style: none;
  }

  .ap-bid .ap-chip {
    padding: 7px 11px;
    border: 1px solid #537493;
    border-radius: 30px;
    background: #153a5e;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
  }

  .ap-bid .ap-standing__note,
  .ap-bid .ap-standing__privacy {
    color: #c7d9ec;
    font-size: 12px;
    line-height: 1.6;
  }

  .ap-bid .ap-standing__privacy {
    margin-bottom: 0;
    opacity: .85;
  }

  /* Submission feedback */

  .ap-bid .ap-alert {
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.6;
  }

  .ap-bid .ap-alert--ok {
    background: #ecfdf5;
    border: 1px solid #86efac;
    color: #166534;
  }

  .ap-bid .ap-alert--error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
  }

  .ap-bid .ap-muted {
    color: var(--bid-muted);
    margin-top: 18px;
  }

  @media (max-width: 650px) {
    .ap-bid .ap-bid__head {
      flex-direction: column;
    }

    .ap-bid .ap-needs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ap-bid .ap-countdown--large {
      align-self: flex-start;
    }

    .ap-bid .ap-standing__big {
      font-size: 36px;
    }
  }

  @media (max-width: 380px) {
    .ap-bid .ap-needs {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ap-bid *,
    .ap-bid *::after {
      transition: none !important;
    }
  }
`

export default function BidPanel({
  request,
  airline,
  myOffer,
  now,
  onSubmitted,
}) {
  const minFare = airline.minFares.find(
    (f) =>
      f.origin === request.origin &&
      f.destination === request.destination
  )

  const minTotalPence = minFare
    ? minFare.minFarePence * request.passengers
    : null

  const [price, setPrice] = useState(() =>
    penceToInput(
      myOffer
        ? myOffer.pricePence
        : Math.round((request.maxPricePence * 0.9) / 100) * 100
    )
  )

  const [bags, setBags] = useState(
    myOffer ? myOffer.checkedBags : request.checkedBags
  )

  const [direct, setDirect] = useState(
    myOffer ? myOffer.direct : request.directOnly
  )

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const standing = usePolling(
    () => getStanding(request.id, airline.id),
    2000,
    [request.id, airline.id]
  )

  const rank = standing.data?.priceRank
  const prevRank = useRef(null)
  const [rankChange, setRankChange] = useState(null)

  useEffect(() => {
    if (rank == null) return

    if (
      prevRank.current != null &&
      prevRank.current !== rank
    ) {
      setRankChange({
        from: prevRank.current,
        to: rank,
      })
    }

    prevRank.current = rank
  }, [rank])

  const msLeft = Date.parse(request.biddingClosesAt) - now
  const closed = msLeft <= 0

  const pricePence = parsePoundsToPence(price)

  const overBudget =
    pricePence != null &&
    pricePence > request.maxPricePence

  const belowMin =
    pricePence != null &&
    minTotalPence != null &&
    pricePence < minTotalPence

  async function handleSubmit(e) {
    e.preventDefault()

    if (pricePence == null || closed) return

    setSubmitting(true)

    try {
      const previous = myOffer

      const offer = await submitOffer(
        request.id,
        airline.id,
        {
          pricePence,
          checkedBags: bags,
          direct,
        }
      )

      setResult({ offer, previous })

      if (offer.status === 'VALID') {
        setRankChange(null)
        standing.refresh()
      }

      onSubmitted()
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{bidPanelStyles}</style>

      <section
        className="ap-panel ap-bid"
        aria-labelledby="ap-bid-title"
      >
        <div className="ap-bid__head">
          <div>
            <h2
              id="ap-bid-title"
              className="ap-route ap-route--large"
            >
              {request.origin}{' '}
              <span className="ap-route__arrow">→</span>{' '}
              {request.destination}
            </h2>

            <div className="ap-route__cities">
              {cityName(request.origin)} to{' '}
              {cityName(request.destination)}
              {' · '}
              {formatDateRange(
                request.earliest,
                request.latest
              )}
            </div>
          </div>

          <span
            className={`ap-countdown ap-countdown--large ap-countdown--${
              countdownUrgency(msLeft) || 'normal'
            }`}
          >
            ⏱ {formatCountdown(msLeft)}
          </span>
        </div>

        <ul
          className="ap-needs"
          aria-label="Traveller requirements"
        >
          <li>
            <span>Budget</span>
            <strong>
              ≤ {formatPence(request.maxPricePence)} total
            </strong>
          </li>

          <li>
            <span>Passengers</span>
            <strong>{request.passengers}</strong>
          </li>

          <li>
            <span>Checked bags</span>
            <strong>≥ {request.checkedBags}</strong>
          </li>

          <li>
            <span>Flight</span>
            <strong>
              {request.directOnly ? 'Direct only' : 'Any'}
            </strong>
          </li>
        </ul>

        <form
          className="ap-bid__form"
          onSubmit={handleSubmit}
        >
          <label className="ap-field">
            <span className="ap-field__label">
              Your price (total for{' '}
              {plural(request.passengers, 'passenger')})
            </span>

            <span
              className={`ap-money${
                overBudget ? ' ap-money--warn' : ''
              }`}
            >
              <span className="ap-money__symbol">£</span>

              <input
                inputMode="decimal"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                aria-describedby="ap-price-hint"
              />
            </span>

            <span
              id="ap-price-hint"
              className="ap-field__hint"
            >
              {minTotalPence != null && (
                <>
                  Your minimum fare here:{' '}
                  {formatPence(minTotalPence)}
                  {' ('}
                  {formatPence(minFare.minFarePence)}
                  {' × '}
                  {request.passengers}
                  {'). '}
                </>
              )}

              {overBudget && (
                <span className="ap-text-warn">
                  Over the traveller's budget: the
                  platform will reject this.{' '}
                </span>
              )}

              {belowMin && (
                <span className="ap-text-warn">
                  Below your minimum fare.{' '}
                </span>
              )}
            </span>
          </label>

          <div className="ap-bid__row">
            <div className="ap-field">
              <span
                className="ap-field__label"
                id="ap-bags-label"
              >
                Checked bags
              </span>

              <div
                className="ap-stepper"
                role="group"
                aria-labelledby="ap-bags-label"
              >
                <button
                  type="button"
                  onClick={() =>
                    setBags((b) => Math.max(0, b - 1))
                  }
                  disabled={bags <= 0}
                  aria-label="Fewer bags"
                >
                  −
                </button>

                <output aria-live="polite">
                  {bags}
                </output>

                <button
                  type="button"
                  onClick={() =>
                    setBags((b) =>
                      Math.min(MAX_BAGS, b + 1)
                    )
                  }
                  disabled={bags >= MAX_BAGS}
                  aria-label="More bags"
                >
                  +
                </button>
              </div>
            </div>

            <label className="ap-switch">
              <input
                type="checkbox"
                role="switch"
                checked={direct}
                onChange={(e) =>
                  setDirect(e.target.checked)
                }
              />

              <span
                className="ap-switch__track"
                aria-hidden="true"
              />

              <span className="ap-switch__label">
                Direct flight
              </span>
            </label>
          </div>

          <button
            className="ap-btn ap-btn--primary ap-btn--block"
            type="submit"
            disabled={
              submitting ||
              closed ||
              pricePence == null
            }
          >
            {closed
              ? 'Bidding closed'
              : submitting
                ? 'Submitting…'
                : myOffer
                  ? 'Revise bid'
                  : 'Place bid'}
          </button>
        </form>

        <BidResult result={result} />

        {myOffer && (
          <p className="ap-bid__current">
            Your active bid:{' '}
            <strong>
              {formatPence(myOffer.pricePence)}
            </strong>
            {' · '}
            {plural(myOffer.checkedBags, 'bag')}
            {' · '}
            {myOffer.direct
              ? 'direct'
              : 'connecting'}
          </p>
        )}

        {standing.data ? (
          <div
            className="ap-standing"
            aria-live="polite"
          >
            <div className="ap-standing__label">
              Your standing
            </div>

            <div className="ap-standing__rank">
              <span
                className={`ap-standing__big${
                  rank === 1 ? ' is-leading' : ''
                }`}
              >
                {ordinal(rank)}
              </span>

              <span>
                of {standing.data.totalBids} on price
              </span>
            </div>

            {rankChange && (
              <div
                className={`ap-standing__change ap-standing__change--${
                  rankChange.to < rankChange.from
                    ? 'up'
                    : 'down'
                }`}
              >
                {rankChange.to < rankChange.from
                  ? '▲ Up'
                  : '▼ Down'}{' '}
                from {ordinal(rankChange.from)}
              </div>
            )}

            {standing.data.strengths.length > 0 && (
              <ul className="ap-chips">
                {standing.data.strengths.map((s) => (
                  <li
                    key={s}
                    className="ap-chip"
                  >
                    ✓ {s}
                  </li>
                ))}
              </ul>
            )}

            <p className="ap-standing__note">
              {standing.data.note}
            </p>

            <p className="ap-standing__privacy">
              🔒 Competitor prices are never shown.
            </p>
          </div>
        ) : (
          standing.loaded &&
          !myOffer && (
            <p className="ap-muted">
              Place a valid bid to see where you stand.
            </p>
          )
        )}
      </section>
    </>
  )
}

function BidResult({ result }) {
  if (!result) return null

  if (result.error) {
    return (
      <div
        className="ap-alert ap-alert--error"
        role="alert"
      >
        {result.error}
      </div>
    )
  }

  const { offer, previous } = result

  if (offer.status === 'REJECTED') {
    return (
      <div
        className="ap-alert ap-alert--error"
        role="alert"
      >
        <strong>Bid rejected.</strong>{' '}
        {offer.rejectionReason}
      </div>
    )
  }

  return (
    <div
      className="ap-alert ap-alert--ok"
      role="status"
    >
      {previous ? (
        <>
          <strong>Bid revised:</strong>{' '}
          {formatPence(previous.pricePence)}
          {' → '}
          {formatPence(offer.pricePence)}.
          Your previous offer is now superseded.
        </>
      ) : (
        <>
          <strong>Bid placed</strong> at{' '}
          {formatPence(offer.pricePence)}.
        </>
      )}
    </div>
  )
}
