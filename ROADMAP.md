# Just Hire Me Bro — Roadmap: 20 Features to Go From Hobby to Amazing

> Sequenced so each feature builds on the last. Early ones deepen the core loop; middle ones add systems and progression; late ones add the meta-layer that creates long-term replay value. Each entry has the full creative spec — the agent handles the code.

---

## PHASE 1 — Deepen the core (Features 1–6)

### 1. The Inbox — a persistent, readable message log [DONE]

Right now messages flash by in the run log and disappear. Give the player an actual **Inbox** — a left-panel tab or modal that accumulates every recruiter DM, rejection, auto-reply, and offer as a readable email-style thread, grouped by company.

Each message has a sender (a recruiter name + parody company), a timestamp ("Day 4, 9:14 AM"), a subject line, and a body. Unread messages show a bold dot. Old threads can be re-read. This makes the world feel persistent and gives the comedy somewhere to *live* instead of scrolling away.

**Creative detail:** subject lines are the joke. *"Re: Re: Re: Quick question", "Touching base!", "Following up on my follow-up", "GREAT news (it is not great news)", "Your application — an update", "[No Subject]"*. Rejection emails should be formatted like real ones — opening pleasantry, the bad news buried in paragraph two, a closing line about "keeping your résumé on file." Offer emails should feel warm and slightly unreal. Add a running gag: one recruiter, "Brenda," emails *every* player *every* run, and her messages get progressively more familiar and unhinged as the run goes on, like she's the only constant in your professional life.

**Implementation notes:** `g.run.inbox[]` with thread grouping, `checkBrenda()` on day advance, `INBOX_SUBJECTS`/`INBOX_BODIES`/`BRENDRA_MESSAGES` templates in data.js. Full overlay panel `#inbox-panel` with DOM rendering and save/load persistence.

---

### 2. Daily Standup — a morning briefing screen [DONE]

Replace the abrupt jump into the feed with a short **morning briefing**: a single screen that shows the day number, a "today's vibe" line, your top 1–2 most urgent stats, any leads that need attention, and the day's news headline. One button: "Begin the Day."

This gives every day a rhythm — *briefing → (maybe morning event) → feed → end-of-day recap* — and a beat to absorb where you stand.

**Creative detail:** the "today's vibe" line is a horoscope-style one-liner. *"Mercury is in retrograde and so is your job search.", "The stars say avoid Easy Apply today. The stars are usually right.", "Today feels like a 'circle back' kind of day.", "A good day to touch grass. Every day is.", "The algorithm woke up and chose you. Unclear if that's good."* If a stat is critical, the briefing calls it out plainly: *"⚠️ Money is low. Rent is in 3 days. Consider a gig."*

---

### 3. Stat-driven dynamic feed weighting

The feed should *react* to the player's state, making each run feel responsive rather than random. High Robot Suspicion → more captcha events and AI-screening cards. Low Money → more gig cards and scam cards (desperation attracts predators). High Clout → more influencer/thought-leader cards and DMs. Low Hope → more "doomscroll" and rest cards surface. Many active leads → more "circle back" and follow-up-related events.

**Creative detail:** when the feed shifts noticeably, the news headline acknowledges it with a wink. *"The algorithm has noticed you're broke. It has thoughts.", "Your desperation has been detected and monetized.", "You posted once and now your feed is all 'thought leadership.' Congratulations."* The player should slowly *feel* the game watching them.

---

### 4. Streaks & momentum

Add a hidden **momentum** system. Doing constructive things (real applications, networking, portfolio work, resting when needed) builds a quiet momentum meter. Self-destructive spirals (mass-applying, posting cringe, ignoring burnout) build "doom momentum." At thresholds, momentum triggers small events: a good streak might surface a "Recruiter Actually Replied" bonus or a Hope boost; a doom streak triggers an intervention ("a friend texts: 'hey, you good?'").

**Creative detail:** momentum is never shown as a number. It's communicated through tone. On a good streak, the run-log narration warms up slightly — *"You're finding a rhythm.", "Something feels different today. In a good way."* On a doom streak, narration gets flatter and shorter, mirroring burnout — *"Another day.", "You applied. That's all."* The intervention event should be genuinely kind, never preachy: a friend, a former coworker, your mom — offering a coffee, a couch, a reminder that you're a person. Picking "accept" gives real Hope back.

---

### 5. Multi-day projects

Some actions should take longer than one turn. Add **projects** — the portfolio piece, a real certification, a side gig, learning a buzzword-able skill — that occupy a "project slot" and tick down over several days, then pay off. The player can have 1 project slot at first (more unlockable). This forces planning: do you commit 3 days to a portfolio project that pays off big later, or stay reactive?

**Creative detail:** projects have progress flavor that updates daily. A portfolio project: Day 1 *"You set up the repo. The README says 'TODO.'"* → Day 2 *"You wrote actual code. It works. You are suspicious of this."* → Day 3 *"You deployed it. It has one user. The user is you."* → completion *"Portfolio piece done. It's genuinely good. Now someone has to look at it."* Make abandoning a project possible but slightly sad — *"You archived the project. It joins 11 others."*

---

### 6. The "About" — a living profile you build

Give the player a **profile page** they can see and shape: a headline, an "about" section, a skills list, and a profile photo (chosen from parody options). Choices here have small mechanical weight — a keyword-stuffed headline raises Bot Aura but lowers Credibility; an honest one does the reverse. The profile is also what recruiters "see," so it subtly affects DM quality.

**Creative detail:** the headline options are a comedy menu. *"Open to Work | Aspiring Synergist | Results-Driven Professional", "Just a guy trying his best, honestly", "Senior Junior Developer | Ex-Bootcamp | Future Founder", "I help companies unlock value (someone please employ me)", "Unemployed but in a brave, LinkedIn-acceptable way."* Profile photos: *"Cropped Wedding Photo," "Slightly Too Close Selfie," "AI-Generated Headshot (uncanny)," "Professional Photo From 2014," "The Default Gray Silhouette (a power move)."* Each photo has a tiny flavor effect and the AI-generated one ironically raises Robot Suspicion.

---

## PHASE 2 — Systems & texture (Features 7–12)

### 7. Relationships — recurring named NPCs

Introduce a small cast of **recurring characters** who appear across cards and events, each with a relationship meter. Examples: **Brenda** (the eternal recruiter), **your mentor** (a tired, kind ex-manager), **your rival** (a peer who's also job hunting and somehow always one step ahead), **the Founder** (a chaotic startup guy who keeps trying to recruit you into nonsense), and **your friend** (non-career, just a person who checks on you).

Investing in these relationships unlocks things: a strong mentor relationship gives interview prep that improves Panel Interview odds; a strong friend relationship caps how low Hope can crash; the rival, if befriended instead of resented, shares leads.

**Creative detail:** each character has a consistent voice. Brenda is breezy, over-familiar, and slippery. The mentor speaks in war-weary truths — *"I've been laid off three times. You'd be amazed what you survive."* The rival is insufferably upbeat in a way that's clearly also a coping mechanism — and the emotional turn of the game is realizing they're as scared as you. The Founder talks exclusively in pitch-deck language and genuinely believes equity is a personality. The friend never once mentions your career, and that's the point.

---

### 8. The Calendar — scheduled events & time pressure

Add a visible **calendar/agenda**. Interviews, recruiter calls, rent due dates, project deadlines, and a few one-off opportunities get placed on specific future days. The player sees them coming and must plan Energy around them. Miss a scheduled interview (no Energy left, or chose other cards) and the lead suffers.

**Creative detail:** the calendar should have texture — not every entry is a task. Include flavor entries the player can't act on but that ground the world: *"Day 12: Your lease renews", "Day 20: Your friend's birthday (you should go)", "Day 8: The free trial you forgot about ends", "Day 17: Mercury enters retrograde (again)."* When the player misses an interview: *"You missed the 2 PM interview. You were 'circling back' on something else. The recruiter was not understanding."*

---

### 9. Economy 2.0 — bills, gigs, and real financial texture

Deepen the money system. Instead of just rent every 5 days, add a small **bills system**: rent, phone, subscriptions you forgot about, the occasional surprise expense (tie this to the morning events). Balance it with a real **gig economy** — gigs you can take that trade Energy/Hope for Money, with the bitter joke that gig work is *more reliable* than the actual job search.

**Creative detail:** the gigs are the satire. *"Deliver food in the rain (it builds character and back pain)", "Sell your old textbooks to a man named Gary", "Do a '$5 logo' commission for someone with strong opinions", "Participate in a sleep study (income while unconscious — the dream)", "Drive strangers around and absorb their life stories."* The cruelest, funniest beat: a gig pays out *immediately and exactly as promised*, and the run log notes it — *"The gig paid you. On time. The full amount. The job market could never."*

---

### 10. Skill Tree / Résumé Builder

Let the player **build a résumé** over the run as a light skill tree. Completing projects, certs, and gigs adds real entries; keyword-stuffing adds fake ones. The résumé is a tangible object the player constructs, and its composition determines how leads evaluate them — a résumé heavy with real projects converts interviews better; one heavy with buzzwords passes more ATS screens but collapses in panels.

**Creative detail:** the résumé is viewable as an actual document, and it's funny to read. Real entries are plain and modest. Fake/stuffed entries are gloriously inflated — *"Filing Clerk"* becomes *"Document Lifecycle Optimization Specialist."* The résumé has a "Bot Aura score" and a "Human score" shown as two bars, and the game's central tension — robots vs humans — is made literal here. Add a wonderful gag: a "Skills" section where endorsed skills include things like *"Microsoft Word (Advanced)," "Synergy," "Showing Up," "Existing."*

---

### 11. Difficulty modes / "Job Markets"

Add selectable **job market conditions** at run start (or unlockable as you win): *"Candidate's Market"* (easy — recruiters are nice, offers come faster, a fantasy), *"Normal Market"* (the current balance), *"Hiring Freeze"* (hard — ghost jobs everywhere, leads die fast, Hope drains), and a unlockable *"2008 / Layoff Season"* (brutal). Each shifts card weights, ghost rates, and economy pace.

**Creative detail:** each market has a tone and a tagline shown on selection. Candidate's Market: *"Recruiters pursue YOU. Enjoy this. It will not last." (it is also slightly boring, and that's a joke).* Hiring Freeze: *"Every door is a wall with a doorknob painted on it."* Layoff Season: *"The market is not hiring. The market is grieving. Good luck."* The news headlines should change flavor per market — abundant and smug in a good market, apocalyptic and gallows-humored in a bad one.

---

### 12. Mid-run Events with consequences — the "Decision" system

Bigger than morning events: a few times per run, a **major decision** modal appears with genuine fork-in-the-road weight. Examples: a lowball offer from a real-but-bleak company arrives on Day 14 — take the bird in hand or hold out? The Founder offers you a co-founder role — security vs chaos. A family member offers to let you move in to save rent — accept help or preserve independence? These decisions reshape the rest of the run.

**Creative detail:** these should have *no* obviously correct answer and should sting a little either way. The lowball offer: taking it is a real win condition ("The Quiet Win" energy) but the game gently notes what you gave up; refusing it is brave but the run log remembers it on a bad day — *"You think about the offer you turned down. You don't regret it. Mostly."* The "move back in" decision is the most human one in the game — it should be treated with warmth, not as a failure. The point of these is that adulthood is a series of imperfect trades.

---

## PHASE 3 — Meta & long-term replay (Features 13–20)

### 13. Career Mode — persistent progression across runs

Wrap individual runs in a **career arc**. Each run is a "job search," and finishing one (win or lose) advances a persistent meta-character: experience level, a permanent skill or two, a small starting bonus, unlocked backgrounds. Getting hired and then *playing the next run as someone who got laid off from that job* is the loop — the game becomes about a *career*, not a single search.

**Creative detail:** between runs, show a "career interlude" — a short text vignette covering the gap. After a win: *"You worked at HVAC-Soft for 14 months. It was fine. Genuinely fine. Then there was a 'reorg.'"* After a loss: *"You took a break. You regrouped. You updated your résumé for the 900th time. Round two."* The meta-character has a name the player picks and a slowly-growing work history. The dark joke: no job lasts, every run starts with you back in the feed. The warm counter-joke: you get *better* at this, and you survive every time.

---

### 14. The Antagonist — a recurring system "boss"

Give the game a face for its real enemy: **the ATS itself**, personified across the run as a cold, polite, omnipresent presence — call it something like **"TALENTECH ATS v9.4"** or **"the Parser."** It occasionally "speaks" via system messages, it's the thing rejecting you, and the game builds toward a climactic confrontation: a final-day mega-event where you either beat the Parser (a culminating mini-game using everything you've learned) or it beats you.

**Creative detail:** the Parser is never angry — it's worse than that, it's *indifferent and procedural*. Its messages are chillingly polite: *"Your application has been processed. A determination has been made. The determination is not favorable. We wish you the best.", "You have been identified as a 'candidate.' This identification is provisional.", "Thank you for your interest in existing within our pipeline."* The endgame confrontation: the Parser offers you a job — to *become* an ATS, to join it. The "Prompt Engineer by Accident" ending already gestures at this; make it the dramatic spine. Beating it isn't destroying it — it's getting a *human* to override it. The moral: the system only loses when a person chooses to see you.

---

### 15. Unlockables & Collection — cards, cosmetics, "Corporate Artifacts"

Add a persistent **collection**: relics ("Corporate Artifacts" from the original concept), cosmetic profile items, alternate card art, joke trophies. Unlocked through achievements, endings, and milestones. Before each run, equip one Artifact that modifies the run (the relic system from the original ultrawork prompt — finally implemented).

**Creative detail:** lean hard into the Artifact comedy. *"The Open-to-Work Halo: recruiters DM you 30% more, but 20% of them are scams.", "Blue Check of Ambiguous Authority: your posts gain Clout but nobody knows why you have it.", "The Standing Desk: -10% Burnout-equivalent Hope drain; you have nowhere to put it.", "Lukewarm Coffee of Eternal Monday: start each day with +1 Energy and a vague sense of dread.", "The LinkedIn Premium Trial That Never Ends: see one extra card per day; you cannot cancel it.", "Mechanical Keyboard of Misplaced Confidence: panel interviews go better; everyone can hear you typing."* Collecting them all should feel like assembling a museum of modern work misery.

---

### 16. Statistics & "Year in Review" — data that roasts you

Add a deep **stats screen** tracking lifetime numbers: total applications, total ghostings, longest ghost streak, offers received, scams dodged, buzzwords collected, days survived, fastest win. Then present it as a parody of LinkedIn's "Year in Review" / Spotify Wrapped — a shareable, animated, gently savage recap.

**Creative detail:** the Year in Review is pure comedy gold and a built-in sharing engine. *"You applied to 1,847 jobs this year. You heard back from 12. That's a 0.6% response rate — better than the industry average!", "You were ghosted 340 times. If each ghost were a real ghost, you'd be the most haunted person in the country.", "Your most-used buzzword was 'synergy.' You used it 89 times. You do not know what it means.", "You spent 14 in-game days 'circling back.' That's two weeks of your life. Spent. Circling.", "Top recruiter who ghosted you: Brenda. Of course it was Brenda."* End it with one genuinely warm line: *"You kept going. 312 times, you opened the app again. That's not nothing. That's the whole thing, actually."*

---

### 17. Daily Challenge / Seeded Mode — shared runs

Use the existing Mulberry32 seed infrastructure to add a **Daily Challenge**: every real-world day, every player gets the same seed — same cards, same events, same starting background and modifiers. A global-feeling leaderboard (local, but framed as global) ranks the day's scores. Adds a "play once a day, compare with friends" hook.

**Creative detail:** each Daily Challenge gets a themed name and a one-line setup. *"Monday's Challenge: 'The Reorg' — you start with 3 active leads, all of which are about to be paused.", "Friday's Challenge: 'Open to Work' — recruiter DMs doubled, scams tripled, godspeed.", "Sunday's Challenge: 'The Scaries' — Hope starts at 30. It's just one of those days."* The shareable result text is the viral mechanism: *"Just Hire Me Bro — Daily Challenge 'The Reorg' — I survived 22 days and was ghosted 19 times. Score: 1,240. Beat that, bro."*

---

### 18. Audio & Game Feel — sound design and juice

The game is silent. Add a tasteful **procedural sound layer** (Web Audio API, no files): soft clicks on card actions, a satisfying chime on offers, a flat "thunk" on ghostings, a typewriter tick on text reveals, an anxious low hum when Hope is critical, ambient "office" texture (distant keyboard clatter, a printer, a far-off Zoom call) on the game screen. Plus visual "juice" — screen shake on a big rejection, a warm glow pulse on Hope gains, smooth number tweens. All toggleable, off-by-default-friendly.

**Creative detail:** the audio is a comedy instrument. The offer chime should be *almost* triumphant but slightly cheap-sounding, like a mobile-game reward. The ghosting sound is the funniest one — a single, deflating, almost cartoonish *"bloop"* of nothing. When Robot Suspicion is maxed, layer in a subtle digital glitch texture. The ambient office sounds are darkly funny *because* the player doesn't have an office — it's the sound of the thing they're trying to get back into, playing faintly while they sit at home.

---

### 19. Narrative Threads — a soft story across the run

Weave a few **multi-part story arcs** that unfold across a run's 30 days, triggered by player choices. Examples: the "Brenda Arc" (the recruiter who slowly becomes weirdly real and human across ~5 escalating emails), the "Rival Arc" (your job-hunting peer's parallel journey, which you witness and which can end in their win, their breakdown, or your friendship), the "Founder Arc" (the startup guy's company visibly rises or implodes depending on whether you joined). These give a run emotional shape beyond stats.

**Creative detail:** the Rival Arc is the heart. Early game they're insufferable — *"Just landed my 4th final-round! The grind works if you work it 💪."* Mid-game cracks show — *"Honestly between us, I haven't slept. But we don't post that, right?"* Late game it forks: if you've been competitive and cold, they get an offer and you feel hollow; if you've been kind — shared a lead, sent an encouraging message — they might *not* win either, and the two of you end the run with a genuine, un-ironic message of solidarity. *"We're both still here. That counts for something. Coffee when this is over — for real this time."* The game should let the player discover that the rival was never the enemy. The ATS was.

---

### 20. New Game+ / "The Other Side" — play as the system

The ultimate unlock. After enough wins, unlock the ability to play **the other side of the table**: a short, separate mode where you're a **recruiter, hiring manager, or the ATS itself**, and you experience the absurdity from the inside — drowning in 4,000 résumés, pressured to post ghost jobs to "build pipeline," forced to reject good candidates for arbitrary reasons, watching the metrics dashboard demand more.

**Creative detail:** this is the thesis of the whole game made playable. As a recruiter, you *want* to help people but the system won't let you — you have 200 reqs, a quota, a boss who measures you on "time-to-fill," and a tool that auto-rejects half your inbox before you see it. You're handed a "great candidate" and told to ghost them because the role got frozen. You post a job you *know* is fake because "leadership wants top-of-funnel awareness." The mode's gut-punch: you recognize the candidates. They're playing the game you just played. You see a desperate applicant named after the player's own meta-character. The closing line of the mode: *"You were never the villain. Neither were they. The villain was the spreadsheet, and the spreadsheet doesn't even know it won."* Completing it permanently changes the main game's tone slightly — a few cards gain a new, sadder-wiser line — and unlocks a final ending where, as a hiring manager, you override the ATS to give one person a real shot. The person you hire is *you, from a previous run.*

---

## Suggested build order rationale

- **1–6** make the existing run *feel* richer without new meta-systems — fastest wins, highest immediate impact.
- **7–12** add the systems (NPCs, calendar, economy, decisions) that turn a card game into a *life sim*.
- **13–17** add the meta-layer — career mode, collection, stats, daily challenge — that creates the "one more run" engine and the sharing loop.
- **18–19** are polish and soul — audio, juice, and the narrative threads that make people *feel* something.
- **20** is the capstone — it recontextualizes everything and gives the game a real thesis. Build it last, because it only lands once the player has lived the other side.

The throughline to protect across all 20: **the system is the antagonist, the player is the human, and the game is ultimately kind.** Every feature should punch up at the machine and treat the job seeker — the player — with warmth. That's what turns a funny hobby project into something people genuinely love.
