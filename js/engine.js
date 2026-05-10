/* ============================================================
   ENGINE — Game State, Day Loop, Resolution, Achievements
   ============================================================ */
const Engine = (() => {
  let _g, _meta, _rng;
  const STORAGE_KEY = 'juhirebro_v1';
  const RUN_KEY = 'juhirebro_run_v1';

  /* Safe HTML → DOM converter (game data, never user input) */
  function htmlToDom(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.cloneNode(true);
  }

  /**
   * Initialize or migrate saved game data. Handles schema version migration
   * to prevent silent data loss when new achievements or lifetime fields
   * are added in future updates.
   */
  function initMeta() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (d && d.v !== undefined) return migrateMeta(d);
    } catch(e) {}
    return {v:3, achievements:{}, unlockedBg:['recent-grad','mid-career','tech-refugee','bootcamp','career-goblin'], highScores:[], lifetime:{ghostsExposed:0,scamsReported:0,runs:0,wins:0,cryptidRuns:0,morningEvents:0,rightThing:0}};
  }

  /**
   * Migrate saved data to the latest schema version.
   * Merges new achievement IDs, lifetime fields, and unlocked backgrounds
   * into existing saves without destroying old data.
   * @param {object} d - The saved data object.
   * @returns {object} Migrated data object with incremented version.
   */
  function migrateMeta(d) {
    // Version 1 → 2: Add new achievement IDs, lifetime fields
    if (d.v === 1) {
      d.lifetime = Object.assign({
        ghostsExposed: 0,
        scamsReported: 0,
        runs: 0,
        wins: 0,
        cryptidRuns: 0
      }, d.lifetime || {});
      d.v = 2;
    }
    // Version 2 → 3: Add morning events tracking
    if (d.v === 2) {
      d.lifetime = Object.assign({
        morningEvents: 0,
        rightThing: 0
      }, d.lifetime || {});
      d.v = 3;
    }
    return d;
  }
  function saveMeta() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_meta)); } catch(e) { showNotice('Saving disabled. Your achievements will not persist. Like your career.'); }
  }
  function showNotice(msg) { const n=document.createElement('div');n.style.cssText='position:fixed;top:1rem;left:50%;transform:translateX(-50%);background:var(--gold);color:var(--navy);padding:.75rem 1.5rem;border-radius:var(--radius);z-index:999;font-size:.85rem;max-width:90vw;text-align:center';n.textContent=msg;document.body.appendChild(n);setTimeout(()=>n.remove(),5000); }

  function saveRun() {
    try {
      if (!_g || !_g.run) return;
      const r = _g.run;
      const serialized = {
        day: r.day,
        background: r.background,
        energy: r.energy,
        maxEnergy: r.maxEnergy,
        stats: {...r.stats, buzzwords: [...(r.stats.buzzwords || [])]},
        activeLeads: r.activeLeads,
        feed: r.feed,
        log: r.log,
        flags: {...r.flags},
        permaPlayedCards: [...(r.permaPlayedCards || [])],
        seed: r.seed,
        won: r.won,
        offers: r.offers,
        _dailyClout: r._dailyClout,
        _postsMadeToday: r._postsMadeToday,
        _prevStats: r._prevStats,
        _prevFlags: r._prevFlags,
        version: 1,
      };
      localStorage.setItem(RUN_KEY, JSON.stringify(serialized));
    } catch(e) {}
  }

  function loadRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY);
      if (!raw) return null;
      const r = JSON.parse(raw);
      if (!r || !r.version) return null;
      return r;
    } catch(e) { return null; }
  }

  function clearRun() {
    try { localStorage.removeItem(RUN_KEY); } catch(e) {}
  }

  function applyRun(saved) {
    if (!_g || !saved) return;
    const r = _g.run;
    r.day = saved.day || 1;
    r.background = saved.background || '';
    r.energy = saved.energy ?? 3;
    r.maxEnergy = saved.maxEnergy || 3;
    r.stats = Object.assign({rent:100,hope:50,credibility:50,clout:0,atsFavor:10,robotSuspicion:100,humanContact:5,buzzwords:[],scamEvidence:0,ghostEvidence:0,scamsFell:0}, saved.stats || {});
    r.stats.buzzwords = saved.stats?.buzzwords || [];
    r.activeLeads = saved.activeLeads || [];
    r.feed = saved.feed || [];
    r.log = saved.log || [];
    r.flags = Object.assign({easyApplyCount:0,ghostsExposed:0,scamsReported:0,consecutiveGhosts:0,applicationsSubmitted:0,leadsGhosted:0,leadsGhostedRun:0,bossFightActive:false,bossFightWon:false,bossFightWonFirstTry:false,recruiterTypes:0,maxFinalInterviews:0,cloutGainToday:0,agreeViral:0,offerDay:0,maxClout:0,maxRobotSusp:0,minRobotSusp:100,minHopeRun:100,maxActiveLeads:0,portalApps:0,takeHomeApps:0,referralUsed:false,referralSaved:false,noRecruiterTomorrow:false,recruiterDoubled:false,unicornSeen:false,repostExposed:false,totalAtsLoss:0,scamsReceived:0,autoRejected:0,salaryCryptid:0,offersTurnedDown:0,firstEasyApplyDay:0,touchGrassCount:0,cringePostCount:0,formsCompleted:0,viralPosts:0,maxConsecutiveGhosts:0}, saved.flags || {});
    r.permaPlayedCards = new Set(saved.permaPlayedCards || []);
    r.seed = saved.seed || Date.now();
    r.won = saved.won || null;
    r.offers = saved.offers || [];
    r._dailyClout = saved._dailyClout || 0;
    r._postsMadeToday = saved._postsMadeToday || 0;
    r._prevStats = saved._prevStats || null;
    r._prevFlags = saved._prevFlags || null;
    _rng = _g._rng = DATA.mulberry32(r.seed);
  }

  function hasRun() { return !!loadRun(); }

  function showToast(msg, type) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* Card pool helpers */
  function weightedPool(pool, state) {
    const g = _g;
    let total = 0;
    const items = pool.filter(c => {
      if (c.permaPlayed && g.run.permaPlayedCards && g.run.permaPlayedCards.has(c.id)) return false;
      if (c.conditions) {
        for (const cond of c.conditions) {
          if (g.run.stats[cond.stat] < cond.min) return false;
        }
      }
      let w = c.weight || 1;
      if (c.category === 'recruiter' && g.run.flags.recruiterDoubled) w *= 2;
      if (c.category === 'recruiter' && g.run.flags.noRecruiterTomorrow) w = 0;
      if (c.isUnicorn) w *= (g.run.flags.unicornSeen ? 0 : 1);
      total += w;
      return w > 0;
    });
    if (total <= 0) return [];
    const picks = [];
    const remaining = [...items];
    let r = remaining.length;
    const count = Math.min(r, DATA.rInt(4, 6, _rng));
    for (let i = 0; i < count && remaining.length > 0; i++) {
      let t = 0;
      for (const c of remaining) t += (c.weight || 1);
      let roll = _rng() * t;
      for (let j = 0; j < remaining.length; j++) {
        roll -= (remaining[j].weight || 1);
        if (roll <= 0) { picks.push(remaining.splice(j,1)[0]); break; }
      }
      if (picks.length <= i) picks.push(remaining.pop());
    }
    return picks;
  }

  /**
   * Draw a new set of cards for the current day's feed.
   * Samples from weighted pools (job, recruiter, post, network, resume,
   * investigate, rest, gig) based on player stats and background.
   * Career Goblin gets +1 extra card. ~15% chance of event card.
   * @returns {void} Sets g.run.feed to the new card array.
   */
  function drawFeed() {
    const g = _g;
    const bg = g.run.background;
    /* Combine all pools and draw 4-6 cards total */
    const jobPool = DATA.POOLS.job.filter(c => !(c.id === 'boss-fight' && _g.run.flags.bossFightDone));
    const combinedPool = [
      ...jobPool.map(c => ({...c, _pool:'job'})),
      ...DATA.POOLS.recruiter.map(c => ({...c, _pool:'recruiter'})),
      ...DATA.POOLS.post.map(c => ({...c, _pool:'post'})),
      ...DATA.POOLS.network.map(c => ({...c, _pool:'network'})),
      ...DATA.POOLS.resume.map(c => ({...c, _pool:'resume'})),
      ...DATA.POOLS.investigate.map(c => ({...c, _pool:'investigate'})),
      ...DATA.POOLS.rest.map(c => ({...c, _pool:'rest'})),
      ...DATA.POOLS.gig.map(c => ({...c, _pool:'gig'})),
    ];
    let cards = weightedPool(combinedPool, g);

    /* Extra card for career goblin */
    if (bg === 'career-goblin') {
      const extras = weightedPool(combinedPool, g);
      if (extras.length) cards.push({...extras[0], _pool:extras[0]._pool});
    }

    /* Event cards (15% chance) */
    if (_rng() < 0.15) {
      const evPool = DATA.POOLS.event;
      const evCard = DATA.pick(evPool, _rng);
      if (evCard) {
        const evt = {id:evCard.id+'_'+Date.now(), ...evCard, _pool:'event'};
        if (evCard.isBoss) g.run.flags.bossFightTriggered = true;
        cards.push(evt);
      }
    }

    g.run.feed = cards;

    /* Track salary cryptid encounter for achievements */
    if (cards.some(c => c.id === 'salary-cryptid')) g.run.flags.salaryCryptid = 1;
  }

  /* Lead creation */
  function createLead(card) {
    const g = _g;
    const comp = DATA.genComp();
    const role = DATA.pick(DATA.JOBS, _rng);
    const isReal = _rng() < card.effects[0].real;
    let ghostChance = card.effects[0].ghostChance || 0.25;
    let scamChance = card.effects[0].scamChance || 0;
    let atsThreshold = card.effects[0].ats || 30;

    if (g.run.flags.consecutiveGhosts >= 5) ghostChance -= 0.3;

    const stageIdx = g.run.stats.humanContact > 10 ? 1 : 0;
    const lead = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
      company: comp, role, isReal, ghostChance: Math.min(1,ghostChance), scamChance: Math.min(1,scamChance),
      atsThreshold, daysSinceUpdate: 0, stageIdx, history:[{day:g.run.day,text:'Applied'}],
      pay: card.pay || '$???', source: card.cost && card.cost.energy === 0 ? 'easy-apply' : 'job-board',
      finalCount: 0, stalled: false,
      /* New follow-up progression fields */
      track: generateLeadTrack(_rng),
      followUpsThisStage: 0,
      finalInterviewCount: 0,
      signals: { salaryDisclosed:false, realRecruiter:false, portfolioReviewed:false, referenceTrouble:false },
    };
    g.run.activeLeads.push(lead);
    return lead;
  }

  function generateLeadTrack(rng) {
    const t = ['waiting'];
    if (rng() < 0.60) t.push('auto-reply');
    if (rng() < 0.35) t.push('screening-form');
    if (rng() < 0.70) t.push('recruiter-screen');
    if (rng() < 0.50) t.push('video-interview');
    if (rng() < 0.30) t.push('personality-test');
    if (rng() < 0.40) t.push('take-home');
    if (rng() < 0.45) t.push('salary-stall');
    if (rng() < 0.60) t.push('panel-interview');
    if (rng() < 0.35) t.push('reference-checks');
    t.push('final-interview-1');
    if (rng() < 0.50) t.push('final-interview-2');
    if (rng() < 0.30) t.push('final-interview-3');
    if (rng() < 0.75) t.push('offer-pending');
    return t;
  }

 /* Apply handlers */
  /**
   * Apply a card effect: consume energy (if any), mutate stats, create leads,
   * trigger sub-mechanisms (captcha, video interview, boss fight, PA), and
   * log outcomes. This is the central effect dispatcher for all card actions.
   * @param {object} card - The card object from the feed.
   * @param {object} effect - The button's effect config (effect name, cost, stat deltas).
   * @returns {void}
   */
  function applyCard(card, effect) {
    const g = _g;
    /* Discard/ignore/decline buttons cost no energy */
    if (effect.effect === 'discard') {
      /* no energy cost, no stat changes */
    } else {
      snapStats();
      const cost = effect.cost || {energy:1};
      const eCost = cost.energy != null ? cost.energy : 1;
      if (g.run.energy < eCost) return;
      g.run.energy -= eCost;
      snapStats();
    }

    if (effect.effect === 'apply' || effect.effect === 'applyCareful') {
      snapStats();
      if (effect.effect === 'applyCareful') {
        const beforeAts = g.run.stats.atsFavor || 0;
        g.run.stats.atsFavor = DATA.clamp(g.run.stats.atsFavor - 2, 0, 100);
        const afterAts = g.run.stats.atsFavor;
        const atsLoss = beforeAts - afterAts;
        if (atsLoss > 0) g.run.flags.totalAtsLoss = (g.run.flags.totalAtsLoss || 0) + atsLoss;
      }
      createLead(card);
      track('applicationsSubmitted', 1);
      if (effect.effect === 'applyCareful') { g.run.stats.credibility = DATA.clamp(g.run.stats.credibility + 2, 0, 100); }
      pushLog(g.run.day, `Applied to ${card.title || 'a job'}`);
    } else if (effect.effect === 'applyEasy' || effect.effect === 'applyDesperate') {
      snapStats();
      g.run.stats.robotSuspicion = DATA.clamp(g.run.stats.robotSuspicion - (effect.effect === 'applyDesperate' ? 3 : 1), 0, 100);
      g.run.flags.easyApplyCount = (g.run.flags.easyApplyCount || 0) + 1;
      g.run.flags.firstEasyApplyDay = g.run.flags.firstEasyApplyDay || g.run.day;
      createLead(card);
      track('applicationsSubmitted', 1);
      pushLog(g.run.day, effect.effect === 'applyDesperate' ? 'Desperately hit mass apply. Sus -3.' : 'Easy Applied. Sus -1.');
    } else if (effect.effect === 'fiverrGig') {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 15, 0, 9999);
      pushLog(g.run.day, 'Did a Fiverr gig. $15 earned. Your soul: devalued.');
    } else if (effect.effect === 'uberGig') {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 20, 0, 9999);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) - 3, 0, 100);
      pushLog(g.run.day, 'Drove for rideshare. Made $20. The passenger cried. You did not.');
    } else if (effect.effect === 'userTest') {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 10, 0, 9999);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 2, 0, 100);
      pushLog(g.run.day, 'Did user testing. $10 earned. You felt seen. For 10 minutes.');
    } else if (effect.effect === 'dataEntry') {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 12, 0, 9999);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) - 5, 0, 100);
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor || 0) + 2, 0, 100);
      pushLog(g.run.day, 'Data entry marathon. $12 earned. 10,000 rows later, a script replaced you.');
    } else if (effect.effect === 'consulting') {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent || 0) + 50, 0, 9999);
      g.run.stats.humanContact = DATA.clamp((g.run.stats.humanContact || 0) + 3, 0, 999);
      pushLog(g.run.day, 'Consulting call. $50 earned. You sold "digital transformation" to a guy who uses Windows 7.');
      exposeGhost();
    } else if (effect.effect === 'investigate') {
      snapStats();
      g.run.stats.robotSuspicion = DATA.clamp(g.run.stats.robotSuspicion + 1, 0, 100);
      g.run.stats.hope = DATA.clamp(g.run.stats.hope + 2, 0, 100);
      pushLog(g.run.day, 'Investigated red flags. Found more red flags.');
      if (card.id === 'reposted') g.run.flags.repostExposed = true;
    } else if (effect.effect === 'reportScam') {
      snapStats();
      g.run.stats.scamEvidence = DATA.clamp((g.run.stats.scamEvidence || 0) + 1, 0, 100);
      g.run.flags.scamsReported = (g.run.flags.scamsReported || 0) + 1;
      track('scamsReported', 1);
      pushLog(g.run.day, 'Reported a scam to Linkfluence. They said "we\'ll look into it." They won\'t.');
    } else if (effect.effect === 'applyTokens') {
      snapStats();
      g.run.stats.clout = DATA.clamp((g.run.stats.clout || 0) + 5, 0, 1000);
      g.run.stats.buzzwords = g.run.stats.buzzwords || [];
      g.run.stats.buzzwords.push(DATA.pick(DATA.BUZZWORDS, _rng));
      if (g.run.stats.buzzwords.length > 50) g.run.stats.buzzwords.splice(50);
      createLead(card);
      pushLog(g.run.day, 'Buzzword injection successful. Clout increased. Soul decreased.');
    } else if (effect.effect === 'addAI') {
      snapStats();
      g.run.stats.buzzwords = g.run.stats.buzzwords || [];
      g.run.stats.buzzwords.push('AI');
      if (g.run.stats.buzzwords.length > 50) g.run.stats.buzzwords.splice(50);
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor || 0) + 3, 0, 100);
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion || 0) + 5, 0, 100);
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility || 0) - 2, 0, 100);
      pushLog(g.run.day, 'Added "AI" to everything. The Bot Aura is pleased. Humans are not.');
    } else if (effect.effect === 'applyPortal') {
      snapStats();
      track('portalApps', 1);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) - 3, 0, 100);
      createLead(card);
      pushLog(g.run.day, 'Workday portal entered. Hope decreased. You may never leave.');
    } else if (effect.effect === 'applyTH') {
      snapStats();
      track('takeHomeApps', 1);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) - 5, 0, 100);
      createLead(card);
      pushLog(g.run.day, 'Did the unpaid take-home assignment. You built a todo list. They wanted Slack.');
    } else if (effect.effect === 'negotiateRemote') {
      snapStats();
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 3, 0, 100);
      createLead(card);
      pushLog(g.run.day, 'Negotiated remote work. They said "hybrid." You said "remote." They said "we\'ll see."');
    } else if (effect.effect === 'askPTO') {
      snapStats();
      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + 5, 0, 100);
      createLead(card);
      pushLog(g.run.day, 'Asked about PTO. They said "we have unlimited PTO." You asked "can I use it now?" They went silent.');
    } else if (effect.effect === 'askUSD') {
      snapStats();
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility || 0) + 2, 0, 100);
      createLead(card);
      pushLog(g.run.day, 'Asked about US diversity programs. They said "we value everyone." They value nobody.');
    } else if (effect.effect === 'askCity') {
      snapStats();
      const city = DATA.pick(DATA.CITIES, _rng);
      pushLog(g.run.day, `Asked about relocation. They said "${city}". You've never heard of it.`);
    } else if (effect.effect === 'applyPipeline') {
      snapStats();
      /* Evergreen = instant ghost */
      pushLog(g.run.day, 'Applied to the evergreen pipeline. There is no pipeline. There is only void.');
      track('ghostsExposed', 1);
      track('ghostsExposedLifetime', 1);
      g.run.stats.ghostEvidence = DATA.clamp((g.run.stats.ghostEvidence || 0) + 1, 0, 100);
      g.run.flags.consecutiveGhosts = (g.run.flags.consecutiveGhosts || 0) + 1;
    } else if (effect.effect === 'exposeGhost') {
      exposeGhost();
    } else if (effect.effect === 'discard') {
      /* Do nothing */
    } else if (effect.effect === 'bulkApply') {
      const count = effect.count || 5;
      for (let i = 0; i < count; i++) {
        if (g.run.energy > 0) {
          const lead = {
            id:'lead_bulk_'+i+'_'+Date.now(), company:DATA.genComp(), role:DATA.pick(DATA.JOBS,_rng),
            isReal:false, ghostChance:0.9, scamChance:0, atsThreshold:5, daysSinceUpdate:0, stageIdx:0,
            history:[{day:g.run.day,text:'Mass Applied'}], pay:'Your dignity', source:'easy-apply', finalCount:0, stalled:false
          };
          g.run.activeLeads.push(lead);
        }
      }
      snapStats();
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0)+5,0,100);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-3,0,100);
      track('applicationsSubmitted', count);
      pushLog(g.run.day, `Mass-applied to ${count} jobs. Your résumé now weeps.`);
    } else if (effect.effect === 'bossFight') {
      startBossFight();
    } else if (effect.effect === 'postThis') {
      processPost(card);
    } else if (effect.effect === 'postSincere') {
      processPost(card);
    }    else if (effect.effect === 'postCringe') {
      g.run.flags.cringePostCount = (g.run.flags.cringePostCount || 0) + 1;
      snapStats();
      card.effects.forEach(e => { if(e.clout) g.run.stats.clout = DATA.clamp((g.run.stats.clout||0)+e.clout*.5,0,1000); if(e.cred) g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0)+e.cred,0,100); });
      pushLog(g.run.day, 'Posted cringey content. The algorithm punished you.');
    } else if (effect.effect === 'postViral') {
      g.run.flags.cringePostCount = (g.run.flags.cringePostCount || 0) + 1;
      processPost(card);
    } else if (effect.effect === 'postBait') {
      g.run.flags.cringePostCount = (g.run.flags.cringePostCount || 0) + 1;
      processPost(card);
    } else if (effect.effect === 'postAgree') {
      g.run.flags.cringePostCount = (g.run.flags.cringePostCount || 0) + 1;
      processPost(card);
    } else if (effect.effect === 'postGood') {
      processPost(card);
    } else if (effect.effect === 'postSlowBurn') {
      processPost(card);
    } else if (effect.effect === 'postCarousel') {
      processPost(card);
    } else if (effect.effect === 'networkGo') { processNetwork(card); }
    else if (effect.effect === 'sendDM') { processNetwork(card); }
    else if (effect.effect === 'endorse') { processNetwork(card); }
    else if (effect.effect === 'congrats') { processNetwork(card); }
    else if (effect.effect === 'slideIn') { processNetwork(card); }
    else if (effect.effect === 'useReferral') { processReferral(); }
    else if (effect.effect === 'slackHang') { processNetwork(card); }
    else if (effect.effect === 'mentorMeet') { processNetwork(card); }
    else if (effect.effect === 'keywordStuff') { processResume(card); }
    else if (effect.effect === 'rewriteBullets') { processResume(card); }
    else if (effect.effect === 'addAI') { processResume(card); }
    else if (effect.effect === 'certComplete') { processResume(card); }
    else if (effect.effect === 'buildPortfolio') { processResume(card); }
    else if (effect.effect === 'plainText') { processResume(card); }
    else if (effect.effect === 'writeCover') { processResume(card); }
    else if (effect.effect === 'aiCover') { processResume(card); }
    else if (effect.effect === 'lieYears') { processResume(card); }
    else if (effect.effect === 'touchGrass') { processRest(card); }
    else if (effect.effect === 'deleteApp') { processRest(card); }
    else if (effect.effect === 'therapy') { processRest(card); }
    else if (effect.effect === 'cookMeal') { processRest(card); }
    else if (effect.effect === 'orderFood') { processRest(card); snapStats(); g.run.stats.rent = DATA.clamp((g.run.stats.rent||0)-25,0,9999); pushLog(g.run.day, 'Ordered food. $25 gone. At least it was cold.'); }
    else if (effect.effect === 'eatCereal') { processRest(card); }
    else if (effect.effect === 'sleep') { processRest(card); }
    else if (effect.effect === 'doomscroll') {
      snapStats();
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-5,0,100);
      pushLog(g.run.day, 'Doomscrolled instead of sleeping. Hope -5.');
    } else if (effect.effect === 'recruitReply') {
      snapStats();
      const roll = _rng();
      if (roll < 0.3) { g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)+5,0,100); g.run.stats.humanContact = DATA.clamp((g.run.stats.humanContact||0)+1,0,999); pushLog(g.run.day, 'A recruiter actually replied! "Great fit! Send resume!" ... then ghosted.'); }
      else if (roll < 0.6) { g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-3,0,100); pushLog(g.run.day, 'Recruiter reply was just a template. "We are pleased to inform you..." pleased with whom?'); }
      else if (roll < 0.8) { g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0)+2,0,100); pushLog(g.run.day, 'Recruiter asked for your SSN. You politely declined. They blocked you.'); }
      else { g.run.stats.clout = DATA.clamp((g.run.stats.clout||0)+3,0,999); pushLog(g.run.day, 'The recruiter liked your profile picture. Clout +3.'); }
    } else if (effect.effect === 'recruitBlock') {
      pushLog(g.run.day, 'Blocked a recruiter. Feels good. Makes you feel smaller.');
    } else if (effect.effect === 'recruitCall') {
      snapStats();
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-2,0,100);
      pushLog(g.run.day, 'Scheduled a "quick 15-min call." It will be 45 minutes and involve a PowerPoint.');
    } else if (effect.effect === 'sendSSN') {
      snapStats();
      g.run.stats.scamsFell = (g.run.stats.scamsFell||0)+1;
      g.run.flags.scamsReceived = (g.run.flags.scamsReceived||0) + 1;
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-15,0,100);
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0)-200,0,9999);
      pushLog(g.run.day, 'Sent your SSN to a scammer. They said "Thank you, dear!" and disappeared.');
    } else if (effect.effect === 'acceptCheck') {
      snapStats();
      g.run.stats.scamsFell = (g.run.stats.scamsFell||0)+1;
      g.run.flags.scamsReceived = (g.run.flags.scamsReceived||0) + 1;
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0)-100,0,9999);
      pushLog(g.run.day, 'Accepted the check deposit scam. The check bounced. You owe $500.');
    } else if (effect.effect === 'reverseImg') {
      snapStats();
      g.run.stats.scamEvidence = DATA.clamp((g.run.stats.scamEvidence||0)+1,0,100);
      pushLog(g.run.day, 'Reverse image search confirmed: the recruiter is a stock photo model named "Anna." Scam Evidence +1.');
    } else if (effect.effect === 'glassbore') {
      pushLog(g.run.day, 'Checked Glassbore. Review: "4 stars, would be PIPped again." - Current Employee');
    } else if (effect.effect === 'askSalary') {
      snapStats();
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)+5,0,100);
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0)+3,0,100);
      pushLog(g.run.day, 'Asked for salary range. The recruiter said "competitive." You said "I\'ll take that."');
    } else if (effect.effect === 'declineUnpaid') {
      snapStats();
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0)+5,0,100);
      pushLog(g.run.day, 'Declined the unpaid take-home. The hiring manager said "We respect boundaries." They did not.');
    } else if (effect.effect === 'saveReferral') {
      g.run.flags.referralSaved = true;
      pushLog(g.run.day, 'Saved the referral for later. It may never be used. Like your hopes.');
    } else if (effect.effect === 'algChange') {
      /* Effects already applied */
    } else if (effect.effect === 'layoffWave') { /* effects applied */ }
    else if (effect.effect === 'profileViewed') { /* effects applied */ }
    else if (effect.effect === 'ceoFamily') { /* effects applied */ }
    else if (effect.effect === 'rolePaused') { /* effects applied */ }
    else if (effect.effect === 'finalInterview') { /* effects applied */ }
    else if (effect.effect === 'hiringPTO') { /* effects applied */ }
    else if (effect.effect === 'massLayoffs') { /* effects applied */ }
    else if (effect.effect === 'friendHired') { /* effects applied */ }
    else if (effect.effect === 'vibesShift') { /* effects applied */ }
    else if (effect.effect === 'discard') {
      pushLog(g.run.day, 'Skipped past another opportunity. The void appreciates your time.');
    } else if (effect.effect === 'captchaEvent') { startCaptcha(); }
    else if (effect.effect === 'paEvent') { startPA(); }
    else if (effect.effect === 'videoInterview') { startVideoInterview(); }
    else if (effect.effect === 'nothing') {
      if (_rng() > (effect.chance||0)) {
        pushLog(g.run.day, '...nothing happened. The recruiter never replied. Classic.');
      }
    }
    saveRun();
  }

  function processPost(card) {
    const g = _g;
    snapStats();
    g.run.stats.clout = DATA.clamp((g.run.stats.clout||0) + 10, 0, 1000);
    g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) - 2, 0, 100);
    if (card.effects && card.effects[0].viral && _rng() < card.effects[0].viral) {
      g.run.flags.viralPosts = (g.run.flags.viralPosts || 0) + 1;
      g.run.stats.clout = DATA.clamp((g.run.stats.clout||0) + 25, 0, 1000);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 10, 0, 100);
      pushLog(g.run.day, 'Your post went VIRAL. 14k reactions. 12k of them are bots. 2k are recruiters.');
      track('viralPosts', 1);
      if (card.effects[0].agree) track('agreeViral', 1);
    } else {
      pushLog(g.run.day, 'Posted on Linkfluence. Got 3 likes. 1 is from your mom.');
    }
  }

  function processNetwork(card) {
    const g = _g;
    snapStats();
    g.run.stats.humanContact = DATA.clamp((g.run.stats.humanContact||0) + 2, 0, 999);
    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 2, 0, 100);
    pushLog(g.run.day, 'Connected with a human. They liked your post. The circle of life.');
  }

  function processReferral() {
    const g = _g;
    snapStats();
    g.run.flags.referralUsed = true;
    g.run.stats.humanContact = DATA.clamp((g.run.stats.humanContact||0) + 3, 0, 999);
    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 5, 0, 100);
    pushLog(g.run.day, 'Used a referral! Your friend\'s cousin\'s friend works there. Bot Aura has been bypassed.');
  }

  function processResume(card) {
    const g = _g;
    snapStats();
    if (card.id === 'keyword-stuff') {
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 8, 0, 100);
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0) - 5, 0, 100);
      if ((g.run.stats.credibility||0) < 5) g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) - 5, 0, 100);
      pushLog(g.run.day, 'Keyword-stuffed your résumé. Bot Aura loves it. Your soul weeps.');
    } else if (card.id === 'rewrite-bullets') {
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 5, 0, 100);
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + 5, 0, 100);
      pushLog(g.run.day, 'Rewrote bullets as impact metrics. "Increased synergy by 40% YoY."');
    } else if (card.id === 'add-ai') {
      g.run.stats.buzzwords = g.run.stats.buzzwords || [];
      g.run.stats.buzzwords.push('AI');
      if (g.run.stats.buzzwords.length > 50) g.run.stats.buzzwords.splice(50);
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 3, 0, 100);
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0) - 8, 0, 100);
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) - 2, 0, 100);
      pushLog(g.run.day, 'Added "AI" to everything. Bot Aura is pleased. Humans flee.');
    } else if (card.id === 'certificate') {
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 4, 0, 100);
      g.run.stats.clout = DATA.clamp((g.run.stats.clout||0) + 3, 0, 999);
      pushLog(g.run.day, 'Completed "AI for Business Leaders: A Beginner\'s Guide to Nothing."');
    } else if (card.id === 'portfolio') {
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + 8, 0, 100);
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 5, 0, 100);
      pushLog(g.run.day, 'Built a portfolio project. Real code. Real credibility. Real time wasted.');
    } else if (card.id === 'plain-text') {
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0) + 5, 0, 100);
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 3, 0, 100);
      pushLog(g.run.day, 'Cleaned up résumé to plain text. Looks like a crime report. Bot Aura happy.');
    } else if (card.id === 'cover-letter') {
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + 3, 0, 100);
      pushLog(g.run.day, 'Wrote a genuine cover letter. Not AI-generated. How brave.');
    } else if (card.id === 'aiCover') {
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0) - 5, 0, 100);
      pushLog(g.run.day, 'Used AI to write a cover letter about being authentic. The irony is lost on the Bot Aura.');
    } else if (card.id === 'lie-years') {
      g.run.stats.atsFavor = DATA.clamp((g.run.stats.atsFavor||0) + 10, 0, 100);
      g.run.stats.robotSuspicion = DATA.clamp((g.run.stats.robotSuspicion||0) - 8, 0, 100);
      pushLog(g.run.day, 'Lied about experience. The Bot Aura is happy. The background check is not.');
    }
  }

  function processRest(card) {
    const g = _g;
    snapStats();
    if (card.id === 'touch-grass') {
      g.run.flags.touchGrassCount = (g.run.flags.touchGrassCount || 0) + 1;
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 18, 0, 100);
      pushLog(g.run.day, 'Touched grass. It was green. You forgot what green looked like.');
    } else if (card.id === 'delete-app') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 25, 0, 100);
      g.run.flags.noRecruiterTomorrow = true;
      pushLog(g.run.day, 'Deleted the app. For one day. Tomorrow you\'ll reinstall it. You always do.');
    } else if (card.id === 'therapy') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 35, 0, 100);
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0) - 30, 0, 9999);
      pushLog(g.run.day, 'Therapy session. Therapist: "The job market isn\'t a personal attack." You: "That\'s... helpful."');
    } else if (card.id === 'cookMeal') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 7, 0, 100);
      pushLog(g.run.day, 'Cooked a real meal. It tasted like... not sadness.');
    } else if (card.id === 'eatCereal') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 2, 0, 100);
      pushLog(g.run.day, 'Ate cereal for dinner. The cereal was cold. Just like your prospects.');
    } else if (card.id === 'sleep') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 3, 0, 100);
      pushLog(g.run.day, 'Slept. The only thing the job market hasn\'t figured out how to monetize.');
    }
  }

  function exposeGhost() {
    const g = _g;
    snapStats();
    g.run.stats.ghostEvidence = DATA.clamp((g.run.stats.ghostEvidence||0) + 1, 0, 100);
    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 3, 0, 100);
    g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + 2, 0, 100);
    g.run.flags.ghostsExposed = (g.run.flags.ghostsExposed||0) + 1;
    track('ghostsExposed', 1);
    track('ghostsExposedLifetime', 1);
    pushLog(g.run.day, 'Exposed a ghost job! The listing had been open since the invention of dial-up.');
  }

  /* Lead progression at end of day */
  /**
   * Resolve active leads: advance stages, process ghosts, scams, and offers.
   * Each lead progresses every 3-4 days based on Bot Aura threshold and stage.
   * Auto-ghosts after 7 days without advancement. Triggers achievement tracking.
   * @returns {void} Mutates g.run.activeLeads and g.run.log.
   */
  function resolveLeads() {
    const g = _g;
    const offers = [];

    for (let i = g.run.activeLeads.length - 1; i >= 0; i--) {
      const lead = g.run.activeLeads[i];
      lead.daysSinceUpdate++;

      if (lead.daysSinceUpdate >= 8) {
        finishLead(lead, 'ghosted', `${lead.company} hasn't responded in over a week. The trail has gone cold.`);
      }
    }

    if (g.run.offers && g.run.offers.length) {
      offers.push(...g.run.offers);
      g.run.offers = [];
    }

    return { offers, logs: [] };
  }

  function advanceDay() {
    const g = _g;
    g.run.day++;
    g.run.energy = g.run.maxEnergy;
    pushLog(g.run.day, `☀️ Day ${g.run.day} begins.`);

    /* Weekly rent */
    if (g.run.day % 5 === 0 && g.run.day > 0) {
      snapStats();
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0) - 25, 0, 9999);
      pushLog(g.run.day, '💸 Rent due! -$25. The landlord does not accept "vibes" as payment.');
    }

    /* Check loss conditions BEFORE sleep recovery (hope=0 game over must trigger first) */
    const loss = checkLosses();
    if (loss) return { type:'loss', ending:loss };

    /* Sleep recovery */
    snapStats();
    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 3, 0, 100);
    pushLog(g.run.day, '☕ Slept. Hope recovered slightly.');

    /* Buzzword penalty */
    if (g.run.stats.buzzwords && g.run.stats.buzzwords.length > 10) {
      snapStats();
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) - (g.run.stats.buzzwords.length - 10), 0, 100);
      pushLog(g.run.day, `🤖 Buzzword overload (${g.run.stats.buzzwords.length} buzzwords). Credibility hit by ${g.run.stats.buzzwords.length - 10}.`);
    }

    /* Check win conditions */
    const win = checkWins();
    if (win) return { type:'win', ending:win };

    /* Check day 30 */
    if (g.run.day > 30) {
      const hasFinalLeads = (g.run.activeLeads||[]).some(l => l.stageIdx >= 6);
      return { type:'loss', ending: hasFinalLeads ? 'final-round-end' : 'times-up-end' };
    }

  saveRun();
    return null;
  }

  /**
     * Check all loss conditions. Returns the ending key if a loss is triggered,
     * or null if the run continues. Checks rent, hope, credibility,
     * robot suspicion, scams felled, resume black hole, and Bot Aura ate résumé.
     * @returns {string|null} Ending key if lost, null otherwise.
   */
  function checkLosses() {
    const g = _g;
    const s = g.run.stats;
    if (s.rent <= 0) return 'rent-end';
    if (s.hope <= 0) return 'doomscroll-end';
    if (s.credibility <= 0) return 'culture-fit';
    if (s.robotSuspicion <= 0) return 'ai-detected';
    if ((s.scamsFell||0) >= 3) return 'kindly-end';

    /* Résumé Black Hole: 50+ apps, no human contact */
    if ((g.run.flags.applicationsSubmitted||0) >= 50 && (s.humanContact||0) < 5) return 'resume-bh-end';

    /* Bot Aura Ate Résumé: catastrophic Bot Aura loss */
    if ((g.run.stats.atsFavor||0) <= 0 && g.run.activeLeads.length > 0) return 'ats-ate-end';

    return null;
  }

  /**
   * Check all win conditions. Returns the ending key if a win is triggered,
   * or null if the run continues. Checks for offers, ghost vigante, scam
   * the scammers, thought leader, prompt engineer, and quiet win endings.
   * @returns {string|null} Ending key if won, null otherwise.
   */
  function checkWins() {
    const g = _g;
    const s = g.run.stats;
    const flags = g.run.flags;

    /* Check if there are any offers in active leads (shouldn't be, since offers remove leads) */
    /* Actually offers are handled in resolveLeads and tracked separately */
    if (g.run.offers && g.run.offers.length > 0) {
      /* Determine ending type from offer */
      if (flags.referralUsed) return 'human-referral';
      if (s.humanContact >= 50 && (flags.easyApplyCount||0) === 0) return 'network-wizard';
      if ((s.buzzwords||[]).length >= 15) return 'founder-mode-end';
      return 'just-hired';
    }

    /* Ghost Job Vigilante */
    if ((s.ghostEvidence||0) >= 25) return 'ghost-vig-end';

    /* Scam the Scammers */
    if ((s.scamEvidence||0) >= 10) return 'scam-scammers';

    /* Thought Leader */
    if ((s.clout||0) >= 500 && (s.credibility||0) >= 30) return 'thought-leader';

    /* Prompt Engineer */
    if ((s.buzzwords||[]).filter(b => b === 'AI').length >= 8) return 'prompt-eng-end';

    /* Quiet Win: survived 30 days with reasonable stats */
    if (g.run.day > 30 && (s.hope||0) > 20) return 'quiet-win-end';

    return null;
  }

  /* Achievement tracking */
  function track(key, val) {
    _g.run.flags[key] = ((_g.run.flags[key]) || 0) + val;
  }

  function checkAchievements() {
    const g = _g;
    const s = g.run.stats;
    const f = g.run.flags;
    const newUnlocks = [];

    const checks = [
      {id:'win-job', check: () => g.run.won === 'just-hired'},
      {id:'robot-said-no', check: () => (f.autoRejected||0) >= 10},
      {id:'resume-bh', check: () => (f.leadsGhostedRun||0) >= 15},
      {id:'open-scams', check: () => (f.scamsReceived||0) >= 10},
      {id:'salary-crypt', check: () => (f.salaryCryptid||0) >= 1},
      {id:'net-kpis', check: () => g.run.won === 'human-referral'},
      {id:'prompt-eng', check: () => g.run.won === 'prompt-eng-end'},
      {id:'final-v7', check: () => (f.maxFinalInterviews||0) >= 4},
      {id:'repost-antiq', check: () => f.repostExposed},
      {id:'one-click', check: () => (f.easyApplyCount||0) >= 20},
      {id:'ghostbuster', check: () => (f.ghostsExposed||0) >= 10},
       {id:'parser-ate', check: () => (f.totalAtsLoss||0) >= 30},
       {id:'ghost-vig', check: () => _meta.lifetime.ghostsExposed >= 25},
      {id:'kindly-champ', check: () => (f.scamsReported||0) >= 5},
      {id:'workday-warr', check: () => (f.portalApps||0) >= 10},
      {id:'humbled-hon', check: () => (f.cloutGainToday||0) >= 100},
      {id:'agree-ach', check: () => (f.agreeViral||0) >= 1},
      {id:'quiet-win', check: () => g.run.won === 'quiet-win-end'},
      {id:'founder-mode', check: () => (s.buzzwords||[]).length >= 15},
      {id:'reformed-inf', check: () => (s.clout||0) >= 200},
      {id:'circle-back', check: () => (f.maxActiveLeads||0) >= 8},
      {id:'no-takehomes', check: () => g.run.won === 'just-hired' && (f.takeHomeApps||0) === 0},
      {id:'pure-human', check: () => g.run.won === 'just-hired' && (f.minRobotSusp||100) >= 80},
      {id:'pure-robot', check: () => g.run.won === 'just-hired' && (s.atsFavor||0) >= 90 && (f.maxRobotSusp||0) <= 20},
      {id:'recruiter-bingo', check: () => (f.recruiterTypes||0) >= 5},
      {id:'30-days', check: () => g.run.day >= 30},
      {id:'first-round', check: () => (f.offerDay||0) > 0 && f.offerDay <= 10},
      {id:'speedrun-app', check: () => (f.applicationsSubmitted||0) >= 50 && g.run.day <= 5},
     {id:'touch-grass-s', check: () => g.run.won && (f.minHopeRun||100) >= 50},
        {id:'touch-crypt', check: () => _meta.lifetime.cryptidRuns >= 3},
       {id:'good-morning', check: () => _meta.lifetime.morningEvents >= 10},
       {id:'right-thing', check: () => (f.rightThing||0) >= 1},
       {id:'mom-knows', check: () => (f.momCalls||0) >= 3},
      ];

    for (const ach of checks) {
      if (!_meta.achievements[ach.id] && ach.check()) {
        _meta.achievements[ach.id] = true;
        newUnlocks.push(ach);
        unlockAchievement(ach.id);
      }
    }

    /* Background unlocks */
    if (!_meta.unlockedBg.includes('reformed-influencer') && (f.maxClout||0) >= 200) {
      _meta.unlockedBg.push('reformed-influencer');
    }
    if (!_meta.unlockedBg.includes('ghost-vigilante') && _meta.lifetime.ghostsExposed >= 25) {
      _meta.unlockedBg.push('ghost-vigilante');
    }

    /* Hidden achievements */
    if (!_meta.achievements['true-boss'] && f.bossFightWonFirstTry) {
      _meta.achievements['true-boss'] = true;
      newUnlocks.push({id:'true-boss', name:'The True Boss', desc:'Defeat the Workday Boss Fight on first try.', hidden:true});
      unlockAchievement('true-boss');
    }
    if (!_meta.achievements['agi-pilled'] && g.run.won === 'prompt-eng-end' && (g.run.stats.robotSuspicion||0) >= 80) {
      _meta.achievements['agi-pilled'] = true;
      newUnlocks.push({id:'agi-pilled', name:'AGI Pilled', desc:'Win the prompt-eng ending with Sus ≥ 80.', hidden:true});
      unlockAchievement('agi-pilled');
    }

    if (newUnlocks.length) {
      for (const a of newUnlocks) {
        toastAchievement(a);
      }
      saveMeta();
    }

    return newUnlocks;
  }

  function unlockAchievement(id) {
    const ach = DATA.ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;
    if (ach.hidden) {
      toast('🔓 Hidden achievement unlocked! Keep going...', 'info');
    }
  }

  function toastAchievement(ach) {
    const name = ach.name || ach.id;
    toast(`🏆 Achievement: "${name}" — ${ach.desc||''}`, '');
  }

  function toast(msg, cls) {
    const t = document.createElement('div');
    t.className = 'toast' + (cls ? ' '+cls : '');
    t.textContent = msg;
    t.setAttribute('role', 'alert');
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* Confetti */
  function launchConfetti() {
    const c = document.getElementById('confetti-container');
    const colors = ['#D9483B','#3F7A89','#C8A951','#1B2A4E','#4caf50','#ff9800'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      p.style.left = Math.random()*100 + '%';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.animationDelay = Math.random()*1.5 + 's';
      p.style.animationDuration = (2+Math.random()*2) + 's';
      p.style.width = (6+Math.random()*8) + 'px';
      p.style.height = (6+Math.random()*8) + 'px';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      c.appendChild(p);
    }
    setTimeout(() => c.innerHTML = '', 5000);
  }

  /* Boss Fight */
  function startBossFight() {
    _g.run.flags.bossFightActive = true;
    const pw = document.getElementById('pw-modal');
    const reqsEl = document.getElementById('pw-reqs');
    const failEl = document.getElementById('pw-failures');
    const timerEl = document.getElementById('pw-timer');
    const input = document.getElementById('pw-input');
    const submit = document.getElementById('pw-submit');

    const activeReqs = DATA.PW_REQS.slice(0, 4);
    let failures = 0;
    let timeLeft = 60;

    function renderReqs() {
      const val = input.value;
      const itemsHTML = activeReqs.map(r => {
        let done = false;
        if (r.includes('8')) done = val.length >= 8;
        else if (r.includes('uppercase')) done = /[A-Z]/.test(val);
        else if (r.includes('number')) done = /\d/.test(val);
        else if (r.includes('special')) done = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);
        else if (r.includes('emoji')) done = /\p{Emoji}/u.test(val);
        else if (r.includes('pet')) done = val.split(' ').length >= 2;
        else if (r.includes('maiden')) done = val.split(' ').length >= 3;
        else if (r.includes('haiku')) done = val.split('\n').length >= 3;
        return `<div class="pw-req-item ${done?'done':'fail'}">${done?'✅':'❌'} ${r}</div>`;
      }).join('');
      reqsEl.replaceChildren(htmlToDom(itemsHTML));
    }

    input.addEventListener('input', renderReqs);
    renderReqs();

    submit.onclick = () => {
      const allDone = activeReqs.every(r => {
        const val = input.value;
        if (r.includes('8')) return val.length >= 8;
        if (r.includes('uppercase')) return /[A-Z]/.test(val);
        if (r.includes('number')) return /\d/.test(val);
        if (r.includes('special')) return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);
        return true;
      });

      if (allDone) {
        pw.classList.remove('active');
        input.removeEventListener('input', renderReqs);
        _g.run.flags.bossFightActive = false;
        _g.run.flags.bossFightWon = true;
        _g.run.flags.bossFightWonFirstTry = failures === 0;
        snapStats();
        _g.run.stats.atsFavor = DATA.clamp((_g.run.stats.atsFavor||0) + 5, 0, 100);
        pushLog(_g.run.day, '🔐 Defeated the Workday Password Reset Boss! Bot Aura +5. The password was "hunter42B!"');
      } else {
        failures++;
        failEl.textContent = `Failures: ${failures}/3`;
        if (failures >= 3) {
          pw.classList.remove('active');
          input.removeEventListener('input', renderReqs);
          _g.run.flags.bossFightActive = false;
          snapStats();
          _g.run.stats.hope = DATA.clamp((_g.run.stats.hope||0) - 10, 0, 100);
          pushLog(_g.run.day, '🔐 Boss Fight failed 3 times. You wasted Energy on password resets. Hope -10.');
        } else {
          /* Add harder requirements */
          if (activeReqs.length < DATA.PW_REQS.length) activeReqs.push(DATA.PW_REQS[activeReqs.length]);
          renderReqs();
        }
      }
    };

    document.getElementById('pw-giveup').onclick = () => {
      pw.classList.remove('active');
      input.removeEventListener('input', renderReqs);
      _g.run.flags.bossFightActive = false;
      pushLog(_g.run.day, '🔐 Gave up on the password reset. Some battles you just can\'t win.');
    };

    pw.classList.add('active');
    setTimeout(() => input.focus(), 100);
    input.value = '';
    failEl.textContent = 'Failures: 0/3';
    timeLeft = 60;
    timerEl.textContent = `⏱ ${timeLeft}s`;
    const timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        pw.classList.remove('active');
        input.removeEventListener('input', renderReqs);
        _g.run.flags.bossFightActive = false;
        snapStats();
        _g.run.stats.hope = DATA.clamp((_g.run.stats.hope||0) - 10, 0, 100);
        pushLog(_g.run.day, '🔐 Time ran out on the boss fight. Password reset: lost. Energy: also lost.');
      }
    }, 1000);
    _g.run._bossTimer = timer;
  }

  /* Captcha */
  function startCaptcha() {
    const grid = document.getElementById('captcha-grid');
    const selEl = document.getElementById('captcha-selected');
    const overlay = document.getElementById('captcha-modal');
    const tiles = [...DATA.CAPTCHA_ITEMS].sort(() => Math.random() - 0.5);
    let selected = [];

    const tilesFrag = htmlToDom(tiles.map((t, i) =>
      `<div class="captcha-tile" data-idx="${i}" role="checkbox" aria-checked="false" tabindex="0" aria-label="${t.label}">${t.icon}</div>`
    ).join(''));

    tilesFrag.querySelectorAll('.captcha-tile').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.idx);
        if (selected.includes(idx)) {
          selected = selected.filter(x => x !== idx);
          el.classList.remove('selected');
          el.setAttribute('aria-checked', 'false');
        } else {
          selected.push(idx);
          el.classList.add('selected');
          el.setAttribute('aria-checked', 'true');
        }
        selEl.textContent = `Selected: ${selected.length} tiles`;
      };
    });
    grid.replaceChildren(tilesFrag);

    document.getElementById('captcha-submit').onclick = () => {
      overlay.classList.remove('active');
      if (selected.length >= 3) {
        snapStats();
        _g.run.stats.robotSuspicion = DATA.clamp((_g.run.stats.robotSuspicion||0) + 3, 0, 100);
        pushLog(_g.run.day, '🤖 Passed the Captcha for Employment. You are "human enough." Sus +3.');
      } else {
        snapStats();
        _g.run.stats.hope = DATA.clamp((_g.run.stats.hope||0) - 3, 0, 100);
        pushLog(_g.run.day, '🤖 Failed the Captcha. "Please select all squares with transferable skills." You selected 0. How ironic.');
      }
    };

    overlay.classList.add('active');
    setTimeout(() => document.getElementById('captcha-grid')?.focus(), 100);
  }

  /* One-Way Video Interview */
  function startVideoInterview(lead, onComplete) {
    const prompt = document.getElementById('video-prompt');
    const fill = document.getElementById('video-fill');
    const subtitles = document.getElementById('video-subtitles');
    const overlay = document.getElementById('video-modal');
    const holdBtn = document.getElementById('video-record-btn');
    const doneBtn = document.getElementById('video-done');
    const actionsEl = document.getElementById('video-actions');
    const _onComplete = typeof onComplete === 'function' ? onComplete : null;
    const _lead = lead || null;

    prompt.textContent = DATA.pick(DATA.VID_PROMPTS, _rng);
    fill.style.width = '0%';
    subtitles.textContent = '';
    actionsEl.style.display = 'none';
    holdBtn.style.display = 'block';
    overlay.classList.add('active');
    setTimeout(() => holdBtn.focus(), 100);

    let held = false;
    let progress = 0;
    const required = 5000; /* 5 seconds */
    let interval;

    const startHold = (e) => {
      e.preventDefault();
      held = true;
      interval = setInterval(() => {
        progress += 100;
        fill.style.width = Math.min(100, progress/required*100) + '%';
        subtitles.textContent = DATA.VID_SUBS[Math.floor(progress/1000) % DATA.VID_SUBS.length];
        if (progress >= required) {
          clearInterval(interval);
          held = false;
          holdBtn.style.display = 'none';
          actionsEl.style.display = 'flex';
          snapStats();
          _g.run.stats.hope = DATA.clamp((_g.run.stats.hope||0) - 3, 0, 100);
          pushLog(_g.run.day, '🎥 Completed the one-way video interview. You sounded professional. You were crying.');
          if (_onComplete) {
            _onComplete(true);
            overlay.classList.remove('active');
          }
        }
      }, 100);
    };

    const endHold = () => {
      if (held && progress < required) {
        clearInterval(interval);
        held = false;
        progress = Math.max(0, progress - 2000);
        fill.style.width = Math.min(100, progress/required*100) + '%';
        subtitles.textContent = 'Error: recording interrupted. Please try again.';
      }
    };

    holdBtn.onmousedown = startHold;
    holdBtn.onmouseup = endHold;
    holdBtn.ontouchstart = startHold;
    holdBtn.ontouchend = endHold;

    doneBtn.onclick = () => {
      overlay.classList.remove('active');
      clearInterval(interval);
      if (_onComplete) {
        _onComplete(false);
      }
    };
  }

  /* Personality Assessment */
  function startPA(lead, onComplete) {
    const questionsEl = document.getElementById('pa-questions');
    const overlay = document.getElementById('pa-modal');
    const _onComplete = typeof onComplete === 'function' ? onComplete : null;
    const _lead = lead || null;

    questionsEl.replaceChildren(htmlToDom(DATA.PA_QS.map((q, i) =>
      `<div class="pa-question"><label>${q.q}</label>
        <input type="range" class="pa-slider" min="0" max="4" value="2" data-idx="${i}" aria-label="${q.q}">
        <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-muted)"><span>${q.opts[0]}</span><span>${q.opts[4]}</span></div></div>`
     ).join('')));

    document.getElementById('pa-submit').onclick = () => {
      overlay.classList.remove('active');
      snapStats();
      _g.run.stats.hope = DATA.clamp((_g.run.stats.hope||0) - 3, 0, 100);
      pushLog(_g.run.day, '📝 Personality Assessment complete. Result: "Borderline Culture Fit." As expected.');
      if (_onComplete) {
        _onComplete(true);
      }
    };

    overlay.classList.add('active');
    setTimeout(() => document.getElementById('pa-questions')?.focus(), 100);
  }

  /* Follow-up on leads — new stage-progression system */
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
      g.run.flags.waitingFollowUpsMax = Math.max(g.run.flags.waitingFollowUpsMax || 0, lead.followUpsThisStage);
      const waitThreshold = lead._waitThreshold || (lead._waitThreshold = 1 + Math.floor(_rng() * 5));

      if (lead.followUpsThisStage >= 5 && !_meta.achievements['patient-zero']) {
        _meta.achievements['patient-zero'] = true;
        const ach = {id:'patient-zero',name:'Patient Zero',desc:'Follow up on the same lead 5 times while it\'s in Waiting.',icon:'⏳',hidden:false};
        toastAchievement(ach);
        saveMeta();
      }

      if (lead.followUpsThisStage < waitThreshold) {
        return { type:'waiting', title:'📭 Still Waiting', company:lead.company, message:DATA.pickWaitingMessage(_rng), stats:[{stat:'hope',delta:-2}] };
      }
      lead.stageIdx++;
      lead.followUpsThisStage = 0;
      lead.history.push({day:g.run.day,text:'Got a response (finally)'});
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 4, 0, 100);
      return {
        type:'broke-silence', title:'✉️ They Wrote Back', company:lead.company,
        message:`After ${waitThreshold} follow-up${waitThreshold>1?'s':''}, ${lead.company} sent something. Anything.`,
        stats:[{stat:'hope',delta:4}],
      };
    }

    return triggerStage(lead, currentStage);
  }

  function triggerStage(lead, stageId) {
    const g = _g;
    switch (stageId) {

      case 'auto-reply':
        lead.stageIdx++;
        lead.history.push({day:g.run.day,text:'Auto-reply received'});
        return {
          type:'flavor', title:'🤖 Auto-Reply', company:lead.company,
          message:DATA.pickAutoReplyMessage(_rng), stats:[],
        };

      case 'recruiter-screen':
        if (_rng() < 0.12 && !lead.signals.realRecruiter) {
          return finishLead(lead, 'ghosted', 'The recruiter "stepped away from the role."');
        }
        lead.stageIdx++;
        if (_rng() < 0.30) { lead.signals.salaryDisclosed = true; g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)+5, 0, 100); }
        if (_rng() < 0.60) lead.signals.realRecruiter = true;
        lead.history.push({day:g.run.day,text:'Recruiter screen complete'});
        return {
          type:'flavor', title:'☎️ Recruiter Screen', company:lead.company,
          message:DATA.pickRecruiterScreenMessage(lead.signals.salaryDisclosed, _rng),
          stats:lead.signals.salaryDisclosed ? [{stat:'hope',delta:5}] : [],
        };

      case 'screening-form':
        return { type:'minigame', minigame:'screening-form', lead };

      case 'video-interview':
        return { type:'minigame', minigame:'video-interview', lead };

      case 'personality-test':
        return { type:'minigame', minigame:'personality-test', lead };

      case 'take-home':
        return { type:'minigame', minigame:'take-home', lead };

      case 'panel-interview':
        return { type:'minigame', minigame:'panel-interview', lead };

      case 'salary-stall':
        return { type:'minigame', minigame:'salary-stall', lead };

      case 'reference-checks':
        lead.stageIdx++;
        if (_rng() < 0.15) {
          lead.signals.referenceTrouble = true;
          g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0)-4, 0, 100);
          return { type:'flavor', title:'📞 Reference Check', company:lead.company,
            message:'They called your old manager. Your old manager said "...interesting." That\'s all they said.',
            stats:[{stat:'credibility',delta:-4}] };
        }
        return { type:'flavor', title:'📞 Reference Check', company:lead.company,
          message:'Your references said you were "fine to work with." Damning, but it cleared.', stats:[] };

      case 'final-interview-1': case 'final-interview-2': case 'final-interview-3':
        lead.finalInterviewCount++;
        g.run.flags.maxFinalInterviews = Math.max(g.run.flags.maxFinalInterviews||0, lead.finalInterviewCount);
        lead.stageIdx++;
        lead.history.push({day:g.run.day,text:`"Final" interview #${lead.finalInterviewCount}`});
        const hiMsg = lead.finalInterviewCount===1 ? DATA.pickFinalInterviewMessage(1, _rng)
                     : lead.finalInterviewCount===2 ? DATA.pickFinalInterviewMessage(2, _rng)
                     : DATA.pickFinalInterviewMessage(3, _rng);
        return {
          type:'flavor', title:`🤝 Final Interview #${lead.finalInterviewCount}`, company:lead.company,
          message:hiMsg, stats:[{stat:'hope',delta:lead.finalInterviewCount>1?-3:2}],
        };

      case 'offer-pending':
        lead.stageIdx++;
        if (_rng() < 0.20 && !lead.signals.salaryDisclosed) {
          return finishLead(lead, 'ghosted', 'The offer was "coming next week." Next week never came.');
        }
        return { type:'flavor', title:'📨 Offer Pending', company:lead.company,
          message:'They said "the offer letter is on its way." They say this every Tuesday now.',
          stats:[{stat:'hope',delta:2}] };
    }

    lead.stageIdx++;
    return { type:'flavor', title:'…', company:lead.company, message:'Something happened. Probably.', stats:[] };
  }

  function resolveTerminalOutcome(lead) {
    const g = _g;
    let offerChance = lead.isReal ? 0.55 : 0.10;
    let ghostChance = 0.20;
    let rejectChance = 0.15;
    let pauseChance = 0.10;

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

  function finishLead(lead, outcome, customMessage) {
    const g = _g;
    const i = g.run.activeLeads.findIndex(l => l.id === lead.id);
    if (i >= 0) g.run.activeLeads.splice(i, 1);

    if (outcome === 'offer') {
      g.run.offers = g.run.offers || [];
      g.run.offers.push(lead);
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 20, 0, 100);
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0) + 500, 0, 9999);
      g.run.flags.offerDay = g.run.flags.offerDay || g.run.day;
      g.run.log.push({day:g.run.day, text:`🎉 OFFER from ${lead.company}!`});

      /* Achievement: Principled — principled take-home decline that still won the offer */
      if (g.run.flags.principledOffer && !_meta.achievements['principled']) {
        _meta.achievements['principled'] = true;
        const ach = {id:'principled',name:'Principled',desc:'Decline an unpaid take-home and still get the offer.',icon:'⚖️',hidden:false};
        toastAchievement(ach); saveMeta();
      }

      /* Achievement: Salary Warrior — got offer using disclosed salary range */
      if (lead.signals.salaryDisclosed && !_meta.achievements['salary-warrior']) {
        _meta.achievements['salary-warrior'] = true;
        const ach = {id:'salary-warrior',name:'Salary Warrior',desc:'Get an offer using the disclosed salary range.',icon:'⚔️',hidden:false};
        toastAchievement(ach); saveMeta();
      }

      return {
        type:'terminal-offer', title:'🎉 OFFER!', company:lead.company,
        message:`${lead.company} extended an offer! ${lead.pay || '(pay: TBD)'}`,
        stats:[{stat:'hope',delta:20},{stat:'rent',delta:500}],
      };
    }

    if (outcome === 'ghosted') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) - 7, 0, 100);
      g.run.flags.leadsGhosted = (g.run.flags.leadsGhosted||0)+1;
      g.run.flags.consecutiveGhosts = (g.run.flags.consecutiveGhosts||0)+1;
      g.run.flags.maxConsecutiveGhosts = Math.max(g.run.flags.maxConsecutiveGhosts || 0, g.run.flags.consecutiveGhosts);
      g.run.log.push({day:g.run.day, text:`${lead.company} ghosted you.`});
      return {
        type:'terminal-ghost', title:'👻 Ghosted', company:lead.company,
        message: customMessage || DATA.pickGhostMessage(_rng),
        stats:[{stat:'hope',delta:-7}],
      };
    }

    if (outcome === 'rejected') {
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) - 4, 0, 100);
      g.run.flags.consecutiveGhosts = 0;
      g.run.log.push({day:g.run.day, text:`${lead.company}: "We've decided to move forward with other candidates."`});
      return {
        type:'terminal-reject', title:'📭 Rejected', company:lead.company,
        message: customMessage || DATA.pickRejectionMessage(_rng),
        stats:[{stat:'hope',delta:-4}],
      };
    }

    g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) - 5, 0, 100);
    g.run.log.push({day:g.run.day, text:`${lead.company}: Role put on hold. "Strategic realignment."`});
    return {
      type:'terminal-pause', title:'⏸️ Role Paused', company:lead.company,
      message: customMessage || 'They told you the role is "paused due to strategic realignment." It will be reposted in 3 months. With a lower salary.',
      stats:[{stat:'hope',delta:-5}],
    };
  }

  /* Save run to high scores */
  function saveHighScore(ending, score) {
    const entry = {
      day: _g.run.day,
      ending: ending,
      score: score,
      bg: _g.run.background,
      date: new Date().toISOString()
    };
    _meta.highScores.push(entry);
    _meta.highScores.sort((a,b) => b.score - a.score);
    _meta.highScores = _meta.highScores.slice(0, 20);
    _meta.lifetime.runs++;
    if (ending.includes('-end') === false) _meta.lifetime.wins++;
    /* Track consecutive runs with salary cryptid for touch-crypt achievement */
    if (_g.run.flags.salaryCryptid) {
      _meta.lifetime.cryptidRuns = (_meta.lifetime.cryptidRuns || 0) + 1;
    } else {
      _meta.lifetime.cryptidRuns = 0;
    }
    saveMeta();
  }

  /* Snap current stats for delta computation on next pushLog */
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
  /* Compute stat deltas between before and after snapshots */
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
    for (const key of Object.keys(statMeta)) {
      const beforeVal = before[key] !== undefined ? before[key] : 0;
      const afterVal = after[key] !== undefined ? after[key] : 0;
      if (Array.isArray(beforeVal)) {
        const diff = afterVal.length - beforeVal.length;
        if (diff !== 0) {
          deltas.push({ key, display: statMeta[key].display, icon: statMeta[key].icon, before: beforeVal.length, after: afterVal.length, delta: diff });
        }
      } else if (beforeVal !== afterVal) {
        deltas.push({ key, display: statMeta[key].display, icon: statMeta[key].icon, before: beforeVal, after: afterVal, delta: afterVal - beforeVal });
      }
    }
    return deltas;
  }

  return {
    init: function() {
      _meta = initMeta();
      _g = {
        run: {
          day: 1, background: '', energy: 3, maxEnergy: 3,
          stats: { rent:100, hope:50, credibility:50, clout:0, atsFavor:10, robotSuspicion:100, humanContact:5, buzzwords:[], scamEvidence:0, ghostEvidence:0, scamsFell:0 },
          activeLeads: [], feed: [], log: [],
          flags: { easyApplyCount:0, ghostsExposed:0, scamsReported:0, consecutiveGhosts:0, applicationsSubmitted:0, leadsGhosted:0, leadsGhostedRun:0, bossFightActive:false, bossFightWon:false, bossFightWonFirstTry:false, recruiterTypes:0, maxFinalInterviews:0, cloutGainToday:0, agreeViral:0, offerDay:0, maxClout:0, maxRobotSusp:0, minRobotSusp:100, minHopeRun:100, maxActiveLeads:0, portalApps:0, takeHomeApps:0, referralUsed:false, referralSaved:false, noRecruiterTomorrow:false, recruiterDoubled:false, unicornSeen:false, repostExposed:false, totalAtsLoss:0, firstEasyApplyDay:0, touchGrassCount:0, cringePostCount:0, formsCompleted:0, viralPosts:0, maxConsecutiveGhosts:0 },
          permaPlayedCards: new Set(),
          seed: Date.now(),
          won: null,
          offers: [],
          _bossTimer: null,
        },
        meta: _meta,
        _rng: null,
      };
      _rng = _g._rng = DATA.mulberry32(_g.run.seed);
     },
     /* Morning Event System */
     rollMorningEvent() {
       if (_g.run.day < 2) return null;
       if ([25, 28, 30].includes(_g.run.day)) return null;
       if (_rng() > 0.30) return null;
       const recent = _g.run.flags._recentMorningEvents || [];
       const pool = DATA.MORNING_EVENTS.filter(e => !recent.includes(e.id));
       if (pool.length === 0) return null;
       const event = DATA.pick(pool, _rng);
       recent.unshift(event.id);
       if (recent.length > 4) recent.pop();
       _g.run.flags._recentMorningEvents = recent;
       return event;
     },
     resolveMorningChoice(event, choiceIdx) {
       const choice = event.choices[choiceIdx];
       if (!choice) return null;
       let outcome;
       if (choice.outcomes.length === 1) {
         outcome = choice.outcomes[0];
       } else {
         const total = choice.outcomes.reduce((s, o) => s + (o.weight || 1), 0);
         let r = _rng() * total;
         for (const o of choice.outcomes) {
           r -= (o.weight || 1);
           if (r <= 0) { outcome = o; break; }
         }
         if (!outcome) outcome = choice.outcomes[choice.outcomes.length - 1];
       }
       const deltas = [];
       (outcome.effects || []).forEach(e => {
         if (e.stat === 'energy') {
           const before = _g.run.energy;
           _g.run.energy = Math.max(0, Math.min(_g.run.maxEnergy + 2, before + e.delta));
           if (_g.run.energy !== before) deltas.push({stat:'energy', delta:_g.run.energy - before});
         } else {
           const before = _g.run.stats[e.stat] || 0;
           const cap = (e.stat === 'rent' || e.stat === 'clout' || e.stat === 'humanContact') ? 9999 : 100;
           _g.run.stats[e.stat] = Math.max(0, Math.min(cap, before + e.delta));
           if (_g.run.stats[e.stat] !== before) deltas.push({stat:e.stat, delta:_g.run.stats[e.stat] - before});
         }
       });
        /* Achievement tracking */
        _meta.lifetime.morningEvents = (_meta.lifetime.morningEvents || 0) + 1;
        if (event.id === 'mom-calls' && choice.label === 'Pick up') {
          _g.run.flags.momCalls = (_g.run.flags.momCalls || 0) + 1;
        }
        if (event.id === 'doordash-glitch' && choice.label === 'Report it') {
          _g.run.flags.rightThing = 1;
        }
        pushLog(_g.run.day, `🌅 ${event.title}: ${outcome.result}`);
        return { result: outcome.result, deltas };
     },
     get state() { return _g; },
    get meta() { return _meta; },
    weightedPool, drawFeed, createLead, applyCard, resolveLeads, advanceDay,
    checkLosses, checkWins, track, checkAchievements, saveHighScore,
    startBossFight, startCaptcha, startVideoInterview, startPA, followUpLead,
    snapStats, pushLog, computeStatDeltas, saveRun, loadRun, clearRun, applyRun, hasRun,
    clamp: DATA.clamp,
    showToast,
  };
})();
/* ============================================================
   UI — Rendering, Event Handlers, Game Flow
   ============================================================ */
