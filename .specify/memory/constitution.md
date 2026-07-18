<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Rationale: MINOR bump — added a new binding principle (VI. Definition of Done / Green-to-Ship
pipeline) and game-versioning + footer-version-bar rules. No principles removed or redefined.

Principles defined (6):
  I.   Zero-Dependency, Single-File Delivery
  II.  Vanilla Web Platform Only
  III. Playtest-First Verification (NON-NEGOTIABLE)
  IV.  Performance Budget & 60 FPS Discipline
  V.   Data-Driven Content, Simple Code
  VI.  Definition of Done — Green-to-Ship Pipeline (NON-NEGOTIABLE)  [added in 1.1.0]

Added in 1.1.0:
  - Principle VI: E2E + build + unit gate → bump → push → deploy
  - Game semantic versioning rules (distinct from constitution version)
  - Mandatory footer version bar with single GAME_VERSION source of truth

Added sections:
  - Technology & Architecture Constraints
  - Development Workflow & Quality Gates
  - Governance

Templates reviewed for consistency:
  ✅ .specify/templates/plan-template.md      (Constitution Check aligns; no changes needed)
  ✅ .specify/templates/spec-template.md       (scope sections compatible)
  ✅ .specify/templates/tasks-template.md      (task categories compatible; playtest tasks map to Principle III)
  ✅ .hermes/commands/speckit.*.md             (generic integration; no agent-specific names to fix)

Deferred / TODO: none. RATIFICATION_DATE set to first commit date of the repository.
-->

# WebDiablo Constitution

WebDiablo is a browser-based, dark-fantasy dungeon-crawler action RPG ("Shadows of the
Forgotten"). It ships as a single self-contained HTML file, runs entirely client-side on
the vanilla web platform, and is hosted on GitHub Pages. This constitution defines the
non-negotiable principles that keep the project fast, portable, and easy to hack on.

## Core Principles

### I. Zero-Dependency, Single-File Delivery

The entire game MUST remain playable from a single `index.html` with no build step, no
package manager, and no external runtime dependencies. All HTML, CSS, and JavaScript live
in that one file (assets may be inlined as data URIs or generated procedurally). No CDN
`<script>`/`<link>` tags, no npm, no bundler, no transpiler.

Rationale: The project's core value is "open the file and it works." A single file can be
double-clicked locally, served by the bundled `server.py`, or hosted on GitHub Pages with
zero configuration. Every added dependency erodes that guarantee and adds a failure mode.

### II. Vanilla Web Platform Only

Gameplay MUST be built on native browser APIs — Canvas 2D for rendering, Web Audio API for
sound, `requestAnimationFrame` for the game loop, and standard DOM for UI overlays. No
front-end framework (React, Vue, Svelte, etc.), no game engine, no rendering library.
Browser support target: current evergreen Chromium and Firefox.

Rationale: Frameworks and engines impose build steps and abstractions that conflict with
Principle I and add weight to a game that is deliberately lightweight. Native APIs are
sufficient and keep the codebase transparent and debuggable.

### III. Playtest-First Verification (NON-NEGOTIABLE)

No feature is "done" until it has been verified running in a real browser. Every change
that touches gameplay, rendering, input, or UI MUST be validated by (a) loading the game,
(b) confirming zero uncaught errors in the browser console, and (c) exercising the new
behavior in play. A change that produces a console error (e.g. a `getContext` on a missing
element) is considered broken regardless of how the code reads.

Rationale: This is a game with no automated test suite; the browser console and actual play
ARE the test harness. The project has already been bitten by a silent script-halting error
(a missing `<canvas id="minimap">`) that a console check would have caught immediately.

### IV. Performance Budget & 60 FPS Discipline

The game MUST target a smooth 60 FPS on modest hardware. The render and update loop MUST
avoid per-frame allocations where practical, cull off-screen entities, and keep the main
loop's per-frame work bounded. Any feature that measurably degrades frame rate MUST be
optimized or gated behind a toggle before merge.

Rationale: Action combat feels bad below 60 FPS. Canvas 2D gives no free performance, so
discipline (culling, object reuse, bounded loops) is the only safeguard.

### V. Data-Driven Content, Simple Code

New content — enemies, items, floors, loot tables, spells — MUST be added as data
(configuration objects/arrays) rather than by branching special-case logic wherever
possible. Systems stay generic; content stays declarative. Prefer the simplest code that
works (YAGNI); avoid speculative abstraction.

Rationale: The existing design already expresses enemies and drops as data tables. Keeping
content declarative makes balancing and expansion cheap and keeps the single file readable.

### VI. Definition of Done — Green-to-Ship Pipeline (NON-NEGOTIABLE)

Every completed feature MUST pass the full verification pipeline before it is considered
done, and passing that pipeline MUST trigger a release. The exact, ordered gate is:

1. **E2E test**: the feature is exercised end-to-end in a real (headless) browser and the
   game loads with **zero uncaught console errors**.
2. **Build check**: the build/validation step passes (HTML/JS structure validates, the game
   boots, no missing DOM references).
3. **Unit tests**: all unit tests pass (green).

Only when **all three are green** MUST the following release actions run, in order:

4. **Version bump**: increment the game version per semantic versioning (see below).
5. **Push to Git**: commit and push to `origin/master`.
6. **Publish**: deploy the new version to GitHub Pages and verify the live URL serves it.

If any gate is red, the pipeline STOPS — no bump, no push, no deploy — until it is green.
This gate may not be waived.

Rationale: Automating "green means ship" removes human error from releases and guarantees
that what is on the live URL always passed the full test suite. It makes every feature a
verifiable, releasable unit.

**Game versioning (semantic, MAJOR.MINOR.PATCH)** — the game version is distinct from this
constitution's version:
- **MAJOR**: backward-incompatible change to saves or core gameplay contract.
- **MINOR**: a new player-facing feature.
- **PATCH**: bug fix, balance tweak, or polish with no new feature.
- The current game version MUST be displayed to the player as a **footer version bar** fixed
  at the bottom of the screen (e.g. `WebDiablo v1.0.0`). There MUST be a single source of
  truth for the version string (one `GAME_VERSION` constant) that both the footer and the
  release process read.

## Technology & Architecture Constraints

- **Language/Platform**: HTML5 + CSS + vanilla ES (no TypeScript build, no modules requiring
  a bundler). Inline `<script>` is the delivery unit.
- **Rendering**: Canvas 2D (`gameCanvas` for the world, `minimap` for the overview).
- **Audio**: Web Audio API via the in-file `AudioEngine`; audio is procedurally synthesized,
  not shipped as files.
- **Effects**: Particle effects via the in-file `ParticleSystem` / `Particle` classes.
- **State**: A single top-level `Game` instance owns game state and the loop. Persistence,
  if added, MUST use `localStorage` only (no server, no backend).
- **Local dev server**: `server.py` (stdlib `http.server`) with no-cache headers, served on
  a configurable non-privileged port. It MUST have no third-party Python dependencies.
- **Hosting**: GitHub Pages from the `master` branch, repo root. The deployed artifact is
  the same `index.html` served locally — no separate build output.

## Development Workflow & Quality Gates

- **Version control**: All work is committed to Git and pushed to `origin/master`. GitHub
  Pages redeploys automatically on push; a change is not "shipped" until the live URL serves
  it (verify with an HTTP 200 and a content check).
- **Quality gate (mandatory before every commit that touches the game)**:
  1. Game loads with **zero uncaught console errors**.
  2. All DOM elements referenced by `getElementById` exist in the HTML (no `null` lookups).
  3. New behavior was playtested (Principle III).
  4. No new external dependency was introduced (Principle I & II).
- **Spec-Driven Development**: Non-trivial features SHOULD flow through the Spec Kit workflow
  — `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` — with
  `/speckit.clarify` and `/speckit.analyze` used to de-risk ambiguity.
- **Simplicity gate**: Any new abstraction, system, or file MUST be justified against
  Principle V; unjustified complexity is rejected.

## Governance

This constitution supersedes ad-hoc practice for the WebDiablo project. All changes to the
codebase are expected to comply with the principles above; a change that violates a
principle MUST either be revised or accompanied by an explicit, documented justification for
the exception.

- **Amendment procedure**: Amendments are made by editing this file, bumping the version per
  the policy below, updating the Sync Impact Report at the top, and committing with a message
  of the form `docs: amend constitution to vX.Y.Z (summary)`.
- **Versioning policy** (semantic):
  - **MAJOR**: Backward-incompatible removal or redefinition of a principle or governance rule.
  - **MINOR**: A new principle/section is added or existing guidance is materially expanded.
  - **PATCH**: Clarifications, wording, or typo fixes with no semantic change.
- **Compliance review**: Every change is reviewed against the Quality Gates before commit.
  The playtest + zero-console-error gate (Principle III) is non-negotiable and may not be
  waived.

**Version**: 1.1.0 | **Ratified**: 2026-07-17 | **Last Amended**: 2026-07-18
