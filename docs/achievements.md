# Achievement System

## Overview
The achievement system tracks player milestones and unlocks special rewards. There are **38 achievements** total.

## Achievement Structure
```javascript
{
  id: 'achievement-id',
  name: 'Achievement Name',
  desc: 'How to unlock',
  icon: '🏆',
  hidden: false
}
```

## Achievement Categories
1. **Winning** — Victory achievements
2. **Exploration** — Discovering game features
3. **Collection** — Gathering items/stats
4. **Challenge** — Overcoming difficulties
5. **Secret** — Hidden achievements

## Achievement Tracking
Achievements are tracked in `_meta.achievements`:
```javascript
// Per-run flags (g.run.flags)
g.run.flags.waitingFollowUpsMax    // Max consecutive waiting follow-ups on one lead
g.run.flags.panelHonestAnswers     // Count of honest answers in panel interviews
g.run.flags.panelStareDowns        // Count of stare-back choices in panel interviews
g.run.flags.formSurvivorCount      // Total screening forms completed
g.run.flags.principledOffer        // Set when principled take-home decline wins offer
g.run.flags.salaryWarriorOffer     // Set when salary-disclosed path wins offer

// Lifetime flags (_meta.lifetime)
_meta.lifetime.morningEvents       // Total morning events experienced across all runs
```

## Achievement Checks
```javascript
function checkAchievements() {
  const g = E.state;
  const f = g.run.flags;
  const newUnlocks = [];

  const checks = [
    { id: 'win-job', check: () => g.run.won === 'just-hired' },
    { id: 'robot-said-no', check: () => (f.autoRejected || 0) >= 10 },
    { id: 'good-morning', check: () => _meta.lifetime.morningEvents >= 10 },
    { id: 'patient-zero', check: () => (f.waitingFollowUpsMax || 0) >= 5 },
    // ... more checks
  ];

  for (const check of checks) {
    if (!(_meta.achievements[check.id]) && check.check()) {
      _meta.achievements[check.id] = true;
      const ach = DATA.ACHIEVEMENTS.find(a => a.id === check.id);
      if (ach) {
        newUnlocks.push(ach);
        unlockAchievement(ach.id);
      }
    }
  }
  return newUnlocks;
}
```

## Achievement List
| ID | Name | Description | Icon | Hidden |
|----|------|-------------|------|--------|
| win-job | Just Hire Me, Bro | Win with an actual job | 🎉 | No |
| robot-said-no | The Robot Said No | Get auto-rejected 10 times | 🤖 | No |
| resume-bh | Résumeé Black Hole Researcher | Have 15 leads ghost | 🕳️ | No |
| open-scams | Open to Work, Open to Scams | Receive 10 scam DMs | 📨 | No |
| salary-crypt | Salary Range Cryptid | Find a recruiter who states salary | 🦄 | No |
| net-kpis | Networking Is Just Friendship With KPIs | Win via referral | 🤝 | No |
| prompt-eng | Prompt Engineer by Accident | Win the AI ending | 🧠 | No |
| final-v7 | Final Round Forever | Reach 4+ "final" interviews | ♾️ | No |
| repost-antiq | Reposted Since Antiquity | Expose a job marked "reposted 50+ times" | 👴 | No |
| one-click | One Click, No Witnesses | Submit 20 Easy Apply applications | 🖱️ | No |
| ghostbuster | Ghostbuster | Expose 10 ghost jobs | 👻 | No |
| ghost-vig | Ghost Job Vigilante | Expose 25 ghost jobs across runs | 🔍 | No |
| kindly-champ | Kindly Champion | Correctly report 5 scam recruiters | 🛡️ | No |
| workday-warr | Workday Warrior | Survive 10 company portal applications | 🔐 | No |
| parser-ate | The Parser Ate My Homework | Lose 30+ Bot Aura to a single event | 💀 | No |
| humbled-hon | Humbled and Honored | Gain 100 Clout in one day | 📣 | No |
| agree-ach | Agree? | Get a one-word "Agree?" post to go viral | ✅ | No |
| touch-grass-s | Touch Grass Speedrun | Win without hope ever dropping below 50 | 🌿 | No |
| quiet-win | The Quiet Win | Achieve "The Quiet Win" ending | 🌅 | No |
| founder-mode | Founder Mode Activated | Collect 15 buzzwords | 🚀 | No |
| reformed-inf | Reformed Influencer | Hit 200 Clout | 📱 | No |
| circle-back | Circle Back Champion | Have 8 active leads at once | 🔄 | No |
| no-takehomes | No Take-Homes | Win without completing a take-home | 🚫 | No |
| pure-human | Pure Human | Win with Sus ≥ 80 throughout | 💚 | No |
| pure-robot | Pure Robot | Win with Bot Aura ≥ 90 and Sus ≤ 20 | ⚙️ | No |
| recruiter-bingo | Recruiter Bingo | Trigger 5 distinct recruiter cards | 🎯 | No |
| good-morning | Good Morning | Experience 10 morning events across all runs | 🌅 | No |
| right-thing | The Right Thing | Report the DoorDash glitch | 😇 | Yes |
| free-pizza | Free Pizza Generation | Go to a meetup for the pizza alone | 🍕 | Yes |
| mom-knows | Mom Knows | Answer 3 mom calls in a single run | ❤️ | No |
| patient-zero | Patient Zero | Follow up on the same lead 5 times while Waiting | ⏳ | No |
| real-answer | A Real Answer | Pick the honest answer in a Panel Interview and survive | 💯 | No |
| principled | Principled | Decline an unpaid take-home and still get the offer | ⚖️ | No |
| silent-power | Silent Power | Choose to stare back in the Panel Interview and survive | 🤫 | Yes |
| form-survivor | Form Survivor | Complete 10 Screening Forms | 📝 | No |
| salary-warrior | Salary Warrior | Get an offer using the disclosed salary range | ⚔️ | No |

## New Achievement Unlock Details (Patch P + Q)

### Morning Events (Patch P)
| Achievement | Condition | Flag |
|---|---|---|
| `good-morning` | `_meta.lifetime.morningEvents >= 10` | Counted in `resolveMorningChoice` |
| `right-thing` | Reported the DoorDash glitch | `g.run.flags.rightThing = 1` |
| `free-pizza` | Went to a meetup for pizza alone | Checked in `triggerStage` for `free-conference` event |
| `mom-knows` | Answered 3 mom calls in a single run | `g.run.flags.momCalls >= 3` in `resolveMorningChoice` |

### Lead Follow-Up (Patch Q)
| Achievement | Condition | Flag |
|---|---|---|
| `patient-zero` | 5+ follow-ups on same lead while in WAITING | `g.run.flags.waitingFollowUpsMax >= 5`, checked in `followUpLead` |
| `real-answer` | Picked honest panel answer and survived | Checked in `startPanelInterview` |
| `principled` | Declined unpaid take-home and won offer | `g.run.flags.principledOffer = 1`, checked in `finishLead` |
| `silent-power` | Stared back in panel and survived | Checked in `startPanelInterview` |
| `form-survivor` | Completed 10 screening forms | `g.run.flags.formSurvivorCount >= 10`, checked in `startScreeningForm` |
| `salary-warrior` | Got offer using disclosed salary range | `lead.signals.salaryDisclosed`, checked in `finishLead` |

## Achievement Display
```javascript
function showAchievements() {
  const grid = document.getElementById('ach-grid');
  const achData = DATA.ACHIEVEMENTS;
  const unlocked = Object.keys(_meta.achievements).filter(k => _meta.achievements[k]);

  grid.innerHTML = achData.map(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    return `
      <div class="ach-item ${isUnlocked ? 'unlocked' : 'locked'}"
           role="img"
           aria-label="${isUnlocked ? ach.name : 'Locked achievement'}">
        ${isUnlocked ? ach.icon : '🔒'}
        <div class="ach-name">${isUnlocked ? ach.name : ach.desc}</div>
      </div>
    `;
  }).join('');

  document.getElementById('ach-count').textContent = `${unlocked.length} / ${achData.length} unlocked`;
}
```
