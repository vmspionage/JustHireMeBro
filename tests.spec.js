import { test, expect } from '@playwright/test';
const GAME_URL = 'http://127.0.0.1:12321/';

async function clearState(page) {
  await page.evaluate(() => { try { localStorage.removeItem('juhirebro_v1'); } catch (_) {} });
}

async function goTitle(page) {
  await page.waitForFunction(() => {
      const ts = document.getElementById('title-screen');
      const ls = document.getElementById('loading-screen');
      return ts && ls && ts.classList.contains('active') && !ls.classList.contains('active');
    }, { timeout: 30000 });
  await page.waitForSelector('#title-screen .title-logo', { state: 'visible', timeout: 30000 });
}

async function goGame(page) {
  await clearState(page);
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => {
      const ts = document.getElementById('title-screen');
      const ls = document.getElementById('loading-screen');
      return ts && ls && ts.classList.contains('active') && !ls.classList.contains('active');
    }, { timeout: 30000 });
  await page.waitForSelector('#title-screen .title-logo', { state: 'visible', timeout: 30000 });
  await page.locator('#btn-start').click();
  await page.waitForSelector('#bg-select', { state: 'visible', timeout: 5000 });
  await page.locator('[data-bg="career-goblin"]').click();
  await page.locator('#btn-bg-confirm').click();
  await page.waitForSelector('#game-screen .day-header', { state: 'visible', timeout: 30000 });
}

async function getStats(page) {
  return page.evaluate(() => { const g = window.Engine?.state?.run; return g ? g.stats : null; });
}

async function getDay(page) {
  return page.evaluate(() => {
    const el = document.getElementById('day-display');
    const m = el?.textContent?.match(/Day\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  });
}

async function getJournal(page) {
  return page.evaluate(() => {
    const entries = document.querySelectorAll('.run-log-entry');
    return Array.from(entries).map(el => {
      const text = el.textContent.replace(/^D\d+\s*$/, '').trim();
      const deltaEl = el.querySelector('.log-deltas');
      const deltasText = deltaEl ? deltaEl.textContent.trim() : '';
      const deltas = deltasText ? deltasText.split(' ').map(d => {
        const m = d.match(/(\+|-)?(\d+)/);
        if (!m) return null;
        return { delta: parseInt(m[1] + m[2], 10) };
      }).filter(Boolean) : [];
      return { text, deltas };
    });
  });
}

async function getStatBarText(page) {
  return page.evaluate(() => {
    const bar = document.getElementById('stat-bar');
    if (!bar) return '';
    return bar.textContent;
  });
}

async function clickDoomscroll(page) {
  const btn = page.locator('#doomscroll-btn');
  await expect(btn).toBeVisible();
  await btn.click();
}

async function clickContinue(page) {
  try {
    await page.locator('#eod-continue').click({ timeout: 5000 });
  } catch {
    // no EOD modal, might be game over
  }
  await page.waitForTimeout(500);
}

async function closeModal(page, id) {
  const btn = page.locator('#' + id + '-continue');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(300);
  }
}

// ── Test 1: Title screen loads ──
test('Test 1: Title screen loads', async ({ page }) => {
  await clearState(page);
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => {
      const ts = document.getElementById('title-screen');
      const ls = document.getElementById('loading-screen');
      return ts && ls && ts.classList.contains('active') && !ls.classList.contains('active');
    }, { timeout: 30000 });

  await expect(page.locator('.title-logo')).toBeVisible();
  await expect(page.locator('.title-logo')).toContainText('Just Hire Me Bro');

  await expect(page.locator('.title-tagline')).toBeVisible();
  await expect(page.locator('.title-tagline')).toContainText('satirical job-hunting simulator');

  await expect(page.locator('#btn-start')).toBeVisible();
  await expect(page.locator('#btn-start')).toContainText('Start Applying Into the Void');

  await expect(page.locator('#btn-howto')).toBeVisible();
  await expect(page.locator('#btn-achievements')).toBeVisible();
  await expect(page.locator('#btn-highscores')).toBeVisible();
  await expect(page.locator('#btn-credits')).toBeVisible();
});

// ── Test 2: Background selection works ──
test('Test 2: Background selection works', async ({ page }) => {
  await clearState(page);
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => {
      const ts = document.getElementById('title-screen');
      const ls = document.getElementById('loading-screen');
      return ts && ls && ts.classList.contains('active') && !ls.classList.contains('active');
    }, { timeout: 30000 });
  await page.waitForSelector('#title-screen .title-logo', { state: 'visible', timeout: 30000 });

  await page.locator('#btn-start').click();
  await page.waitForSelector('#bg-select', { state: 'visible', timeout: 5000 });

  await expect(page.locator('.bg-select-title')).toBeVisible();
  await expect(page.locator('.bg-select-title')).toContainText('Choose Your Origin Story');

  const bgGrid = page.locator('#bg-grid');
  await expect(bgGrid).toBeVisible();
  const bgCards = bgGrid.locator('.bg-card:not(.bg-locked)');
  expect(await bgCards.count()).toBeGreaterThanOrEqual(5);

  await page.locator('[data-bg="career-goblin"]').click();
  await expect(page.locator('[data-bg="career-goblin"].selected')).toBeVisible();
  await expect(page.locator('#btn-bg-confirm')).toBeEnabled();

  await page.locator('#btn-bg-confirm').click();
  await page.waitForSelector('#game-screen .day-header', { state: 'visible', timeout: 30000 });
  await expect(page.locator('.game-logo')).toBeVisible();
  await expect(page.locator('.game-logo')).toContainText('Linkfluence');
});

// ── Test 3: Game screen renders correctly ──
test('Test 3: Game screen renders correctly', async ({ page }) => {
  await goGame(page);

  // Day header
  await expect(page.locator('.day-header')).toBeVisible();

  // Day display
  await expect(page.locator('#day-display')).toBeVisible();
  await expect(page.locator('#day-display')).toContainText('Day 1');

  // Stat bar with all 6 stats
  const barText = await getStatBarText(page);
  expect(barText).toContain('Money');
  expect(barText).toContain('Hope');
  expect(barText).toContain('Cred');
  expect(barText).toContain('Bot Aura');
  expect(barText).toContain('Sus');
  expect(barText).toContain('Human');

  // Verify initial stat values via engine
  const stats = await getStats(page);
  expect(stats.rent).toBe(100);
  expect(stats.hope).toBe(50);
  expect(stats.credibility).toBe(50);
  expect(stats.atsFavor).toBe(10);
  expect(stats.robotSuspicion).toBe(100);
  expect(stats.humanContact).toBe(5);

  // Energy display
  const energyEl = page.locator('#energy-display');
  await expect(energyEl).toBeVisible();
  expect(await energyEl.textContent()).toContain('☕');
  expect(await energyEl.textContent()).toContain('3');

  // Clout display
  const cloutEl = page.locator('#clout-display');
  await expect(cloutEl).toBeVisible();
  expect(await cloutEl.textContent()).toContain('0');

  // Leads panel
  await expect(page.locator('#leads-panel')).toBeVisible();

  // Card feed with rendered cards
  const feedArea = page.locator('#feed-area');
  await expect(feedArea).toBeVisible();
  const cards = page.locator('.feed-card');
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first().locator('.card-title')).toBeVisible();
  await expect(cards.first().locator('.card-category-badge')).toBeVisible();
});

// ── Test 4: Keyword Stuff card modifies stats ──
test('Test 4: Keyword Stuff card action modifies stats correctly', async ({ page }) => {
  await goGame(page);

  // Find and click the Keyword Stuff card
  const cards = page.locator('.feed-card');
  let found = false;
  for (let i = 0; i < (await cards.count()); i++) {
    const cardText = await cards.nth(i).textContent();
    if (cardText.toLowerCase().includes('keyword stuff')) {
      await cards.nth(i).locator('button:has-text("Keyword Stuff")').click();
      await closeModal(page, 'result');
      found = true;
      break;
    }
  }

  if (!found) {
    test.skip(true, 'No Keyword Stuff card in initial feed');
  }

  // Verify journal has correct deltas
  const journal = await getJournal(page);
  const last = journal[journal.length - 1];
  expect(last.deltas.length).toBeGreaterThan(0);

  // Check for Bot Aura +8
  const deltaTexts = await page.evaluate(() => {
    const d = document.querySelector('.log-deltas');
    return d ? d.textContent : '';
  });
  expect(deltaTexts).toContain('+8');
  expect(deltaTexts).toContain('-5');
});

// ── Test 5: Network card action works ──
test('Test 5: Network card action works', async ({ page }) => {
  await goGame(page);

  // Find a networking card
  const cards = page.locator('.feed-card');
  for (let i = 0; i < (await cards.count()); i++) {
    const cat = await cards.nth(i).locator('.card-category-badge').textContent().catch(() => '');
    if (cat.toLowerCase().includes('network')) {
      await cards.nth(i).click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Go (Networking)")').click().catch(() => {
        // Try alternative
      });
      await closeModal(page, 'result');
      break;
    }
  }

  // Verify journal deltas
  const deltaTexts = await page.evaluate(() => {
    const d = document.querySelector('.log-deltas');
    return d ? d.textContent : '';
  });
  expect(deltaTexts).toContain('+2');

  // Verify via engine
  const stats = await getStats(page);
  expect(stats.humanContact).toBeGreaterThan(5);
  expect(stats.hope).toBeGreaterThan(50);
});

// ── Test 6: Post card action works ──
test('Test 6: Post card action works', async ({ page }) => {
  await goGame(page);

  // Find a post card
  const cards = page.locator('.feed-card');
  for (let i = 0; i < (await cards.count()); i++) {
    const cat = await cards.nth(i).locator('.card-category-badge').textContent().catch(() => '');
    if (cat.toLowerCase().includes('post')) {
      await cards.nth(i).click();
      await page.waitForTimeout(300);
      await page.locator('button:has-text("Post (Carousel)")').click().catch(() => {});
      await closeModal(page, 'result');
      break;
    }
  }

  // Verify journal deltas
  const deltaTexts = await page.evaluate(() => {
    const d = document.querySelector('.log-deltas');
    return d ? d.textContent : '';
  });
  expect(deltaTexts).toContain('+10');
  expect(deltaTexts).toContain('-2');

  // Verify via engine
  const stats = await getStats(page);
  expect(stats.clout).toBe(10);
  expect(stats.credibility).toBe(48);
});

// ── Test 7: End of day flow works ──
test('Test 7: End of day flow works', async ({ page }) => {
  await goGame(page);

  await clickDoomscroll(page);

  // EOD modal appears or game continues
  try {
    await page.locator('#eod-continue').click({ timeout: 30000 });
  } catch {
    // Game might have ended, check if it's game over
  }

  const day = await getDay(page);
  expect(day).toBe(2);

  // Journal has sleep recovery
  const journal = await getJournal(page);
  const slept = journal.some(e => e.text.toLowerCase().includes('slept') || e.text.toLowerCase().includes('sleep'));
  expect(slept).toBe(true);

  // New cards rendered
  await expect(page.locator('#feed-area .feed-card').first()).toBeVisible({ timeout: 8000 });
});

// ── Test 8: Game over triggers at hope = 0 ──
test('Test 8: Game over conditions trigger correctly', async ({ page }) => {
  await goGame(page);

  // Set hope to 0 via JS
  await page.evaluate(() => {
    if (window.Engine?.state?.run) window.Engine.state.run.stats.hope = 0;
  });

  await clickDoomscroll(page);

  // Wait for end screen
  await page.waitForSelector('#end-screen .ending-title', { state: 'visible', timeout: 30000 });

  // Verify defeat screen
  await expect(page.locator('#end-type-label')).toContainText(/DEFEAT/i);
  await expect(page.locator('#end-review')).toBeVisible();
  await expect(page.locator('#end-scores')).toBeVisible();
  await expect(page.locator('#btn-restart')).toBeVisible();
});

// ── Test 9: Console has no errors ──
test('Test 9: Console has no errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !msg.url()?.includes('favicon')) {
        errors.push(text);
      }
    }
  });

  await goGame(page);

  // Click a card action
  const cards = page.locator('.feed-card');
  if (await cards.count() > 0) {
    const btn = cards.first().locator('button:not(:disabled)').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await closeModal(page, 'result');
    }
  }

  // End day
  try {
    await clickDoomscroll(page);
    await clickContinue(page);
  } catch { /* ignore */ }

  await page.waitForTimeout(500);
  expect(errors).toHaveLength(0);
});
