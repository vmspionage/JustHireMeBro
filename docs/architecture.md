# Just Hire Me Bro - Technical Documentation

## 1. Architecture

### File Structure
```
index.html        - Main HTML document (screens, panels, modals)
css/styles.css    - All visual styles
js/data.js        - Game data: card pools, backgrounds, achievements, endings, microcopy
js/engine.js      - Game engine: drawFeed, applyCard, resolveLeads, advanceDay, micro-events
js/ui.js          - UI module: rendering, event handling, modals
js/boot.js        - Initialization and event listeners
```

### Loading Order
1. `css/styles.css`   (visual design)
2. `js/data.js`       (game data constants)
3. `js/engine.js`     (game logic - depends on data.js)
4. `js/ui.js`         (UI logic - depends on engine.js + data.js)
5. `js/boot.js`       (init - depends on ui.js + engine.js)

### Module Pattern
All JS modules use the Immediately Invoked Function Expression (IIFE) pattern:
```javascript
const MODULE = (() => {
  // Private variables and functions
  function privateFunction() { }
  
  // Public API
  return {
    publicFunction() { }
  };
})();
```

This ensures:
- No global namespace pollution
- Clear separation of public/private interfaces
- Easy to test and maintain

### Data Flow
1. `DATA` module exports all game constants (cards, backgrounds, achievements, etc.)
2. `Engine` module uses DATA to initialize game state and manage game logic
3. `UI` module uses Engine to render the game and handle user interactions
4. `boot.js` initializes all modules and attaches event listeners

---

## 2. Lead Progression System

Each lead follows a randomized stage track rather than a fixed path. This is the core progression mechanic introduced in Patch Q.

### Track Generation

When a lead is created, `generateLeadTrack(rng)` builds a randomized array of stage IDs. The track always starts with `'waiting'`, then probabilistically adds subsequent stages. This makes every lead feel unique.

**Full stage list** (in approximate chronological order):

`waiting` → `auto-reply` → `screening-form` → `recruiter-screen` → `video-interview` → `personality-test` → `take-home` → `panel-interview` → `salary-stall` → `reference-checks` → `final-interview-1` → `final-interview-2` → `final-interview-3` → `offer-pending`

Terminal outcomes (`offer`, `ghosted`, `rejected`, `role-paused`) are **NOT** in the track. They are resolved when `stageIdx >= track.length`, meaning the player has cycled through every stage.

### Lead Data Shape

```javascript
const lead = {
  id, company, role, isReal, ghostChance, scamChance, atsThreshold,
  daysSinceUpdate, stageIdx, history, pay, source, finalCount, stalled,
  track: ['waiting', ...stages],           // randomized stage path
  followUpsThisStage: 0,                   // WAITING follow-ups counter
  finalInterviewCount: 0,                  // stacked finals counter
  signals: { salaryDisclosed, realRecruiter, portfolioReviewed, referenceTrouble },
};
```

**Key fields:**

| Field | Purpose |
|---|---|
| `track` | Array of stage IDs defining this lead's personalized path |
| `stageIdx` | Current position in the track |
| `followUpsThisStage` | Tracks how many times the player has followed up at the WAITING stage (used for probability thresholds) |
| `finalInterviewCount` | Stacks across multiple `final-interview` stages; triggers special events |
| `signals` | Accumulated boolean flags from player actions; influence terminal outcome weights |

### Key Functions

**`generateLeadTrack(rng)`** — Creates a randomized stage path for a new lead. Starts with `'waiting'`, then walks the stage list, including or excluding each step based on weighted random rolls.

**`followUpLead(leadId)`** — Advances a lead one stage forward. Returns a result object describing what happened. If the current stage has an associated mini-game, it returns a mini-game launch signal instead of advancing directly.

**`triggerStage(lead, stageId)`** — Dispatcher for each stage type. Matches the `stageId` and executes the appropriate logic. Some stages return `{type: 'minigame', minigame: 'name', lead}` to hand control to the UI layer.

**`resolveTerminalOutcome(lead)`** — Called when `stageIdx >= track.length`. Runs a weighted roll for one of the four terminal outcomes. Weights are modified by accumulated signals: `salaryDisclosed`, `realRecruiter`, `portfolioReviewed`, `referenceTrouble`.

**`finishLead(lead, outcome)`** — Removes the lead from the active list, applies stat effects (e.g., money gain on offer, stat loss on ghost), and triggers any end-game conditions.

---

## 2.5 Morning Events System (Patch P)

Each day (starting Day 2, 30% chance), a random real-world life event may appear as a modal *before* the feed renders. There are 20 distinct events, each with 2–4 choices whose outcomes are hidden until selected.

**Engine functions:**
- `rollMorningEvent()` — 30% chance, skips Day 1 and countdown days (25/28/30), no back-to-back repeats
- `resolveMorningChoice(event, choiceIdx)` — Applies weighted outcome, updates stats, logs the event

**Data:** `DATA.MORNING_EVENTS` — array of 20 events with `id`, `icon`, `title`, `flavor`, `choices[]`
Each choice has `label` and weighted `outcomes[]` with `effects[]` (stat deltas) and `result` (flavor text).

**Design rules:**
- Effects max ±20 on any stat, ±$40 on Money — no instant game-over
- Mix of guaranteed and probabilistic outcomes
- Every event has at least one free or neutral choice
- No children, illness specifics, mental-health specifics, violence, romance, or politics

**Achievements:** `good-morning` (10 events across all runs), `right-thing` (report DoorDash glitch), `free-pizza` (meetup for pizza), `mom-knows` (3 mom calls in one run)

---

## 3. Mini-Game System

Four mini-games were introduced in Patch Q, launched directly from lead follow-ups. Two existing mini-games from earlier patches were also repurposed.

**Total: 6 mini-games**

| Mini-game | Triggered By | Core Mechanic |
|---|---|---|
| `screening-form` | Lead stage `screening-form` | Fill in a mock application form |
| `take-home` | Lead stage `take-home` | Complete a timed task |
| `panel-interview` | Lead stage `panel-interview` | Answer panel questions |
| `salary-stall` | Lead stage `salary-stall` | Negotiate compensation |
| `video-interview` | Lead stage `video-interview` | Hold-to-record mechanic (reused) |
| `personality-test` | Lead stage `personality-test` | Slider-based quiz (reused) |

**Flow:**

1. `triggerStage()` detects a stage that has a mini-game.
2. Returns `{type: 'minigame', minigame: 'name', lead}`.
3. UI routes to the appropriate `startMinigame()` function with an `onComplete` callback.
4. On completion, the lead advances to the next stage.
5. If the player gives up, the lead stays alive at the same stage (no penalty).

---

## 4. Morning Events System

Morning events were introduced in Patch P as a daily probability-based event layer.

**Parameters:**
- **Trigger:** 30% chance per day, only on day 2 or later
- **Pool:** 20 unique events
- **Choices per event:** 2 to 4 hidden choices
- **Outcomes:** Mix of guaranteed effects and weighted-random results

**Effect bounds:**
- Stat changes are clamped to valid stat ranges
- Maximum stat change: ±20
- Maximum money change: ±$40
- Morning events **never** cause instant game over

This keeps daily gameplay fresh without risking a hard loss state.

---

## 5. resolveLeads() — Patch Q Changes

The `resolveLeads()` function was refactored in Patch Q. Its role shifted from auto-advancement to passive management.

**Before Patch Q (old behavior):**
- Auto-advanced leads every 3–4 days based on ATS threshold
- Stage progression was automatic and time-driven
- Player had limited control over pacing

**After Patch Q (current behavior):**
- Increments `daysSinceUpdate` for all active leads
- Auto-ghosts leads at 8+ days without player interaction
- Collects offers that have become ready
- Stage advancement happens **only** when the player clicks Follow Up

This gives the player agency over pacing while keeping passive decay mechanics (ghosting, offer collection) running in the background.
