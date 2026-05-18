# Just Hire Me Bro — Expanded Roadmap: Technical Specifications

> Each unfinished feature (3–20) is expanded with concrete implementation notes grounded in the existing architecture. Done features (1–2) preserved as reference.

---

## PHASE 1 — Deepen the core (Features 1–6)

### 1. The Inbox — a persistent, readable message log [DONE]

*(preserved as-is)*

### 2. Daily Standup — a morning briefing screen [DONE]

*(preserved as-is)*

---

### 3. Stat-driven dynamic feed weighting

The feed should *react* to the player's state, making each run feel responsive rather than random.

**Creative detail:** when the feed shifts noticeably, the news headline acknowledges it with a wink. *"The algorithm has noticed you're broke. It has thoughts.", "Your desperation has been detected and monetized.", "You posted once and now your feed is all 'thought leadership.' Congratulations."*

#### Technical Specification

**State extension:**
- Add `feedWeights` object to `g.run`:
```js
feedWeights: {
  gig: 1.0,        // weight multiplier for gig cards
  scam: 1.0,       // weight multiplier for scam/scam-ish cards
  post: 1.0,       // weight multiplier for social media cards
  doomscroll: 1.0, // weight multiplier for low-energy/doom cards
  network: 1.0,    // weight multiplier for networking cards
  circleBack: 1.0, // weight multiplier for follow-up cards
  captcha: 1.0,    // weight multiplier for captcha/AI screening cards
}
```

**Weight computation (`data.js`):**
- New function `DATA.feedWeightModifiers(stats)` returns the `feedWeights` object by reading current stats:
  - `stats.robotSuspicion > 70` → `captcha *= 2.5`
  - `stats.robotSuspicion < 30` → `captcha *= 0.3`
  - `stats.rent < 20` → `gig *= 2.5`, `scam *= 3.0`
  - `stats.hope < 25` → `doomscroll *= 2.0`
  - `stats.clout > 50` → `post *= 1.8`
  - `activeLeads.length > 3` → `circleBack *= 1.5`
  - `stats.humanContact > 60` → `network *= 1.5`

**Engine wiring (`engine.js`):**
- In `weightedPool(pool, state)`: after base weight computation, multiply each card's weight by the category-specific feedWeight modifier. Cards tag their category via existing `card.category` field.
- In `drawFeed()`: call `DATA.feedWeightModifiers(_g.run.stats)` once per feed draw to compute dynamic weights. Store result in `_g._currentWeights` cache.
- Recompute weights at top of each day in `advanceDay()`.

**News headline hook (`engine.js` / `ui.js`):**
- New `DATA.FEED_SHIFT_HEADLINES` mapping stat-thresholds → headline text. When any weight exceeds 1.5 or drops below 0.5, pick a matching headline for the day's standup.
- Track `_g.run.flags._prevFeedWeights` and diff against current to detect "shifts" (abs change > 0.5 on any axis).

**CSS:** No new styles required. Feed cards already render via existing `#feed` container.

---

### 4. Streaks & momentum

Add a hidden **momentum** system.

**Creative detail:** momentum is never shown as a number. On a good streak, the run-log narration warms up — *"You're finding a rhythm."* On a doom streak, narration gets flatter — *"Another day."*

#### Technical Specification

**State extension:**
```js
// In g.run
momentum: {
  value: 0,           // -100 (doom) to +100 (good). Never displayed directly.
  consecutive: 0,     // consecutive days with same-direction actions
  phase: 'neutral'   // 'good' | 'doom' | 'neutral' — determines narration tone
}
```

**Momentum modifiers (`engine.js`):**
- New `adjustMomentum(actionCategory, result)` called from `applyCard()`:
  - `actionCategory` = card.category
  - `result` = positive | negative | neutral (based on net stat effects)
  - Construction categories (`job`, `gig`, `network`, `resume`, `rest`) → `momentum.value += 3..8` on positive result
  - Self-destructive (`post` with cringe content, `job` easy-apply spam pattern) → `momentum.value -= 3..6`
  - Momentum clamped to `[-100, 100]` via `DATA.clamp()`
  - Decay: each day, `momentum.value` drifts 3 toward 0 (prevents permanent lock-in)

**Narration hook (`engine.js`):**
- New `DATA.MOMENTUM_NARRATION` keyed by phase and intensity bands:
  - `good` ≥ 50: *"You're finding a rhythm.", "Something feels different today."*
  - `doom` ≤ -50: *"Another day.", "You applied. That's all."*
  - `good` 20-49: *"Small progress compounds."*
  - `doom` -20 to -49: *"It's been a rough stretch."*
- `getLogFlavor(stats, momentum)` appends a momentum-colored trailing sentence to journal entries. Called from `pushLog()`.

**Intervention system (`engine.js`):**
- New `DATA.INTERVENTION_EVENTS` array. Triggered when `momentum.value` crosses -70 for the first time in a run:
  - Modal with 2 choices: "accept support" (Hope +15, momentum resets to -20) / "push through" (no stat change, momentum stays, flag `flags._rejectedIntervention` toggled)
  - Track `_g.run.flags._interventionTriggered` to fire only once per run.

**Achievement link:**
- `checkAchievements()` → new achievement `momentum_master`: reach momentum 100 without ever dropping below 0.
- New achievement `doom_survivor`: recover from momentum -100 to +50 within 5 days.

---

### 5. Multi-day projects

Some actions should take longer than one turn.

**Creative detail:** projects have progress flavor that updates daily. Abandoning is possible but slightly sad.

#### Technical Specification

**State extension:**
```js
// In g.run
projects: {
  active: [],         // array of active project objects. Max 1 initially.
  completed: [],      // history of completed projects (for achievements)
  maxSlots: 1,        // unlockable. Up to 2 via achievement/milestone.
}
```

**Project definition structure (`data.js`):**
```js
DATA.PROJECTS = [
  {
    id: 'portfolio-piece',
    name: 'Portfolio Project',
    category: 'portfolio',
    duration: 3,        // days to complete
    energyCost: 1,      // energy consumed per day while active
    cost: 0,             // money cost
    effects: {            // on completion
      cred: 10,
      hope: 5,
      clout: 5,
    },
    // Daily progress flavor (indexed by day index)
    progressFlavor: [
      'You set up the repo. The README says "TODO."',
      'You wrote actual code. It works. You are suspicious of this.',
      'You deployed it. It has one user. The user is you.',
    ],
    completionFlavor: 'Portfolio piece done. It\'s genuinely good. Now someone has to look at it.',
    abandonFlavor: 'You archived the project. It joins {archivedCount} others.',
    // Optional: conditions for appearance in card pool
    conditions: null,
  },
  // More: 'certification', 'open-source-contrib', 'learn-buzzword-skill'
];
```

**Engine wiring (`engine.js`):**
- Card button action: `startProject(projectId)` → validates slot availability, creates project instance `{id, startedDay, dayIndex: 0, ...}`.
- `advanceDay()`: iterate `projects.active` — increment `dayIndex` for each. Check completion (`dayIndex >= duration`).
  - On complete: apply `effects`, move to `completed`, log `completionFlavor`.
  - On abandon (via card/button): log `abandonFlavor` with `flags.archivedProjects++`, remove from active.
  - Daily energy drain: subtract `project.energyCost` from energy each day. If no energy, project pauses (logged).
- `pushLog()` on day start: for each active project, log `progressFlavor[dayIndex]` if progress changed.

**UI changes (`ui.js`):**
- New `#projects-panel` overlay or inline section in main game screen. Shows active projects with progress bar (`dayIndex / duration`), abandon button, and current-day flavor text.
- Rendered via `UI.renderProjects()` — called from `UI.scheduleRender()`.

**Save/Load projects persist in `_g.run.projects` — already serialized by existing `saveRun()`.

---

### 6. The "About" — a living profile you build

Give the player a **visible, editable profile page**.

**Creative detail:** headline options are a comedy menu. Profile photos have tiny mechanical effects.

#### Technical Specification

**State extension:**
```js
// In g.run
profile: {
  headline: '',           // player's chosen headline (empty = not set)
  headlineIdx: -1,        // index into DATA.PROFILE_HEADLINES
  photo: '',               // player's chosen photo ID
  photoIdx: -1,            // index into DATA.PROFILE_PHOTOS
  section: '',             // "about" text chosen from DATA.PROFILE_SECTIONS
}
```

**Data templates (`data.js`):**
```js
DATA.PROFILE_HEADLINES = [
  { text: 'Open to Work | Aspiring Synergist', effects: { atsFavor: 5, credibility: -3 } },
  { text: 'Just a guy trying his best, honestly', effects: { credibility: 5, atsFavor: -2 } },
  { text: 'Senior Junior Developer | Ex-Bootcamp', effects: { clout: 3, credibility: -1 } },
  // ...5-8 options
];
DATA.PROFILE_PHOTOS = [
  { id: 'cropped-wedding', name: 'Cropped Wedding Photo', effects: { humanContact: 2 } },
  { id: 'ai-headshot', name: 'AI-Generated Headshot (uncanny)', effects: { robotSuspicion: -5, credibility: -2 } },
  { id: 'default-silhouette', name: 'The Default Gray Silhouette (a power move)', effects: { atsFavor: 3 } },
  // ...4-6 options
];
```

**Card integration (`engine.js`):**
- New card category `resume` includes "build profile" cards with buttons that trigger `setProfileHeadline(idx)` and `setProfilePhoto(idx)`.
- Effects apply immediately via `snapStats()` → modify → `pushLog()` pattern.
- Card conditions: profile cards become more available as `day >= 3` or `flags.profileSet` is false.

**DM quality modifier (`engine.js`):**
- In `createLead()`: apply `profileHeadline` and `profilePhoto` effects to lead quality flags. Profile choices that boost `atsFavor` increase chance of auto-reply stage; those that boost `credibility` improve panel interview odds.

**UI changes (`ui.js`):**
- New `#profile-panel` modal/screen. Renders selected headline, photo (with placeholder CSS art), and about section.
- "Edit Profile" button opens selection menus from DATA templates.
- Stats impact visualization: small +/- indicators next to each choice showing mechanical effect.

---

## PHASE 2 — Systems & texture (Features 7–12)

### 7. Relationships — recurring named NPCs

**Creative detail:** Each character has a consistent voice. Investing unlocks benefits.

#### Technical Specification

**State extension:**
```js
// In g.run
relationships: {
  brenda: { level: 0, met: false, lastContactDay: -1 },    // eternal recruiter
  mentor: { level: 0, met: false, lastContactDay: -1 },    // tired ex-manager
  rival: { level: 0, met: false, lastContactDay: -1 },    // peer job hunter
  founder: { level: 0, met: false, lastContactDay: -1 },  // chaotic startup guy
  friend: { level: 0, met: false, lastContactDay: -1 },   // non-career friend
}
```

**NPC definition structure (`data.js`):**
```js
DATA.NPCS = [
  {
    id: 'brenda',
    name: 'Brenda',
    role: 'eternal recruiter',
    voice: 'breezy, over-familiar, slippery',
    // Messages indexed by relationship level (0-5)
    messages: [
      'Hey! I saw your profile and wanted to connect!',        // level 0
      'Hey again! We have something fun...',                  // level 1
      'It\'s Brenda... remember me? Call me.',               // level 2
      'I\'m starting to think I\'m the only one checking in.', // level 3
      '...you good? Asking for myself too.',                  // level 4
    ],
    // Per-level perks
    perks: [
      null, // level 0: nothing
      { type: 'lead_boost', desc: 'Brenda sends one extra lead per week.' },
      { type: 'auto_reply_bypass', desc: 'Brenda\'s leads skip auto-reply stage.' },
      { type: 'emergency_call', desc: 'Once per run, Brenda rescues a dying lead.' },
      null, // level 4+: narrative-only
    ],
    // How the player meets them (trigger)
    meetTrigger: { type: 'card', category: 'recruiter', weight: 0.3 },
  },
  // mentor, rival, founder, friend — similar structure
];
```

**Engine wiring (`engine.js`):**
- `encounterNPC(npcId, outcome)`: called when card/event features an NPC. Increments `level` on positive outcome, decrements on negative (min 0). Sets `met: true`, updates `lastContactDay`.
- `checkNPCPerks()`: called at day start. Applies active perks (e.g., `brenda` level ≥ 1 → extra lead with `source: 'brenda-dm'`).
- `rival` special: if `rival.level >= 3` (befriended), rival shares leads → new lead with `flags.referralSource: 'rival'` applied, better conversion rates.
- `friend` special: at `friend.level >= 2`, Hope floor raised from 0 to 10 (soft cap against total despair).

**Card integration:**
- NPCs appear in existing card categories as flavored variations. Card `buttons` reference `encounterNPC()` action.
- New card sub-tag `npc: 'brenda'` for filtering.

---

### 8. The Calendar — scheduled events & time pressure

**Creative detail:** Calendar includes flavor entries the player can't act on. Missing an interview has consequences.

#### Technical Specification

**State extension:**
```js
// In g.run
calendar: {
  events: [], // [{ day, type, id, label, required, consumed }]
  flavor: [],  // [{ day, label }] — non-interactive world-building
}
```

**Calendar event types:**
- `interview` — requires energy + card choice. Missed → lead suffers.
- `recruiter_call` — stat opportunity. Missed → lost chance.
- `project_deadline` — project completion check. Missed → project fails.
- `rent_due` — economy event (see Feature 9).
- `rent` / `rent_due` — automatic stat drain.
- `world` — flavor-only, displayed but no action needed.

**Engine wiring (`engine.js`):**
- `scheduleEvent(day, type, id, label, required)`: adds to `calendar.events`. Called from `createLead()` (interview stages), morning events, and project system.
- On `advanceDay()`: check `calendar.events` for `day === _g.run.day` matches.
  - `required` events: if not consumed (no matching card played), apply `missed` penalty.
  - `world` events: log to day narrative as flavor text.
- `DATA.CALENDAR_FLAVOR` templates: `"Day 12: Your lease renews"`, `"Day 8: The free trial you forgot about ends"`, `"Day 17: Mercury enters retrograde (again)."`. Selected at run start based on seed for consistency.

**UI changes (`ui.js`):**
- `#calendar-panel`: 30-day mini-calendar overlay. Upcoming events shown as colored dots. Click to see details.
- Integration with `#feed` area: on-screen indicator shows "3 things coming up this week."

---

### 9. Economy 2.0 — bills, gigs, and real financial texture

**Creative detail:** Gigs pay reliably. Job market does not.

#### Technical Specification

**State extension:**
```js
// In g.run
economy2: {
  bills: [
    { type: 'rent', amount: 500, every: 10, nextDue: 10, // every N days
      label: 'Rent' },
    { type: 'phone', amount: 60, every: 15, nextDue: 15, label: 'Phone Bill' },
    { type: 'subscription', amount: 15, every: 10, nextDue: 10, label: 'Forgotten Subscription' },
  ],
  emergencyFund: 0, // can be built via specific choices
}
```

**Bill processing (`engine.js`):**
- In `advanceDay()`: check `calendar` for bill due dates OR scan `economy2.bills` for `nextDue <= currentDay`.
  - Auto-deduct from `stats.rent`. If insufficient, `stats.rent = 0` and flag `stats.hope -= 5` (stress).
  - Paying on time → neutral. Missing → `hope -= 10`, `credibility -= 3`.
- Bills scale with difficulty mode (Feature 11).

**Gig deepening (`data.js`):**
- New `DATA.GIGS` array with satirical gig definitions:
```js
DATA.GIGS = [
  { id: 'food-delivery', name: 'Deliver food in the rain', flavor: 'It builds character and back pain.', pay: 35, energyCost: 2, hopeCost: 5 },
  { id: 'textbook-sale', name: 'Sell textbooks to Gary', flavor: 'Gary is always buying.', pay: 25, energyCost: 1, hopeCost: 0 },
  { id: 'logo-commission', name: '$5 logo commission', flavor: 'They have strong opinions.', pay: 5, energyCost: 2, hopeCost: 8 },
  { id: 'sleep-study', name: 'Participate in a sleep study', flavor: 'Income while unconscious — the dream.', pay: 80, energyCost: 0, hopeCost: 0, weight: 0.2 },
  // ...
];
```
- Gigs appear in existing `gig` card category. Payment happens immediately via `stats.rent += gig.pay`.
- Flavor log: auto-generated "paid on time, full amount" note on completion.

**Save/Load:** `economy2` included in `_g.run` serialization. Bills auto-recalculate on load using day offset.

---

### 10. Skill Tree / Résumé Builder

**Creative detail:** Résumé is a viewable document with Bot Aura vs Human score bars.

#### Technical Specification

**State extension:**
```js
// In g.run
resume: {
  entries: [],  // [{ type: 'real' | 'fake', name, originalName, skills: [], dayAdded }]
  botAuraScore: 0,  // computed from entries (fake-heavy = higher)
  humanScore: 0,    // computed from entries (real-heavy = higher)
  skills: [],      // array of unlocked skill strings
}
```

**Résumé entry creation (`engine.js`):**
- `addResumeEntry(entry)`: called from project completion, certification, or specific card effects.
  - `entry.type === 'fake'` → `resume.botAuraScore += entry.auraBoost`, `resume.humanScore -= entry.humanPenalty`
  - `entry.type === 'real'` → `resume.humanScore += entry.humanBoost`, `resume.botAuraScore -= entry.auraPenalty`
- Scores clamped 0-100. Higher botAuraScore → better ATS screening but worse panel interview performance.

**Lead evaluation integration (`engine.js`):**
- In `createLead()` / `triggerStage()`: lead quality modified by résumé scores.
  - `resume.botAuraScore > 50` → ATS stages pass faster, but `panel` stage has reduced success probability.
  - `resume.humanScore > 50` → ATS stages slightly slower, but `panel` and `offer` stages have increased probability.
  - This makes the robot-vs-human tension mechanical.

**UI changes (`ui.js`):**
- `#resume-panel`: renders résumé as a styled document. Entries listed chronologically. Fake entries shown with subtle strikethrough styling for comedy.
- Two progress bars (Bot Aura / Human Score) side by side with labels.
- Skills section rendered as tags/badges.
- "Endorsed skills" auto-generate from `resume.skills` + joke defaults (`'Microsoft Word (Advanced)'`, `'Showing Up'`).

---

### 11. Difficulty modes / "Job Markets"

**Creative detail:** Each market has a tone and tagline. News flavor changes per market.

#### Technical Specification

**State extension:**
```js
// In g.run (selected at character select / run start)
market: 'normal', // 'easy' | 'normal' | 'hiring-freeze' | 'layoff'
// Unlockable markets tracked in _meta.lockedMarkets[]
```

**Market configuration (`data.js`):**
```js
DATA.MARKETS = {
  easy: {
    name: "Candidate's Market",
    tagline: 'Recruiters pursue YOU. Enjoy this. It will not last.',
    modifiers: {
      leadCreationRate: 1.5,    // 50% more leads
      ghostRate: 0.5,          // half ghost rate
      hopeDrainRate: 0.5,      // slower hope drain
      economyPace: 0.7,        // bills cost less
      cardWeightShift: { recruiter: 2.0, gig: 0.5, scam: 0.3 },
    },
    headlines: [/* smug, abundant tone */],
  },
  normal: {
    name: "Normal Market",
    tagline: 'Welcome to Tuesday.',
    modifiers: {
      leadCreationRate: 1.0,
      ghostRate: 1.0,
      hopeDrainRate: 1.0,
      economyPace: 1.0,
      cardWeightShift: {},
    },
    headlines: DATA.HEADLINES, // existing
  },
  'hiring-freeze': {
    modifers: { /* ghost jobs, fast lead death, hope drains */ },
  },
  layoff: {
    name: "2008 / Layoff Season",
    tagline: 'The market is grieving.',
    modifers: { /* brutal — everything harder */ },
    unlockRequirement: 'complete_normal_run',
  },
};
```

**Engine wiring (`engine.js`):**
- In `init()`: set `g.run.market` from character select choice. Load `DATA.MARKETS[market].modifiers`.
- All rate modifiers apply in relevant functions:
  - `leadCreationRate` → `weightedPool()` multiplier on `job`/`recruiter` cards
  - `ghostRate` → `triggerStage()` terminal outcome probability shift
  - `hopeDrainRate` → applied in `advanceDay()` hope drain calculation
  - `economyPace` → bill amounts multiplied (Feature 9 dependency)
- `cardWeightShift` → merged into `feedWeights` (Feature 3 dependency).

**Headlines:** `DATA.MARKETS[market].headlines` replaces `DATA.HEADLINES` for news flavor.

**Unlock tracking:** `_meta.lockedMarkets` (persistent across runs). Unlocked by achievements (see Feature 13).

---

### 12. Mid-run Events with consequences — the "Decision" system

**Creative detail:** No obviously correct answer. These are imperfect trades.

#### Technical Specification

**Decision structure (`data.js`):**
```js
DATA.DECISIONS = [
  {
    id: 'lowball-offer',
    triggerDay: 14,       // approximate — with ±3 randomization
    minDayCondition: 12, // won't trigger before day 12
    maxDayCondition: 18, // won't trigger after day 18
    requires: () => _g.run.activeLeads.length >= 1,
    title: 'A Lowball Offer',
    description: 'HVAC-Soft offers you a position. The salary is... generous by current standards.',
    choices: [
      {
        label: 'Take it quietly',
        effects: { rent: 200, hope: 10, flags: { quietWin: true } },
        log: 'You took the offer. It\'s safe. It\'s fine. You\'ll think about what you gave up later.',
        ending: 'quiet-win', // triggers "The Quiet Win" ending path
      },
      {
        label: 'Hold out',
        effects: { hope: -10, flags: { rejectedLowball: true } },
        log: 'You turned it down. You don\'t regret it. Mostly.',
        // On bad days, if rejectedLowball flag set, occasional log reminder
      },
    ],
  },
  // More: 'co-founder-offer', 'move-back-in', 'take-career-break'
];
```

**Engine wiring (`engine.js`):**
- In `advanceDay()`: after morning event roll, check `DATA.DECISIONS` for any untriggered decision matching:
  - `day >= minDayCondition && day <= maxDayCondition`
  - `flags._decisions.triggered` does NOT include `decision.id`
  - `decision.requires()` passes
  - 35% chance to trigger on matching day
- Decision modal displayed via `UI.showDecision(decision)`. Player choice → apply `effects`, mark triggered, log.

**Post-decision flavor (`engine.js`):**
- `flags._decisionLog[]` stores `{ decisionId, choiceIdx, day }`. On random days, reference past decisions in narration.
- E.g., `flags._rejectedLowball` → on bad hope day: *"You think about the offer you turned down."*

**UI changes (`ui.js`):**
- Reuses `#eod-modal` pattern. New `UI.showDecision()` renders with distinct visual styling (gold accent border, two large choice buttons, satirical but warm tone).

---

## PHASE 3 — Meta & long-term replay (Features 13–20)

### 13. Career Mode — persistent progression across runs

**Creative detail:** Career interludes between runs. No job lasts forever.

#### Technical Specification

**Meta extension (`_meta`):**
```js
// In _meta (persistent — saved to juhirebro_v1)
career: {
  playerName: '',
  experienceLevel: 0,      // increments on each completed run (win or lose)
  totalRuns: 0,
  totalWins: 0,
  totalLosses: 0,
  workHistory: [],         // [{ company, role, daysEmployed, ending, won }]
  permanentBonuses: [],    // [{ type, value, fromRun }] — stack, max 3 active
  unlockedMarkets: ['normal'],
  careerInterludes: [],    // history of interlude text (for review)
}
```

**Career advancement (`engine.js`):**
- On run end: `advanceCareer(result)` called from `triggerEnding()`:
  - `career.totalRuns++`, `career.experienceLevel++`
  - `workHistory.push({ company, role, ending, won: result.won })`
  - At level thresholds (5, 10, 15, 25, 50): grant `permanentBonus`:
    - Level 5: `startWithExtraEnergy` (+1 maxEnergy)
    - Level 10: `cloutBonus` (+10 starting clout)
    - Level 25: `unlockedMarket` (hiring-freeze)
    - Level 50: `legendStatus` (all perks)
- Career persists across `localStorage.clear()` resets for run state only (meta separate).

**Career interlude (`data.js` / `ui.js`):**
```js
DATA.INTERLUDES = {
  win: [
    'You worked at {company} for {months} months. It was fine. Then there was a "reorg."',
    '{company} promoted you to {role}. Great news! Also great at destroying work-life balance.',
  ],
  loss: [
    'You took a break. You regrouped. You updated your résumé for the {count}th time.',
    'The job search didn\'t go well this time. You survived. You always do.',
  ],
  // Variables: {company}, {role}, {months}, {count}, {playerName}
};
```
- Rendered as full-screen text between end screen and character select. "New Search" button to start next run at next experience level.

---

### 14. The Antagonist — a recurring system "boss"

**Creative detail:** The ATS personified. Indifferent and procedural. Endgame confrontation.

#### Technical Specification

**Parser presence system (`data.js`):**
```js
DATA.PARSER_MESSAGES = [
  'Your application has been processed. The determination is not favorable.',
  'You have been identified as a "candidate." This identification is provisional.',
  'Thank you for your interest in existing within our pipeline.',
];
// Triggered periodically via existing morning event system or as post-card flavor.

DATA.BOSS_BATTLE = {
  // The culminating mini-game. Uses accumulated stats as weapons.
  name: 'Confronting the Parser',
  description: 'The Parser offers you a job — to become an ATS. You refuse.',
  // Boss uses "rejections" as attacks. Player counters with stats.
  rounds: 5,
  playerAttacks: [
    { stat: 'credibility', name: 'Human Override', threshold: 30 },
    { stat: 'clout', name: 'Public Shaming', threshold: 50 },
    { stat: 'scamEvidence', name: 'Complaint Filing', threshold: 40 },
    { stat: 'humanContact', name: 'Networking Appeal', threshold: 60 },
  ],
  bossAttacks: [
    { name: 'Auto-Rejection', effect: 'hope -5' },
    { name: 'Keyword Mismatch', effect: 'credibility -3' },
    { name: 'Silent Treatment', effect: 'energy drain' },
  ],
  // Victory condition: survive all 5 rounds via stat checks.
  // Defeat = "Prompt Engineer by Accident" ending (already partially exists).
};
```

**Engine wiring (`engine.js`):**
- `flags.bossFightActive` already exists. Trigger on day 25-30 or upon specific conditions.
- Boss battle as new mini-game type (`type: 'boss-battle'`). Launched via `startBossBattle()`.
- Uses existing stat-modification patterns. Victory sets `flags.bossFightWon`.
- Loss → existing `prompt-engineer` ending path.

**Parser encounters (`engine.js`):**
- Early-game: Parser messages appear in morning events (existing mechanism). Rare and unsettling.
- Mid-game: frequency increases as `atsFavor` gets extreme or `robotSuspicion` drops below 50.
- Late-game: Parser directly addresses player. Builds toward final confrontation.

**UI changes (`ui.js`):**
- Boss battle reuses mini-game modal system. Parser speaks in `DATA.PARSER_MESSAGES` style — cold, procedural text. Player selects stat-based attacks.
- Visual: terminal-style text interface with monospace font.

---

### 15. Unlockables & Collection — "Corporate Artifacts"

**Creative detail:** Each artifact is comedy with mechanical effect.

#### Technical Specification

**Meta extension (`_meta`):**
```js
// In _meta
collection: {
  artifacts: {},   // { artifactId: true } — unlocked
  cosmetics: {},  // cosmetic items unlocked
  trophies: [],   // joke trophies for endings
  equipped: null, // currently equipped artifact (one per run)
}
```

**Artifact structure (`data.js`):**
```js
DATA.ARTIFACTS = [
  {
    id: 'open-to-work-halo',
    name: 'The Open-to-Work Halo',
    flavor: 'Recruiters DM you 30% more. 20% of them are scams.',
    effects: { recruiterWeight: 1.3, scamWeight: 1.2 },
    unlockCondition: { type: 'achievement', id: 'hundreds-of-applications' },
  },
  {
    id: 'blue-check',
    name: 'Blue Check of Ambiguous Authority',
    flavor: 'Posts gain Clout. Nobody knows why.',
    effects: { postWeight: 1.5, cloutGain: 1.3 },
    unlockCondition: { type: 'clout', threshold: 100 },
  },
  // ...10-15 artifacts
];
```

**Engine wiring (`engine.js`):**
- At run start: if `collection.equipped` set, load `DATA.ARTIFACTS[equippedId].effects` into modifiers.
- Artifact effects merge with `feedWeights` (Feature 3) and stat modifiers.
- `unlockArtifact(id)` called from `checkAchievements()` when condition met. Saves to `_meta`.

**UI changes (`ui.js`):**
- New `#collection-panel`: museum-style inventory. Locked items shown as silhouettes with "Achieve X to unlock."
- "Equip" button on unlocked artifacts. Only one equippable per run (selected at character select).

---

### 16. Year in Review (End-of-Career summary)

**Creative detail:** Comedy stats with one genuinely warm closing line.

#### Technical Specification

**Computation (`engine.js`):**
```js
function computeYearInReview(stats, flags, log, inbox) {
  return {
    jobsApplied: flags.applicationsSubmitted // already tracked
    + flags.portalApps + flags.takeHomeApps,
    heardBack: activeLeads.length,
    responseRate: computed from above,
    ghosted: flags.leadsGhosted,
    buzzwordCounts: frequency analysis of flags.buzzwords collected,
    mostUsedBuzzword: top entry,
    circleBackDays: flags.touchGrassCount + circle-back card plays,
    topRecruiter: most-encountered NPC,
    sessionsOpened: 312 (derived from flags),
  };
}
```

**UI (`ui.js`):**
- Full-screen scrollable summary rendered after `triggerEnding()`. Each stat gets satirical commentary from `DATA.YEAR_IN_REVIEW_TEMPLATES[]`.
- Final warm line (always the same, for dramatic consistency):
  *"You kept going. {X} times, you opened the app again. That's not nothing. That's the whole thing, actually."*
- Shareable text: formatted as a copyable string for social sharing.

**Data dependency:** Most fields already tracked in `flags`. `buzzwords` frequency computed at end. Log entry count for engagement metrics.

---

### 17. Daily Challenge / Seeded Mode — shared runs

**Creative detail:** Same seed = same run. Compare scores with friends.

#### Technical Specification

**Seed generation (`data.js`):**
```js
DATA.DAILY_CHALLENGES = [
  { name: 'The Reorg', description: 'You start with 3 active leads, all about to be paused.', seed: 0 },
  { name: 'Open to Work', description: 'Recruiter DMs doubled, scams tripled.', seed: 1 },
  { name: 'The Scaries', description: 'Hope starts at 30.', seed: 2 },
];
// Seed derived from real date: Math.floor(Date.now() / 86400000) % totalChallenges.

// Daily seed modifiers:
function getDailySeed(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 86400000);
  const challengeIdx = dayOfYear % DATA.DAILY_CHALLENGES.length;
  return DATA.DAILY_CHALLENGES[challengeIdx];
}
```

**Engine wiring (`engine.js`):**
- "Daily Challenge" button on start screen (alongside normal play).
- Sets `g.run.challengeMode: true`, `g.run.challengeSeed`, `g.run.challengeId`.
- Challenge applies: seeded RNG (existing `mulberry32`), fixed background, specific stat modifiers.
- Score computation on run end: `computeScore(stats, flags, day)` — weighted formula (`days × 10 + leadsGhosted × 0.5 + endingScore`).
- Persistent best score tracking: `_meta.dailyHighScores[]` — `{ challengeId, score, date }`.

**UI changes (`ui.js`):**
- Challenge selection screen with current challenge name, description, and your best score.
- Share modal at end: formatted text string with score and challenge name.
- Countdown to next challenge timer.

---

### 18. Audio & Game Feel — sound design and juice

The game is silent. Add a tasteful **procedural sound layer** (Web Audio API, no files).

#### Technical Specification

**Audio engine (`data.js` or new `js/audio.js` — IIFE module):**
```js
const AudioEngine = (() => {
  let ctx = null;
  let enabled = false;
  let masterGain = null;

  // Procedural sounds generated via Web Audio API oscillators/envelopes
  function click() { // soft card click: short noise burst, 150ms
  function chime() { // offer: major triad, detuned for comedic "cheap" effect
  function thunk() { // ghost: low-frequency "bloop", 300ms decay
  function tick() { // typewriter text reveal
  function anxiousHum() { // low sine wave when hope < 20, fades out above 30
  function glitch() { // robot suspicion > 90: periodic digital glitch layer

  return { init(), play(name), enable(), disable(), isPlaying() };
})();
```

**Wiring (`engine.js` / `ui.js`):**
- Audio hooks at: card play (`click`), offer received (`chime`), ghosting (`thunk`), stat display update (`tick`), EOD modal open.
- `hope < 20` → start `anxiousHum` layer (toggle on `renderStats()` if hope crosses threshold).
- `robotSuspicion > 90` → `glitch` audio + subtle CSS filter `filter: hue-rotate(30deg) saturate(1.2)` on game container.

**Visual juice (CSS/JS):**
- Stat number tweens: CSS `transition` on stat bar width + counter animation (no heavy library).
- Screen shake on rejection: `@keyframes shake` applied to game container for 200ms.
- Hope gain glow: `box-shadow` pulse on stat bar.

**Settings:** `g.run.audioEnabled` flag. Off by default. Toggleable via settings gear. `_meta.audioPreference` persists across runs.

---

### 19. Narrative Threads — a soft story backbone

Threads are persistent, low-bandwidth story arcs that surface organically.

#### Technical Specification

**Thread definition structure (`data.js`):**
```js
DATA.THREADS = [
  {
    id: 'brenda-story',
    // Phase 1: Brenda is just another recruiter (already exists as inbox NPC).
    // Phase 2: Brenda emails get personal ("you good?").
    // Phase 3: Brenda reveals she was also laid off (Day 15+). Choice: call her back.
    // Phase 4: "Brenda found a lead for you" or "Brenda quit too" based on prior choices.
    beats: [
      { trigger: { day: 3, condition: null }, action: 'send-message', flavor: 'Brenda DMs you...' },
      { trigger: { day: 10, minRelationship: 1 }, action: 'send-message', flavor: 'Brenda texts: "you good?"' },
      { trigger: { day: 15, minRelationship: 3 }, action: 'decision', flavor: 'Brenda reveals she was laid off too...' },
      { trigger: { day: 25 }, action: 'resolution', flavor: 'Brenda finds a lead / quits the industry...' },
    ],
    // Each beat can be: 'send-message' (inbox) / 'decision' (modal) / 'flavor' (log only) / 'stat-mod' (direct stat event)
  },
  {
    id: 'the-founders-gambit',
    // The Founder keeps offering nonsense roles. Eventually offers co-founder.
    // Thread can culminate in a real offer (bad one) or complete avoidance.
    beats: [/* ... */],
  },
  // More: 'rival-redemption', 'mentor-passes-torch', 'burnout-arc'
];
```

**Engine wiring (`engine.js`):**
- `checkThreads(day)`: called from `advanceDay()`. Iterates active threads, checks `beats[n].trigger` conditions. Fires matching beat.
- Thread state: `g.run.threads = { 'brenda-story': 3, ... }` tracking current beat index per thread.
- Beats auto-advance on condition met. Some beats can be missed (skipped) if conditions not met by day limit.

**Integration with existing systems:**
- `send-message` → uses existing inbox system (Feature 1).
- `decision` → uses new Decision system (Feature 12).
- `stat-mod` → existing card effect pattern.
- `flavor` → journal log entry.

**Achievement tie-in:** Completing all threads → `thread_narrator` achievement.

---

### 20. roguelike Mode — permadeath + unique modifiers

Each run is a complete, non-saveable attempt with a unique seed, one life, and escalating modifiers.

#### Technical Specification

**Mode toggle:**
```js
// In g.run
rogueMode: false, // true for roguelike
rogueModifiers: [], // active modifiers for this run
```

**Modifier pool (`data.js`):**
```js
DATA.ROGUE_MODIFIERS = [
  { id: 'zero-energy', flavor: 'No energy restore. Every action costs forever.', effect: { dailyEnergyRestore: 0 } },
  { id: 'no-gigs', flavor: 'Gig cards are banned.', effect: { banCardCategory: 'gig' } },
  { id: 'rent-double', flavor: 'Rent costs 2×.', effect: { billMultiplier: 2.0 } },
  { id: 'hope-start-20', flavor: 'Hope starts at 20.', effect: { startingHope: 20 } },
  { id: 'double-ghost', flavor: 'Ghost rate doubled.', effect: { ghostRateMultiplier: 2.0 } },
  { id: 'one-recruiter', flavor: 'Only one recruiter type exists.', effect: { recruiterTypesLimit: 1 } },
  { id: 'ats-penalized', flavor: 'Starting atsFavor is 5.', effect: { startingAtsFavor: 5 } },
  // ...12-15 modifiers. 2-3 randomly selected per run.
];
```

**Engine wiring (`engine.js`):**
- Roguelike mode: `saveRun()` disabled. `init()` with `rogueMode: true` — draws 2-3 modifiers, applies to starting stats and game logic.
- No mid-run save/load. Game ends permanently on loss.
- Score tracking: `_meta.rogueHighScores[]` — `{ score, modifiers: [], date, day }`.
- Daily challenge (Feature 17) can use roguelike modifiers as a harder variant.

**UI changes (`ui.js`):**
- Start screen "Roguelike" toggle. Modifiers displayed before run begins (with option to reroll — costs existing clout or achievement points).
- Game screen shows active modifiers as badges/pills.

**Integration:** Works independently or combined with Career Mode (roguelike runs still count toward career experience but with reduced multiplier).

---

## Dependency Map

| Feature | Depends On | Notes |
|---------|-----------|-------|
| 3. Feed weighting | None (extends `weightedPool`) | Foundation for difficulty mode |
| 4. Momentum | None | Independent system |
| 5. Multi-day projects | None | Foundation for résumé builder |
| 6. Profile | None | Independent, enhances DM quality |
| 7. Relationships | None (Brenda already exists) | Extends inbox system |
| 8. Calendar | 5. Projects | Projects need deadline tracking |
| 9. Economy 2.0 | 8. Calendar | Bills schedule on calendar |
| 10. Résumé | 5. Projects | Gets entries from projects |
| 11. Difficulty | 3. Feed weighting | Uses weight system |
| 12. Decisions | None (but uses inbox + log) | Independent modal system |
| 13. Career Mode | None (uses `_meta`) | Meta-layer foundation |
| 14. Antagonist | None (uses existing boss flags) | Mini-game extension |
| 15. Collection | 13. Career Mode | Unlocks tie to achievements |
| 16. Year in Review | 13. Career Mode | Needs career data |
| 17. Daily Challenge | None (uses mulberry32) | Standalone |
| 18. Audio | None | Infrastructure, no game dependency |
| 19. Narrative Threads | 1. Inbox, 7. NPCs, 12. Decisions | Uses existing systems |
| 20. Roguelike | 11. Difficulty | Can use difficulty modifiers |

---

## Implementation Priority Phases

**Quick wins (no other feature dependency):**
- Feature 3: Feed weighting (extends existing weightedPool)
- Feature 4: Momentum (independent stat system)
- Feature 6: Profile (independent card system)
- Feature 17: Daily Challenge (uses existing mulberry32)
- Feature 18: Audio (independent engine)

**Mid-tier (light dependencies):**
- Feature 5: Multi-day projects (standalone, but feeds into résumé)
- Feature 7: Relationships (Brenda already exists)
- Feature 8: Calendar (light integration)
- Feature 14: Antagonist (flags exist)
- Feature 20: Roguelike (modifier system)

**Requires predecessors:**
- Feature 9: Economy 2.0 (depends on 8. Calendar)
- Feature 10: Résumé (depends on 5. Projects)
- Feature 11: Difficulty (depends on 3. Feed weighting)
- Feature 12: Decisions (uses existing modal patterns)
- Feature 13: Career Mode (meta-layer — needs 15-16)
- Feature 15: Collection (builds on 13)
- Feature 16: Year in Review (builds on 13)
- Feature 19: Narrative Threads (builds on 1, 7, 12)
