const UI = (() => {
  const E = Engine;

  /* Safe HTML → DOM converter (game data, never user input) */
  function htmlToDom(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.cloneNode(true);
  }

  let selectedBg = null;

  /* Batched DOM updates using requestAnimationFrame */
  let _rafPending = false;
  const _rafQueue = [];

  function scheduleRender(fn) {
    _rafQueue.push(fn);
    if (!_rafPending) {
      _rafPending = true;
      requestAnimationFrame(() => {
        _rafPending = false;
        const queue = _rafQueue.splice(0);
        for (const fn of queue) fn();
      });
    }
  }
  const loadingMsgs = [
    'Checking if recruiters are nearby...',
    'Scanning for ghost jobs...',
    'Compiling rejection letters...',
    'Loading Bot Aura compatibility...',
    'Initializing doomscroll protocol...',
    'Your résumé is being parsed...',
    'A recruiter viewed your profile (probably just a bot)...',
    'Loading Linkfluence dark mode...',
    'Fetching salary transparency data...',
    'Running background check on your dreams...',
  ];

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  /* Title Screen */
  function showTitle() {
    showScreen('title-screen');
    E.launchConfetti = () => {}; /* prevent confetti on title */

    /* Animate unread count — always goes up */
    let unread = (E.meta.lifetime?.runs || 0) > 0 ? (47 + (E.meta.lifetime?.runs || 0) * 10) : 47;
    const badge = document.getElementById('unread-count');
    if (window._titleInterval) clearInterval(window._titleInterval);
    const interval = setInterval(() => {
      unread += Math.floor(Math.random() * 3) + 1;
      badge.textContent = unread;
    }, 3000);
    window._titleInterval = interval;

    /* Show wins */
    const wins = E.meta.lifetime?.wins || 0;
    const wd = document.getElementById('wins-display');
    if (wins > 0) wd.textContent = `🏆 ${wins} career${wins>1?'s':''} completed. Your LinkedIn is proud.`;
    else wd.textContent = '';

    const contBtn = document.getElementById('btn-continue');
    const saved = E.loadRun();
    if (saved) {
      contBtn.style.display = '';
      const dayLabel = saved.day || '?';
      const hope = (saved.stats?.hope ?? 0);
      const rent = (saved.stats?.rent ?? 0);
      contBtn.textContent = `📂 Continue Game (Day ${dayLabel}, Hope ${hope}, Rent $${rent})`;
    } else {
      contBtn.style.display = 'none';
    }
    if (contBtn) {
      contBtn.onclick = () => {
        const saved = E.loadRun();
        if (!saved) return;
        window._titleInterval && clearInterval(window._titleInterval);
        showScreen('game-screen');
        E.applyRun(saved);
        startDay();
      };
    }

    /* Verified checkmark if lots of wins */
    if (wins >= 5) {
      const tl = document.querySelector('.title-logo');
      if (tl && !tl.querySelector('span[style*="var(--teal)"]')) {
        const span = document.createElement('span');
        span.style.color = 'var(--teal)';
        span.style.fontSize = '1.5rem';
        span.textContent = '\u2713';
        tl.appendChild(span);
      }
    }
  }

  function showBgSelect() {
    window._titleInterval && clearInterval(window._titleInterval);
    showScreen('bg-select');
    const grid = document.getElementById('bg-grid');
    const bg = E.meta.unlockedBg || ['recent-grad','mid-career','tech-refugee','bootcamp','career-goblin'];

    const fragment = htmlToDom(DATA.BACKGROUNDS.map(b => {
      const unlocked = bg.includes(b.id);
      return `<div class="bg-card ${unlocked?'':'bg-locked'} ${selectedBg===b.id?'selected':''}" data-bg="${b.id}" role="button" tabindex="0" aria-label="${b.name}">
        <div class="bg-icon">${b.icon}</div>
        <div class="bg-name">${b.name}${b.locked?' (🔒)':''}</div>
        <div class="bg-vibe">${b.vibe}</div>
        <div class="bg-perk">✨ ${b.perk}</div>
        <div class="bg-penalty">⚠️ ${b.penalty}</div>
        ${b.locked ? `<div class="bg-locked-hint">${b.lockHint}</div>` : ''}
      </div>`;
    }).join(''));
    fragment.querySelectorAll('.bg-card').forEach(card => {
      card.onclick = () => {
        if (card.classList.contains('bg-locked')) return;
        selectedBg = card.dataset.bg;
        grid.querySelectorAll('.bg-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('btn-bg-confirm').disabled = false;
      };
    });
    grid.appendChild(fragment);

    document.getElementById('btn-bg-confirm').onclick = () => {
      if (!selectedBg) return;
      startRun(selectedBg);
    };
  }

  function startRun(bgId) {
    selectedBg = bgId;
    E.clearRun();
    E.init();
    const g = E.state;

    /* Apply background */
    const bgData = DATA.BACKGROUNDS.find(b => b.id === bgId);
    if (bgData) {
      g.run.background = bgId;
      /* Preserve all stat keys — merge background overrides into default stats */
      const defaultStats = { rent:100, hope:50, credibility:50, clout:0, atsFavor:10, robotSuspicion:0, humanContact:5, buzzwords:[], scamEvidence:0, ghostEvidence:0 };
      Object.keys(defaultStats).forEach(k => {
        g.run.stats[k] = (bgData.stats[k] !== undefined) ? bgData.stats[k] : defaultStats[k];
      });
      g.maxEnergy = bgData.stats.maxEnergy || 3;
      g.run.maxEnergy = g.maxEnergy;
      if (bgData.extra === 'recruiterDoubled') g.run.flags.recruiterDoubled = true;
    }

    /* Reset per-run flags */
    g.run.flags.easyApplyCount = 0;
    g.run.flags.consecutiveGhosts = 0;
    g.run.flags.applicationsSubmitted = 0;
    g.run.flags.leadsGhosted = 0;
    g.run.flags.leadsGhostedRun = 0;
    g.run.flags.bossFightWonFirstTry = false;
    g.run.flags.recruiterTypes = 0;
    g.run.flags.maxFinalInterviews = 0;
    g.run.flags.cloutGainToday = 0;
    g.run.flags.agreeViral = 0;
    g.run.flags.offerDay = 0;
    g.run.flags.maxClout = 0;
    g.run.flags.maxRobotSusp = 0;
    g.run.flags.minRobotSusp = 100;
    g.run.flags.maxActiveLeads = 0;
    g.run.flags.scamsReceived = 0;
    g.run.flags.autoRejected = 0;
    g.run.flags.salaryCryptid = 0;

    /* Daily tracking */
    g.run._dailyClout = 0;
    g.run._postsMadeToday = 0;

    /* Show game */
    showScreen('game-screen');
    document.getElementById('scanline-overlay').classList.remove('active');
    document.getElementById('confetti-container').innerHTML = '';

    startDay();
  }

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

    /* 30-day countdown tension modals */
    if (g.run.day === 25) {
      E.showCountdown('5 days left. If you\'re still in the "applied" stage, start following up. The market doesn\'t wait.');
    } else if (g.run.day === 28) {
      E.showCountdown('3 days left. You have 60 hours to change your life. Or at least your LinkedIn bio.');
    } else if (g.run.day === 30) {
      E.showCountdown('Last day. Submit one more application. Post one more thing. The clock is ticking, bro.');
    }

    /* Batched DOM updates via requestAnimationFrame */
    scheduleRender(() => { try { renderStatBar(); } catch(e) {} });
    scheduleRender(() => { try { renderDayHeader(); } catch(e) {} });
    scheduleRender(() => { try { renderFeed(); } catch(e) {} });
scheduleRender(() => { try { renderLeads(); } catch(e) {} });
    scheduleRender(() => { try { renderInventory(); } catch(e) {} });
    scheduleRender(() => { try { renderRunLog(); } catch(e) {} });
    scheduleRender(() => { try { renderNewsTicker(); } catch(e) {} });
    scheduleRender(() => { try { updateScanline(); } catch(e) {} });

    /* Re-add key listener after EOD modal dismissal */
    document.addEventListener('keydown', handleKey);
  }

  function showMorningEventModal(event, onContinue) {
    const modal = document.getElementById('morning-event-modal');
    document.getElementById('me-icon').textContent = event.icon || '🌅';
    document.getElementById('me-title').textContent = event.title;
    document.getElementById('me-flavor').textContent = event.flavor;
    const choicesEl = document.getElementById('me-choices');
    const outcomeEl = document.getElementById('me-outcome');
    const deltasEl = document.getElementById('me-outcome-deltas');
    const actionsEl = document.getElementById('me-actions');

    outcomeEl.style.display = 'none';
    deltasEl.innerHTML = '';
    actionsEl.style.display = 'none';

    const statMeta = {
      rent:{icon:'💰',name:'Money'}, hope:{icon:'💡',name:'Hope'},
      credibility:{icon:'🎯',name:'Cred'}, clout:{icon:'⭐',name:'Clout'},
      atsFavor:{icon:'🤖',name:'Bot Aura'}, robotSuspicion:{icon:'👁️',name:'Bot Sus'},
      humanContact:{icon:'🤝',name:'Human'}, energy:{icon:'⚡',name:'Energy'},
    };

    choicesEl.innerHTML = event.choices.map((c, i) =>
      `<button class="me-choice-btn" data-idx="${i}">${c.label}</button>`
    ).join('');

    choicesEl.querySelectorAll('.me-choice-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        const res = E.resolveMorningChoice(event, idx);
        choicesEl.querySelectorAll('button').forEach(b => b.disabled = true);
        outcomeEl.textContent = res.result;
        outcomeEl.style.display = 'block';
        deltasEl.innerHTML = res.deltas.map(d => {
          const meta = statMeta[d.stat] || {icon:'?',name:d.stat};
          const sign = d.delta > 0 ? '+' : '';
          const cls = d.delta > 0 ? 'up' : 'down';
          return `<span class="me-outcome-delta ${cls}">${meta.icon} ${sign}${d.delta} ${meta.name}</span>`;
        }).join('');
        actionsEl.style.display = 'flex';
      };
    });

    document.getElementById('me-continue').onclick = () => {
      modal.classList.remove('active');
      if (onContinue) onContinue();
    };

    modal.classList.add('active');
    setTimeout(() => choicesEl.querySelector('button')?.focus(), 100);
  }

  function handleKey(e) {
    const activeModal = document.querySelector('.modal-overlay.active');

    if (e.key === 'Tab' && activeModal) {
      e.preventDefault();
      const focusable = activeModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === focusable[0] || !activeModal.contains(document.activeElement)) {
          focusable[focusable.length - 1].focus();
        } else {
          focusable[Array.from(focusable).indexOf(document.activeElement) - 1]?.focus();
        }
      } else {
        if (document.activeElement === focusable[focusable.length - 1] || !activeModal.contains(document.activeElement)) {
          focusable[0].focus();
        } else {
          focusable[Array.from(focusable).indexOf(document.activeElement) + 1]?.focus();
        }
      }
      return;
    }

    if (e.key === 'Escape' && activeModal) {
      if (activeModal.id === 'eod-modal') {
        if (E.state.run.won) return;
        activeModal.classList.remove('active');
        startDay();
      } else if (activeModal.id === 'captcha-modal') {
        activeModal.classList.remove('active');
        Engine.snapStats();
        Engine.state.run.stats.robotSuspicion = DATA.clamp((Engine.state.run.stats.robotSuspicion||0)+3,0,100);
        Engine.pushLog(Engine.state.run.day, '🤖 Escaped the Captcha. "Please select all squares with transferable skills." You gave up. How ironic.');
      } else if (activeModal.id === 'pw-modal') {
        activeModal.classList.remove('active');
        Engine.state.run.flags.bossFightActive = false;
        Engine.state.run.flags.bossFightWon = false;
        Engine.state.run.flags.bossFightWonFirstTry = false;
        Engine.pushLog(Engine.state.run.day, '🔐 Escaped the Workday Password Reset Boss. You lost. They lost. Everyone lost.');
      } else if (activeModal.id === 'video-modal') {
        activeModal.classList.remove('active');
        Engine.snapStats();
        Engine.state.run.stats.hope = DATA.clamp((Engine.state.run.stats.hope||0)-3,0,100);
        Engine.pushLog(Engine.state.run.day, '🎥 Escaped the one-way video interview. "We\'ll be in touch." You\'re not.');
      } else if (activeModal.id === 'pa-modal') {
        activeModal.classList.remove('active');
        Engine.snapStats();
        Engine.state.run.stats.hope = DATA.clamp((Engine.state.run.stats.hope||0)-3,0,100);
        Engine.pushLog(Engine.state.run.day, '📝 Escaped the Personality Assessment. "We\'ll be in touch." You\'re not.');
      } else {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
      return;
    }

    if (activeModal) return;

    const gameScreen = document.getElementById('game-screen');
    if (gameScreen && gameScreen.classList.contains('active')) {
      if (e.key === 'e' || e.key === 'E') {
        const doomBtn = document.getElementById('doomscroll-btn');
        if (doomBtn && !doomBtn.disabled) {
          e.preventDefault();
          doomBtn.click();
        }
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const leadsPanel = document.getElementById('leads-panel');
        if (leadsPanel) {
          leadsPanel.classList.toggle('collapsed');
        }
        return;
      }
      if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key) - 1;
        const card = document.querySelector(`[data-card-idx="${idx}"]`);
        if (card) {
          e.preventDefault();
          const firstBtn = card.querySelector('.card-buttons button');
          if (firstBtn && !firstBtn.disabled) {
            firstBtn.click();
          }
        }
        return;
      }
    }

    const titleScreen = document.getElementById('title-screen');
    if (titleScreen && titleScreen.classList.contains('active')) {
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        showHowTo();
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        showBgSelect();
        return;
      }
    }
  }

  function renderStatBar() {
    const g = E.state;
    const s = g.run.stats;
    const bar = document.getElementById('stat-bar');
    const failureStats = ['rent','hope','credibility','atsFavor','robotSuspicion','humanContact'];
    /* highIsGood: higher value = better. false = higher value = worse. */
    const stats = [
      // money: starts 100, decays. Above 100 = green. Below 30 = red.
      {icon:'💰', key:'rent', max:100, label:'Money', funny:'Rent Money — because the void charges $1,200/month.', fail:'⚠️ Hits 0 = Game Over (Evicted!)', highIsGood:true},
      // hope: starts 50, volatile. 60 = comfortable. 0 = game over.
      {icon:'💡', key:'hope', max:60, label:'Hope', funny:'Hope — your morale. Crashes on ghosting, recovers from human contact.', fail:'⚠️ Hits 0 = Game Over (Doomscroll Spiral.)', highIsGood:true},
      // credibility: starts low, grows. 80 = comfortable.
      {icon:'🎯', key:'credibility', max:80, label:'Cred', funny:'Credibility — your professional reputation. Hard to earn, easy to destroy with one "Agree?" post.', fail:'⚠️ Hits 0 = Game Over (Culture Fit Not Found.)', highIsGood:true},
      // human contact: starts 5, building is the path to victory.
      {icon:'🤝', key:'humanContact', max:25, label:'Human', funny:'Human Contact — real people who will vouch for you. The only thing that bypasses the pipeline.', fail:'⚠️ Hits 0 = Game Over (Isolated.)', highIsGood:true},
      // bot aura: starts 10, ~50 = comfortable.
      {icon:'🤖', key:'atsFavor', max:50, label:'Bot Aura', funny:'Bot Aura — how much the résumé-parser likes you. Not the same as being qualified.', fail:'⚠️ Hits 0 = Game Over (Blacklisted.)', highIsGood:true},
      // robot suspicion: starts 100, <30 = concerning.
      {icon:'👁️', key:'robotSuspicion', max:100, label:'Sus', funny:'Sus — how human you appear. Drops with AI-ish behavior. Falls to 0 = Game Over (AI Detected AI.)', fail:'⚠️ Hits 0 = Game Over (AI Detected AI.)', highIsGood:true},
    ];

    const statsFrag = htmlToDom(stats.map(st => {
      const val = s[st.key] || 0;
      const pct = Math.min(100, Math.round((val / st.max) * 100));
      /* Health = how "good" the stat is. Inverts for bad stats so 100 = ideal. */
      const health = st.highIsGood ? pct : 100 - pct;
      const displayHealth = Math.max(5, Math.min(100, health));

      /* Gauge arc endpoint: center(18,17), rx=15, ry=10. */
      const angle = displayHealth / 100 * Math.PI;
      const gx = (18 - 15 * Math.cos(angle)).toFixed(1);
      const gy = (17 - 10 * Math.sin(angle)).toFixed(1);
      const d = `M3 17 A15 10 0 0 1 ${gx} ${gy}`;

      const colorClass = displayHealth > 50 ? 'good' : displayHealth > 20 ? 'warn' : 'bad';
      const danger = (st.key === 'robotSuspicion') ? val < 30 : (st.key === 'rent' || st.key === 'hope') ? val < 25 : false;
      const hasFail = st.fail && failureStats.includes(st.key);

      return `<div class="stat-item" data-stat="${st.key}" aria-label="${st.label}: ${val}">
        <span class="stat-icon">${st.icon}</span>
        <svg class="stat-gauge" viewBox="0 0 36 22" aria-hidden="true">
          <path class="track-arc" d="M3 17 A15 10 0 0 1 33 17"/>
          <path class="fill-arc ${colorClass}" d="${d}"/>
        </svg>
        <span class="stat-val ${danger?'danger':displayHealth>20?'ok':''}">${val}</span>
        <div class="stat-tooltip"><div class="tt-body"><span class="tt-funny">${st.label}</span><span class="tt-desc">${st.funny}</span>${hasFail ? `<div class="tt-failure">${st.fail}</div>` : ''}</div></div>
      </div>`;
    }).join(''));
    bar.replaceChildren(statsFrag);

    const energyEl = document.getElementById('energy-display');
    if (energyEl) {
      energyEl.innerHTML = '';
      const cups = Array.from({length: g.run.maxEnergy}, (_, i) => {
        const span = document.createElement('span');
        span.className = i < g.run.energy ? 'energy-cup' : 'energy-icon';
        span.textContent = i < g.run.energy ? '☕' : '💤';
        return span;
      });
      cups.forEach(s => energyEl.appendChild(s));
      const countSpan = document.createElement('span');
      countSpan.className = 'energy-count';
      countSpan.textContent = `${g.run.energy}`;
      countSpan.style.cssText = 'font-size:.85rem;color:var(--text-muted);margin-left:.25rem';
      energyEl.appendChild(countSpan);
    }

    const cloutEl = document.getElementById('clout-display');
    if (cloutEl) {
      cloutEl.textContent = s.clout || 0;
    }
  }

  function renderDayHeader() {
    const g = E.state;
    document.getElementById('day-display').textContent = `Day ${g.run.day} / 30`;
    document.getElementById('news-display').textContent = DATA.pick(DATA.HEADLINES, E._rng || Math);
  }

  function renderFeed() {
    const g = E.state;
    const area = document.getElementById('feed-area');
    const cards = g.run.feed || [];
    if (cards.length === 0) {
      area.replaceChildren(htmlToDom('<div style="text-align:center;padding:2rem;color:var(--text-muted)">No cards today. The void stares back. 🕳️</div>'));
      return;
    }

    const cardsFrag = htmlToDom(cards.map((card, idx) => {
      /* Apply background modifier to post energy cost */
      const isReformedInf = card.category === 'post' && g.run.background === 'reformed-influencer';
      const postCost = isReformedInf && (g.run._postsMadeToday||0) === 0 ? 0 : (card.cost?.energy || 1);

      const catColors = {job:'var(--navy)',recruiter:'var(--teal)',post:'var(--gold)',network:'#7a9a6a',resume:'#8a6a9a',rest:'#6aaa8a',event:'#aa6a6a',gig:'#8a7a6a'};
      const catColor = catColors[card.category] || 'var(--navy)';
      const extraClass = card.id === 'salary-cryptid' ? ' salary-cryptid' : '';
      /* Buttons */
      const allBtns = card.buttons.slice();
      return `<div class="feed-card card-${card.category}${extraClass}" role="article" aria-label="Card: ${card.title}" data-card-idx="${idx}">
        <div class="card-header" role="heading" aria-level="3">
          <span class="card-title">${card.title}</span>
          <span class="card-category-badge" style="background:${catColor}22;color:${catColor};border:1px solid ${catColor}44">${card.category}</span>
          <span class="card-cost" aria-label="Energy cost: ${postCost}">☕ ${postCost}</span>
        </div>
        <div class="card-flavor" role="text">${card.flavor}</div>
        <div class="card-buttons" role="group" aria-label="Actions for ${card.title}">${allBtns.map((btn, bi) => {
          const btnCost = btn.cost?.energy != null ? btn.cost.energy : 1;
          const canBtn = g.run.energy >= btnCost;
          /* Ghost Vigilante can't easy apply */
          const isEasy = ['applyEasy','applyDesperate','applyPipeline'].includes(btn.effect);
          const blocked = g.run.background === 'ghost-vigilante' && isEasy;
          /* Discard effects look dismissable; energy-cost = primary; no-cost = secondary */
          const DISCARD_EFFECTS = ['discard','ignore','decline','cancel','nothing','recruitBlock'];
          const isDiscard = DISCARD_EFFECTS.includes(btn.effect) || btn.isDiscard;
          const btnClass = isDiscard ? 'discard' : (btnCost > 0 ? 'primary' : 'secondary');
          return `<button class="card-btn ${btnClass}" data-idx="${idx}" data-btn="${btn.effect}" ${(!canBtn||blocked)?'disabled':''} aria-label="${btn.label}" title="${btn.label}">${btn.label}${blocked?' (🔒 Locked)':''}</button>`;
        }).join('')}</div>
      </div>`;
    }).join(''));

    /* Card button handlers */
    cardsFrag.querySelectorAll('.card-btn:not(:disabled)').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        const effect = btn.dataset.btn;
        const card = cards[idx];
        if (!card) return;

        /* Find the matching button's effect */
        const btnData = card.buttons.find(b => b.effect === effect);
        if (btnData) {
          /* Capture before stats */
          const beforeStats = JSON.parse(JSON.stringify(g.run.stats));
          beforeStats.energy = g.run.energy;

          /* Apply the card action */
          E.applyCard(card, btnData);

          /* Show toast feedback for discard/ignore */
          if (effect === 'discard' || effect === 'ignore' || effect === 'decline' || effect === 'cancel') {
            E.showToast('Ignored. The void approves.', 'info');
          }

          /* Track posts made today for Reformed Influencer perk */
          if (card.category === 'post') {
            g.run._postsMadeToday = (g.run._postsMadeToday||0) + 1;
          }

          /* Capture after stats */
          const afterStats = JSON.parse(JSON.stringify(g.run.stats));
          afterStats.energy = g.run.energy;

          /* Remove the card and re-render */
          g.run.feed.splice(idx, 1);
          E.saveRun();
          renderFeed();
          renderStatBar();
          renderLeads();
          renderRunLog();
          checkDayEnd();

          /* Show result popup only when stats actually changed (not discard/ignore) */
          const deltas = E.computeStatDeltas(beforeStats, afterStats);
          if (deltas.length > 0) {
            const response = generateResponse(btnData, card, deltas);
            showResultModal(btnData.label, response, deltas);
          }
        }
      };
    });
    area.replaceChildren(cardsFrag);
  }

  /* Generate a clever response based on the action and stat changes */
  function generateResponse(btn, card, deltas) {
    const effect = btn.effect || '';

    const responses = {
      apply: [
        'Résumé entered the void. Will be seen by someone. Maybe.',
        'Application submitted! Bot Aura has absorbed your dreams into its training data.',
        'You applied. Somewhere, a recruiter feels a faint disturbance in the force.',
        'Job applied to. Hope went up slightly. Rent did not.',
      ],
      applyCareful: [
        'Applied with meticulous attention to detail. Your Bot Aura score took a hit though.',
        'Careful application submitted. Credibility gained, Bot Aura lost. Eternal balance.',
        'Read the entire job description. Most applicants didn\'t. Still got rejected.',
        'Applied carefully. Every field filled. Bot Aura marked it "underqualified" anyway.',
      ],
      applyEasy: [
        'Easy Apply clicked! Sus dropped. You applied to 47 jobs in 3 minutes.',
        'One-click application submitted. The void accepted your submission. Probably.',
        'Easy Apply: the digital equivalent of throwing your résumé into a shredder and hoping it reassembles.',
        'Clicked "Easy Apply." Nothing about it was easy. Except the clicking.',
      ],
      applyDesperate: [
        'Desperate application submitted. Sus plummeted. They know.',
        'You applied so fast even you didn\'t read the requirements. Classic.',
        'Applied with the energy of someone who hasn\'t slept in 47 hours. Bot Aura can smell the desperation.',
        'Hit submit before reading the salary range. Future-you will be proud. Present-you is not.',
        'Desperate mode: quality dropped. Energy expenditure tripled. Math checks out.',
      ],
      applyTokens: [
        'Buzzword injection successful. Clout increased. Soul decreased.',
        'Applied with maximum buzzword density. The algorithm loves you now.',
        'You stuffed "synergy," "disruption," and "leveraging AI" into the application. HR called it "cringe."',
        'Buzzword bingo complete. Used every buzzword since 2016. Bot Aura confused. Clout: +1.',
      ],
      applyPortal: [
        'Workday portal entered. Hope decreased. You may never leave.',
        'Portal application submitted. You traded energy for the slim chance of a reply.',
        'Filled out 14 fields on the company portal. Field 15: "upload your birth certificate." You left.',
        'Workday portal: where applications go to die. The abyss submitted you to a background check.',
      ],
      addAI: [
        '"AI-powered" added to everything. Bot Aura pleased. Humans skeptical.',
        'You injected "AI" into your profile. Credibility dropped, robot suspicion rose.',
        'Added "AI" to 3 projects. Now all "AI-powered." Were just spreadsheets.',
        'Labeled resume "AI-optimized." The AI rejected it. For being too human.',
      ],
      addNetworking: [
        'Network expanded. Human contact increased. You\'re becoming more... social.',
        'Reached out to someone. They may or may not respond. That\'s networking.',
        'Sent a connection request. They accepted. Nothing to say to them now.',
        'Networking: the art of pretending to care about someone\'s job so they might care about yours.',
      ],
      addClout: [
        'Clout gained! LinkedIn presence grows. Algorithm rewards you.',
        'Posted something clever. Or at least something. Clout increased.',
        'Clout accumulated. LinkedIn profile has 3 more followers. 2 are bots.',
        'Engaged with content. Algorithm noticed. Clout went up. Rent didn\'t.',
      ],
      addBuzzwords: [
        'Buzzwords added to your profile. You\'re one step away from being a LinkedIn influencer.',
        'Your profile now has more buzzwords than substance. Classic.',
        'You added "thought leader," "go-getter," and "results-oriented." Your manager added "underperformer."',
        'Buzzword injection complete. Your profile reads like a Fortune 500 press release. Nobody believes it.',
      ],
      rest: [
        'You rested. Energy restored. The job hunt continues tomorrow, as it always does.',
        'Brief respite from the doomscroll. Energy recovered. Rent did not.',
        'Took a break. Rent increased while you were gone. Classic.',
        'Rest completed. Felt human again. For about 6 hours. Then applications resumed.',
      ],
      post: [
        'Posted on Linkfluence. The void stares back, and you stared first.',
        'Your post is now live. 3 likes, 2 of which are from your mom.',
        'Linkfluence post published. Will be algorithmically buried within hours. Posted anyway.',
        'Posted on Linkfluence. Algorithm showed it to 12 people. 3 were ads.',
      ],
      postViral: [
        'VIRAL! Post blew up. Clout went through the roof. Act naturally.',
        'Content went viral. Clout machine rewards you. Algorithm pleased.',
        'Your post hit 10K views. 8K were bots. The rest were cringe compilation seekers.',
        'VIRAL MOMENT. Post about "hustle culture" shared by 47 accounts. 46 were yours.',
      ],
    exposeGhost: [
        'Ghost job exposed! Your karma increased. The job market is one star smaller.',
        'Exposed a ghost job. Recruiter\'s reputation tanked. Well played.',
        'Ghost job revealed: posted 47 days ago, 10K applications, 0 interviews. Ghost was human.',
        'Exposed the ghost job. Posted by a company that doesn\'t exist. Or does. Who knows anymore?',
      ],
      reverseImg: [
        'Reverse image search deployed! Found stock photo source. Well played.',
        'Reverse-searched their office photo. Working from a WeWork. Exposed.',
        'Reverse-searched their "team photo." From a Shutterstock catalog. $2.99 per image.',
        'Reverse image search revealed: their "modern office" is a 300 sq ft room with a beanbag and a whiteboard.',
      ],

      askSalary: [
        'You asked about salary. The recruiter ghosted. Fair.',
        'Salary transparency requested. The silence was deafening. Classic.',
        'You asked "what\'s the budget for this role?" They replied "we\'re open to negotiation." Translation: minimum wage.',
        'Salary question asked. Recruiter sent a PDF with a single number: $30,000. Replied "interesting."',
      ],
      followUp: [
        'Follow-up sent. Recruiter saw your message. Ghosted again.',
        'Followed up professionally. They saw it. Just don\'t care.',
        'Followed up with "just checking in!" Recruiter replied "checking in" to their spam folder.',
        'Follow-up sent. Read receipt confirmed. Three weeks later: still no reply.',
      ],
      referral: [
        'Referral secured! Real human passed along your résumé. This means something.',
        'Someone referred you. The human referral network is stronger than the Bot Aura.',
        'Got a referral. Referrer said "let me know if you hear anything." Heard nothing.',
        'Referral submitted. The hiring manager saw it, forgot, then forgot again.',
      ],
      videoInterview: [
        'Video interview complete. Looked into the camera, not the screen. Pro tip.',
        'Video interview done. Remembered to smile. They probably didn\'t.',
        'Video interview: you answered questions while your cat walked across your keyboard. They noticed.',
        'Video interview submitted. You practiced in the mirror. The mirror didn\'t hire you either.',
      ],
      personalityAssessment: [
        'Personality assessment complete. Result: "Borderline Culture Fit." As expected.',
        'You took the personality test. "You score high on "eats lunch at desk"."',
        'Personality test: "I enjoy working in teams." Selected "Strongly Disagree." They selected you anyway.',
        'Assessment result: "Highly independent." Your manager interprets that as "doesn\'t need meetings."',
      ],
      offer: [
        'OFFER! Life just changed. This is the moment you\'ve been waiting for.',
        'OFFER LETTER RECEIVED! Job hunt ends here. You did it, bro.',
        'OFFER RECEIVED. Salary is low. Title is fancy. You take it anyway.',
        'Offer arrived: 401k match 4%, 10 vacation days. You accept before reading the non-compete.',
      ],
      applyPipeline: [
        'Evergreen posting submitted. It\'s always open, which means it\'s never hired anyone.',
        'Submitted to the pipeline. Your application joins 10,000 others in the digital purgatory.',
        'You applied to the "evergreen" posting. The tree grows but bears no fruit. Just like your prospects.',
        'Pipeline application sent. You are now part of their "talent community." Which is Latin for "spam list."',
        'Evergreen posting: submitted, ignored, and forgotten. In that order.',
      ],
      // Recruiter responses
      recruitReply: [
        'Replied to the recruiter. They replied "let\'s hop on a call." You have a meeting.',
        'Recruiter replied. Call was scheduled for "ASAP." You rescheduled to "someday."',
        'Replied to the recruiter. They replied with a calendar invite for "tomorrow at 3am EST." Declined.',
        'Recruiter: "excited to move forward!" Translation: "500 other candidates."',
      ],
recruitCall: [
        'Recruiter call complete. Asked about your "side hustle." You lied.',
        'Phone interview finished. They said "we\'ll be in touch." You know what that means.',
        'Recruiter call: "Where in 5 years?" You said "in a better job." They said "ambitious."',
        'Called the recruiter. 47-minute hold later: "technical difficulties." There were none.',
      ],
recruitBlock: [
        'You blocked the recruiter. They sent 12 more messages from different numbers.',
        'Blocked. Recruiter found you on Glassbore. Relentless.',
        'Blocked the recruiter. They replied from "noreply@linkfluence.com." Can\'t block that.',
        'Recruiter blocked. They sent a connection request. You blocked again.',
      ],
sendDM: [
        'Sent a DM. Recruiter read it. Left you on read. Classic.',
        'Direct message sent. Professionalism met with silence. Expected.',
        'DM sent to the hiring manager. They liked it. Maximum engagement achieved.',
        'You DM\'d the recruiter. They replied "thanks for reaching out!" Then silence.',
      ],
sendSSN: [
        'Sent your SSN. Should not have done that. Identity is now compromised.',
        'SSN submitted. Company now has your Social Security Number. Pray they use it responsibly.',
        'You sent your SSN to a company with a 2.1-star Glassbore rating. Future-you is not proud.',
        'SSN submitted. The hiring manager forwarded it to their personal email. You are now on a list.',
      ],
acceptCheck: [
        'Accepted the check. It bounced. Recruiter sent another check. Also bounced.',
        'Check deposited. Amount was "$0.00 and 3 years of experience." Deposited it anyway.',
        'Accepted the "offer." It was a PDF. Printed it. Framed it. Not real.',
        'Check accepted. Bank said "insufficient funds." Recruiter: "we\'re a startup." Both correct.',
      ],
      // Apply variants
applyTH: [
        'Applied for the take-home assignment. 40 hours of work. For $50.',
        'Take-home task submitted. It was a test. Failed it. Or passed. Nobody told you.',
        'Take-home assignment: "Build us a clone of Slack in 48 hours." Built a todo list. They wanted Slack.',
        'Did the unpaid take-home test. Real project. Hired someone else. Used your code.',
      ],
askCity: [
        'You asked about relocation. They said "remote." You packed your bags anyway.',
        'Location question answered. They said "hybrid." You said "I live in another state."',
        'You asked about location. They said "US-based." You are in Canada. You applied anyway.',
        'City question: "Are you authorized to work in the US?" You said "yes." The visa sponsorship process began.',
      ],
askPTO: [
        'You asked about PTO. They said "unlimited." You read the fine print. It\'s unlimited PTO.',
        'PTO policy explained. Unlimited vacation. Unlimited guilt. Unlimited guilt.',
        '"Unlimited PTO" means "take zero days and feel guilty about it." You took zero days. You felt guilty.',
        'You asked about vacation days. They said "we trust you." You trusted them. They didn\'t give you any days.',
      ],
askUSD: [
        'You asked about compensation. They sent a PDF with a single number: $30,000.',
        'Salary discussion initiated. The range was "competitive." The number was not.',
        'You asked about salary. They said "equity." You have equity in a company that has no revenue.',
        'USD question: "What\'s the budget?" They said "negotiable." You negotiated. They counter-offered less.',
      ],
negotiateRemote: [
        'You negotiated remote work. They agreed. Then scheduled 5 daily standups. Remote, but in person.',
        'Remote negotiation complete. They said "yes, but you must be available 9-5 EST." You are in PST.',
        'You asked for remote. They said "hybrid." You said "I\'ll be in the office once a month." They said "twice."',
        'Remote work negotiated. You get to work from home. You just have to log in from 6am to 10pm. Remote, technically.',
      ],
bulkApply: [
        'You applied to 50 jobs in one hour. Your hope plummeted. Your soul: priced at $0.23 per application.',
        'Bulk application sent. Bot Aura rejected them all. At least you tried.',
        'You applied to 100 jobs. 99 were "easy apply." 1 was a 20-page form. You filled out the form. It was a scam.',
        'Bulk applied. Your résumé was sent to 47 companies. 46 of them didn\'t reply. The 47th asked for a reference.',
      ],
keywordStuff: [
        'You stuffed keywords into your résumé. Bot Aura approved. The hiring manager rejected.',
        'Keyword injection successful. Your résumé now reads like a Wikipedia article. Bot Aura loves it.',
        'You added "Python," "JavaScript," and "AI" to your résumé. You know none of them. Bot Aura doesn\'t care.',
        'Keyword stuffing: your résumé now has "synergy" 14 times. Bot Aura marked it "top 1% candidate." The hiring manager disagrees.',
      ],
      // Post responses
postAgree: [
        'You agreed with the post. The algorithm showed it to 12 more people. Your clout went up.',
        'Agreed with the trending post. You look informed. You are not.',
        'You "liked" the post. The author saw it. They didn\'t follow you back. Classic.',
        'Agreed with the post. The algorithm rewarded you with more posts you agree with. The echo chamber deepens.',
      ],
postBait: [
        'Baited the comments. 47 replies, 3 from bots. Engagement: maximized.',
        'Controversial post published. The comments section is a battlefield. You lost.',
        'Posted "remote work is killing productivity." Comments erupted. You muted it.',
        'Bait post: "Hustle culture is overrated." 200 likes, 50 comments calling you lazy. Algorithm knows.',
      ],
postCarousel: [
        'Posted a carousel. 10 slides of "5 tips for career growth." Slide 10: "follow me."',
        'Carousel published. The algorithm showed it to your mom. She liked it. You felt proud.',
        'Carousel: "7 skills every developer needs." Slide 5: "LinkedIn networking." You wrote it.',
        'You created a 12-slide carousel. Nobody reads past slide 3. You put everything on slide 1.',
      ],
postCringe: [
        'You posted something cringe. 3 people liked it. 2 were bots. 1 was your ex.',
        'Cringe content published. Algorithm buried it. Friends shared it anyway.',
        'Posted a "humble brag." Comments were silent. Inbox was not.',
        'Cringe post: "I\'m grateful for this opportunity!" You have 3. All unpaid.',
      ],
postGood: [
        'Good post published. Got 15 likes. Mom gave 3 of them.',
        'Post went well. Algorithm showed it to 50. 5 liked it. Progress.',
        'Posted something genuine. 47 engaged. 46 recruiters. One cousin.',
        'Good post: shared a real story. Algorithm boosted it. Rent did not.',
      ],
postSincere: [
        'Posted something sincere. 200 likes. Felt seen. For 3 minutes.',
        'Sincere post published. Algorithm showed it to network. They commented "agreed!" Felt validated.',
        'You posted a vulnerable story about job hunting. 500 reactions, 0 offers. The algorithm doesn\'t care.',
        'Sincere post: "I\'m struggling to find a job." The comments said "stay positive!" You posted again the next day.',
      ],
postSlowBurn: [
        'Post slowly gained traction. 3 days later: 100 likes. You forgot you posted it.',
        'Slow burn post: didn\'t blow up. Got 47 views. From people who matter. Or should.',
        'You posted 2 weeks ago. Today it got 500 views. The algorithm found you. You are not ready.',
        'Slow burn: 10 views/day for 3 weeks. Then 1,000 in an hour. Algorithm is fickle.',
      ],
postThis: [
        'Posted this. Algorithm showed it to 12. 3 liked it. Mom was one.',
        'Post published. The void stared back, then liked it. The void is your bot account.',
        'You posted something random. The algorithm boosted it. Your network is confused. You are too.',
        'Post published. Algorithm showed it to 50. 2 liked it. One was a scam bot. Progress?',
      ],
      // Network responses
networkGo: [
        'Networking event: collected 12 business cards. Forgot all 12 names.',
        'Networking event: talked to 5 people, 3 recruiters, 2 job seekers.',
        'Attended a "networking mixer." Everyone on their phone. You were too. Bonding.',
        'Networking event: you exchanged LinkedIn QR codes with 8 people. None of them followed you back.',
      ],
congrats: [
        'Congratulated a connection. They liked your comment. Algorithm showed it to 50 people.',
        'Congratulatory message sent. Connection replied "thanks!" Felt good for 10 minutes.',
        'Congratulated someone on their new job. They hired you. Or just said "thanks." Hoping.',
        'Congratulated a former colleague. They posted about their new role. You clicked "Apply." They saw it. Awkward.',
      ],
endorse: [
        'Endorsed a skill. They endorsed you back. Algorithm rewarded both with clout.',
        'Endorsement given. Recipient felt validated. Felt like a good person. For 5 minutes.',
        'Endorsed someone in "Leadership." They endorsed you in "Synergy." Algorithm confused.',
        'Endorsement exchange: endorsed "Python," they endorsed "Excel." Neither is a developer.',
      ],
useReferral: [
        'You used a referral. The hiring manager saw your name. They looked at your résumé. It was still rejected.',
        'Referral submitted. The recruiter said "I\'ll pass this along." They did not.',
        'Used a referral. Hiring manager saw your name, looked at your résumé. Still rejected. Referral didn\'t help.',
        'Referral: friend said "I\'ll put in a good word." Didn\'t. Found out 3 weeks later. From a job post.',
      ],
slideIn: [
        'Slid into their DMs. They slid into their inbox. You were not in it.',
        'Direct message sent. The recruiter read it. Then slid into their next conversation. You were not remembered.',
        'Slid into hiring manager\'s DMs. They replied "interesting." You replied "let\'s talk!" Never did.',
        'Slide into DMs: sent a connection request with a note. They accepted. You: "looking for opportunities." They: "check careers page."',
      ],
      // Resume responses
      rewriteBullets: [
        'You rewrote your résumé bullets as "impact metrics." It now reads like a war crime confession.',
        'Bullet points transformed into quantified achievements. Your experience is now "optimized for the Bot Aura."',
        'Résumé rewritten. "Managed team" became "Led cross-functional synergy initiatives." HR called it "cringe."',
        'Resumé bullets rewritten. "Worked on project" became "Spearheaded paradigm-shifting deliverables." Bot Aura approved. You lied.',
      ],
      writeCover: [
        'Wrote a cover letter. The posting said "optional." You wrote 3 paragraphs anyway.',
        'Cover letter composed. Poured your soul into it. Bot Aura strips all soul.',
        'Cover letter written. Posting said "no cover letters." You sent it. They replied "as stated, no cover letters."',
        'You wrote a cover letter. It was 4 paragraphs. The Bot Aura read it as "applicant: unknown." You added "to whom it may concern."',
      ],
      plainText: [
        'Sent résumé as plain text. HR director cried. Some things should stay PDF.',
        'Plain-text résumé sent. The formatting is gone but your desperation remains intact.',
        'You sent your résumé as plain text. The Bot Aura parsed it as "applicant: error." You resent it as a Word doc.',
        'Plain-text résumé: you called it "minimalist." Recruiter called it "broken." Both correct.',
      ],
      // Investigate responses
      aiCover: [
        'Discovered the job posting was written by AI. AI is now applying to your résumé. The circle closes.',
        'AI-generated job description detected. AI writer is now unemployed. Karmic justice.',
        'Analyzed the job posting. AI-generated. AI used "synergy" 7 times. Applied anyway.',
        'AI job description: more buzzwords than your résumé. You felt competitive. Applied anyway.',
      ],
      algChange: [
        'Algorithm changed your feed. Now shows "entry-level VP" roles. Progress.',
        'Algorithm updated. Feed now reflects your true self: desperate applicant for 500 jobs.',
        'Linkfluence algorithm changed. Your feed now shows jobs requiring 15 years of experience for "entry-level." You applied.',
        'Algorithm update: jobs in cities you don\'t live in. Salary: "negotiable." You\'re suspicious.',
      ],
      lieYears: [
        'Lied about experience. Interviewer asked a follow-up. You are sweating.',
        'Lie entered: "8 years." Reality: 8 months. The interview will be awkward. You brought props.',
        'You claimed "10 years experience." You graduated last year. The interviewer nodded. You sweated more.',
        'Lied about experience: you claimed "senior level." They asked about system design. You pivoted to "team player."',
      ],
      certComplete: [
        'You completed a "certificate course" that took 3 weeks and cost $49.99. You are now "certified."',
        'Certificate earned. LinkedIn notified 500+ connections. Felt accomplished and slightly foolish.',
        'Certificate completed. It was a 2-hour Udemy course. You added it to your résumé. Your manager added "suspicious."',
        'Certificate earned from a "university" that doesn\'t exist. The Bot Aura didn\'t notice. Your employer might.',
      ],
      // Event/micro-event responses
      captchaEvent: [
        'Captcha: "Select all squares with bicycles." Selected 47 squares. Machine unimpressed.',
        'Captcha completed. Proved you\'re not a robot. Job application still rejected you.',
        'Captcha: "Select all traffic lights." Selected 12. 8 wrong. Failed. Job application continued.',
        'Captcha: "Prove you\'re human." Clicked 15 images of buses. Bot Aura: "close enough." You cried.',
      ],
      bossFight: [
        'Boss fight: The Final Interview. You defeated it with "synergy" and a PowerPoint. The offer is coming.',
        'Boss fight won! Survived the panel interview. 5 interviewers, 3 questions, 1 offer. Victorious.',
      ],
      paEvent: [
        'Personality assessment completed. Result: "May panic in group settings." HR noted.',
        'Assessment submitted. Algorithm classified you as "culture fit: borderline." You expected better.',
        'PA results: "High independence, low agreeableness." HR: "we need a team player." You: "I\'m independent."',
        'Personality assessment: you scored "high stress tolerance." They said "good, we\'ll give you 60-hour weeks."',
      ],
      // Rest/gig responses
sleep: [
        'You slept. The job market continues without you. It will continue after you too.',
        'Sleep complete. You felt human again. For about 8 hours. Then the applications resumed.',
        'You slept 8 hours. Your rent increased while you were unconscious. Classic.',
        'Sleep: you dreamed of interview questions. You woke up sweating. The dreams were real.',
      ],
therapy: [
        'You went to therapy. The therapist said "you need a job." You said "I know." The session was over.',
        'Therapy session complete. The therapist recommended "self-care." You recommended "a salary."',
        'Therapy: talked about job hunting 50 minutes. Therapist asked about childhood. You said "fine."',
        'Therapy: therapist said "you have control." You said "I have rent." They said "boundaries." You said "boundaries don\'t pay rent."',
      ],
      cookMeal: [
        'Cooked a meal. Recipe was on a 30-min video that took 2 hours. Food was mediocre. Journey was real.',
        'Meal prepared. It\'s just cereal again but you ate it with intention. That counts.',
      ],
      eatCereal: [
        'Ate cereal for dinner. 11pm. Mother would be proud. Landlord would not.',
        'Cereal consumed. Job hunt requires fuel. Chose the fuel in a box with a cartoon mascot.',
        'Cereal for dinner: ate it at 2am. Box said "serve with milk." Drank from carton. Regretted it.',
        'Ate cereal. Third cereal this week. Fridge has 47 cereal boxes. Rent is unpaid.',
      ],
      orderFood: [
        'Ordered food delivery. Driver said "I\'ll be there in 5 minutes." It\'s been 47.',
        'Food ordered. Driver is circling the block. They are always circling.',
        'Food delivery: app said "15 minutes." Took 47. Ate it cold. Still better than cereal.',
        'Food ordered. Driver: "I\'m at the wrong address." You: "I\'m at the right one." The driver cried.',
      ],
      // Gig responses
      fiverrGig: [
        'Fiverr gig completed. $15 earned. Wrote a LinkedIn "About" section for someone with no LinkedIn.',
        'Fiverr gig done. Soul: devalued. Bank account: marginally improved. Math of survival.',
        'Fiverr gig: wrote a resume for $10. Client said "thanks." You both knew it was terrible.',
        'Fiverr gig completed. Wrote a cover letter for $8. Client used it. Got the job. You got $8.',
      ],
      uberGig: [
        'Rideshare shift: made $20. Passenger cried. You didn\'t. Desensitized.',
        'Uber shift finished. Drove a stranger across town. They tipped $1. Algorithm took $7.',
        'Uber shift: drove someone to the airport. They said "thanks for the ride." You: "thanks for the $3."',
        'Rideshare gig: picked up a passenger. They asked "are you hungry?" You said "yes." Didn\'t tip.',
      ],
      userTest: [
        'User testing completed. $10 earned. Thought out loud while clicking the wrong button. They wanted to hear that.',
        'User test done. Felt seen for 10 minutes. Then they asked about "thought process." You lied.',
        'User test: you clicked through a prototype. The researcher said "what were you thinking?" You said "I was thinking about rent."',
        'User test: $15 earned. Told them the app was "confusing." They said "we\'ll improve it." They won\'t.',
      ],
      dataEntry: [
        'Data entry marathon complete. 10,000 rows. Script will replace you by Tuesday.',
        'Data entry done. Now a human API. Pay is $12. Existential dread is free.',
        'Data entry: typed 500 rows into a spreadsheet. A Python script could do it in 3 seconds. You were paid $8.',
        'Data entry gig: entered names and addresses into a database. Realized you were the database. For $10/hour.',
      ],
      consulting: [
        'Consulting call complete. $50 earned. Advised someone on "digital transformation." They use Windows 7.',
        'Consulting gig done. Sold "synergy" to someone who asked what a "cloud" was. The future is now.',
        'Consulting: told a startup to "hire a CTO." They said "can\'t afford it." You said "then can\'t afford me." They paid anyway.',
        'Consulting: advised a company on "agile methodology." They use spreadsheets. Advised "buy better spreadsheets."',
      ],
      buildPortfolio: [
        'Portfolio built. 3 projects, 2 for school. Credibility gains are real.',
        'Built a portfolio project. In GitHub. 0 stars. 100% more credibility.',
        'Portfolio updated. Added a "todo app" built in React. 3 issues. All yours.',
        'Built a portfolio weather app. Uses an API. The API costs money. You used the free tier.',
      ],
      ceoFamily: [
        'CEO announced "family culture." You are now part of a family that doesn\'t pay you.',
        '"We\'re a family!" said the CEO. Your family doesn\'t make you work 80-hour weeks.',
        'CEO: "we\'re a family." You asked for therapy. They said "startup." You asked for a raise.',
        '"Family culture" announced. Your "family" excludes healthcare, PTO, and a living wage.',
      ],
      // Other responses
      deleteApp: [
        'Deleted a job application. Freedom. Company will never know what they missed.',
        'Application withdrawn. Bot Aura: "applicant declined." You declined nothing. You were declined.',
        'Deleted the application. Company sent a thank you email. Deleted that too.',
        'Application deleted. Bot Aura: "applicant withdrew." You withdrew nothing. You were withdrawing from reality.',
      ],
doomscroll: [
        'Doomscrolled 2 hours. Learned about a job in a field you don\'t want in a city you don\'t live in.',
        'Doomscroll complete. Hope decreased. Rent increased. Algorithm rewarded you with more doom.',
        'Doomscrolled 3 hours. Applied to 47 jobs. All scams. You felt productive.',
        'Doomscroll: 50 job postings. 49 required 10 years for "entry-level." You cried. Scrolled more.',
      ],
touchGrass: [
        'Went outside. Grass was green. Job market was gray. Both remained unchanged.',
        'Touch grass completed. Sun was shining. Inbox was not. Went back inside.',
        'Went for a walk. Saw a bird with a job. The bird didn\'t apply either.',
        'Touch grass: you sat on a bench for 20 minutes. A pigeon ate your sandwich. You felt connected to nature.',
      ],
slackHang: [
        'Slack hang: 47 meetings scheduled, 0 jobs offered. Calendar full. Inbox emptier.',
        'Virtual hangout: talked to 12 people, 3 recruiters, 2 job seekers. Exchanged QR codes.',
        'Slack hang: attended a "virtual coffee chat." Other person had a job. You wanted one. They didn\'t.',
        'Slack hangout: met someone "in your field." Same field. Unemployed too. Bonding.',
      ],
mentorMeet: [
        'Mentor meeting complete. They said "just be yourself." You were. They said "be more confident."',
        'Mentor session finished. Gave advice. You took notes. Did none of it. Felt guilty.',
        'Mentor meeting: "network more." You: "I try." They: "try harder." You tried. Cried.',
        'Mentor session: "follow your passion." You: "I need rent." They: "passion pays." You: "rent doesn\'t."',
      ],
hiringPTO: [
        'Hiring manager took PTO. Application stuck. Recruiter stuck. Cycle continues.',
        'Hiring manager on vacation. Application in limbo. Recruiter: "back next week."',
        'Hiring manager took PTO. Application sat 3 weeks. They: "welcome back!" You: "found another job."',
        'PTO announced. Recruiter: "resume interviews when they return." Returned. Quit.',
      ],
layoffWave: [
        'Layoff wave hits. Friend lost their job. Update LinkedIn. You update yours. Both get no replies.',
        'Layoffs announced. Company lost 10% of staff. Lost hope. Recruiter lost their job too.',
        'Layoff wave: "friend" at the company laid off. Sent a LinkedIn post. Commented "stay strong!" No reply.',
        'Layoffs hit. Company: "tough decision." Decision was tough. Money was easy.',
      ],
massLayoffs: [
        'Mass layoffs announced. Company lost 500 employees. Lost your referral. Cycle continues.',
        'Layoffs: 1,000 lost jobs. Lost hope. Recruiter lost job too. Cycle continues.',
        'Mass layoffs: "network" lost 50 people. LinkedIn feed is now a memorial. Update résumé.',
        'Mass layoffs hit. CEO: "we\'re optimizing." You: "we\'re starving." CEO didn\'t reply.',
      ],
friendHired: [
        'Your friend got hired. They posted about it. You liked the post. You cried in the shower.',
        'Friend hired. The company posted about it. You posted about it. Your rent didn\'t post about you.',
        'Friend got hired. You congratulated them. They said "thanks." You said "you deserve it." They said "luck." You knew it wasn\'t luck.',
        'Friend hired: you commented "congrats!" They replied "thanks!" You replied "let\'s grab coffee!" They didn\'t reply.',
      ],
profileViewed: [
        'Your profile was viewed. By a recruiter. They viewed it for 3 seconds. Then viewed 47 others.',
        'Profile viewed. The recruiter looked at your résumé. Then looked at 47 others. You were #48.',
        'Profile viewed: a recruiter looked at your LinkedIn. They clicked "Apply." They applied to you. You were confused.',
        'Profile viewed. The recruiter spent 12 seconds on your profile. Then moved on. 12 seconds was more attention than your ex gave you.',
      ],
      finalInterview: [
        'Final interview complete. Panel was 7 people, each asking different questions. Answered all. Exhausted.',
        'Final round finished. Asked "where in 5 years?" You: "not here." They laughed. You did not.',
        'Final interview: 45 minutes, 3 technical questions, 2 behavioral. They asked "what color are you?" You said "white." Wrong color.',
        'Final round: they asked "what\'s your weakness?" You said "I work too hard." They said "we all do." You insisted.',
      ],
      rolePaused: [
        'Role paused. "We\'ve received an overwhelming response." You received an overwhelming rejection.',
        'Position paused. Hiring manager moved to a startup. Startup has no budget. Cycle continues.',
        'Role paused. Recruiter: "pausing hiring." You: "when will you resume?" They: "Q3." It\'s Q4.',
        'Position paused. Company said "repost in 6 months." Reposted in 6 weeks. Lower salary.',
      ],
      vibesShift: [
        'Vibes shifted. Recruiter\'s enthusiasm dropped. Salary range narrowed. You felt it.',
        'Vibes shift detected. Conversation went from "we\'re a family" to "let\'s circle back." You know how this ends.',
        'Vibes shift: recruiter went from "excited" to "let me check with HR." You knew what "check with HR" means.',
        'Vibes shifted. Recruiter said "interesting" flatly. You said "thank you." They said "we\'ll be in touch." They won\'t.',
      ],
      ignore: [
        'Ignored. In-box grows quieter. Peace, of a sort.',
        'Swiped left. Job will be forgotten by both you and the algorithm.',
      ],
      discard: [
        'Discarded. Void accepts your rejection. Grateful. Void is always grateful.',
        'Ignored. You chose peace over a job posting that asks for 10 years of experience in a tool released Tuesday.',
        'Discarded. Your inbox is 0.3% less painful. Progress.',
        'Discarded the opportunity. Company will never know what they missed. Or care.',
        'Discarded. Chose yourself over a job posting that said "fast-paced." Not fast. Tired.',
      ],
      acceptCheck: [
        'You signed the background check. They signed your soul in return.',
        'Background check complete. The void saw all your secrets and nodded.',
        'You signed the NDA. The NDA is longer than your résumé.',
      ],
      applyTH: [
        'Built the unpaid take-home in your lunch break. They called it "culture fit."',
        'Delivered the take-home at 3am. They said "thanks, but we moved on."',
        'Solved an unpaid assignment. It felt like free consulting.',
      ],
      askCity: [
        'Asked for the office address. Got "we\'re rethinking our physical footprint."',
        'They said "hybrid." You said "where?" HR said "that\'s not decided yet."',
        'Asked about relocation. They said "we pay for it in exposure."',
      ],
      askPTO: [
        'Asked about PTO. They showed you the employee handbook from 2012.',
        '"Unlimited PTO" means "no PTO but also no guilt."',
        'Asked if you could take Monday off. HR said "Monday is accountability day."',
      ],
      askUSD: [
        'Asked for $95k. HR said "we pay in equity." You said "in what company?" Silence.',
        'Requested salary in USD. They offered crypto. You gave them silence.',
        'Asked for base salary. Recruiter paused. "We\'re actually a talent platform." Silence.',
      ],
      bulkApply: [
        'Applied to 15 jobs before breakfast. Your résumé became a statistic.',
        'Clicked "easy apply" until your fingers got tired. The void said "nice try."',
        'Bulk-applied with the energy of someone who gave up hope at 8am.',
      ],
      congrats: [
        'You said "congrats!" They said "same." Nobody was promoted.',
        'Wrote "congrats!" They replied "congrats!" It was a loop.',
        'Congratulated someone on their promotion. They replied with three emojis.',
      ],
      declineUnpaid: [
        '"No pay, no play." They said "but you\'ll gain experience!" You gained freedom.',
        'Declined the unpaid internship. They called you "difficult."',
        'Told them "I\'m worth more than exposure." Exposure said "you\'re right."',
      ],
      doomscroll: [
        'Scrolled through 47 job postings at 2am. None wanted humans.',
        'Doomscrolled until the algorithm offered you a job. It was a scam.',
        'Found a job posting at 3am. Applied at 3:17am. Regretted it at 8am.',
      ],
      endorse: [
        'Endorsed someone\'s skills. They endorsed your LinkedIn post from 2019.',
        'Gave them Python, SQL, and "Resilience." They gave you "Can Work Independently."',
        'Clicked "endorse." They clicked "Coffee" and "Punctuality."',
      ],
      friendHired: [
        'Your friend got hired. They forgot to send you the referral link.',
        'You congratulated your friend. They said "same." Nobody was hired.',
        'Friend got an offer. You said "congrats" through the void.',
      ],
      hiringPTO: [
        'Asked for PTO during the interview. Offer letter said "unlimited PTO (subject to approval)."',
        '"We want work-life balance." HR laughed. The offer letter laughed louder.',
        'Negotiated PTO. They gave you a calendar with every Sunday in red.',
      ],
      keywordStuff: [
        'Added keywords until your soul was just keywords. Bot Aura loved it.',
        'Stuffed your résumé with buzzwords. Each word was a small piece of your soul.',
        'Keyword-stuffed your résumé. Bot Aura said "delicious." You said "please."',
      ],
      layoffWave: [
        'Saw the layoffs at 6am. Your inbox had the memo at 6:03am.',
        'Company went silent. You started the mass apply routine. The routine was tired too.',
        'Pink slip arrived. You applied for "Senior Everything." They replied "everything is junior."',
      ],
      massLayoffs: [
        'They let go everyone. You let go hope. Hope let you go back.',
        'Company laid off 40% of staff including the HR person who sent the email.',
        'News broke at 5pm. The memo said "strategic realignment." Nobody aligned anything.',
      ],
      mentorMeet: [
        'Met with a mentor. They said "follow your passion." You said "can you pay my rent?"',
        'Your mentor said "network more." Your network said "network less."',
        'Mentor meeting. They gave advice. You gave them silence.',
      ],
      negotiateRemote: [
        'Negotiated remote. They said "hybrid once a week." You negotiated back. They fired you.',
        '"Remote first" became "remote sometimes." You said "what does that mean?"',
        'Asked for remote. They said "the office is where the action is." The office was empty.',
      ],
      networkGo: [
        'Attended a networking event. Nobody shared contact info. The bar shared something.',
        'Met 7 people. 6 said "let\'s follow up." 1 followed up (it was a recruiter).',
        'Networking night. You got one referral. They said "keep applying."',
      ],
      nothing: [
        'You chose nothing. The void chose silence. Silence chose peace.',
        'No action taken. The algorithm forgot you existed. It\'s fine.',
        'Said nothing. Did nothing. Achieved nothing. The void said "progress."',
      ],
      postAgree: [
        'Posted "This is so true!" under a thread about hiring. Got 3 likes.',
        '"Agree" under someone\'s post. They said "agree back." It\'s a cult.',
        'Commented "Agree" on a post about agreeing. The algorithm agreed.',
      ],
      postBait: [
        'Posted something controversial. Arguments multiplied. You deleted the account.',
        'The bait was "AI will destroy jobs." The comments destroyed the algorithm.',
        'Posted bait. Comments said "we\'re already destroyed." Nobody bit.',
      ],
      postCarousel: [
        'Made a carousel of 7 slides. Slide 6 was just whitespace.',
        'Posted a carousel. Nobody swiped. You swiped. Got stuck on slide 3.',
        'Made slides. Shared slides. Nobody viewed slides. The algorithm made slides.',
      ],
      postCringe: [
        'Posted "I\'m hiring!" when nobody was. Comments were kind. Kind comments are rare.',
        '"I\'m excited to announce..." Nobody announced. You announced. It was cringe.',
        'Posted "I\'m looking for roles!" Reply came at 3am: "I\'m looking too."',
      ],
      postGood: [
        'Posted something thoughtful. Nobody noticed. Nobody was there.',
        'Wrote a thoughtful post. Comments said "same" and "relatable."',
        'Shared thoughts. One friend liked it. It was enough.',
      ],
      postSincere: [
        'Posted honestly about your job hunt. Comments said "relatable."',
        '"Job hunting is hard." They said "yours is hard." Yours was harder.',
        'Told the truth. Nobody believed the truth. The truth posted an AI reply.',
      ],
      postSlowBurn: [
        'Posted "slow burn." Nobody burned. Nobody slowed. The post burned quietly.',
        '"Slow burn" about layoffs. Comments burned faster than the post.',
        'Posted something real. Nobody reacted. You unposted. The void posted it back.',
      ],
      postThis: [
        'Posted "I\'m looking!" Nobody looked. Void looked. Void didn\'t find.',
        '"Open to work" post. Open to work. Nobody opened.',
        'Shared a job hunt post. The algorithm shared it with nobody.',
      ],
      profileViewed: [
        'Saw someone view your profile at 2am. You viewed theirs. Both of you left.',
        'Profile viewed by "Recruiter, AI Corp." The AI had opinions about your résumé.',
        'Someone looked at your profile. They didn\'t apply. They didn\'t leave.',
      ],
      recruitBlock: [
        'Blocked the recruiter. They sent an email, voicemail, carrier pigeon. All blocked.',
        '"Do not call me at 6am." You never heard from them again.',
        'They called. You blocked. They texted. Your phone said "nope."',
      ],
      recruitCall: [
        'Recruiter called. You called back. Both left voicemails.',
        '"Hey, quick question!" You hung up when they said "quick." Always quick.',
        'Recruiter call. They said "exciting role." You said "exciting how?" Silence.',
      ],
      saveReferral: [
        'Saved a referral for later. Later never came. The referral expired.',
        '"Thanks, I\'ll use this soon." You meant it. Soon was never.',
        'Opened the referral tab. Closed it. Opened again. It expired.',
      ],
      sendDM: [
        'Sent a DM at 2am. They replied at 3am: "what?" You said "nothing."',
        'DM\'d someone at a conference. They replied with "DMs disabled."',
        'Messaged cold. They said "what?" You said "sorry." They said "nevermind."',
      ],
      sendSSN: [
        'Sent your SSN to "Government Portal." They said "thanks for trusting us." It wasn\'t.',
        'Pasted your SSN. The website asked for your mother\'s maiden name too.',
        'Submitted "confidential info." Reply said "your data is secure with us." It wasn\'t.',
      ],
      slackHang: [
        'Slack hangout with a recruiter. Both of you said "good vibes only."',
        'Joined the Slack channel. Nobody posted. You were the first post.',
        'Slacked about jobs. They slacked back about coffee. Coffee slacked about jobs.',
      ],
      sleep: [
        'You slept. The algorithm kept running. None of the jobs kept.',
        'Slept through 12 emails. None of them were offers. All were noise.',
        'Dreamt about an offer. Woke up to a job listing from 2017.',
      ],
      slideIn: [
        'Slid into DMs. Nobody slid back. You slid alone. The slide was DMs.',
        'Sent "quick question!" at 2am. Nobody answered. You answered "nothing."',
        'Slid. Nobody slid back. You slid away.',
      ],
      therapy: [
        'Went to therapy. They said "keep applying." You applied. You kept applying.',
        '"I need breaks." Therapist said "schedule them." You scheduled one. You didn\'t take it.',
        'Talked about job hunting. Therapist talked. You listened. The void listened too.',
      ],
      touchGrass: [
        'Touched grass. The grass said "go back inside. The void has jobs."',
        'Went outside for air. The air said "the algorithm is online."',
        'Grass said "relax." You relaxed. Relaxed. You weren\'t relaxed.',
      ],
      useReferral: [
        'Used a referral. It referred you to an automated rejection.',
        'Your friend referred you. The company said "no, but keep applying."',
        'Referred to a recruiter. They referred you to HR. It was a game of telephone.',
      ],
      default: [
        'Action taken. The void noted it. No one noted.',
        'You clicked something. Something clicked back. Something clicked away.',
        'The algorithm processed your action. The algorithm is busy. You wait.',
      ],
    };

    const pool = responses[effect] || responses.default;
    let response = DATA.pick(pool, E._rng || Math);

    /* Append actual delta values to match journal entries */
    if (deltas && deltas.length > 0) {
      const deltaStr = deltas.map(d => {
        const sign = d.delta > 0 ? '+' : '';
        return `${sign}${d.delta} ${d.display}`;
      }).join(', ');
      response = `${response} (${deltaStr})`;
    }

    return response;
  }

  /* Show result modal with toast */
  function showResultModal(title, response, deltas) {
    if (response) {
      E.showToast(response, 'info');
      const modal = document.getElementById('result-modal');
      if (modal) {
        document.getElementById('result-title').textContent = title || '✅ Applied!';
        document.getElementById('result-response').textContent = response;
        const changesEl = document.getElementById('result-stat-changes');
        if (deltas && deltas.length > 0) {
          const html = deltas.map(d => {
            const sign = d.delta > 0 ? '+' : '';
            const cls = d.delta > 0 ? 'positive' : 'negative';
            const arrow = d.delta > 0 ? '↑' : '↓';
            return `<div class="result-stat ${cls}">${d.icon} ${d.display}<span class="delta ${cls}">${sign}${d.delta} ${arrow}</span></div>`;
          }).join('');
          changesEl.replaceChildren(htmlToDom(html));
        } else {
          changesEl.innerHTML = '';
        }
        modal.classList.add('active');
        document.getElementById('result-continue').onclick = () => modal.classList.remove('active');
      }
    }
  }

  const STAGE_DISPLAY = {
    'waiting':'Waiting','auto-reply':'Auto-Reply','screening-form':'Screening Form',
    'recruiter-screen':'Recruiter Screen','video-interview':'Video Interview',
    'personality-test':'Personality Test','take-home':'Take-Home',
    'panel-interview':'Panel Interview','salary-stall':'Salary Stall',
    'reference-checks':'References',
    'final-interview-1':'Final Interview','final-interview-2':'"Final" (again)','final-interview-3':'"Final" (still)',
    'offer-pending':'Offer Pending',
  };
  const STAGE_BADGE_CLASS = {
    'waiting':'applied','auto-reply':'applied','screening-form':'auto-screen',
    'recruiter-screen':'recruiter','video-interview':'video-int',
    'personality-test':'video-int','take-home':'take-home',
    'panel-interview':'panel','salary-stall':'recruiter',
    'reference-checks':'panel',
    'final-interview-1':'final','final-interview-2':'final','final-interview-3':'final',
    'offer-pending':'offer',
  };

  function showFollowUpModal(result) {
    if (!result) return;
    if (result.type === 'minigame') { launchFollowUpMinigame(result); return; }

    const modal = document.getElementById('followup-modal');
    document.getElementById('followup-title').textContent = `${result.title}${result.company ? ' — ' + result.company : ''}`;
    document.getElementById('followup-response').textContent = result.message;

    const statMeta = {
      rent:{icon:'💰',display:'Money'}, hope:{icon:'💡',display:'Hope'},
      credibility:{icon:'🎯',display:'Cred'}, clout:{icon:'⭐',display:'Clout'},
      atsFavor:{icon:'🤖',display:'Bot Aura'}, robotSuspicion:{icon:'👁️',display:'Bot Sus'},
      humanContact:{icon:'🤝',display:'Human'}, energy:{icon:'⚡',display:'Energy'},
    };

    document.getElementById('followup-stat-changes').innerHTML = (result.stats||[])
      .map(d => {
        const m = statMeta[d.stat] || {icon:'?',display:d.stat};
        const sign = d.delta > 0 ? '+' : '';
        const cls = d.delta > 0 ? 'positive' : 'negative';
        return `<div class="result-stat ${cls}">${m.icon} ${m.display}<span class="delta ${cls}">${sign}${d.delta}</span></div>`;
      }).join('');

    const continueBtn = document.getElementById('followup-continue');
    if (result.type === 'terminal-offer') {
      continueBtn.textContent = '🎉 Accept the Offer';
      continueBtn.className = 'title-btn gold';
    } else if (result.type === 'terminal-ghost' || result.type === 'terminal-reject' || result.type === 'terminal-pause') {
      continueBtn.textContent = 'Move On';
      continueBtn.className = 'title-btn';
    } else {
      continueBtn.textContent = 'Got it';
      continueBtn.className = 'title-btn';
    }

    modal.classList.add('active');
    setTimeout(() => continueBtn.focus(), 100);
    continueBtn.onclick = () => modal.classList.remove('active');
  }

  function launchFollowUpMinigame(result) {
    const cb = (success) => {
      if (success) { result.lead.stageIdx++; }
      renderLeads();
      renderStatBar();
    };
    switch (result.minigame) {
      case 'screening-form': startScreeningForm(result.lead, cb); break;
      case 'video-interview': startVideoInterview(result.lead, cb); break;
      case 'personality-test': startPA(result.lead, cb); break;
      case 'take-home': startTakeHome(result.lead, cb); break;
      case 'panel-interview': startPanelInterview(result.lead, cb); break;
      case 'salary-stall': startSalaryStall(result.lead, cb); break;
    }
  }

  function showSpamConfirmModal(lead, message) {
    const overlay = htmlToDom(`<div id="spam-modal" class="modal-overlay">
      <div class="modal">
        <div class="modal-title">🚫 Mark ${lead.company} as Spam?</div>
        <div class="modal-body"><p style="margin-bottom:.75rem;font-size:.9rem;color:var(--text-muted)">${message}</p></div>
        <div class="modal-footer" style="display:flex;gap:.5rem;justify-content:flex-end">
          <button class="title-btn secondary cancel-spam-btn">Cancel</button>
          <button class="title-btn spam-confirm-btn">Confirm</button>
        </div>
      </div>
    </div>`);
    document.body.appendChild(overlay);
    /* Must query actual DOM element — appendChild empties the DocumentFragment */
    const modal = document.querySelector('#spam-modal');
    modal.querySelector('.cancel-spam-btn').onclick = () => modal.remove();
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    return modal;
  }

  function renderLeads() {
    const g = E.state;
    const list = document.getElementById('leads-list');
    const leads = g.run.activeLeads || [];

    /* Update leads toggle button count */
    const toggleBtn = document.getElementById('leads-toggle-btn');
    const leadsCountEl = document.getElementById('leads-count');
    if (toggleBtn && leadsCountEl) {
      leadsCountEl.textContent = `(${leads.length})`;
      toggleBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    }

    if (leads.length === 0) {
      list.replaceChildren(htmlToDom('<div style="font-size:.75rem;color:var(--text-muted);padding:.5rem">No active leads. Your pipeline is as empty as your inbox.</div>'));
      return;
    }

    const leadsFrag = htmlToDom(leads.map(lead => {
      const currentStageId = lead.track?.[lead.stageIdx] || 'pending-decision';
      const stageDisplay = STAGE_DISPLAY[currentStageId] || 'Decision Pending';
      const stageClass = STAGE_BADGE_CLASS[currentStageId] || 'applied';
      const days = lead.daysSinceUpdate;
      const daysClass = days >= 5 ? 'color:var(--red)' : days >= 3 ? 'color:var(--gold)' : '';

       const vibe = lead.ghostVibe ?? 50;
       const tier = E.getVibeTier(vibe);
       const vibeWidth = vibe;
       const cls = tier.cls + (days > 5 ? ' gv-flicker' : '');
       const tipArr = DATA.GHOSTVIBE_TOOLTIPS || [];
       const tipIdx = (lead.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % (tipArr.length || 1);
       const tip = tipArr[tipIdx] || "Trust it at your peril.";
       let vibeHTML = `<div class="gv-bar-wrap" title="${tip.replace(/"/g, '&quot;')}"><div class="gv-bar ${cls}" style="width:${vibeWidth}%;background:${tier.color}"></div><div class="gv-label">${tier.label}</div></div>`;
       const spamArr = DATA.SPAM_BUTTON_LABELS || ["🚫 Spam"];
       const spamLabel = spamArr[(lead.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % spamArr.length];
       return `<div class="lead-item">
        <div class="lead-company">${lead.company}</div>
        <div class="lead-role">${lead.role}</div>
        <span class="lead-badge ${stageClass}">${stageDisplay}</span>
        ${vibeHTML}
        <div class="lead-days-since" style="${daysClass}">${days}d ago</div>
        ${days >= 3 ? `<button class="lead-followup-btn" data-lead="${lead.id}" ${g.run.energy<1?'disabled':''} aria-label="Follow up with ${lead.company}">Follow Up (☕1)</button>` : ''}
        <button class="lead-spam-btn" data-lead="${lead.id}" data-company="${lead.company}" aria-label="Mark ${lead.company} as spam">${spamLabel}</button>
      </div>`;
    }).join(''));

    /* Follow-up handlers */
    leadsFrag.querySelectorAll('.lead-followup-btn:not(:disabled)').forEach(btn => {
      btn.onclick = () => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        const result = E.followUpLead(btn.dataset.lead);
        renderLeads();
        renderStatBar();
        renderRunLog();
        checkDayEnd();
        if (result) showFollowUpModal(result);
      };
    });

    /* Mark as Spam handlers — custom modal */
    leadsFrag.querySelectorAll('.lead-spam-btn').forEach(btn => {
      btn.onclick = () => {
        const lead = leads.find(l => l.id === btn.dataset.lead);
        if (!lead) return;
        const confirmLines = DATA.SPAM_CONFIRM_LINES || [];
        const confirmLine = confirmLines[(lead.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % confirmLines.length] || "You sure?";
        const spamModal = showSpamConfirmModal(lead, confirmLine);
        if (spamModal) {
          const confirmBtn = spamModal.querySelector('.spam-confirm-btn');
          confirmBtn.onclick = () => {
            E.markAsSpam(lead);
            renderLeads();
            renderStatBar();
            renderRunLog();
          };
        }
      };
    });
    list.replaceChildren(leadsFrag);

    /* Update max leads tracking */
    g.run.flags.maxActiveLeads = Math.max(g.run.flags.maxActiveLeads || 0, leads.length);
  }

  function renderRunLog() {
    const g = E.state;
    const log = document.getElementById('run-log');
    const entries = (g.run.log || []).slice(-5).reverse();
    log.replaceChildren();
    const meta = {rent:'💰',hope:'💡',credibility:'🎯',clout:'⭐',atsFavor:'🤖',robotSuspicion:'👁️',humanContact:'🤝',energy:'☕',scamEvidence:'🚩',ghostEvidence:'👻',scamsFell:'🛡️',buzzwords:'🔤'};
    entries.forEach(e => {
      const div = document.createElement('div');
      div.className = 'run-log-entry';
      const daySpan = document.createElement('span');
      daySpan.className = 'log-day';
      daySpan.textContent = 'D' + e.day;
      div.appendChild(daySpan);
      div.appendChild(document.createTextNode(e.text));
      if (e.deltas && e.deltas.length) {
        const deltaSpan = document.createElement('span');
        deltaSpan.className = 'log-deltas';
        deltaSpan.style.cssText = 'color:var(--accent);font-size:.7rem;margin-left:.3rem;white-space:nowrap;';
        deltaSpan.textContent = ' ' + e.deltas.map(d => {
          const sign = d.delta > 0 ? '+' : '';
          return `${meta[d.key]||'📊'}${sign}${d.delta}`;
        }).join(' ');
        div.appendChild(deltaSpan);
      }
      log.appendChild(div);
    });
  }

  function renderNewsTicker() {
    const ticker = document.getElementById('news-ticker');
    const g = E.state;
    let headlines = [...DATA.HEADLINES.slice(0, 2)];

    /* Feed shift headline */
    if (g.run._feedShifted && DATA.FEED_SHIFT_HEADLINES.length) {
      const shift = DATA.pick(DATA.FEED_SHIFT_HEADLINES, Math.random);
      headlines.unshift(`<strong style="color:var(--gold)">🔮 ${shift}</strong>`);
    }

    ticker.replaceChildren(htmlToDom(headlines.map(h => `<div style="margin-bottom:.5rem">📌 ${h}</div>`).join('')));
  }

  function checkDayEnd() {
    const g = E.state;
    if (g.run.energy <= 0) {
      /* Auto end day */
      setTimeout(() => endDay(), 500);
    }
  }

  function endDay() {
    const g = E.state;
    document.removeEventListener('keydown', handleKey);

    /* Ensure _prevStats and _prevFlags are set for EOD stat changes */
    if (!g.run._prevStats) {
      g.run._prevStats = {...g.run.stats};
    }
    if (!g.run._prevFlags) {
      g.run._prevFlags = {...g.run.flags};
    }

    /* Resolve leads */
    const results = E.resolveLeads();

    /* Track offers */
    if (results.offers && results.offers.length > 0) {
      g.run.offers = results.offers;
      g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + 20, 0, 100);
      g.run.stats.rent = DATA.clamp((g.run.stats.rent||0) + 500, 0, 9999);
      g.run.flags.offerDay = g.run.day;
      g.run.flags.maxClout = Math.max(g.run.flags.maxClout || 0, g.run.stats.clout || 0);
      E.snapStats();
      E.pushLog(g.run.day, `🎉 Got ${results.offers.length} offer(s)! Hope +20, Rent +$500.`);
      /* Confetti! */
      launchConfetti();
    }

    /* Track max robot suspicion, min hope */
    g.run.flags.minRobotSusp = Math.min(g.run.flags.minRobotSusp || 100, g.run.stats.robotSuspicion || 0);
    g.run.flags.minHopeRun = Math.min(g.run.flags.minHopeRun || 100, g.run.stats.hope || 100);
    g.run.flags.maxClout = Math.max(g.run.flags.maxClout || 0, g.run.stats.clout || 0);

    /* Check for loss/win */
    const advanceResult = E.advanceDay();

    if (advanceResult) {
      /* Game over */
      if (advanceResult.type === 'win') {
        g.run.won = advanceResult.ending;
        const ending = DATA.ENDINGS[advanceResult.ending];
        showEndScreen(ending, true);
      } else {
        g.run.won = advanceResult.ending;
        const ending = DATA.ENDINGS[advanceResult.ending];
        showEndScreen(ending, false);
      }
    }

    /* Check achievements (now that g.run.won is set) */
    E.checkAchievements();

    if (advanceResult) {
      return;
    }

    /* Show end-of-day modal (error-boundary: EOD render failures don't crash the game) */
    try { showEODModal(g, results); } catch(e) {}
  }

  function showEODModal(g, results) {
    const modal = document.getElementById('eod-modal');
    const recap = document.getElementById('eod-recap');
    const changes = document.getElementById('eod-stat-changes');
    const leadRes = document.getElementById('eod-lead-results');

  /* Procedural recap built from actual run flags */
    const prevS = g.run._prevStats || {};
    const prevF = g.run._prevFlags || {};
    const parts = [];
    const newApps = (g.run.flags.applicationsSubmitted||0) - (prevF.applicationsSubmitted||0);
    if (newApps > 0) parts.push(`Applied to ${newApps} job${newApps>1?'s':''}`);
    if ((g.run.flags.leadsGhosted||0) > 0) {
      parts.push(`ghosted by ${g.run.flags.leadsGhosted} compan${g.run.flags.leadsGhosted>1?'ies':'y'}`);
    }
    if ((g.run.stats.scamEvidence||0) - (prevS.scamEvidence||0) > 0) {
      parts.push(`received scam DMs`);
    }
    if (g.run.flags.repostsExposed) parts.push(`exposed a repost scam`);
    if (g.run.flags.bossFightActive && g.run.flags.bossFightWon) parts.push(`beat the recruiter boss fight`);
    if ((g.run.stats.clout||0) - (prevS.clout||0) >= 50) parts.push(`went semi-viral on Linkfluence`);

    const closingLines = [
      'The void is patient. You are not.',
      'Tomorrow is another day of applying to jobs that don\'t exist.',
      'The algorithm will remember. The algorithm always remembers.',
      'Your landlord will forget. Your landlord always forgets about you.',
      'The job market doesn\'t care. You don\'t care back. Mutual.',
      'You survived. That\'s the victory for today.',
      'Time to touch grass. Or at least pretend to.',
    ];
    const zeroDayLines = [
      'A quiet day. The jobs are quiet too. A perfect match.',
      'Nothing happened. In this job market, that\'s a win.',
      'You stared at the screen. It stared back. A standoff.',
      'The day passed without incident. The screen remains unapplied to.',
      'Peaceful. The void was merciful today.',
    ];
    try { recap.textContent = parts.length ? `${parts.join(', ')}. ${DATA.pick(closingLines)}` : DATA.pick(zeroDayLines); } catch(e) {}

    /* Stat changes */
    const s = g.run.stats;
    const prevStats2 = g.run._prevStats || {};
    const changesHTML = [];
    try {
      for (const key of Object.keys(s)) {
        if (typeof s[key] === 'number' && key !== 'maxEnergy' && prevStats2[key] !== s[key]) {
          const diff = s[key] - (prevStats2[key] || 0);
          if (diff !== 0) {
            const icons = {rent:'💰',hope:'💡',credibility:'🎯',clout:'⭐',atsFavor:'🤖',robotSuspicion:'👁️',humanContact:'🤝',     energy:'☕',scamEvidence:'🚩',ghostEvidence:'👻',scamsFell:'🛡️'};
            const names = {rent:'Rent Money',hope:'Hope',credibility:'Credibility',clout:'Clout',atsFavor:'Bot Aura',robotSuspicion:'Robot Suspicion',humanContact:'Human Contact',energy:'Energy',scamEvidence:'Scam Evidence',ghostEvidence:'Ghost Evidence',scamsFell:'Scams Felled'};
            changesHTML.push(`<span class="stat-change ${diff>0?'up':'down'}">${icons[key]||''} ${names[key]||key}: ${diff>0?'+':''}${diff}</span>`);
          }
        }
      }
      if (changes) changes.replaceChildren(htmlToDom(changesHTML.join('')));
    } catch(e) {}
    g.run._prevStats = {...s};
    g.run._prevFlags = {...g.run.flags};

    /* Lead results */
    try {
      if (results.offers && results.offers.length > 0 && leadRes) {
        leadRes.replaceChildren(htmlToDom(results.offers.map(o => `<div style="text-align:center;padding:.5rem;color:var(--teal);font-weight:700">🎉 ${o.company} — ${o.role} — ${o.pay}</div>`).join('')));
      }
    } catch(e) {}

    try {
      modal.classList.add('active');
      setTimeout(() => document.getElementById('eod-continue')?.focus(), 100);
    } catch(e) {}

    const contBtn = document.getElementById('eod-continue');
    if (g.run.day > 30) contBtn.style.display = 'none';
    contBtn.onclick = () => {
      if (g.run.won) return;
      modal.classList.remove('active');
      const briefing = E.generateBriefing();
      if (briefing && briefing.warnings.length > 0) {
        showBriefing(briefing);
      } else {
        startDay();
      }
    };
    contBtn.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (g.run.won) return;
        modal.classList.remove('active');
        startDay();
        e.preventDefault();
      }
    };

    /* Dismiss EOD modal when game ends — prevents stale continue button */
    const observer = new MutationObserver(() => {
      const endScreen = document.getElementById('end-screen');
      if (endScreen && endScreen.classList.contains('active')) {
        modal.classList.remove('active');
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function showCountdown(text) {
    const modal = document.getElementById('countdown-modal');
    document.getElementById('countdown-text').textContent = text;
    modal.classList.add('active');
    document.getElementById('countdown-continue').onclick = () => {
      modal.classList.remove('active');
    };
  }

  function buildPIPLetter() {
    const g = E.state;
    const s = g.run.stats;
    const f = g.run.flags;
    const endingId = g.run.won;
    const day = g.run.day;
    const rng = Math.random;

    const ctx = {
      apps: f.applicationsSubmitted || 0,
      day: day,
      easyCount: f.easyApplyCount || 0,
      firstEasyApplyDay: f.firstEasyApplyDay || 'unknown',
      ghosts: f.ghostsExposed || 0,
      ghosted: f.leadsGhosted || 0,
      scams: f.scamsReported || 0,
      scamDMs: f.scamsReceived || 0,
      scamsFell: (f.scamsFell || 0),
      hc: s.humanContact || 0,
      clout: s.clout || 0,
      cred: s.credibility || 0,
      aura: s.atsFavor || 0,
      susp: s.robotSuspicion || 0,
      rejections: f.autoRejected || 0,
      finals: f.maxFinalInterviews || 0,
      finalCount: f.maxFinalInterviews || 0,
      buzzwordCount: (s.buzzwords || []).length,
      buzzwordSample: (s.buzzwords || []).slice(0, 3).join(', ') || 'synergy',
      viralReactions: 12000 + Math.floor(rng() * 8000),
      credLoss: Math.floor(rng() * 15) + 5,
      aiCount: (s.buzzwords || []).filter(b => b === 'AI').length,
      forms: f.formsCompleted || 0,
      grass: f.touchGrassCount || 0,
      portal: f.portalApps || 0,
      consec: f.maxConsecutiveGhosts || f.consecutiveGhosts || 0,
      company: DATA.genComp(),
    };

    function fillTemplate(str) {
      return str.replace(/\{(\w+)\}/g, (m, key) => ctx[key] !== undefined ? ctx[key] : m);
    }

    function pickFromPool(pool) {
      return DATA.pick(pool, rng);
    }

    function pickByCondition(arr, count) {
      const day = g.run.day;
      const matching = arr.filter(item => {
        const sDay = Object.assign({}, s, { day });
        return item.condition(sDay, f) && !item.isFallback;
      });
      const fallback = arr.find(item => item.isFallback);
      const picks = [];
      const shuffled = [...matching].sort(() => rng() - 0.5);
      for (let i = 0; i < Math.min(count, shuffled.length); i++) picks.push(shuffled[i]);
      if (picks.length === 0 && fallback) picks.push(fallback);
      return picks.map(p => fillTemplate(p.text));
    }

    const P = DATA.PIP_LETTER;
    const openingPool = P.openings[endingId] || P.openings.default;
    const closingPool = P.closings[endingId] || P.closings.default;

    const opening = fillTemplate(pickFromPool(openingPool));
    const strengths = pickByCondition(P.strengths, 2 + (rng() < 0.5 ? 1 : 0));
    const dev = pickByCondition(P.developmentAreas, 2 + (rng() < 0.5 ? 1 : 0));
    const showIncident = rng() < 0.4;
    const sDay = Object.assign({}, s, { day: g.run.day });
    const incidentPool = P.incidents.filter(i => i.condition(sDay, f));
    const incident = (showIncident && incidentPool.length > 0)
      ? fillTemplate(pickFromPool(incidentPool).text)
      : null;
    const closing = fillTemplate(pickFromPool(closingPool));

    const hrName = pickFromPool(P.hrFirstNames) + ' ' + pickFromPool(P.hrLastNames);
    const hrTitle = pickFromPool(P.hrTitles);
    const hrCompany = ctx.company;
    const footer = pickFromPool(P.footerLines);

    const month = new Date().getMonth();
    const quarter = ['Q1','Q1','Q1','Q2','Q2','Q2','Q3','Q3','Q3','Q4','Q4','Q4'][month];

    return `
    <div class="pip-letter" id="pip-letter">
      <div class="pip-letterhead">
        <div class="pip-lh-logo">Lf</div>
        <div class="pip-lh-text">
          <div class="pip-lh-company">${hrCompany}</div>
          <div class="pip-lh-dept">Talent Acquisition · People Operations Division</div>
        </div>
      </div>
      <div class="pip-meta">
        <div>${quarter} Performance Review</div>
        <div>Day ${day} / 30</div>
      </div>
      <div class="pip-addressee">Dear Candidate,</div>
      <p class="pip-para">${opening}</p>
      <div class="pip-section-header">Observed Strengths</div>
      <ul class="pip-list">
        ${strengths.map(txt => `<li>${txt}</li>`).join('')}
      </ul>
      <div class="pip-section-header">Areas for Development</div>
      <ul class="pip-list">
        ${dev.map(txt => `<li>${txt}</li>`).join('')}
      </ul>
      ${incident ? `<div class="pip-section-header pip-incident-header">For the Record</div><p class="pip-para pip-incident">${incident}</p>` : ''}
      <p class="pip-para">${closing}</p>
      <div class="pip-signature">
        <div>Warmly,</div>
        <div class="pip-sig-line"></div>
        <div class="pip-sig-name">${hrName}</div>
        <div class="pip-sig-title">${hrTitle}, People Operations</div>
        <div class="pip-sig-company">${hrCompany}</div>
      </div>
      <div class="pip-footer">${footer}</div>
    </div>
  `;
  }

  function letterToPlainText(letterEl) {
    const company = letterEl.querySelector('.pip-lh-company')?.textContent || '';
    const meta = letterEl.querySelector('.pip-meta')?.innerText || '';
    const addressee = letterEl.querySelector('.pip-addressee')?.textContent || '';
    const sections = [...letterEl.querySelectorAll('.pip-section-header')].map(h => h.textContent);
    const paras = [...letterEl.querySelectorAll('.pip-para')].map(p => p.textContent);
    const allItems = [...letterEl.querySelectorAll('.pip-list li')].map(li => '• ' + li.textContent);
    const sigName = letterEl.querySelector('.pip-sig-name')?.textContent || '';
    const sigTitle = letterEl.querySelector('.pip-sig-title')?.textContent || '';
    const sigCompany = letterEl.querySelector('.pip-sig-company')?.textContent || '';
    const footer = letterEl.querySelector('.pip-footer')?.textContent || '';

    let out = `${company}\nTalent Acquisition · People Operations\n${meta}\n\n${addressee}\n\n`;
    paras.forEach(p => { out += p + '\n\n'; });
    allItems.forEach(item => { out += item + '\n'; });
    out += `\n— ${sigName}, ${sigTitle}\n${sigCompany}\n\n${footer}\n\n— Just Hire Me Bro`;
    return out;
  }

  function setupLetterActions(ending, score, isVictory) {
    document.getElementById('btn-copy-letter').onclick = () => {
      const letter = document.querySelector('#pip-letter-container .pip-letter');
      if (!letter) return;
      const text = letterToPlainText(letter);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => E.showToast('Letter copied. Forward to your enemies.', 'info'))
          .catch(() => E.showToast('Could not copy. The void resists.', 'info'));
      }
    };
    document.getElementById('btn-screenshot-mode').onclick = () => {
      const ssContainer = document.getElementById('pip-letter-container-ss');
      ssContainer.innerHTML = document.getElementById('pip-letter-container').innerHTML;
      document.body.classList.add('pip-screenshot-mode');
      window.scrollTo(0, 0);
    };
    document.getElementById('pip-screenshot-exit').onclick = () => {
      document.body.classList.remove('pip-screenshot-mode');
    };
    document.getElementById('btn-share-summary').onclick = () => {
      const g = E.state;
      const summary = `I just played Just Hire Me Bro. Result: ${ending.name}. Day ${g.run.day}/30. Score: ${score}. #JustHireMeBro`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(summary)
          .then(() => E.showToast('Summary copied. Share your shame.', 'info'))
          .catch(() => E.showToast('Could not copy.', 'info'));
      }
    };
  }

  function showEndScreen(ending, isVictory) {
    try {
      window._titleInterval && clearInterval(window._titleInterval);
      showScreen('end-screen');

    const title = document.getElementById('end-title');
    const typeLabel = document.getElementById('end-type-label');
    const scores = document.getElementById('end-scores');

    title.className = 'ending-title ' + (isVictory ? 'victory' : 'loss');
    title.textContent = ending.icon + ' ' + ending.name;
    typeLabel.textContent = isVictory ? '🎉 VICTORY' : '💀 DEFEAT';

    const g = E.state;

    /* PIP Letter */
    const pipContainer = document.getElementById('pip-letter-container');
    if (pipContainer) {
      try {
        pipContainer.innerHTML = buildPIPLetter();
      } catch(e) {
        pipContainer.innerHTML = `<div class="pip-letter"><div class="pip-para">We regret to inform you that your Performance Improvement Plan could not be generated. Please contact your recruiter for assistance.</div></div>`;
      }
    }

    /* Score table */
    const s = g.run.stats;
    const scoresHTML = `
      <tr><td>Day reached</td><td>${g.run.day}/30</td></tr>
      <tr><td>Applications</td><td>${g.run.flags.applicationsSubmitted||0}</td></tr>
      <tr><td>Ghost jobs exposed</td><td>${g.run.stats.ghostEvidence||0}</td></tr>
      <tr><td>Scams reported</td><td>${g.run.stats.scamEvidence||0}</td></tr>
      <tr><td>Final Clout</td><td>${s.clout||0}</td></tr>
      <tr><td>Final Bot Aura</td><td>${s.atsFavor||0}</td></tr>
            <tr><td>Final Hope</td><td>${s.hope||0}</td></tr>
      <tr><td>Final Cred</td><td>${s.credibility||0}</td></tr>
      <tr><td>Final Sus</td><td>${s.robotSuspicion||0}</td></tr>
      <tr><td>Final Human Contact</td><td>${s.humanContact||0}</td></tr>
    `;
    scores.replaceChildren(htmlToDom(scoresHTML));

    /* Score calculation */
    const score = (s.clout||0) * 2
      + (s.atsFavor||0)
      + (s.hope||0) * 3
      + (s.credibility||0) * 2
      + (g.run.stats.ghostEvidence||0) * 10
      + (g.run.stats.scamEvidence||0) * 10
      + (g.run.day) * 5
      + (isVictory ? 500 : 0);

    /* Save to high scores */
    E.saveHighScore(ending.name, score);

    /* Share text */
    const shareText = ending.share ? ending.share
      .replace('{ending}', ending.name)
      .replace('{N}', g.run.flags.applicationsSubmitted||0)
      .replace('{G}', g.run.stats.ghostEvidence||0)
      .replace('{S}', g.run.stats.scamEvidence||0)
      .replace('{score}', score)
      .replace('{day}', g.run.day)
      .replace('{clout}', s.clout||0)
      .replace('{buzzwords}', (s.buzzwords||[]).length)
      .replace('{hc}', s.humanContact||0)
      .replace('{scams}', s.scamsFell||0)
      .replace('{apps}', g.run.flags.applicationsSubmitted||0)
      + ' #JustHireMeBro' : `I just played Just Hire Me Bro. Result: ${ending.name}. Score: ${score}. #JustHireMeBro`;

    document.getElementById('btn-share').onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          E.showToast('Cringe copied to clipboard! Share it with your remaining friends.', 'info');
        }).catch(() => E.showToast('Could not copy to clipboard.', 'info'));
      } else {
        E.showToast('Clipboard not available on this browser.', 'info');
      }
    };

    document.getElementById('btn-restart').onclick = () => {
      E.clearRun();
      try { Engine._g = { run: null }; } catch(e) {}
      showTitle();
    };

    document.getElementById('btn-ach-end').onclick = () => {
      showAchievements();
    };

    setupLetterActions(ending, score, isVictory);
    } catch(e) {}
  }

  function showAchievements() {
    try {
      showScreen('achievements-screen');
      const grid = document.getElementById('ach-grid');
      const count = document.getElementById('ach-count');
      const unlocked = Object.keys(E.meta.achievements || {}).filter(k => E.meta.achievements[k]);
      count.textContent = `${unlocked.length} / ${DATA.ACHIEVEMENTS.length} unlocked`;

      if (grid) grid.replaceChildren(htmlToDom(DATA.ACHIEVEMENTS.map(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        return `<div class="ach-item ${isUnlocked?'unlocked':'locked'}" role="img" aria-label="${isUnlocked?ach.name:'Locked achievement'}" tabindex="0">
          <span class="ach-icon">${isUnlocked ? (ach.icon||'🏆') : '🔒'}</span>
          <span class="ach-name">${isUnlocked ? ach.name : (ach.hidden ? '???' : 'Locked')}</span>
          <span class="ach-desc">${isUnlocked ? ach.desc : (ach.hidden ? 'Keep playing to discover...' : 'Hint: ' + ach.desc.split('.')[0] + '.')}</span>
        </div>`;
      }).join('')));

      document.getElementById('btn-ach-back').onclick = () => showTitle();
    } catch(e) {}
  }

  function showHowTo() { showScreen('howto-screen'); }
  function showCredits() { showScreen('credits-screen'); }
  function showHighScores() {
    try {
      showScreen('highscores-screen');
      const list = document.getElementById('highscores-list');
      const scores = (E.meta.highScores || []).slice(0, 10);
      if (scores.length === 0) {
        if (list) list.replaceChildren(htmlToDom('<div style="text-align:center;color:var(--text-muted)">No runs yet. The void awaits.</div>'));
      } else {
        if (list) list.replaceChildren(htmlToDom(scores.map((s, i) =>
          `<div style="padding:.3rem 0;border-bottom:1px solid var(--card-border)"><strong>#${i+1}</strong> Day ${s.day} — ${s.ending} — Score: ${s.score} <span style="color:var(--text-muted);font-size:.8rem">(${s.bg})</span></div>`
        ).join('')));
      }
      document.getElementById('btn-hs-back').onclick = () => showTitle();
    } catch(e) {}
  }

  function updateScanline() {
    const g = E.state;
    const overlay = document.getElementById('scanline-overlay');
    if (g && g.run.stats && g.run.stats.robotSuspicion > 75) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }

  /* Doomscroll button */
  function initDoomscroll() {
    const btn = document.getElementById('doomscroll-btn');
    if (btn) {
      btn.onclick = () => {
        const g = E.state;
        if (g && !g.run.won) {
          E.snapStats();
          g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-5,0,100);
          E.pushLog(g.run.day, 'Doomscrolled instead of sleeping. Hope -5.');
          endDay();
        }
      };
    }
  }

  /* Reset game state */
  function resetGame() {
    if (!window.confirm('Reset your career? This will erase all progress, achievements, and high scores. No going back.')) return;
    localStorage.removeItem('juhirebro_v1');
    E.clearRun();
    E.init();
    initTitleButtons();
    initDoomscroll();
    initInbox();
    initBriefing();
    showTitle();
    E.showToast('Career reset. Fresh start, same void.', 'info');
  }

  /* Title screen buttons */
  let _titleButtonsAttached = false;
  function initTitleButtons() {
    if (_titleButtonsAttached) return;
    _titleButtonsAttached = true;
    document.getElementById('btn-start')?.addEventListener('click', showBgSelect);
    document.getElementById('btn-howto')?.addEventListener('click', showHowTo);
    document.getElementById('btn-achievements')?.addEventListener('click', showAchievements);
    document.getElementById('btn-highscores')?.addEventListener('click', showHighScores);
    document.getElementById('btn-credits')?.addEventListener('click', showCredits);
    document.getElementById('btn-howto-back')?.addEventListener('click', showTitle);
    document.getElementById('btn-credits-back')?.addEventListener('click', showTitle);
    document.getElementById('btn-reset')?.addEventListener('click', resetGame);
  }

  function renderInbox() {
    const listEl = document.getElementById('inbox-list');
    const msgEl = document.getElementById('inbox-message');
    const countEl = document.getElementById('inbox-count');
    const inbox = E.state?.run?.inbox || [];
    const count = E.inboxUnreadCount();
    if (countEl) countEl.textContent = `(${count})`;
    if (listEl) {
      if (inbox.length === 0) {
        listEl.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">Inbox empty. The silence is loud.</div>';
      } else {
        listEl.innerHTML = inbox.map(m => `<div data-msg-id="${m.id}" class="inbox-thread ${m.read ? 'inbox-read' : 'inbox-unread'}"><div class="inbox-thread-header"><span>${m.sender}</span><span style="color:var(--text-muted);font-size:.7rem">${m.subject}</span></div></div>`).join('');
        listEl.querySelectorAll('.inbox-thread').forEach(th => {
          th.addEventListener('click', () => showInboxMessage(+(th.dataset.msgId)));
        });
      }
    }
    if (msgEl) msgEl.innerHTML = '<div class="inbox-message-placeholder">Select a message to read</div>';
  }

  function showInboxMessage(msgId) {
    const msg = E.state?.run?.inbox?.find(m => m.id === msgId);
    if (!msg) return;
    E.markInboxRead(msgId);
    const msgEl = document.getElementById('inbox-message');
    const name = msg.sender;
    const company = msg.company?`<span style="color:var(--text-muted)"> @ ${msg.company}</span>`:'';
    const date = msg.receivedAt?`<time>${msg.receivedAt}</time>`:'';
    msgEl.innerHTML = `<div class="inbox-message-header"><h3>${name}${company}</h3>${date}<button class="title-btn" style="font-size:.7rem;margin-top:.5rem" data-ack-msg="${msg.id}">Got it</button></div><div class="inbox-message-body"><p>${msg.body.replace(/\n/g,'<br>')}</p></div>`;
    const ackBtn = msgEl.querySelector('[data-ack-msg]');
    ackBtn?.addEventListener('click', () => {
      E.markInboxRead(msgId);
      renderInbox();
    });
  }

  function initInbox() {
    const toggle = document.getElementById('inbox-toggle-btn');
    const panel = document.getElementById('inbox-panel');
    const close = document.getElementById('inbox-close-btn');
    if (!toggle || !panel || !close) return;
    toggle.addEventListener('click', () => {
      panel.classList.add('open');
      renderInbox();
    });
    close.addEventListener('click', () => panel.classList.remove('open'));
  }

  /* Initialize everything */
  function init() {
    /* Loading animation */
    const sub = document.getElementById('loading-sub');
    let li = 0;
    const loadInt = setInterval(() => {
      li = (li + 1) % loadingMsgs.length;
      sub.textContent = loadingMsgs[li];
    }, 600);

    setTimeout(() => {
      try {
        clearInterval(loadInt);
        E.init();
        initTitleButtons();
        initDoomscroll();
        initInbox();
        initBriefing();
        showTitle();
        document.getElementById('loading-screen').classList.remove('active');
        document.addEventListener('keydown', handleKey);
      } catch(e) {
        if (sub) sub.textContent = 'Error: ' + e.message;

      }
    }, 1500 + Math.random() * 1000);
  }

 /* Mini-game: Screening Form */
  function startScreeningForm(lead, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'screening-form-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Screening Form');

    const g = E.state;

    const fields = [...DATA.SCREENING_FIELDS].sort(() => Math.random() - 0.5).slice(0, 6);
    const fieldHTML = fields.map((f, i) => {
      if (f.type === 'select') {
        return `<div class="sf-field"><label>${f.label}</label><select data-field="${i}"><option value="">— Select —</option>${f.options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>`;
      } else if (f.type === 'textarea') {
        return `<div class="sf-field"><label>${f.label}</label><textarea data-field="${i}" rows="3" placeholder="${f.placeholder||''}"></textarea></div>`;
      } else if (f.type === 'file-fake') {
        return `<div class="sf-field"><label>${f.label}</label><div class="sf-fake-file">${f.placeholder||'[No file]'}</div><input type="text" class="sf-file-input" data-field="${i}" value="${f.placeholder||''}" readonly></div>`;
      }
      return `<div class="sf-field"><label>${f.label}</label><input type="text" data-field="${i}" placeholder="${f.placeholder||''}"></div>`;
    }).join('');

    modal.innerHTML = `
      <div class="modal" style="max-width:550px">
        <div class="modal-title">🏢 Application Portal — Step 2 of 7</div>
        <div class="modal-body">
          <div class="sf-progress"><div class="sf-dot sf-dot-filled"></div><div class="sf-dot"></div><div class="sf-dot"></div><div class="sf-dot"></div><div class="sf-dot"></div><div class="sf-dot"></div><div class="sf-dot"></div></div>
          <div class="sf-fields">${fieldHTML}</div>
          <div style="display:flex;justify-content:space-between;margin-top:1rem">
            <button class="title-btn secondary" id="sf-giveup">Give Up</button>
            <button class="title-btn" id="sf-submit" style="position:relative">Submit Form</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.classList.add('active');

    /* Nudge submit button */
    const submitBtn = modal.querySelector('#sf-submit');
    let nudgeDone = false;
    submitBtn.onmouseenter = () => {
      if (!nudgeDone) {
        nudgeDone = true;
        const dx = Math.random() > 0.5 ? 60 : -60;
        submitBtn.style.transform = `translateX(${dx}px)`;
      }
    };

    modal.querySelector('#sf-giveup').onclick = () => {
      document.getElementById('screening-form-modal').remove();
      lead.followUpsThisStage = 0;
      onComplete(false);
    };

      submitBtn.onclick = () => {
        document.getElementById('screening-form-modal').remove();
        lead.stageIdx++;
        lead.followUpsThisStage = 0;
        const s = E.state();
        lead.history.push({day:s.run.day,text:'Submitted screening form'});
        g.run.stats.hope = DATA.clamp((g.run.stats.hope||0)-2, 0, 100);
        g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0)+2, 0, 100);
        g.run.flags.formsCompleted = (g.run.flags.formsCompleted||0) + 1;
      g.run.flags.formSurvivorCount = (g.run.flags.formSurvivorCount||0) + 1;
      if (g.run.flags.formSurvivorCount >= 10 && !E.meta.achievements['form-survivor']) {
        E.meta.achievements['form-survivor'] = true;
        const ach = {id:'form-survivor',name:'Form Survivor',desc:'Complete 10 Screening Forms.',icon:'📝',hidden:false};
        E.toastAchievement(ach); E.saveMeta();
      }
      onComplete(true);
    };

    /* Close on overlay click */
    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); } };
  }

  /* Mini-game: Take-Home Assignment */
  function startTakeHome(lead, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'take-home-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Take-Home Assignment');

    const g = E.state;
    const cred = (g.run.stats.credibility || 0);
    const options = DATA.TAKE_HOME_OPTIONS.filter(o => !o.requireCred || cred >= o.requireCred);
    const originalIdx = {};
    DATA.TAKE_HOME_OPTIONS.forEach((o, i) => { originalIdx[options.indexOf(o)] = i; });

    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal-title">📋 Take-Home Assignment</div>
        <div class="modal-body">
          <p style="font-style:italic;color:var(--text-muted);text-align:center;padding:.5rem 0">"This should only take a couple hours. We just want to see how you think."</p>
          <div style="display:flex;flex-direction:column;gap:.5rem" id="th-options">
            ${options.map((o, i) => `
              <button class="me-choice-btn" data-orig="${originalIdx[i]}" style="text-align:left">
                <strong>${o.label}</strong><br>
                <span style="font-size:.8rem;color:var(--text-muted)">${o.description}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.classList.add('active');

    modal.querySelector('#th-options').querySelectorAll('.me-choice-btn').forEach(btn => {
      btn.onclick = () => {
        const origIdx = parseInt(btn.dataset.orig);
        const option = DATA.TAKE_HOME_OPTIONS[origIdx];
        const total = option.outcomes.reduce((s, o) => s + o.weight, 0);
        let r = Math.random() * total;
        let outcome = option.outcomes[option.outcomes.length - 1];
        for (const o of option.outcomes) {
          r -= o.weight;
          if (r <= 0) { outcome = o; break; }
        }

        lead.stageIdx++;
        lead.followUpsThisStage = 0;
        lead.history.push({day:g.run.day,text:'Completed take-home assignment'});

        g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + outcome.hopeDelta, 0, 100);
        g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + outcome.credDelta, 0, 100);

        modal.classList.remove('active');
        modal.remove();

        if (option.label.includes('Option D') && outcome.credDelta === 5 && outcome.hopeDelta === -3) {
          /* Decline option D that leads to rejection */
          E.finishLead(lead, 'rejected', 'They thanked you and "moved forward with other candidates."');
          onComplete(false);
          return;
        }

        if (option.label.includes('Option D') && outcome.credDelta >= 10) {
          /* Principled decline that worked */
          g.run.flags.principledOffer = 1;
        }

        onComplete(true);
      };
    });

    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); } };
  }

  /* Mini-game: Panel Interview */
  function startPanelInterview(lead, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'panel-interview-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Panel Interview');

    const answers = DATA.WEAKNESS_ANSWERS;

    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal-title">🪑 Panel Interview at ${lead.company}</div>
        <div class="modal-body">
          <p style="font-style:italic;color:var(--text-muted);text-align:center;padding:.5rem 0">Five interviewers. Three of them are silent. One is on mute. The fifth says: "So... what would you say is your biggest weakness?"</p>
          <div style="display:flex;flex-direction:column;gap:.5rem" id="panel-options">
            ${answers.map((a, i) => `<button class="me-choice-btn" data-idx="${i}">${a.label}</button>`).join('')}
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.classList.add('active');

    modal.querySelector('#panel-options').querySelectorAll('.me-choice-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        const answer = answers[idx];
        const ghostChance = answer.credDelta >= 5 ? 0.05 : answer.credDelta >= 0 ? 0.15 : 0.30;

        const g = E.state;

        /* Track achievements */
        if (answer.label.includes('Honestly?')) { g.run.flags.panelHonestAnswers = (g.run.flags.panelHonestAnswers||0) + 1; }
        if (answer.label.includes('stare back')) { g.run.flags.panelStareDowns = (g.run.flags.panelStareDowns||0) + 1; }

        g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + answer.credDelta, 0, 100);
        g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + answer.hopeDelta, 0, 100);

        lead.stageIdx++;
        lead.followUpsThisStage = 0;
        lead.history.push({day:g.run.day,text:'Panel interview complete'});

        if ((E._rng ? E._rng() : Math.random()) < ghostChance) {
          modal.classList.remove('active');
          modal.remove();
          E.finishLead(lead, 'ghosted', `You answered "${answer.label}" and they ghosted you.`);
          onComplete(false);
          return;
        }

        /* Achievement checks */
        if (answer.label.includes('Honestly?') && answer.credDelta >= 8 && !E.meta.achievements['real-answer']) {
          E.meta.achievements['real-answer'] = true;
          const ach = {id:'real-answer',name:'A Real Answer',desc:'Pick the honest answer in a Panel Interview and survive.',icon:'💯',hidden:false};
          E.toastAchievement(ach); E.saveMeta();
        }
        if (answer.label.includes('stare back') && answer.hopeDelta === -5 && !E.meta.achievements['silent-power']) {
          E.meta.achievements['silent-power'] = true;
          const ach = {id:'silent-power',name:'Silent Power',desc:'Choose to stare back in the Panel Interview and survive.',icon:'🤫',hidden:true};
          E.toastAchievement(ach); E.saveMeta();
        }

        modal.classList.remove('active');
        modal.remove();
        onComplete(true);
      };
    });

    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); } };
  }

  /* Mini-game: Salary Stall */
  function startSalaryStall(lead, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'salary-stall-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Salary Discussion');

    const g = E.state;
    const options = DATA.SALARY_STALL_OPTIONS.filter(o => !o.signalOnly || lead.signals.salaryDisclosed);

    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal-title">💰 Compensation Discussion</div>
        <div class="modal-body">
          <p style="font-style:italic;color:var(--text-muted);text-align:center;padding:.5rem 0">"What are you looking for, comp-wise?" — them. Their lips are pressed thin.</p>
          <div style="display:flex;flex-direction:column;gap:.5rem" id="salary-options">
            ${options.map((o, i) => `<button class="me-choice-btn" data-idx="${i}">${o.label}</button>`).join('')}
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.classList.add('active');

    modal.querySelector('#salary-options').querySelectorAll('.me-choice-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        const option = options[idx];
        const origIdx = DATA.SALARY_STALL_OPTIONS.indexOf(option);

        g.run.stats.hope = DATA.clamp((g.run.stats.hope||0) + (option.hopeDelta||0), 0, 100);
        g.run.stats.credibility = DATA.clamp((g.run.stats.credibility||0) + (option.credDelta||0), 0, 100);

        lead.stageIdx++;
        lead.followUpsThisStage = 0;
        lead.history.push({day:g.run.day,text:'Salary discussion complete'});

        if (option.signalOnly) {
          lead.signals.salaryDisclosed = true;
          g.run.flags.salaryWarriorOffer = 1;
        }

        if (option.ghostChance && (E._rng ? E._rng() : Math.random()) < option.ghostChance) {
          modal.classList.remove('active');
          modal.remove();
          E.finishLead(lead, 'ghosted', 'You named a number too high. They said "interesting." You know what that means.');
          onComplete(false);
          return;
        }

        modal.classList.remove('active');
        modal.remove();
        onComplete(true);
      };
    });

modal.onclick = (e) => { if (e.target === modal) { modal.remove(); } };
  }

  /* Mini-game: Personality Assessment */
  function startPA(lead, onComplete) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'pa-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Personality Assessment');

    const questions = DATA.PA_QS.slice(0, 4);

    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal-title">📝 Personality Assessment</div>
        <div class="modal-body" id="pa-questions">
          ${questions.map((q, i) => `
            <div class="pa-question" data-q="${i}" style="margin-bottom:1.5rem;padding:.75rem;border:1px solid var(--text-muted);border-radius:var(--radius)">
              <p style="font-weight:bold;margin-bottom:.75rem">${i + 1}. ${q.q}</p>
              <div style="display:flex;flex-direction:column;gap:.3rem">
                ${q.opts.map((opt, j) => `<button class="me-choice-btn" data-idx="${j}" style="text-align:left;font-weight:normal;font-size:.85rem;padding:.4rem .75rem">${opt}</button>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;

    document.body.appendChild(modal);
    modal.classList.add('active');

    const answers = {};
    const totalQuestions = questions.length;

    const submitBtn = document.createElement('button');
    submitBtn.className = 'title-btn';
    submitBtn.id = 'pa-submit';
    submitBtn.style.width = '100%';
    submitBtn.style.marginTop = '1rem';
    submitBtn.textContent = 'Submit Assessment';
    submitBtn.disabled = true;
    modal.querySelector('#pa-questions').appendChild(submitBtn);

    modal.querySelectorAll('.pa-question').forEach(qDiv => {
      const qIdx = parseInt(qDiv.dataset.q);
      qDiv.querySelectorAll('.me-choice-btn').forEach(btn => {
        btn.onclick = () => {
          answers[qIdx] = parseInt(btn.dataset.idx);
          qDiv.querySelectorAll('.me-choice-btn').forEach(b => b.style.background = '');
          btn.style.background = 'var(--teal)';
          btn.style.color = 'var(--navy)';
          if (Object.keys(answers).length >= totalQuestions) {
            submitBtn.disabled = false;
          }
        };
      });
    });

    submitBtn.onclick = () => {
      if (Object.keys(answers).length < totalQuestions) return;
      const g = E.state;
      let hopeDelta = 0, credDelta = 0;
      const score = Object.values(answers).reduce((s, ans) => s + ans, 0);
      const maxScore = totalQuestions * 4;

      if (score > maxScore * 0.75) {
        hopeDelta = 5; credDelta = -3;
      } else {
        hopeDelta = -3; credDelta = 5;
      }

      g.run.stats.hope = DATA.clamp((g.run.stats.hope || 0) + hopeDelta, 0, 100);
      g.run.stats.credibility = DATA.clamp((g.run.stats.credibility || 0) + credDelta, 0, 100);

      lead.stageIdx++;
      lead.followUpsThisStage = 0;
      lead.history.push({day: g.run.day, text: 'Completed personality assessment'});

      modal.classList.remove('active');
      modal.remove();
      onComplete(true);
    };

    modal.onclick = (e) => { if (e.target === modal) { modal.remove(); } };
  }

  function renderInventory() {
    const g = E.state;
    const listEl = document.getElementById('inventory-list');
    const countEl = document.getElementById('inventory-count');
    if (!listEl) return;
    const inventory = g.run.inventory || [];
    countEl.textContent = `(${inventory.length}/4)`;
    if (inventory.length === 0) {
      listEl.innerHTML = '<div class="inventory-empty">Empty. Complete tasks to find items.</div>';
      return;
    }
    let html = '';
    inventory.forEach(id => {
      const def = E.getItemDef(id);
      if (!def) return;
      const cls = def.rarity === 'rare' ? 'rare' : def.rarity === 'legendary' ? 'legendary' : '';
      const desc = (def.passive?.description || def.active?.description || '');
      const btnLabel = (def.type === 'active') ? def.active?.label || 'Use' : '';
      html += `<div class="inventory-item ${cls}" data-id="${def.id}" title="${def.flavor || ''}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>${def.icon} ${def.name}</span>
          <span style="font-size:.6rem;color:var(--text-muted);margin-right:.4rem">${def.rarity || ''}</span>
        </div>
        <div style="font-size:.62rem;color:var(--text-muted);margin-top:.15rem">${desc}</div>`;
      if (def.type === 'active') {
        html += `<div style="margin-top:.3rem"><button class="item-use-btn" data-item-id="${def.id}" data-label="${btnLabel}" style="font-size:.6rem;padding:.15rem .5rem;background:var(--teal);color:var(--navy);border:none;border-radius:var(--radius);cursor:pointer">${btnLabel}</button></div>`;
      }
      html += '</div>';
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll('.item-use-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        E.useItem(itemId);
        renderInventory();
      };
    });
  }

  function flashInventory() {
    const section = document.getElementById('inventory-section');
    if (!section) return;
    section.classList.add('flash');
    setTimeout(() => section.classList.remove('flash'), 1200);
  }

  function showItemSwapModal(newItemId) {
    const g = E.state;
    const modal = document.getElementById('swap-modal');
    if (!modal) return;
    const def = E.getItemDef(newItemId);
    if (!def) { g.run._pendingItem = null; return; }
    const inventory = g.run.inventory || [];
    document.getElementById('swap-instructions').textContent = `Inventory full (${inventory.length}/4). Drop one to pick this up.`;
    document.getElementById('swap-new-item').innerHTML = `<div class="inventory-item" style="border-color:var(--gold)">
      <span>${def.icon} ${def.name}</span> — <span style="font-size:.65rem;color:var(--text-muted)">${def.flavor || ''}</span>
    </div>`;
    const optionsEl = document.getElementById('swap-options');
    optionsEl.innerHTML = '';
    inventory.forEach(id => {
      const old = E.getItemDef(id);
      if (!old) return;
      const cls = old.rarity === 'rare' ? 'rare' : old.rarity === 'legendary' ? 'legendary' : '';
      const div = document.createElement('div');
      div.className = `swap-option inventory-item ${cls}`;
      div.href = '#';
      div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <span>${old.icon} ${old.name}</span>
        <button class="swap-drop-btn" data-drop-id="${old.id}" style="font-size:.6rem;padding:.15rem .5rem;background:var(--red);color:#fff;border:none;border-radius:var(--radius);cursor:pointer">Drop</button>
      </div>
      <div style="font-size:.6rem;color:var(--text-muted)">${old.passive?.description || old.active?.description || ''}</div>`;
      div.onclick = (evt) => { if (evt.target.classList.contains('swap-drop-btn')) {
        E.swapItem(newItemId, old.id);
        g.run._pendingItem = null;
        modal.classList.remove('active');
        renderInventory();
        scheduleRender(() => renderInventory());
      }};
      optionsEl.appendChild(div);
    });
    document.getElementById('swap-skip').onclick = () => {
      modal.classList.remove('active');
      g.run._pendingItem = null;
    };
    modal.classList.add('active');
  }

  function showReferencePicker(itemId) {
    const g = E.state;
    const leads = g.run.activeLeads || [];
    if (leads.length === 0) { E.showToast('No active leads to use reference on.', 'info'); return; }
    const modal = document.getElementById('swap-modal');
    if (!modal) return;
    const def = E.getItemDef(itemId);
    document.getElementById('swap-modal-title').textContent = '🤝 Use Reference On...';
    document.getElementById('swap-new-item').innerHTML = `<div class="inventory-item">${def ? `${def.icon} ${def.name}` : 'Real Reference'} — skip a reference check and gain +5 Cred.</div>`;
    document.getElementById('swap-instructions').textContent = 'Pick a lead to apply your reference:';
    const optionsEl = document.getElementById('swap-options');
    optionsEl.innerHTML = '';
    leads.forEach(lead => {
      const div = document.createElement('div');
      div.className = 'swap-option inventory-item';
      div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <span>${lead.company} — ${lead.role}</span>
        <button class="swap-drop-btn reference-use-btn" data-lead-id="${lead.id}" style="font-size:.6rem;padding:.15rem .5rem;background:var(--teal);color:var(--navy);border:none;border-radius:var(--radius);cursor:pointer">Use</button>
      </div>`;
      div.onclick = (evt) => { if (evt.target.classList.contains('reference-use-btn')) {
        E.applyReferenceToLead(lead.id, itemId);
        modal.classList.remove('active');
        renderInventory();
        renderLeads();
      }};
      optionsEl.appendChild(div);
    });
    document.getElementById('swap-skip').onclick = () => {
      modal.classList.remove('active');
    };
    modal.classList.add('active');
  }

  function showItemUseResult(def, resultText, deltas) {
    showResultModal(`${def.icon} ${def.name}`, resultText, deltas);
    renderInventory();
  }

  function renderBriefing(briefing) {
    const dayEl = document.getElementById('briefing-day');
    const vibeEl = document.getElementById('briefing-vibe');
    const warningsEl = document.getElementById('briefing-warnings');
    const leadsEl = document.getElementById('briefing-leads');
    if (!dayEl || !vibeEl) return;
    dayEl.textContent = `☀️ Day ${briefing.day}`;
    vibeEl.innerHTML = `<em>"${briefing.vibe}"</em>`;
    if (warningsEl) {
      warningsEl.innerHTML = '';
      briefing.warnings.forEach(w => {
        const div = document.createElement('div');
        div.className = 'briefing-warning';
        div.textContent = w;
        warningsEl.appendChild(div);
      });
    }
    if (leadsEl) {
      leadsEl.innerHTML = '';
      briefing.leads.forEach(lead => {
        const div = document.createElement('div');
        div.className = 'briefing-lead';
        div.innerHTML = `<div><span class="briefing-lead-company">${lead.company}</span> <span class="briefing-lead-role">— ${lead.role}</span></div><span class="briefing-lead-stage">${lead.currentStage?.name || 'Waiting'}</span>`;
        leadsEl.appendChild(div);
      });
    }
  }

  function showBriefing(briefing) {
    const modal = document.getElementById('briefing-modal');
    if (!modal) return;
    renderBriefing(briefing);
    modal.classList.add('active');
  }

  function hideBriefing() {
    const modal = document.getElementById('briefing-modal');
    if (modal) modal.classList.remove('active');
  }

  function initBriefing() {
    const btn = document.getElementById('briefing-continue');
    if (!btn) return;
    btn.onclick = () => {
      hideBriefing();
      E.drawFeed();
      renderFeed();
    };
  }

   return { init, showTitle, showBgSelect, showAchievements, showHowTo, showCredits, showHighScores, updateScanline, buildPIPLetter, renderInventory, flashInventory, showItemSwapModal, showReferencePicker, showItemUseResult, initBriefing, renderBriefing, showBriefing, hideBriefing, renderFeed, renderStatBar };
  })();
  window.UI = UI;
