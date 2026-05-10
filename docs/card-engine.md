# Card Engine

## Overview
The card engine is the core of the game, handling card drawing, playing, and effects.

## Card Pool Structure
Cards are defined in `js/data.js` using the `mk()` helper function:
```javascript
mk({
  id: 'card-id',
  title: 'Card Title',
  category: 'job',  // job, recruiter, post, network, resume, investigate, rest, event
  flavor: 'Card flavor text',
  cost: { energy: 1 },
  redFlags: 0,
  ghostChance: 0.25,
  weight: 1,
  effects: [{ type: 'lead', real: 0.5, ats: 20 }],
  buttons: [
    { label: 'Action', cost: { energy: 1 }, effect: 'apply' },
    { label: 'Ignore', cost: { energy: 0 }, effect: 'discard' }
  ]
})
```

## Card Categories
1. **job** — Job applications with various apply options
2. **recruiter** — Recruiter interactions (reply, block, etc.)
3. **post** — Social media posting (LinkedIn, etc.)
4. **network** — Networking actions (DMs, endorsements, etc.)
5. **resume** — Resume improvements (keyword stuff, portfolio, etc.)
6. **investigate** — Red flag investigation
7. **rest** — Self-care actions (sleep, therapy, etc.)
8. **event** — Random events (boss fights, etc.)

## Card Drawing
Cards are drawn from weighted pools in `js/engine.js`:
```javascript
function drawCard() {
  // Select random pool based on game state
  const pool = DATA.POOLS[category];
  // Weight cards by their weight property
  // Draw card and add to feed
}
```

## Card Effects
Effects are defined in the `buttons` array and processed in `applyCard()`:
- `apply` — Apply to job (creates a lead)
- `applyCareful` — Apply with attention to detail (atsFavor -2, credibility +2)
- `applyEasy` — One-click easy apply (robotSuspicion -1)
- `applyDesperate` — Mass apply with low quality (robotSuspicion -3)
- `investigate` — Check for red flags
- `discard` — Ignore card
- `buzzwordAdd` — Add buzzwords
- `atsFavor` — Modify Bot Aura
- `robotSuspicion` — Modify Sus
- `credMod` — Modify Credibility
- `hopeMod` — Modify Hope
- `burnoutMod` — Modify energy
- `rentMod` — Modify Money
- `cloutMod` — Modify Clout
- `offerChance` — Increase offer probability
- `bossFight` — Trigger Workday boss fight
- `captchaEvent` — Trigger CAPTCHA
- `paEvent` — Trigger personality assessment
- `bulkApply` — Apply to multiple jobs
- `referral` — Use referral (creates lead with higher real chance)
- `fiverrGig`, `uberGig`, `userTest`, `dataEntry`, `consulting` — Side gigs for rent
- `reportScam`, `exposeGhost` — Investigation actions
- `postThis` / `postSincere` / `postCringe` / `postViral` — Social media posting (modifies Clout)
- `networkGo` / `sendDM` / `endorse` / `congrats` / `slideIn` / `slackHang` / `mentorMeet` — Networking actions (modifies Human Contact, Clout, Credibility)
- `keywordStuff` / `rewriteBullets` / `addAI` / `certComplete` / `buildPortfolio` / `plainText` / `writeCover` / `aiCover` / `lieYears` — Resume improvement actions (modify Credibility, Clout)
- `touchGrass` / `deleteApp` / `therapy` / `cookMeal` / `eatCereal` / `sleep` — Self-care/rest actions (modify Hope, Energy, Money)

## Lead System (Patch Q)

When a job application is submitted, a **lead** is created with a randomized stage track:

```javascript
const lead = {
  id: 'lead_123',
  company: 'Company Name',
  role: 'Job Title',
  isReal: true/false,
  ghostChance: 0.25,
  scamChance: 0,
  atsThreshold: 30,
  stageIdx: 0,           // Position in track
  daysSinceUpdate: 0,
  track: ['waiting', 'screening-form', 'recruiter-screen', 'video-interview',
           'final-interview-1', 'offer-pending'],  // Pre-generated
  followUpsThisStage: 0,
  finalInterviewCount: 0,
  signals: {
    salaryDisclosed: false,
    realRecruiter: false,
    portfolioReviewed: false,
    referenceTrouble: false,
  },
  history: [{ day: 1, text: 'Applied' }]
};
```

### Lead Progression

**Leads no longer auto-advance.** The player must click "Follow Up" (costs 1 energy) on leads that are 3+ days old. Each click advances the lead to the next stage in its track.

- **WAITING**: Every lead starts here. Requires 1–5 follow-ups before anything happens.
- **Stages**: May include screening form (mini-game), video interview (mini-game), personality test (mini-game), take-home (mini-game), panel interview (mini-game), salary stall (mini-game), reference checks, final interviews, offer pending.
- **Terminal**: When `stageIdx >= track.length`, the engine rolls offer/ghosted/rejected/role-paused based on `lead.isReal` and accumulated signals.
- **Auto-ghost**: If a lead is 8+ days without a follow-up, it auto-ghosts.

### Lead Signals

Signals accumulate during the journey and affect terminal outcomes:
| Signal | How set | Effect |
|---|---|---|
| `salaryDisclosed` | Recruiter screen stage (30% chance) | +offer +15%, -ghost -8% |
| `realRecruiter` | Recruiter screen (60% chance) | +offer +10%, -ghost -5% |
| `portfolioReviewed` | (Future: from post/network cards) | +offer +10%, -reject -5% |
| `referenceTrouble` | Reference checks (15% chance) | -offer -20%, +reject +20% |

### Mini-Games

Four mini-games are triggered from stages:

1. **Screening Form** (`screening-form` stage) — 6 random hostile fields from a pool of 11. Submit button nudges away on hover. Submit: +2 cred, -2 hope. Give up: -4 hope, stays at stage.

2. **Take-Home** (`take-home` stage) — 3–4 options with weighted outcomes. Option D ("Decline politely") only appears if credibility ≥ 60. Weighted outcomes for scope/hope/cred.

3. **Panel Interview** (`panel-interview` stage) — 6 "weakness" answers with different credDelta values. Ghost chance based on answer quality: ≥+5: 5%, 0–4: 15%, <0: 30%.

4. **Salary Stall** (`salary-stall` stage) — 4 negotiation options. Last option ("Per the job post, the band is...") only shows if `salaryDisclosed` signal was set. "Aim high" has 30% ghost chance.

### Follow-Up Modal

The follow-up modal now handles multiple result types:
```javascript
function showFollowUpModal(result) {
  if (result.type === 'minigame') {
    launchFollowUpMinigame(result);  // Opens the appropriate mini-game
    return;
  }
  // Show result with stat changes
  // Button text changes for terminal outcomes:
  //   terminal-offer: "🎉 Accept the Offer" (gold button)
  //   terminal-ghost/reject/pause: "Move On"
  //   others: "Got it"
}
```

## Ghost Job Detection
The game includes ghost job detection:
- Cards with `redFlags > 0` can be investigated
- Investigation reveals red flags and ghost percentage
- Exposing ghost jobs increases ghost evidence
- Ghost evidence unlocks achievements
