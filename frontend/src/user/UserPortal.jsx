import React, { useEffect, useMemo, useState } from "react";
import { acceptDemoBid, getRequestsForEmail, DEMO_TRAVELLERS, seedDemoTraveller } from "./userData";
import { acceptBackendOffer, getRequestOffers } from "../airline/api.js";

/* # ---------- EMAIL-ONLY DEMO SIGN-IN ---------- */
export default function UserPortal({ email, onSignIn, onSignOut, onBack }) {
  const [draftEmail, setDraftEmail] = useState(email || "");
  const [error, setError] = useState("");
  const [offerLoadError, setOfferLoadError] = useState("");
  const [version, setVersion] = useState(0);
  const [backendOffers, setBackendOffers] = useState({});
  const [loadingOffers, setLoadingOffers] = useState(false);
  const storedRequests = useMemo(() => email ? getRequestsForEmail(email) : [], [email, version]);

  useEffect(() => {
    let cancelled = false;
    if (!email || storedRequests.length === 0) {
      return () => { cancelled = true; };
    }
    setLoadingOffers(true);
    setOfferLoadError("");
    Promise.all(storedRequests.map(async (request) => {
      // Seeded demo requests only exist in browser storage, not in the backend.
      if (request.id.startsWith("demo-")) return [request.id, null, null];
      try {
        const offers = await getRequestOffers(request.id);
        return [request.id, offers, null];
      } catch (fetchError) {
        return [request.id, null, fetchError.message || "Could not contact the backend."];
      }
    })).then((entries) => {
      if (cancelled) return;
      setBackendOffers(Object.fromEntries(entries.map(([id, offers]) => [id, offers])));
      const failed = entries.filter(([, , message]) => message);
      setOfferLoadError(failed.length
        ? `Couldn't load offers for ${failed.length} request${failed.length === 1 ? "" : "s"}. ${failed[0][2]} Check that the backend is running and that it hasn't been restarted, then refresh.`
        : "");
    }).finally(() => {
      if (!cancelled) setLoadingOffers(false);
    });
    return () => { cancelled = true; };
  }, [email, storedRequests, version]);

  const requests = storedRequests.map((request) => {
    const offers = backendOffers[request.id];
    if (!offers) return request;
    const bids = offers
      .filter((offer) => offer.status === "VALID" || offer.status === "ACCEPTED")
      .map((offer) => ({
        id: offer.id,
        airline: offer.airline?.name || offer.airlineId,
        price: offer.pricePence / 100,
        features: `${offer.checkedBags} checked bag${offer.checkedBags === 1 ? "" : "s"}`,
        stops: offer.direct ? 0 : 1,
        status: offer.status,
        backend: true,
      }));
    return { ...request, bids, acceptedBidId: bids.find((bid) => bid.status === "ACCEPTED")?.id || null };
  });
  const totalBids = requests.reduce((sum, request) => sum + request.bids.length, 0);

  function submitEmail(e) {
    e.preventDefault();
    const clean = draftEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    onSignIn(clean);
  }

  function enterDemoAccount(account) {
    try {
      seedDemoTraveller(account.email);
      setError("");
      setDraftEmail(account.email);
      onSignIn(account.email);
    } catch (e) {
      setError(e.message || "Could not initialise demo account.");
    }
  }

  async function chooseBid(requestId, bidId) {
    try {
      const bid = requests.find((request) => request.id === requestId)?.bids.find((item) => item.id === bidId);
      if (bid?.backend) await acceptBackendOffer(bidId);
      else acceptDemoBid(email, requestId, bidId);
      setVersion((value) => value + 1);
      setError("");
    } catch (e) { setError(e.message); }
  }

  // Version is intentionally changed after selections so browser storage is re-read.
  void version;

  return (
    <main className="user-portal">
      <div className="user-shell">
        <div className="user-topbar">
          <button type="button" className="user-back" onClick={onBack}>← Back to flights</button>
          {email && <button type="button" className="user-back" onClick={() => { onSignOut(); setDraftEmail(""); }}>Sign out</button>}
        </div>

        {!email ? (
          <section className="user-login">
            <span className="user-kicker">TRAVELLER ACCOUNT · MOCK DEMO</span>
            <h1>Find your flight requests.</h1>
            <p>Enter your email to attach your requests to a demo profile and review airline bids.</p>
            <form onSubmit={submitEmail} className="user-login-form">
              <label htmlFor="bidscanner-email">Email address</label>
              <input id="bidscanner-email" type="email" autoComplete="email" placeholder="you@example.com" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} required />
              <button type="submit" className="user-primary">Continue to dashboard</button>
            </form>
            <div className="user-demo-divider"><span>OR TRY A DEMO ACCOUNT</span></div>
            <div className="user-demo-accounts">
              {DEMO_TRAVELLERS.map((account) => (
                <button
                  type="button"
                  key={account.email}
                  className="user-demo-account"
                  onClick={() => enterDemoAccount(account)}
                >
                  <span className="user-demo-avatar">{account.initials}</span>
                  <span className="user-demo-person">
                    <strong>Sign in as {account.name}</strong>
                    <small>{account.email} · {account.requestCount} flight requests</small>
                  </span>
                  <span className="user-demo-chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            {error && <p className="user-error" role="alert">{error}</p>}
            <p className="user-disclaimer">Demo only: no password or email verification. Anyone entering the same email in this browser can view its stored requests. Do not enter sensitive details.</p>
          </section>
        ) : (
          <>
            <header className="user-dashboard-header">
              <div>
                <span className="user-kicker">YOUR TRAVELLER DASHBOARD</span>
                <h1>My flight requests</h1>
                <p>Signed in as <strong>{email}</strong></p>
              </div>
              <div className="user-dashboard-actions">
                <button type="button" className="user-secondary" disabled={loadingOffers} onClick={() => setVersion((value) => value + 1)}>
                  {loadingOffers ? "Checking offers…" : "Refresh offers"}
                </button>
                <button type="button" className="user-primary" onClick={onBack}>+ New travel request</button>
              </div>
            </header>

            <div className="user-stats">
              <div><strong>{requests.length}</strong><span>Requests published</span></div>
              <div><strong>{totalBids}</strong><span>Airline offers</span></div>
              <div><strong>{requests.filter((r) => r.acceptedBidId || r.status === "offer_selected").length}</strong><span>Offers selected</span></div>
            </div>

            {error && <p className="user-error" role="alert">{error}</p>}
            {offerLoadError && <p className="user-error" role="alert">{offerLoadError}</p>}
            {loadingOffers && <p className="user-note">Checking for new airline offers…</p>}
            {requests.length === 0 ? (
              <section className="user-empty">
                <h2>No travel requests yet</h2>
                <p>Publish a request with your destination, dates and maximum budget. Airlines can then submit offers for your trip.</p>
                <button type="button" className="user-primary" onClick={onBack}>Create my first request</button>
              </section>
            ) : requests.map((request) => {
              const selected = request.bids.find((bid) => bid.id === request.acceptedBidId);
              return (
                <article className="user-request" key={request.id}>
                  <div className="user-request-heading">
                    <div><span className="user-kicker">REQUEST #{request.id.slice(-6).toUpperCase()}</span><h2>{request.origin} → {request.destination}</h2></div>
                    <span className={`user-status ${selected ? "user-status-selected" : ""}`}>{selected ? "Offer selected" : "Open for bids"}</span>
                  </div>
                  <div className="user-facts">
                    <span>{request.depart}{request.back ? ` to ${request.back}` : ""}</span>
                    <span>{request.adults + request.children} traveller(s)</span>
                    <span>{request.cabin}</span>
                    <strong>Max £{request.maxBudget.toFixed(2)} total</strong>
                  </div>
                  <h3>Airline bids <small>({request.bids.length})</small></h3>
                  <div className="user-bids">
                    {request.bids.length === 0 && <p>No bids yet.</p>}
                    {[...request.bids].sort((a, b) => a.price - b.price).map((bid) => (
                      <div className="user-bid" key={bid.id}>
                        <div><strong>{bid.airline}</strong><span>{bid.features} · {bid.stops === 0 ? "Direct" : `${bid.stops} stop`}</span></div>
                        <strong className="user-bid-price">£{bid.price}</strong>
                        {selected?.id === bid.id ? <span className="user-winner">Selected</span> : (
                          <button type="button" className="user-secondary" disabled={Boolean(selected)} onClick={() => chooseBid(request.id, bid.id)}>Select offer</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {selected && <p className="user-note">You selected {selected.airline}'s offer. No real flight has been booked or paid for.</p>}
                </article>
              );
            })}
            <p className="user-disclaimer">This demo does not book or pay for a real flight. Requests and offers are held in memory by the backend and reset when it restarts.</p>
          </>
        )}
      </div>
    </main>
  );
}
