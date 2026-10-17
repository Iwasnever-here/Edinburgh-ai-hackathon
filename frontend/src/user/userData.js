/* # ---------- LOCAL DEMO STORAGE ---------- */
// Prototype only. Email is a label, not verified identity or real authentication.
const REQUESTS_KEY = "bidscanner.mock.requests.v1";
const EMAIL_KEY = "bidscanner.mock.email.v1";

function readRequests() {
  try {
    const value = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function writeRequests(items) {
  try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(items)); }
  catch { throw new Error("Browser storage is unavailable. Enable local storage to try the demo."); }
}

export function getDemoEmail() {
  try { return localStorage.getItem(EMAIL_KEY) || ""; }
  catch { return ""; }
}

export function saveDemoEmail(email) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
    else localStorage.removeItem(EMAIL_KEY);
  } catch { /* Demo still allows an in-memory sign-in. */ }
}

export function getRequestsForEmail(email) {
  if (!email) return [];
  return readRequests().filter((r) => r.email === email.trim().toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// The backend keeps requests in memory, so a restart forgets them. Drop the ones it no longer knows.
export function removeRequests(ids) {
  if (!ids.length) return;
  const gone = new Set(ids);
  writeRequests(readRequests().filter((r) => !gone.has(r.id)));
}

export function createRequest(input) {
  if (!input.email || !(Number(input.maxBudget) > 0)) {
    throw new Error("An email and positive maximum budget are required.");
  }
  const request = {
    ...input,
    id: input.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    email: input.email.trim().toLowerCase(),
    maxBudget: Number(input.maxBudget),
    createdAt: new Date().toISOString(),
    status: "open",
    acceptedBidId: null,
    bids: [],
  };
  writeRequests([request, ...readRequests()]);
  return request;
}

/* # ---------- MOCK AIRLINE BIDDING ---------- */
export function generateDemoBids(requestId) {
  const records = readRequests();
  const target = records.find((r) => r.id === requestId);
  if (!target || target.bids.length) return target;
  const budget = target.maxBudget;
  const competitors = [
    { airline: "AeroBlue", factor: 0.91, features: "Hand luggage included", stops: 0 },
    { airline: "CloudJet", factor: 0.83, features: "Lowest-price option", stops: 1 },
    { airline: "NorthStar Air", factor: 0.97, features: "Checked bag included", stops: 0 },
  ];
  target.bids = competitors.map((airline, index) => ({
    id: `${requestId}-bid-${index}`,
    airline: airline.airline,
    price: Math.max(1, Math.floor(budget * airline.factor)),
    features: airline.features,
    stops: airline.stops,
    createdAt: new Date().toISOString(),
    simulated: true,
  }));
  writeRequests(records);
  return target;
}

export function acceptDemoBid(email, requestId, bidId) {
  const records = readRequests();
  const request = records.find((r) => r.id === requestId && r.email === email?.trim().toLowerCase());
  if (!request) throw new Error("Request not found for this demo email.");
  if (request.status !== "open") throw new Error("This request is already closed.");
  if (!request.bids.some((bid) => bid.id === bidId)) throw new Error("Bid does not exist.");
  request.acceptedBidId = bidId;
  request.status = "offer_selected";
  writeRequests(records);
  return request;
}


/* # ---------- ONE-CLICK TRAVELLER DEMO ACCOUNTS ---------- */
export const DEMO_TRAVELLERS = [
  { name: "Jamie Davis", email: "jamie@example.com", initials: "JD", requestCount: 3 },
  { name: "Sam Carter", email: "sam@example.com", initials: "SC", requestCount: 2 },
  { name: "Alex Taylor", email: "alex@example.com", initials: "AT", requestCount: 4 },
];

const SEED_KEY = "bidscanner.mock.traveller.seed.v1";
const SAMPLE_TRIPS = {
  "jamie@example.com": [
    ["Edinburgh (EDI)", "Barcelona", "2026-11-12", "2026-11-18", 220, "bids"],
    ["Edinburgh (EDI)", "Rome", "2026-12-04", "2026-12-09", 340, "bids"],
    ["Glasgow (GLA)", "Lisbon", "2027-01-16", "2027-01-22", 280, "bids"],
  ],
  "sam@example.com": [
    ["Manchester (MAN)", "Copenhagen", "2026-11-22", "2026-11-26", 190, "none"],
    ["London (LHR)", "Madrid", "2026-12-15", "2026-12-20", 260, "bids"],
  ],
  "alex@example.com": [
    ["Edinburgh (EDI)", "Paris", "2026-11-07", "2026-11-12", 230, "selected"],
    ["Birmingham (BHX)", "Prague", "2026-12-02", "2026-12-07", 210, "bids"],
    ["London (LGW)", "Athens", "2027-01-19", "2027-01-26", 320, "bids"],
    ["Manchester (MAN)", "Amsterdam", "2027-02-10", "2027-02-15", 180, "none"],
  ],
};

export function seedDemoTraveller(email) {
  const normalized = (email || "").trim().toLowerCase();
  const sample = SAMPLE_TRIPS[normalized];
  if (!sample) return;
  const existing = readRequests();
  // Markers plus stable IDs prevent duplication even if this function runs again.
  let seeded = [];
  try { seeded = JSON.parse(localStorage.getItem(SEED_KEY) || "[]"); } catch { /* recover below */ }
  if (!Array.isArray(seeded)) seeded = [];
  if (seeded.includes(normalized)) return;

  const demoRequests = sample.filter((_, i) => !existing.some((r) => r.id === `demo-${normalized}-${i}`)).map(([origin, destination, depart, back, maxBudget, mode], i) => {
    const id = `demo-${normalized}-${sample.findIndex((t) => t[0] === origin && t[1] === destination)}`;
    const factors = [0.84, 0.92, 0.97];
    const airlines = ["AeroNova", "BudgetJet", "SkyWays"];
    const bids = mode === "none" ? [] : airlines.map((airline, bidIndex) => ({
      id: `${id}-bid-${bidIndex}`,
      airline,
      price: Math.floor(maxBudget * factors[bidIndex]),
      features: ["Cabin bag included", "Basic fare", "Extra legroom"][bidIndex],
      stops: [0, 1, 0][bidIndex],
      simulated: true,
      createdAt: "2026-10-17T09:00:00.000Z",
    }));
    return {
      id, email: normalized, origin, destination, depart, back, maxBudget,
      adults: 1, children: 0, cabin: "Economy", tripType: "Return", direct: false, nearby: false,
      createdAt: `2026-10-${String(10 + i).padStart(2, "0")}T12:00:00.000Z`,
      status: mode === "selected" ? "offer_selected" : "open",
      acceptedBidId: mode === "selected" ? bids[0].id : null,
      bids,
    };
  });
  // If storage fails, leave the marker unset so the operation can be retried.
  writeRequests([...demoRequests, ...existing]);
  localStorage.setItem(SEED_KEY, JSON.stringify([...seeded, normalized]));
}
