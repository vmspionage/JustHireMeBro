'use strict';
const { test } = require('@playwright/test');
const GAME_URL = 'http://127.0.0.1:12321/';

async function clearState(page) {
  await page.evaluate(() => {
    try { localStorage.removeItem('juhirebro_v1'); } catch(_) {}
    try { localStorage.removeItem('juhirebro_run_v1'); } catch(_) {}
  });
}

async function goTitle(page) {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => {
    const ts = document.getElementById('title-screen');
    return ts && ts.classList.contains('active');
  }, { timeout: 30000 });
}

test('E2E: Full game playthrough', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const bugs = [];
  const consoleLogs = [];

  page.on('console', msg => {
    const t = msg.text();
    if (t.includes('Error') || t.includes('WARN')) consoleLogs.push(msg.type() + ': ' + t);
  });
  page.on('pageerror', err => {
    bugs.push({ day: 0, stage: 'init', detail: String(err), type: 'pageerror' });
  });

  await clearState(page);
  await goTitle(page);

  await page.locator('#btn-start').click();
  await page.waitForSelector('#bg-select', { state: 'visible', timeout: 10000 });
  await page.locator('[data-bg="career-goblin"]').click();
  await page.locator('#btn-bg-confirm').click();
  await page.waitForSelector('#game-screen .day-header', { state: 'visible', timeout: 30000 });

  for (let day = 1; day <= 30; day++) {
    const stats = await page.evaluate(() => {
      const g = window.Engine?.state?.run;
      if (!g) return null;
      return { rent: g.stats.rent, hope: g.stats.hope, credibility: g.stats.credibility, energy: g.stats.energy, maxEnergy: g.stats.maxEnergy };
    });

    const gameOver = await page.evaluate(() => {
      return document.getElementById('end-screen')?.classList.contains('active');
    });

    if (gameOver || !stats || stats.energy <= 0) {
      if (gameOver) {
        const ending = await page.evaluate(() => {
          const el = document.querySelector('#end-screen .modal-body p');
          return el ? el.textContent : 'unknown';
        });
        bugs.push({ day, type: 'gameover', detail: ending.substring(0, 200) });
      }
      console.log('Game ended on day ' + day);
      break;
    }

    const cardCount = await page.evaluate(() => {
      return document.querySelectorAll('#feed .card').length;
    });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const btns = await page.$$('#feed .card .card-action-btn:not([disabled])');
        if (!btns.length) break;
        await btns[Math.floor(Math.random() * btns.length)].click();
        await page.waitForTimeout(400);
      } catch(e) {
        break;
      }
    }

    try {
      const eodBtn = await page.$('#end-day-btn');
      if (eodBtn) {
        await eodBtn.click();
        await page.waitForTimeout(1000);
        const confirmBtn = await page.$('#eod-modal .modal-action-btn');
        if (confirmBtn) await confirmBtn.click();
      }
    } catch(e) {
      bugs.push({ day, type: 'eod', detail: e.message });
    }

    await page.waitForTimeout(400);
  }

  if (consoleLogs.length) consoleLogs.forEach(l => console.log('CONSOLE: ' + l));
  if (bugs.length) {
    console.log('\n=== BUGS FOUND ===');
    console.log(JSON.stringify(bugs, null, 2));
  } else {
    console.log('\n=== NO BUGS FOUND ===');
  }

  await context.close();
});
