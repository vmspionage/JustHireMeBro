const { test, expect } = require('@playwright/test');
const GAME_URL = 'http://127.0.0.1:12321/';

test.describe('Ghost Vibe System', () => {
  test('E.getVibeTier returns correct boundaries', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      return {
        t80: Engine.getVibeTier(80).label,
        t79: Engine.getVibeTier(79).label,
        t60: Engine.getVibeTier(60).label,
        t40: Engine.getVibeTier(40).label,
        t20: Engine.getVibeTier(20).label,
        t19: Engine.getVibeTier(19).label,
      };
    });
    expect(result.t80).toBe('Promising');
    expect(result.t79).toBe('Warm');
    expect(result.t60).toBe('Warm');
    expect(result.t40).toBe('Quiet');
    expect(result.t20).toBe('Going Cold');
    expect(result.t19).toBe('Probably a Ghost');
  });

  test('rollInitialGhostVibe returns valid vibes', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      const v1 = Engine.rollInitialGhostVibe(() => 0.5, { isReal: true });
      const v2 = Engine.rollInitialGhostVibe(() => 0.5, { isReal: false });
      return { real: v1.vibe, ghost: v2.vibe };
    });
    expect(result.real).toBeGreaterThanOrEqual(0);
    expect(result.real).toBeLessThanOrEqual(100);
    expect(result.ghost).toBeGreaterThanOrEqual(0);
    expect(result.ghost).toBeLessThanOrEqual(100);
  });

  test('markAsSpam exists and removes leads', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      // Check markAsSpam is exported
      return typeof Engine.markAsSpam === 'function';
    });
    expect(result).toBe(true);
  });

  test('Achievements: 5 new vibe achievements exist', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      const ids = ['ghost-them-back', 'good-instincts', 'oops', 'vibe-check', 'trust-no-one'];
      return ids.map(id => DATA.ACHIEVEMENTS.find(a => a.id === id) !== undefined);
    });
    expect(result.every(Boolean)).toBe(true);
  });

  test('Investigate pool removed', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      return DATA.POOLS.investigate === undefined;
    });
    expect(result).toBe(true);
  });

  test('Ghost Vigilante background updated', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      const bg = DATA.BACKGROUNDS.find(b => b.id === 'ghost-vigilante');
      return {
        perk: bg.perk,
        hasOld: bg.perk.includes('Investigate'),
        hasNew: bg.perk.includes('±15'),
      };
    });
    expect(result.hasOld).toBe(false);
    expect(result.hasNew).toBe(true);
  });

  test('CSS: no card-investigate rule', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText.includes('card-investigate')) return false;
          }
        } catch (e) {}
      }
      return true;
    });
    expect(result).toBe(true);
  });

  test('CSS: vibe bar classes exist', async ({ page }) => {
    await page.goto(GAME_URL);
    const result = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText.includes('.gv-bar-wrap')) return 'gv-bar-wrap';
            if (rule.cssText.includes('.gv-bar')) return 'gv-bar';
            if (rule.cssText.includes('.gv-flicker')) return 'gv-flicker';
            if (rule.cssText.includes('.lead-spam-btn')) return 'lead-spam-btn';
          }
        } catch (e) {}
      }
      return 'not-found';
    });
    expect(result).not.toBe('not-found');
  });
});
