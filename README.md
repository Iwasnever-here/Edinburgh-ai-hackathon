# BidScanner

**Tell airlines what you need. Let them bid for you.**

![Frontend: React and Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-1f2937?logo=react&logoColor=61DAFB) ![Backend: Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-1f2937?logo=springboot&logoColor=6DB33F) ![Storage: in memory](https://img.shields.io/badge/Storage-In%20memory-1f2937)

BidScanner flips the usual flight-booking process for the Edinburgh AI Hackathon’s **“Flip the Script”** theme. Instead of searching through fixed fares, travellers publish the trip they want and airlines compete to offer it.

## How it works

Travellers set their route, date window, passenger count and budget. Airlines browse open requests and submit or revise offers. The backend checks each offer against the traveller’s budget, baggage and direct-flight requirements. Travellers compare bids and accept one; acceptance closes bidding for that request.

## Try the demo

1. Publish a trip from the home page using an email address as your demo label.
2. Open **Airline login**, choose an airline, and use password `demo`.
3. Place an offer from the marketplace.
4. Return to **My requests**, refresh offers and select one.
5. Open `/live` for the judge-facing ranking and activity view.

| Demo username | Airline |
| --- | --- |
| `aeronova` | AeroNova |
| `budgetjet` | BudgetJet |
| `skyways` | SkyWays |

## Run locally

Requirements: Java 21 or later, Node.js with npm, and two terminals. No database or API key is needed.

**Terminal 1 — backend**

```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 — frontend**

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). It proxies `/api` to the backend at `http://localhost:8080`. Stop either server with `Ctrl+C`.

## API

All endpoints run on port `8080`. Money values use integer pence; IDs are strings.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/requests` | Publish a request |
| `GET` | `/api/requests` or `/api/requests/{requestId}` | List requests or get one |
| `GET` | `/api/airlines` | List demo airlines |
| `GET` | `/api/airlines/{airlineId}/marketplace` | Browse open requests |
| `POST` | `/api/requests/{requestId}/offers` | Submit an offer |
| `GET` | `/api/requests/{requestId}/offers` | View offers and score breakdowns |
| `GET` | `/api/requests/{requestId}/standing?airlineId={airlineId}` | Get an airline’s standing without rival prices |
| `GET` | `/api/airlines/{airlineId}/bids` | View an airline’s bid history |
| `PUT` | `/api/airlines/{airlineId}/strategy` | Update demo strategy settings |
| `POST` | `/api/offers/{offerId}/accept` | Accept an offer and close bidding |

Example request:

```json
{
  "origin": "EDI",
  "destination": "BCN",
  "earliest": "2027-07-12",
  "latest": "2027-07-16",
  "passengers": 2,
  "maxPricePence": 15000,
  "checkedBags": 1,
  "directOnly": false
}
```

Offers that break a hard requirement are saved as `REJECTED` with a reason. A valid revised bid supersedes that airline’s previous bid. On acceptance, other valid bids become `LOST`.

## Prototype notes

- Backend data is in memory and resets when the backend restarts.
- The email is an unverified browser-local label; demo sign-in is not authentication.
- No real flights are searched, booked or paid for. Airlines place bids manually; autonomous AI bidding is not implemented.
- Cabin class and nearby-airport preferences appear in the traveller form but are not yet sent to or enforced by the backend. Routes are free text; route availability and minimum fares are not checked.

## Checks

```bash
# backend (from backend/)
./mvnw test

# frontend (from frontend/)
npm run build
npm run lint
```

The current backend test verifies that Spring starts; it does not yet test the full request → bid → accept flow.

## Project layout

- `backend/` — Spring Boot API and in-memory request, airline and offer services
- `frontend/` — React/Vite traveller, airline and live ranking interfaces

Main routes: `/` traveller home, `/airline` airline portal, `/live` live ranking. No license has been added yet.
