# AGENTS.md — Just Hire Me Bro

## Project Overview

**JustHireMeBro** is a browser-based satirical card game about job hunting. No build tools, no frameworks, no bundlers. Pure vanilla JS/CSS served as static files.

**Repo:** `github.com/vmspionage/JustHireMeBro`
**License:** MIT

---

## File Architecture

```
index.html           → Entry point, all screens/modals/panels
css/styles.css       → All styles (CSS vars: --navy, --red, --teal, --gold, --bg)
js/data.js           → GAME DATA (constants): cards, backgrounds, achievements, endings, buzzwords, microcopy
js/engine.js         → GAME ENGINE: state, save/load, card logic, lead tracking, achievements
js/ui.js             → UI RENDERING: screen transitions, stat bars, feed, modals, mini-games
js/boot.js           → BOOT: document.addEventListener('DOMContentLoaded', UI.init)
tests.spec.js        → Playwright E2E tests (target: localhost:12321)
docs/                → Technical docs (architecture, card-engine, stat-system, day-progression, journal-system, achievements)
```

### Loading Order (DO NOT REORDER)
1. `css/styles.css` — visual design
2. `js/data.js` — game data constants (exports `DATA`)
3. `js/engine.js` — game logic (depends on `DATA`, exports `Engine`)
4. `js/ui.js` — UI logic (depends on `Engine` + `DATA`, exports `UI`)
5. `js/boot.js` — init (depends on `UI`)

### Module Pattern
All JS uses **IIFE modules** on `window`:
```javascript
const MODULE = (() => { /* private */ return { /* public API */ }; })();
```
- No imports/exports. No bundler. No CommonJS/ESM in game code.
- `tests.spec.js` uses ESM (Playwright only) — do NOT convert game files to ESM.

---

## Core Game Mechanics

### Stats (12 tracked)
| Stat | Range | Meaning |
|------|-------|---------|
| `rent` (Money) | 0-9999 | Funds for rent. Game over at 0. |
| `hope` | 0-100 | Morale. Game over at 0. |
| `credibility` | 0-100 | Professional reputation. Game over at 0. |
| `clout` | 0+ | Social capital from posts. Unlocks backgrounds at 200. |
| `atsFavor` (Bot Aura) | 10-100 | Digital presence. Game over at 100. |
| `robotSuspicion` (Sus) | 0-100 | AI suspicion. Game over at 0. |
| `humanContact` | 0-100 | Human connections. Affects lead quality. |
| `buzzwords` | Array | Buzzwords collected. 15+ → "Founder Mode" ending. |
| `energy` | 0-maxEnergy | Actions per day. Restored each morning. |
| `scamEvidence` | 0-100 | Proof of scams. Unlocks "Scam the Scammers" ending. |
| `ghostEvidence` | 0-100 | Proof of ghost jobs. Unlocks "Ghost Job Vigilante" ending. |
| `scamsFell` | 0+ | Total scams successfully reported. |

All stat modifications MUST use `DATA.clamp(value, min, max)`.

### Card System
- **92 unique cards** across 10 categories: `job`, `recruiter`, `post`, `network`, `resume`, `gig`, `investigate`, `rest`, `event`, `micro`
- Each card has: `id`, `title`, `category`, `flavor`, `cost`, `weight`, `effects`, `buttons`
- Cards defined in `js/data.js` via `mk()` helper
- Weighted draw system: higher weight → more frequent appearance
- Daily feed: 4 cards (standard jobs excluded after Day 5, 10% urgent card injection)

### Day Loop
1. **Start Day** → Morning event (30% chance, Day 2+), then draw feed, restore energy
2. **Play Cards** → Player plays up to 3 energy-limit cards, follows up on leads
3. **End Day** → Resolve leads, check win/loss conditions, EOD modal

**30-day cycle** with tension modals on Days 25, 28, 30.

### Lead System
- Leads follow **randomized stage tracks** (not fixed paths)
- Track: `waiting` → `auto-reply` → `screening-form` → ... → `offer-pending`
- Terminal outcomes (`offer`, `ghosted`, `rejected`, `role-paused`) resolve when track is exhausted
- Follow-up requires 3+ days since last update
- Signal-based: flags affect terminal outcomes (salary disclosed, real recruiter, etc.)

### Mini-Games (6 types)
1. Screening Form — personality questions and references
2. Take-Home — unpaid assignment evaluation
3. Panel Interview — group decision-making
4. Salary Stall — compensation negotiation
5. Video Interview — online interview
6. Personality Test — behavioral assessment

### Backgrounds (7 types)
Each modifies starting stats and may have passive perks. Some are locked until unlocked by achievements.

### Endings
- 9 victory paths, 10 loss paths — see `DATA.ENDINGS`
- Special endings gated by stats (Buzzwords ≥ 15, Scam Evidence, etc.)

### Achievements (38 total)
Tracked in `Engine._meta.achievements` (persists across runs). Checked via `checkAchievements()`.

---

## Save/Load System

### localStorage Keys
- `juhirebro_v1` — Meta data (achievements, lifetime stats, unlocked backgrounds)
- `juhirebro_run_v1` — Active run state (save/load/continue)

### Schema Versioning
`Engine._meta.v` tracks schema version. `migrateMeta()` handles forward migration. Current: v3.

---

## Development

### Running the game
```bash
# Simple HTTP server (port 12321 for tests)
python -m http.server 12321
# or any static server — open index.html in browser
```

### Running tests
```bash
# Start server first, then:
npx playwright test
```
Tests target `http://127.0.0.1:12321/` — defined in `tests.spec.js` as `GAME_URL`.

### Constraints
- **NO external dependencies** — zero npm packages for game logic
- **NO network requests** — fully offline
- **NO build step** — raw HTML/JS/CSS
- **Modern browsers only** — no IE compatibility
- All game code in IIFE modules; ESM only for Playwright tests

---

## Key Code Patterns

### UI rendering
- `UI.scheduleRender()` → batched rAF updates
- `UI.htmlToDom()` → safe HTML→DOM via `<template>`
- `UI.showScreen(id)` → screen switching

### Engine state
- `Engine.state` → returns current game state (`_g`)
- `Engine.init()` → starts new run
- `Engine.loadRun()` → loads saved run
- `Engine.saveRun()` / `Engine.clearRun()` → save management

### Data access
- `DATA.POOLS` → card pools by category
- `DATA.BACKGROUNDS` → background definitions
- `DATA.ACHIEVEMENTS` → achievement definitions
- `DATA.ENDINGS` → ending definitions
- `DATA.mulberry32()` → seeded PRNG

### Journal/Deltas
- `Engine.snapStats()` → capture stats snapshot
- `Engine.pushLog(day, text)` → log with auto-computed deltas
- Delta tracking = before/after comparison via `computeStatDeltas()`

### Morning Events
- 20 events defined in `DATA.MORNING_EVENTS`
- 30% daily probability (Day 2+), 4-day cooldown per event
- Hidden outcomes, max ±20 stat effect per choice

---

## Code Style Guidelines

1. **IIFE modules only** — no imports/exports, no bundler
2. **CSS custom properties** for all colors/themes (`--navy`, `--red`, etc.)
3. **`DATA.clamp()`** for all stat modifications — never direct assignment
4. **Minified utility functions** in `data.js` are intentional (size optimization)
5. **Comment headers** at top of files describe load order and structure
6. **Accessibility** — focus-visible, skip links, aria-live, prefers-reduced-motion supported
7. **Satirical tone** — flavor text, company names, buzzwords are part of the game world

---

## Testing Notes

- Tests use Playwright with helpers: `goGame()`, `getStats()`, `getDay()`, `getJournal()`
- `goGame()` selects `career-goblin` background by default
- Game state accessed via `window.Engine.state` from evaluate()
- LocalStorage cleared between test runs
- Server MUST be running on port 12321 before running tests

---

## Debugging with Chrome DevTools

### Primary Debug Tool
Chrome DevTools is the primary debugging workflow for this project. No build tools, breakpoints, or sourcemaps needed — just open `localhost:12321` and press F12.

### Console — Game State Inspection
```javascript
// Inspect current game state
Engine.state.run.stats    // All 12 stats
Engine.state.run.flags     // All tracked flags
Engine.state.run.leads     // Active leads array

// Inspect data pools
DATA.POOLS                // All card pools by category
DATA.ENDINGS              // All ending definitions
DATA.ACHIEVEMENTS         // Achievement definitions
DATA.PIP_LETTER           // PIP letter letter templates

// Force state changes (for testing)
Engine._g.run.stats.hope = 0        // Trigger game over
Engine._g.run.flags.leadsGhosted++ // Bump ghost count
```

### Sources — Breakpoints
All 4 JS files load directly — set breakpoints in:
- `js/engine.js` → `generateLeadTrack()`, `followUpLead()`, `triggerStage()` (lines ~253, ~1169, ~1200)
- `js/ui.js` → `processCardClick()`, `startSalaryStall()`, `buildPIPLetter()` (mini-game debugging)
- `js/data.js` → Card definitions, constant pools

### Local Storage — Save/Load Debugging
```
# Keys
juhirebro_v1      → Meta data (achievements, lifetime stats, unlocked backgrounds)
juhirebro_run_v1  → Active run state (save/load/continue)

# Clear all saves
localStorage.clear()
```

### Elements — DOM Debugging
- `#feed` → Active card feed
- `#pip-letter-container` → PIP letter at game end
- `#eod-modal` → End-of-day modal
- `#end-screen` → Game over screen
- Use `$0` in Console to inspect selected Elements tab node

### Network — Minimal (static only)
No network requests expected. If requests appear, investigate external resource loading.

### Performance — rAF Batching
UI uses `UI.scheduleRender()` for batched `requestAnimationFrame` updates. Use `performance.now()` markers to profile slow renders.

---

## Common Pitfalls

| Mistake | Fix |
|---------|-----|
| Adding ESM imports to game files | Keep IIFE pattern; ESM is Playwright-only |
| Forgetting `DATA.clamp()` on stat changes | Stats MUST be clamped to their valid range |
| Breaking load order (js boot/engine/ui/data) | See File Architecture section above |
| Adding npm dependencies for game logic | Zero dependencies — this is intentional |
| Modifying card data without checking conditions | Cards may have `conditions`, `permaPlayed`, or weight modifiers |
| Breaking save compatibility | Bump schema version + add migration in `migrateMeta()` |
| Direct stat assignment in card effects | Always use `snapStats()` → modify → `pushLog()` pattern |
