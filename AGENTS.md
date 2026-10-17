# AGENTS.md

Guidance for Codex when working in this repository.

## Context

This is a team entry for the **Edinburgh AI Hackathon**. The theme is **"Flip the Script"**:

> Take something we all assume has to work a certain way and turn it on its head. Think about the systems, processes and ideas we take for granted. What if they worked in reverse? Pick something familiar, challenge the assumptions behind it, and build a completely different way of doing things. Don't just make it better. Flip the whole idea.

See `README.md` for the current project idea, the assumption being flipped, and setup instructions.

## Guiding principles

- **Flip, don't polish.** When suggesting features or design choices, check them against the theme. An incremental improvement to the familiar version is off-brief; the product should invert the underlying assumption. Call it out if a proposed feature drifts back toward the "normal" way of doing things.
- **Demo first.** This is a time-boxed hackathon. Prioritise a working, demoable end-to-end path over completeness, abstraction or edge-case handling. Hardcode, stub or mock anything that isn't on the demo path.
- **Make the flip visible.** The judges need to *see* the inversion within seconds. Favour UI, copy and flows that make the reversed assumption obvious.
- **Keep it runnable.** Every commit on `main` should start and run. Don't leave the app broken between changes; teammates are pulling frequently.

## Working conventions

- Keep dependencies minimal and well-known; avoid anything that needs lengthy setup on a teammate's machine.
- Secrets go in `.env` (git-ignored) with a matching `.env.example` committed. Never commit API keys.
- When using LLM APIs, default to the latest Codex models (e.g. `Codex-opus-5-5`, `Codex-sonnet-5-5` for speed/cost, `Codex-haiku-5-5` for high-volume calls).
- Update `README.md` (setup, run commands, project structure) when you add something a teammate would need to know to run the project.
- Small, focused commits with clear messages.

## Commands

_TBD — add install, run, test and lint commands here once the stack is chosen._

## Architecture

_TBD — summarise the main components and how data flows between them once the codebase exists._
