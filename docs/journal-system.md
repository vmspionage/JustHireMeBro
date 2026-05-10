# Journal/Delta Tracking

## Overview
The journal tracks all game events with stat deltas showing how each action affected stats.

## How It Works
The journal uses a snapshot/compute system:
1. `snapStats()` captures current stats into `_snapStats`
2. `pushLog(day, text)` computes deltas between `_snapStats` and current stats
3. Deltas are stored with each log entry

## Core Functions
```javascript
let _snapStats = null;

function snapStats() {
  const s = {};
  for (const k of Object.keys(_g.run.stats)) {
    s[k] = Array.isArray(_g.run.stats[k]) ? [..._g.run.stats[k]] : _g.run.stats[k];
  }
  _snapStats = s;
}

function pushLog(day, text) {
  const deltas = _snapStats ? computeStatDeltas(_snapStats, _g.run.stats) : [];
  _g.run.log.push({ day, text, deltas: deltas.length ? deltas : null });
  _snapStats = null;
}

function computeStatDeltas(before, after) {
  const deltas = [];
  const statMeta = {
    rent: { icon:'💰', label:'Rent', display:'Rent Money' },
    hope: { icon:'💡', label:'Hope', display:'Hope' },
    credibility: { icon:'🎯', label:'Cred', display:'Credibility' },
    clout: { icon:'⭐', label:'Clout', display:'Clout' },
    atsFavor: { icon:'🤖', label:'Bot Aura', display:'Bot Aura' },
    robotSuspicion: { icon:'👁️', label:'Sus', display:'Sus' },
    humanContact: { icon:'🤝', label:'Human', display:'Human Contact' },
    energy: { icon:'☕', label:'Energy', display:'Energy' },
    scamEvidence: { icon:'🚩', label:'Scam', display:'Scam Evidence' },
    ghostEvidence: { icon:'👻', label:'Ghost', display:'Ghost Evidence' },
    scamsFell: { icon:'🛡️', label:'Scams', display:'Scams Felled' },
  };
  
  for (const key of Object.keys(after)) {
    if (key === 'buzzwords') continue;
    const beforeVal = before[key] !== undefined ? before[key] : 0;
    const afterVal = after[key] !== undefined ? after[key] : 0;
    if (beforeVal !== afterVal && statMeta[key]) {
      deltas.push({
        key,
        display: statMeta[key].display,
        icon: statMeta[key].icon,
        before: beforeVal,
        after: afterVal,
        delta: afterVal - beforeVal
      });
    }
  }
  return deltas;
}
```

## Usage Pattern
In `applyCard()`, stats are modified and logged:
```javascript
function applyCard(card, effect) {
  const g = _g;
  const eCost = effect.cost?.energy || 1;
  
  // Snap before energy cost
  snapStats();
  g.run.energy -= eCost;
  
  // Snap before stat changes
  snapStats();
  g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 5, 0, 100);
  
  // Log with deltas
  pushLog(g.run.day, 'Job applied to. Hope went up slightly.');
}
```

## Journal Entry Structure
```javascript
{
  day: 1,
  text: "Keyword-stuffed your résumé. Bot Aura loves it. Your soul weeps.",
  deltas: [
    { key: 'atsFavor', display: 'Bot Aura', icon: '🤖', before: 10, after: 18, delta: 8 },
    { key: 'robotSuspicion', display: 'Sus', icon: '👁️', before: 100, after: 95, delta: -5 }
  ]
}
```

## Rendering
Journal entries are rendered in `renderRunLog()`:
```javascript
function renderRunLog() {
  const log = document.getElementById('run-log');
  const entries = g.run.log || [];
  log.innerHTML = entries.map(entry => `
    <div class="run-log-entry">
      <div class="log-day">Day ${entry.day}</div>
      <div class="log-text">${entry.text}</div>
      ${entry.deltas ? `<div class="log-deltas">${entry.deltas.map(d => d.delta > 0 ? '+' : ''}${d.delta} ${d.display}</div>` : ''}
    </div>
  `).join('');
}
```

## Toast/Journal Parity
Toast messages append delta values to match journal entries:
```javascript
function generateResponse(btn, card, deltas) {
  // Get flavor text
  const response = DATA.pick(responses[effect], E._rng);
  
  // Append deltas
  if (deltas && deltas.length > 0) {
    const deltaStr = deltas.map(d => {
      const sign = d.delta > 0 ? '+' : '';
      return `${sign}${d.delta} ${d.display}`;
    }).join(', ');
    return `${response} (${deltaStr})`;
  }
  return response;
}
```
