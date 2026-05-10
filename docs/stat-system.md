# Stat System

## Overview
The stat system tracks the player's progress and determines game over conditions.

## Stats
1. **Money (rent)** — Starts at 100. Rent decreases this every 5 days. Game over at 0.
2. **Hope** — Starts at 50. Decreases with rejections and bad outcomes. Game over at 0.
3. **Credibility (cred)** — Starts at 50. Increases with good actions. Game over at 0.
4. **Human Contact (humanContact)** — Starts at 5. Increases with networking. Affects lead quality.
5. **Bot Aura (atsFavor)** — Starts at 10. Increases with AI-ish behavior. Game over at 100.
6. **Sus (robotSuspicion)** — Starts at 100. Decreases with AI-ish behavior. Game over at 0.
7. **Buzzwords** — Array of buzzwords collected. Triggers "Founder Mode" ending at 15+.
8. **Clout** — Social capital from posting. Unlocks "Reformed Influencer" background at 200.
9. **Energy** — Actions per day. Restored each morning. Modified by mini-games and events.
10. **Scam Evidence** — Increases when reporting scams. Unlocks "Scam the Scammers" ending.
11. **Ghost Evidence** — Increases when exposing ghost jobs. Unlocks "Ghost Job Vigilante" ending.
12. **Scams Felled** — Total scams successfully reported.

## Stat Modifiers
Stats are modified by card actions:
```javascript
g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 5, 0, 100);
g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) - 100, 0, 9999);
```

## Clamp Function
All stat modifications use `DATA.clamp(value, min, max)` to keep stats within bounds:
```javascript
clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
```

## Stat Interactions
- **Bot Aura vs Sus**: High Bot Aura increases job application success but decreases Sus
- **Hope vs Burnout**: Hope decreases with rejections, increases with human contact
- **Credibility vs Clout**: Credibility affects lead quality, Clout unlocks special paths
- **Human Contact vs Networking**: High Human Contact unlocks referral paths
- **Credibility vs Take-Home**: Cred ≥ 60 unlocks "Decline politely" option in take-home mini-game
- **Clout vs Viral Posts**: High Clout increases viral post probability

## Background Modifiers
Each background modifies starting stats:
```javascript
const bgData = DATA.BACKGROUNDS.find(b => b.id === bgId);
if (bgData) {
  g.run.background = bgId;
  Object.keys(defaultStats).forEach(k => {
    g.run.stats[k] = (bgData.stats[k] !== undefined) ? bgData.stats[k] : defaultStats[k];
  });
}
```

## Special Stat Behaviors
- **Buzzwords**: Array that grows with AI-ish behavior. Triggers "Founder Mode" ending at 15+.
- **Clout**: Social capital from posting. Unlocks "Reformed Influencer" background at 200.
- **Ghost Evidence**: Increases when exposing ghost jobs. Unlocks "Ghost Job Vigilante" ending.
- **Scam Evidence**: Increases when reporting scams. Unlocks "Scam the Scammers" ending.
- **Energy**: Restored each morning. Modified by morning events (e.g., gym day gives +1, sick day gives -1). Mini-games cost energy to access.
- **atsFavor**: Clamped 0–100. At 100, triggers "AI Flagged" loss. Affects lead progression speed.
- **robotSuspicion**: Clamped 0–100. At 0, triggers "Bot Flagged" loss. Decreases with AI-ish actions.
