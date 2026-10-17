import React, { useState } from "react";
import { acceptDemoBid, getRequestsForEmail, DEMO_TRAVELLERS, seedDemoTraveller } from "./userData";

/* # ---------- EMAIL-ONLY DEMO SIGN-IN ---------- */
export default function UserPortal({ email, onSignIn, onSignOut, onBack }) {
  const [draftEmail, setDraftEmail] = useState(email || "");
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const requests = email ? getRequestsForEmail(email) : [];
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

  function chooseBid(requestId, bidId) {
    try {
      acceptDemoBid(email, requestId, bidId);
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
              <button type="button" className="user-primary" onClick={onBack}>+ New travel request</button>
            </header>

            <div className="user-stats">
              <div><strong>{requests.length}</strong><span>Requests published</span></div>
              <div><strong>{totalBids}</strong><span>Simulated airline offers</span></div>
              <div><strong>{requests.filter((r) => r.status === "offer_selected").length}</strong><span>Offers selected</span></div>
            </div>

            {error && <p className="user-error" role="alert">{error}</p>}
            {requests.length === 0 ? (
              <section className="user-empty">
                <h2>No travel requests yet</h2>
                <p>Publish a request with your destination, dates and maximum budget. Mock airlines will bid for your trip.</p>
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
                  <h3>Airline bids <small>({request.bids.length} simulated)</small></h3>
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
                  {selected && <p className="user-note">You selected {selected.airline}'s simulated offer. No real flight has been booked or paid for.</p>}
                </article>
              );
            })}
            <p className="user-disclaimer">All offers are fictional and generated locally. This dashboard is not a secure account or a real booking service.</p>
          </>
        )}
      </div>
    </main>
  );
}
