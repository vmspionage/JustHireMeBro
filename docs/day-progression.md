# Day Progression

## Overview
The game runs in a 30-day cycle. Each day, the player plays cards, manages stats, and progresses leads. Lead advancement was completely reworked in Patch Q to use a linear stage track instead of auto-advancing every 3–4 days.

## Day Structure
1. **Start Day** — Morning event may roll (30% chance, starting day 2), then new cards drawn, energy restored, sleep recovery applied
2. **Play Cards** — Player plays up to 3 cards (energy limit), clicks "Follow Up" on leads when 3+ days have passed
3. **End Day** — Doomscroll or auto-advance, leads checked for auto-ghost, sleep recovery, EOD modal

## Day Initialization
```javascript
function startDay() {
  const g = E.state;
  if (!g || g.run.won) return;

  /* Roll morning event BEFORE rendering anything else */
  const event = E.rollMorningEvent();
  if (event) {
    showMorningEventModal(event, () => continueStartDay(g));
    return;
  }
  continueStartDay(g);
}

function continueStartDay(g) {
  /* Capture stats at day start for EOD delta tracking */
  g.run._prevStats = {...g.run.stats};
  g.run._prevFlags = {...g.run.flags};
  g.run._dailyClout = 0;
  g.run._postsMadeToday = 0;

  /* Draw feed */
  E.drawFeed();

  /* 30-day countdown tension modals (days 25, 28, 30) */
  if (g.run.day === 25) { ... }
  else if (g.run.day === 28) { ... }
  else if (g.run.day === 30) { ... }

  /* Render stat bar, day header, feed, leads, run log, news ticker */
  scheduleRender(() => renderStatBar());
  scheduleRender(() => renderDayHeader());
  scheduleRender(() => renderFeed());
  scheduleRender(() => renderLeads());
  scheduleRender(() => renderRunLog());
  scheduleRender(() => renderNewsTicker());
}
```

### Morning Event System
- 30% chance per day, starting Day 2 (Day 1 is reserved for onboarding)
- Skipped on countdown days (25, 28, 30)
- Max one event per day
- Same event never appears back-to-back (4-day cooldown)
- Each event has 2–4 choices with hidden outcomes (some guaranteed, some probabilistic)
- Effects max out at ±20 on stats, ±$40 on Money — no instant game-over
- See `DATA.MORNING_EVENTS` for all 20 events

## Day End
```javascript
function endDay() {
  /* Resolve leads */
  const results = E.resolveLeads();
  
  /* Track offers */
  if (results.offers && results.offers.length > 0) {
    g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 20, 0, 100);
    g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 500, 0, 9999);
    pushLog(g.run.day, `🎉 Got ${results.offers.length} offer(s)! Hope +20, Rent +$500.`);
  }
  
  /* Check for loss/win */
  const advanceResult = E.advanceDay();
  
  /* Show EOD modal */
  showEODModal(g, results);
}
```

## Lead Progression (Patch Q)

Leads no longer auto-advance. Instead, each lead has a **pre-generated track** of stages, and the player must click "Follow Up" to advance. Leads auto-ghost after 8+ idle days.

```javascript
function resolveLeads() {
  const g = _g;
  const offers = [];

  for (let i = g.run.activeLeads.length - 1; i >= 0; i--) {
    const lead = g.run.activeLeads[i];
    lead.daysSinceUpdate++;

    if (lead.daysSinceUpdate >= 8) {
      // True auto-ghost — the lead went so cold it died
      finishLead(lead, 'ghosted', `${lead.company} hasn't responded in over a week. The trail has gone cold.`);
    }
  }

  if (g.run.offers && g.run.offers.length) {
    offers.push(...g.run.offers);
    g.run.offers = [];
  }

  return { offers, logs: [] };
}
```

### Lead Track Generation (at creation)
Each lead gets a randomized track of stages:
```javascript
function generateLeadTrack(rng) {
  const t = ['waiting'];  // Always starts here
  if (rng() < 0.60) t.push('auto-reply');       // 60%
  if (rng() < 0.35) t.push('screening-form');   // 35%
  if (rng() < 0.70) t.push('recruiter-screen'); // 70%
  if (rng() < 0.50) t.push('video-interview');  // 50%
  if (rng() < 0.30) t.push('personality-test'); // 30%
  if (rng() < 0.40) t.push('take-home');        // 40%
  if (rng() < 0.45) t.push('salary-stall');     // 45%
  if (rng() < 0.60) t.push('panel-interview');  // 60%
  if (rng() < 0.35) t.push('reference-checks'); // 35%
  t.push('final-interview-1');                   // Always
  if (rng() < 0.50) t.push('final-interview-2'); // 50%
  if (rng() < 0.30) t.push('final-interview-3'); // 30%
  if (rng() < 0.75) t.push('offer-pending');    // 75%
  return t;
}
```

Terminal outcomes (offer/ghosted/rejected/role-paused) are **not** in the track. When `stageIdx >= track.length`, the engine rolls the final outcome based on `lead.isReal` and accumulated signals.

### Lead Follow-Up
```javascript
function followUpLead(leadId) {
  const g = _g;
  const lead = g.run.activeLeads.find(l => l.id === leadId);
  if (!lead || g.run.energy < 1) return null;
  g.run.energy--;
  lead.daysSinceUpdate = 0;

  if (lead.stageIdx >= lead.track.length) {
    return resolveTerminalOutcome(lead);
  }

  const currentStage = lead.track[lead.stageIdx];

  if (currentStage === 'waiting') {
    lead.followUpsThisStage = (lead.followUpsThisStage || 0) + 1;
    const waitThreshold = lead._waitThreshold || (lead._waitThreshold = 1 + Math.floor(_rng() * 5));

    if (lead.followUpsThisStage >= 5 && !_meta.achievements['patient-zero']) {
      _meta.achievements['patient-zero'] = true;
      toastAchievement({...}); saveMeta();
    }

    if (lead.followUpsThisStage < waitThreshold) {
      return { type:'waiting', title:'📭 Still Waiting', company:lead.company,
        message: DATA.pickWaitingMessage(_rng), stats:[{stat:'hope', delta:-2}] };
    }
    lead.stageIdx++;
    lead.followUpsThisStage = 0;
    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 4, 0, 100);
    return { type:'broke-silence', title:'✉️ They Wrote Back', company:lead.company,
      message:`After ${waitThreshold} follow-ups, ${lead.company} sent something. Anything.`,
      stats:[{stat:'hope', delta:4}] };
  }

  return triggerStage(lead, currentStage);
}
```

### Stage Handlers (`triggerStage`)
Each stage either returns a flavor result or launches a mini-game:

| Stage | Type | Behavior |
|---|---|---|
| auto-reply | Flavor | Advances, generic acknowledgment message |
| recruiter-screen | Flavor | 12% ghost chance, 30% salary disclosure, 60% real recruiter signal |
| screening-form | Mini-game | Hostile form with nudge-away submit button |
| video-interview | Mini-game | Hold-to-record (existing mini-game, now reused) |
| personality-test | Mini-game | Slider quiz (existing mini-game, now reused) |
| take-home | Mini-game | Weighted scope choice with principled decline option |
| panel-interview | Mini-game | Cursed weakness picker with ghost chances |
| salary-stall | Mini-game | Negotiation modal, "disclosed salary" option conditional |
| reference-checks | Flavor | 15% chance of referenceTrouble signal |
| final-interview-{1,2,3} | Flavor | Stacks `finalInterviewCount`, advances |
| offer-pending | Flavor | 20% ghost if no salary disclosed |

### Terminal Outcome Resolution
```javascript
function resolveTerminalOutcome(lead) {
  let offerChance = lead.isReal ? 0.55 : 0.10;
  let ghostChance = 0.20;
  let rejectChance = 0.15;
  let pauseChance = 0.10;

  // Signal adjustments
  if (lead.signals.salaryDisclosed) { offerChance += 0.15; ghostChance -= 0.08; }
  if (lead.signals.realRecruiter)   { offerChance += 0.10; ghostChance -= 0.05; }
  if (lead.signals.portfolioReviewed){ offerChance += 0.10; rejectChance -= 0.05; }
  if (lead.signals.referenceTrouble) { offerChance -= 0.20; rejectChance += 0.20; }
  if (lead.finalInterviewCount >= 3) { ghostChance += 0.10; pauseChance += 0.10; }

  const total = offerChance + ghostChance + rejectChance + pauseChance;
  const r = _rng() * total;
  let outcome;
  if (r < offerChance) outcome = 'offer';
  else if (r < offerChance + ghostChance) outcome = 'ghosted';
  else if (r < offerChance + ghostChance + rejectChance) outcome = 'rejected';
  else outcome = 'role-paused';

  return finishLead(lead, outcome);
}
```

### `finishLead` Outcome Effects
| Outcome | Hope | Rent | Other |
|---|---|---|---|
| **Offer** | +20 | +500 | Adds to `g.run.offers`, sets `offerDay` |
| **Ghosted** | -7 | — | `leadsGhosted++`, `consecutiveGhosts++` |
| **Rejected** | -4 | — | `consecutiveGhosts = 0` (closure) |
| **Role Paused** | -5 | — | "Strategic realignment" flavor text |

## Game Over Conditions
```javascript
function checkLosses() {
  const s = g.run.stats;
  const f = g.run.flags;

  // Rent = 0 → you're evicted
  if (s.rent <= 0) return 'evicted-end';
  // Hope = 0 → total burnout
  if (s.hope <= 0) return 'burnout-end';
  // Credibility = 0 → resume black hole
  if (s.credibility <= 0) return 'black-hole-end';
  // Bot Aura = 100 → flagged as AI
  if (s.atsFavor >= 100) return 'ai-flagged-end';
  // Sus = 0 → flagged as bot
  if (s.robotSuspicion <= 0) return 'bot-flagged-end';

  // Scam evidence triggers scammer ending
  if (f.scamsReported >= 5 && s.scamEvidence >= 20) return 'scammer-ending';
  // Ghost evidence triggers ghost hunter ending
  if (f.ghostsExposed >= 10 && s.ghostEvidence >= 50) return 'ghost-hunter-ending';

  return null;
}

function checkWins() {
  const f = g.run.flags;
  const s = g.run.stats;

  // Prompt engineer ending (AI flag + high cred)
  if (f.aiFlagged && s.credibility >= 50 && s.buzzwords.length >= 15) return 'prompt-eng-end';
  // Ghost hunter ending
  if (s.ghostEvidence >= 80 && s.hope >= 50) return 'ghost-hunter-ending';
  // Scammer ending
  if (f.scamsReported >= 5 && s.scamEvidence >= 20) return 'scammer-ending';

  return null;
}
```

## Lead Panel Display
Leads are displayed with stage names mapped from their track:

```javascript
const STAGE_DISPLAY = {
  'waiting':'Waiting', 'auto-reply':'Auto-Reply', 'screening-form':'Screening Form',
  'recruiter-screen':'Recruiter Screen', 'video-interview':'Video Interview',
  'personality-test':'Personality Test', 'take-home':'Take-Home',
  'panel-interview':'Panel Interview', 'salary-stall':'Salary Stall',
  'reference-checks':'References',
  'final-interview-1':'Final Interview', 'final-interview-2':'"Final" (again)',
  'final-interview-3':'"Final" (still)', 'offer-pending':'Offer Pending',
};

const STAGE_BADGE_CLASS = {
  'waiting':'applied', 'auto-reply':'applied', 'screening-form':'auto-screen',
  'recruiter-screen':'recruiter', 'video-interview':'video-int',
  'personality-test':'video-int', 'take-home':'take-home',
  'panel-interview':'panel', 'salary-stall':'recruiter',
  'reference-checks':'panel',
  'final-interview-1':'final', 'final-interview-2':'final', 'final-interview-3':'final',
  'offer-pending':'offer',
};

// In renderLeads:
const currentStageId = lead.track[lead.stageIdx] || 'pending-decision';
const stageDisplay = STAGE_DISPLAY[currentStageId] || 'Decision Pending';
```
