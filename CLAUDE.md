# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Reverse Booking**, our team entry for the Edinburgh AI Hackathon. The theme is "Flip the Script": take something familiar and invert the assumption behind it.

**Planned** concept (not yet implemented): travellers publish a flight request and a budget, and AI airline agents compete by bidding on it. Booking is simulated. None of this exists in the code yet; see "Current state".

## Repo layout

```
frontend/   React + Vite app (JavaScript/JSX)
backend/    Spring Boot app (Maven)
README.md   Hackathon brief + project template (mostly TBD)
```

## Stack & versions (as declared in the repo)

| Part | What | Version |
|---|---|---|
| frontend | React / react-dom | ^19.2.8 |
| | Vite + @vitejs/plugin-react | ^8.3.0 / ^6.1.1 (Vite needs Node ^20.19 or >=22.12) |
| | Lint: oxlint (`.oxlintrc.json`, react + oxc plugins) | ^1.81.0 |
| | Language | JavaScript (`.jsx`). There is no TypeScript or `tsconfig`, although the `@types/react*` packages are installed. |
| backend | Spring Boot parent | 4.1.1 |
| | Java (`java.version` in pom.xml) | 25 |
| | Build | Maven wrapper 3.3.4 → Maven 3.10.0 (`./mvnw`) |
| | Starters | webmvc, validation, actuator, data-jpa, flyway, security; postgresql driver + flyway-database-postgresql |

## Running

```bash
# frontend
cd frontend && npm install
npm run dev        # Vite dev server (default http://localhost:5173)
npm run build      # vite build
npm run lint       # oxlint

# backend
cd backend
./mvnw spring-boot:run   # default port 8080
./mvnw test
```

Note: the backend won't build or start as it stands. It targets Java 25, and no datasource is configured. Fix those config issues before relying on these commands.

## Current state

- **Backend:** only `com.reversebooking.reversebooking.ReverseBookingApplication` (`@SpringBootApplication`) and a `contextLoads` test exist. `application.properties` sets only `spring.application.name=reverse-booking`. There are no controllers, entities, migrations or LLM code.
- **Frontend:** `src/App.jsx` is a single-component, Skyscanner-style "Skyflip" search homepage. All styles are inline in a `<style>` block, and `App.css` and `index.css` are empty. Every interaction is local demo state (`alert()` or status text), with no backend calls.
- **Not connected:** there is no fetch/API client, no Vite proxy and no CORS config, and no environment variables are read anywhere.

## Conventions found in the code

- Frontend: function components + `useState`, single-file components, no UI or CSS libraries.
- Backend: Spring Initializr defaults; base package `com.reversebooking.reversebooking`.
- Commits: conventional-style prefixes (`feat:`, `fix:`).

## Working principles

- **Flip, don't polish.** Point it out if a feature drifts back toward the normal search-and-book flow. The current homepage *is* that flow.
- **Demo first.** Make the end-to-end demo path work first, and stub anything that isn't on it.
- **Keep it runnable.** Make small increments, and every commit on `main` should start.
- Never commit secrets. LLM keys come from environment variables. Default to the latest Claude models (`claude-sonnet-5-5`, `claude-haiku-5-5`).
- Update `README.md` when setup or run steps change.
