const { test, expect } = require('@playwright/test');
const GAME_URL = 'http://127.0.0.1:12321/';

test.describe('Ghost Vibe Integration', () => {
  test('End-to-end: game start via engine → leads with ghost vibe', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.locator('#btn-start').click();
    await page.locator('[data-bg="career-goblin"]').click();
    await page.locator('#btn-bg-confirm').click();
    await page.waitForSelector('#game-screen.active', { timeout: 10000 });

    const result = await page.evaluate(() => {
      const g = Engine.state;
      const newLead = {
        id: 'e2e-test-lead',
        company: 'TestCorp',
        role: 'Senior Tester',
        isReal: true,
        day: g.run.day,
        stageIdx: 0,
        daysSinceUpdate: 1,
        track: ['applied', 'auto-reply'],
      };
      const vibeRoll = Engine.rollInitialGhostVibe(() => 0.5, newLead);
      g.run.activeLeads.push(Object.assign(newLead, vibeRoll));
      return {
        day: g.run.day,
        energy: g.run.energy,
        hasVibe: typeof vibeRoll.vibe === 'number',
        vibeValue: vibeRoll.vibe,
      };
    });
    expect(result.day).toBe(1);
    expect(result.hasVibe).toBe(true);
    expect(result.vibeValue).toBeGreaterThan(0);
  });

  test('markAsSpam removes lead and increments counter', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      Engine.init();
      const state = Engine.state;
      const fakeLead = { id: 'spam-test', company: 'Spam Corp', role: 'Test', isReal: false, ghostVibe: 50, track: ['applied'], stageIdx: 0 };
      const beforeCount = state.run.activeLeads.length;
      const beforeSpam = state.run.flags?.totalSpam || 0;
      state.run.activeLeads.push(fakeLead);
      Engine.markAsSpam(fakeLead);
      return {
        isRemoved: !state.run.activeLeads.some(l => l.id === 'spam-test'),
        spamIncremented: (state.run.flags?.totalSpam || 0) > beforeSpam,
        countUnchanged: state.run.activeLeads.length === beforeCount,
      };
    });
    expect(result.isRemoved).toBe(true);
    expect(result.spamIncremented).toBe(true);
    expect(result.countUnchanged).toBe(true);
  });

  test('Vibe tier labels and colors', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      return [90, 70, 50, 30, 10].map(v => {
        const t = Engine.getVibeTier(v);
        return { label: t.label, cls: t.cls };
      });
    });
    expect(result[0].label).toBe('Promising');
    expect(result[1].label).toBe('Warm');
    expect(result[2].label).toBe('Quiet');
    expect(result[3].label).toBe('Going Cold');
    expect(result[4].label).toBe('Probably a Ghost');
  });

  test('Spam button labels present', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => DATA.SPAM_BUTTON_LABELS);
    expect(result.length).toBe(5);
  });

  test('Real vs ghost vibe distribution', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      const realVibes = [], ghostVibes = [];
      for (let i = 0; i < 100; i++) {
        realVibes.push(Engine.rollInitialGhostVibe(() => i / 100, { isReal: true }).vibe);
        ghostVibes.push(Engine.rollInitialGhostVibe(() => i / 100, { isReal: false }).vibe);
      }
      return {
        realAvg: (realVibes.reduce((a, b) => a + b, 0) / realVibes.length).toFixed(1),
        ghostAvg: (ghostVibes.reduce((a, b) => a + b, 0) / ghostVibes.length).toFixed(1),
      };
    });
    expect(parseFloat(result.realAvg)).toBeGreaterThan(40);
    expect(parseFloat(result.ghostAvg)).toBeLessThan(60);
  });
});
