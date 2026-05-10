# Just Hire Me Bro, Bro

> A satirical job-hunting game.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What is it?

**Just Hire Me Bro** is a browser-based card game that turns the modern job search into a ruthless game. You play as a job seeker grinding through applications, recruiter calls, background checks, and the occasional boss fight — all rendered in a satirical take on corporate hiring culture.

Every run is different. Cards are drawn from weighted pools covering job postings, recruiter interactions, resume hacks, networking, investigations, and random events. Your stats shift with every decision — burn out too fast and it's game over. Land enough leads and you might actually get hired.

## What is "Bro, Bro"?

"Bro, Bro" is a tongue-in-cheek acknowledgment of the game's satirical nature. The title riff plays on the casual, almost desperate energy of modern job hunting. It's not a sequel — it's a wink to anyone who's spent enough time doomscrolling through job boards to start questioning reality.

## Features

- **Custom procedural card engine** — 92 unique cards across 10 categories (job, recruiter, post, network, resume, gig, investigate, rest, event, micro)
- **7 playable backgrounds** — each with unique starting stats and passive perks
- **Day-by-day card game loop** — manage energy, money, hope, credibility, and Bot Aura across a ticking clock
- **Micro-events** — boss fights, CAPTCHAs, video interviews, personality assessments, and more
- **Morning Events** — 30% chance per day (from Day 2) for a random real-world life event modal with 20 events and hidden outcomes
- **Lead Follow-Up Progression** — Each lead has a randomized track of stages; follow-up triggers mini-games or flavor responses
- **6 mini-games** — Screening Form, Take-Home, Panel Interview, Salary Stall, Video Interview, Personality Test (various approaches exist in codebase)
- **Signal-based leads** — Each lead accumulates signals (salary disclosed, real recruiter, reference trouble) that affect terminal outcomes
- **34 achievements** — for the completionists (and the deeply troubled)
- **19 endings** — 9 victory paths and 10 loss paths, each with satirical HR-style review letters
- **Fully offline** — zero external dependencies, zero network requests

## Getting Started

### Option 1: Download and Local Server
1. Clone or download the repository
2. Open `index.html` in your browser

```bash
# Recommended: Run a local HTTP server
python -m http.server 8000
# or open index.html directly (modern browsers may restrict some features)
```

### Option 2: Fork and use GitHub Pages
Use [GitHub Pages](https://pages.github.com/) to deploy your own instance.

### Option 3: Deploy with Vercel

```bash
npm i -g vercel
vercel
```

### Stats at a Glance
| Stat | Starting | Max | Description |
|------|----------|-----|-------------|
| Energy | 10 | 20 | Spent on daily actions. Refills by resting. |
| Hope | 70 | 100 | Your will to continue. Hit 0 and it's over. |
| Money | 500 | — | Your finances used for rent and expenses. |
| Credibility | 60 | 100 | How human and trustworthy you seem. |
| Bot Aura | 10 | 100 | Your digital presence. High Bot Aura = more applications seen. |

---

## Card System

### How Cards Work
Cards represent job applications, recruiters, social media posts, networking events, resume tweaks, investigation opportunities, rest options, and random events. The weighted deck system ensures variety and unexpected combinations.

### Card Anatomy
Each card has:
- **Title**: The name of the opportunity, event, or action available
- **Category**: One of 10 types (job, recruiter, post, network, resume, gig, investigate, rest, event, micro)
- **Flavor Text**: Satirical commentary on modern recruitment culture
- **Cost**: Energy or money paid to pursue this option
- **Effects**: How your stats change when you take action

### Card Categories

#### 1. Recruiters
Recruiter interactions range from the genuinely helpful to the completely fraudulent. Some will advance your lead through interview stages, while others are scams that waste your time and money. The challenge is distinguishing between them until you get evidence.

#### 2. Posts
Social media content can help or hurt your professional brand. You'll encounter everything from well-intentioned content to engagement bait, each with real consequences to your credibility and Bot Aura stats. Some posts are worth ignoring entirely.

#### 3. Network
Networking events and contacts provide leads through human connections rather than application systems. These relationships can be powerful but require energy investment to maintain.

#### 4. Resumes
Resume tweaks modify your stats in various ways. Some tweaks boost Bot Aura at the expense of credibility, while others strike a balance between digital presence and genuine human appeal.

#### 5. Investigate
Investigation opportunities allow you to dig into job listings to expose ghost jobs and scams. Successful investigations increase your evidence and credibility but fail regularly.

#### 6. Rest
Rest cards are essential for survival. Sleep restores hope and energy, while venting outlets help you decompress when things get overwhelming.

#### 7. Events
Random event cards represent unexpected opportunities, setbacks, or bizarre situations you encounter during your job search.

#### 8. Jobs (Standard Applications)
Standard job applications require significant effort but provide structured interview pipelines with predictable progression tracks.

#### 9. Gigs (Side Work)
Gig work cards offer quick opportunities to earn income while job hunting, though they can interfere with your primary job search goals.

#### 10. Micro
Micro-event cards represent brief, high-stakes interactions during the application process like screening forms, take-home assignments, and other gatekeeping mechanisms.

### Weight System
Each card has a weight attribute from 0.5 to 2.0. Higher weight = more frequent appearance in your daily feed. Weight 2 cards appear roughly twice as often as weight 1 cards.

### Feed Generation Rules
- Daily feed contains 4 cards
- Standard applications excluded after Day 5
- 20% chance to skip a post card
- 10% chance for an urgent card to be inserted (weight 3, drawn from unplayed urgent cards)

---

## Lead System

### Lead Anatomy
When you apply to a job, you gain a Lead. Each lead tracks:
- **id**: Unique identifier for tracking across days
- **Title**: Job title you applied for
- **Company**: Where the job is posted
- **Progression**: Current stage in the interview/follow-up process
- **Flags**: Special conditions affecting outcomes (real recruiter, salary disclosed, etc.)
- **Timeline**: Expected response windows

### Lead Follow-Up Stages
Each lead progresses through randomized stages:
1. **Waiting**: Initial application submitted, awaiting response
2. **Auto-Reply**: Robotic confirmation of application receipt
3. **Screening Form (Mini-Game)**: Fill out company portal with personality questions and references
4. **Recruiter Screen**: Automated or live phone screening
5. **Video Interview (Mini-Game)**: Online interview with company representatives
6. **Personality Test (Mini-Game)**: Behavioral assessment via company portal
7. **Take-Home (Mini-Game)**: Unpaid assignment evaluation
8. **Panel Interview (Mini-Game)**: Group panel decision-making process
9. **Salary Stall (Mini-Game)**: Compensation negotiation phase
10. **Reference Checks**: Background verification through professional contacts
11. **Final Interviews**: Decision-making panel and next steps
12. **Offer Pending**: Final wait while offer is prepared
13. **Terminal Outcome**: Reaches end-game condition

### Ghost Tracking
Leads that ghost contribute to ghost tracking stats. Tracking 2+ leads in one run triggers achievement checks for ghost-related milestones.

---

## Mini-Games (6 Types)

### 1. Screening Form
Fill out a company portal with questions about personality, experience, and references. Wrong answers lead to immediate rejection.

### 2. Take-Home Assignment
Build something over 48 hours (or simulate it). Wrong approaches lead to rejection with feedback like "good effort, but we're looking for someone more senior."

### 3. Panel Interview
Navigate a group panel with various personality types and demands. One wrong answer ends the interview. Strategic choices required.

### 4. Salary Stall
Negotiate compensation through increasingly absurd HR tactics ranging from "competitive salary" claims to ghosting.

### 5. Video Interview
Navigate online interviews with company representatives testing your cultural fit and technical knowledge.

### 6. Personality Test
Answer behavioral assessment questions that seem reasonable but have absurdly specific correct answers.

---

## Boss Fights

### Standard Bosses (3 Types)
Bosses appear as special cards with multiple phases, each requiring different strategies based on your current stats:

1. **The Infinite Applicant**: A recruiter who claims to have 14 years of experience at a company founded 8 years ago. Three phases testing persistence and credibility across resume review, behavioral interview, and technical assessment.

2. **The Legacy Hire**: Former employee promoted through nepotism now interviewing you. Three phases testing your ability to navigate legacy corporate culture while maintaining hope.

3. **The AI Hiring Manager**: An algorithm evaluating your application through increasingly absurd tests. Four phases testing your digital presence, pattern recognition, and meta-awareness.

### Cryptid
The Cryptid is a legendary card that represents an impossibly good opportunity. Encountering it triggers special achievement and ending conditions.

---

## Endings (19 Total)

### Victory Paths (9)

**Just Hired, Bro** 🎉
Complete 3 applications on time and secure an actual job. Requires balanced stats, strategic energy management, and surviving the interview pipeline.

**Human Referral Network** 🤝
Win through organic connections rather than applying. Requires 3+ human connections and 5+ networking actions.

**Ghost Job Vigilante** 🕵️
Build 5+ ghost evidence and expose systemic problems in the job market. Achieved through investigation actions and exposing scams.

**Scam the Scammers** 🛡️
Report 10+ scams and become a one-person regulatory force. Requires maintaining high credibility while pursuing leads aggressively.

**Prompt Engineer by Accident** 🧠
Build enough Bot Aura (70+) that you automate your way into the job. A meta-victory that comments on AI in recruitment.

**Thought Leader Containment Breach** 📣
Reach 100 Clout through posts and networking while maintaining high credibility. Becomes a viral influencer in the job search space.

**Founder Mode** 🚀
Accumulate 15+ buzzwords and build enough credibility to start your own company. The entrepreneurial escape route.

**Network Wizard** ✨
Build 3+ Human Contact and accumulate significant credibility. Win through pure networking without relying on standard applications.

**The Quiet Win** 🌅
Survive 30 days without burning out. Take a mundane but satisfying job in a stable industry while maintaining 60+ Hope.

### Loss Paths (10)

**The Résumé Black Hole** 🕳️
Apply to 5+ jobs without a single response. Your applications enter the void. Requires 10+ applications before triggering.

**The Doomscroll Spiral** 🌀
Hope reaches 0 from continuous negative events. You close the devices and question everything.

**Hopeless** 🔥
Hope reaches 0 from poor decisions and bad luck. Your body files a formal complaint.

**Rent Has Entered the Chat** 💸
Money reaches 0 and rent accumulates. The landlord stops being polite. Survival takes priority over job hunting.

**Final Round Forever** ♾️
Trapped in continuous interview loops with no advancement past Day 15. You're stuck in "Final_Final_v7" status permanently.

**The Ghost Town** 👻
Submit 5+ applications and receive not a single response. The job market goes completely silent.

**The Infinite Internship** 🔄
Get stuck in unpaid internship loops that exploit your skills without compensation.

**The Algorithm's Playground** 🎰
Complete 3+ applications but get auto-rejected 10+ times. The ATS system wins decisively.

**Overqualified** 🎓
Reach 100 Credibility but fail to secure a job due to being "too good" for available positions. Irony intact.

**The Quiet Exit** 🌿
Survive for 30 days and simply give up. Take a career in a completely unrelated field. Sometimes running away is the realistic choice.

---

## Achievements (34)

| Achievement | Trigger | Hidden? |
|-------------|---------|---------|
| Just Hire Me, Bro | Win with an actual job | No |
| The Robot Said No | Get auto-rejected 10 times | No |
| Résumé Black Hole Researcher | Have 15 leads ghost in one run | No |
| Open to Work, Open to Scams | Receive 10 scam DMs in one run | No |
| Salary Range Cryptid | Find a recruiter who states salary upfront | No |
| Networking Is Just Friendship With KPIs | Win via referral | No |
| Prompt Engineer by Accident | Win the AI ending | No |
| Final Round Forever | Reach 4+ "final" interviews on a single lead | No |
| Reposted Since Antiquity | Expose a job marked "reposted 50+ times" | No |
| One Click, No Witnesses | Submit 20 Easy Apply applications | No |
| Ghostbuster | Expose 10 ghost jobs in one run | No |
| Ghost Job Vigilante | Expose 25 ghost jobs across all runs | No |
| Kindly Champion | Correctly report 5 scam recruiters | No |
| Workday Warrior | Survive 10 company portal applications | No |
| The Parser Ate My Homework | Lose 30+ Bot Aura to a single event | No |
| Humbled and Honored | Gain 100 Clout in one day | No |
| Agree? | Get a one-word "Agree?" post to go viral | No |
| Touch Grass Speedrun | Win without hope ever dropping below 50 | No |
| The Quiet Win | Achieve "The Quiet Win" ending | No |
| Founder Mode Activated | Collect 15 buzzwords | No |
| Reformed Influencer | Hit 200 Clout | No |
| Circle Back Champion | Have 8 active leads at once | No |
| No Take-Homes | Win without completing a take-home | No |
| Pure Human | Win with Sus ≥ 80 throughout | No |
| Pure Robot | Win with Bot Aura ≥ 90 and Sus ≤ 20 | No |
| Recruiter Bingo | Trigger 5 distinct recruiter cards in one run | No |
| The 30 Days Are a Lifetime | Reach day 30 in any state | No |
| First-Round Knockout | Get an offer on or before day 10 | No |
| Speedrunner | Submit 50+ applications in 5 days or fewer | No |
| Touch Cryptid | Encounter a Salary Range Cryptid in 3+ runs | No |
| True Boss | Defeat a boss fight without failing a single requirement | No |
| AGI Pilled | Win the Prompt Engineer ending 5 times across all runs | No |
| Good Morning | Experience 10 morning events across all runs | No |
| The Right Thing | Report the DoorDash glitch | **Yes** |
| Free Pizza Generation | Go to a meetup for the pizza alone | **Yes** |

---

## Credits

**Code:** [vmspionage](https://github.com/vmspionage)
**Engine:** Custom procedural card game engine
**Testing:** Headless browser tests verify HTML/CSS structure and engine behavior
**License:** MIT License — free to use, modify, and distribute
**Live Demo:** [justhiremebro.pages.dev](https://vmspionage.github.io/JustHireMeBro/)

Built with vanilla HTML, CSS, and JavaScript. No frameworks. No build steps. No dependencies.
