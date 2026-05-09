# Just Hire Me Bro

> A satirical job-hunting roguelite.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-v1.0.0-green)]()

## What is it?

**Just Hire Me Bro** is a single-file, browser-based card game that turns the modern job search into a ruthless roguelite. You play as a job seeker grinding through applications, recruiter calls, background checks, and the occasional boss fight — all rendered in a satirical take on corporate hiring culture.

Every run is different. Cards are drawn from weighted pools covering job postings, recruiter interactions, resume hacks, networking, investigations, and random events. Your stats shift with every decision — burn out too fast and it's game over. Land enough leads and you might actually get hired.

## Features

- **Procedural card engine** — 80+ unique cards across 8 categories (job, recruiter, post, network, resume, investigate, rest, event)
- **7 playable origins** — each with unique starting stats and passive perks
- **Day-by-day roguelite loop** — manage energy, money, hope, credibility, and burnout across a ticking clock
- **Micro-events** — boss fights, CAPTCHAs, video interviews, personality assessments, and more
- **32 achievements** — for the completionists (and the deeply troubled)
- **18 endings** — 9 victory paths and 9 loss paths, each with satirical HR-style review letters
- **Fully offline** — zero external dependencies, zero network requests, works with a file:// URL

## Stats

| Stat | What it tracks |
|---|---|
| Energy | Actions per day — your most precious resource |
| Hope | Determines whether you keep trying after rejections |
| Credibility | Your "resume score" — affects lead quality and offer chances |
| Burnout | Stacks from overwork — game over at 10 |
| Money | Rent is due every few days — go broke and it's over |
| ATS Favor | How much the automated systems like you |
| Robot Suspicion | AI screening flags you — too high and you're blacklisted |
| Buzzwords | Keyword stack that boosts ATS Favor |
| Clout | Social capital from networking — unlocks special paths |

## How to Play

1. **Open `index.html`** in any modern browser (Chrome, Firefox, Edge, Safari). No server needed.
2. **Pick your origin** — choose a background character with different starting stats and perks.
3. **Play the card game** — each day you get a hand of 4–6 cards. Click action buttons to apply for jobs, network, post on LinkedIn, investigate suspicious postings, or rest.
4. **Survive** — manage your stats. Don't let burnout hit 10. Don't let money hit 0. Land enough leads to convert into offers before rent kills you.
5. **Get hired** — or don't. The game has 18 possible endings.

## Screens

- **Title** — main menu with play, achievements, and credits
- **Background Select** — pick your origin story
- **Game** — the main card-playing screen with stat bar, card feed, leads pipeline, and run log
- **Achievements** — track unlocked and hidden achievements
- **Ending** — victory or defeat screen with shareable summary

## Tech

- **Single HTML file** (~3,200 lines) containing:
  - **CSS** (~260 lines) — responsive, accessible, reduced-motion support
  - **HTML** (~140 lines) — semantic screen structure with ARIA attributes
  - **JavaScript** (~2,800 lines) — game engine, data layer, and UI renderer
- Zero dependencies. No build step. No npm. Just open and play.

## Modding / Extending

Adding content is straightforward — all game data lives in the `DATA` object:

- **New cards**: Add to `DATA.POOLS` in the appropriate category array. See the card schema in the source header.
- **New achievements**: Add to `DATA.ACHIEVEMENTS` and add a check in `E.checkAchievements()`.
- **New endings**: Add to `DATA.ENDINGS` with type `'victory'` or `'loss'`.
- **New backgrounds**: Add to `DATA.BACKGROUNDS` with stats and a perk.

Card effect types include: `lead`, `recruit`, `post`, `net`, `buzzwordAdd`, `atsFavor`, `robotSuspicion`, `credMod`, `hopeMod`, `burnoutMod`, `rentMod`, `cloutMod`, `offerChance`, `bossFight`, `captchaEvent`, `paEvent`, `bulkApply`, `referral`, and more.

## Planned

- Daily Seed mode (same card pool for all players each day)
- Career arc mode (persistent character across runs)
- Themed expansion packs
- Custom card import via JSON
- FAANG Final Round boss mode
- Co-op mode

## License

MIT
