import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  './', './residential/', './commercial/', './construction/', './monitoring/',
  './technology/', './about/', './support/', './quote/', './photo-credits/',
];

test('all routes serve valid headings, metadata and relative links', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const internal = new Set<string>();
  page.on('pageerror', (error) => errors.push(String(error)));

  for (const route of routes) {
    expect((await page.goto(route))?.status(), route).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('figure a')).toHaveCount(0);
    const links = await page.locator('a[href]').evaluateAll((items) =>
      items.map((item) => (item as HTMLAnchorElement).href),
    );
    for (const link of links) {
      if (link.startsWith(baseURL!)) internal.add(link);
    }
  }

  const pages = new Map<string, string>();
  for (const link of internal) {
    const url = new URL(link);
    const fragment = decodeURIComponent(url.hash.slice(1));
    url.hash = '';
    if (!pages.has(url.href)) {
      const response = await page.request.get(url.href);
      expect(response.ok(), url.href).toBe(true);
      pages.set(url.href, await response.text());
    }
    if (fragment) expect(pages.get(url.href), link).toContain('id="' + fragment + '"');
  }
  expect(errors).toEqual([]);
});

test('compact mobile navigation leads to systems, contact and a prefilled quote', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main' });
  await expect(menu.getByRole('link')).toHaveText(['Systems', 'Contact']);
  await menu.getByRole('link', { name: 'Contact' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact a[href="tel:+17784754320"]')).toBeInViewport();
  await menu.getByRole('link', { name: 'Systems', exact: true }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator('#installation-title')).toBeInViewport();
  await page.locator('#services').getByRole('link', { name: 'Businesses' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Security for the way your business works.');
  await page.locator('main').getByRole('link', { name: 'Get a quote' }).first().click();
  await expect(page.getByRole('radio', { name: /My business/ })).toBeChecked();
});

test('the 3D door can open and close and the scroll story reverses cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const modelRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/signal-models.')) modelRequests.push(request.url());
  });
  await page.goto('./');
  const story = page.locator('[data-signal-story]');
  const stage = story.locator('[data-signal-stage]');
  const first = page.locator('#signal-door');
  const doorFrame = first.locator('[data-signal-slot]');
  await page.locator('.evening__photo img').evaluate((image) => (image as HTMLImageElement).decode());
  expect(modelRequests).toHaveLength(0);
  await expect(page.getByRole('heading', { name: /200 break-ins/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Statistics Canada' })).toHaveAttribute('href', /3510018401/);
  await doorFrame.evaluate((step) => step.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(story).toHaveAttribute('data-webgl', 'true');
  expect(modelRequests).toHaveLength(1);
  await expect(stage).toHaveAttribute('data-beat', 'door');
  const canvas = stage.locator('canvas');
  await expect.poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width)).toBeGreaterThan(320);
  const button = first.getByRole('button', { name: 'Open the door' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(first.locator('[data-signal-status-label]')).toHaveAttribute('data-open', 'true');
  await expect(first.getByRole('status')).toHaveText(/sensor sends a signal/);
  await first.getByRole('button', { name: 'Close the door' }).click();
  await expect(first.locator('[data-signal-status-label]')).toHaveAttribute('data-open', 'false');

  await page.setViewportSize({ width: 2530, height: 1210 });
  const hubFrame = page.locator('#signal-hub [data-signal-slot]');
  await hubFrame.evaluate((step) => step.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(stage).toHaveAttribute('data-beat', 'hub');
  await expect.poll(() => hubFrame.evaluate((slot) => {
    const frame = slot.getBoundingClientRect();
    const drawing = document.querySelector('[data-signal-stage]')!.getBoundingClientRect();
    return Math.max(Math.abs(frame.x - drawing.x), Math.abs(frame.y - drawing.y),
      Math.abs(frame.width - drawing.width), Math.abs(frame.height - drawing.height));
  })).toBeLessThan(2);
  await page.locator('#signal-response [data-signal-slot]').evaluate((step) => step.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(stage).toHaveAttribute('data-beat', 'response');
  await expect(stage).toBeHidden();
  await doorFrame.evaluate((step) => step.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(stage).toHaveAttribute('data-beat', 'door');
  await expect(first.getByRole('button', { name: 'Open the door' })).toBeInViewport();

  await page.locator('#services').evaluate((step) => step.scrollIntoView({ block: 'start', behavior: 'instant' }));
  const stageBottom = await stage.evaluate((element) => element.getBoundingClientRect().bottom);
  const guideTop = await page.locator('#services').evaluate((element) => element.getBoundingClientRect().top);
  expect(stageBottom).toBeLessThanOrEqual(guideTop + 1);
  await page.locator('#services').getByRole('link', { name: 'Businesses', exact: true }).hover();
  await expect(page.locator('[data-installation-image="1"]')).toHaveClass(/is-current/);

  await page.goto('./monitoring/');
  const sequence = page.locator('[data-signal-sequence]');
  await sequence.scrollIntoViewIfNeeded();
  await expect(sequence).toHaveClass(/signal-played/);
});

test('the equipment guide exposes images and switchable Ajax categories on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.getByRole('table', { name: 'Ajax equipment examples and their uses' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Browse equipment examples' }).click();
  await expect(page).toHaveURL(/technology\/#ajax-equipment$/);
  const table = page.getByRole('table', { name: 'Ajax equipment examples and their uses' });
  await expect(table.getByRole('rowheader')).toHaveText(['DoorProtect', 'MotionProtect', 'MotionCam', 'GlassProtect', 'HomeSiren']);
  const filter = page.getByRole('group', { name: 'Equipment category' });
  await filter.getByRole('button', { name: 'Video' }).click();
  await expect(table.getByRole('rowheader')).toHaveText(['DoorBell', 'TurretCam', 'NVR']);
  await expect(filter.getByRole('button', { name: 'Video' })).toHaveAttribute('aria-pressed', 'true');
  await filter.getByRole('button', { name: 'Fire & water' }).focus();
  await page.keyboard.press('Space');
  await expect(table.getByRole('rowheader')).toHaveText(['FireProtect 2', 'LeaksProtect', 'WaterStop']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  await filter.getByRole('button', { name: 'Detection' }).click();
  await expect(table.getByRole('rowheader', { name: 'DoorProtect' })).toBeVisible();
  await page.locator('.catalogue summary').click();
  await expect(page.locator('.catalogue a[href*="/product/"]')).toHaveCount(14);
  await expect(page.getByText(/Google still supports existing devices/)).toBeVisible();
});

test('quote validates choices, preserves answers and simulates without browser transmission', async ({ page }) => {
  await page.goto('./quote/');
  await expect(page.getByRole('heading', { name: 'What are you looking to protect?' })).toBeVisible();
  const requests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr', 'document', 'ping', 'websocket'].includes(request.resourceType())) {
      requests.push(request.url());
    }
  });
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Choose the kind of property to continue.')).toBeVisible();
  await expect(page.getByRole('radio', { name: /My home/ })).toBeFocused();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'What would you like help with?' })).toBeFocused();
  await page.getByRole('button', { name: 'Review choices' }).click();
  await expect(page.getByText(/Choose a priority or select/)).toBeVisible();
  await page.getByRole('checkbox', { name: /Cameras and video/ }).check();
  await page.getByRole('checkbox', { name: /Help me decide/ }).check();
  await expect(page.getByRole('checkbox', { name: /Cameras and video/ })).not.toBeChecked();
  await page.getByRole('checkbox', { name: /Cameras and video/ }).check();
  await page.getByRole('checkbox', { name: /Professional monitoring/ }).check();
  await expect(page.getByRole('checkbox', { name: /Help me decide/ })).not.toBeChecked();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('radio', { name: /My home/ })).toBeChecked();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('checkbox', { name: /Cameras and video/ })).toBeChecked();
  await page.getByRole('button', { name: 'Review choices' }).click();
  await expect(page.getByRole('heading', { name: 'Review your choices.' })).toBeFocused();
  await expect(page.locator('[data-review-property]')).toHaveText('My home');
  await expect(page.locator('[data-review-priorities] li')).toHaveText(['Cameras and video', 'Professional monitoring']);
  await page.getByRole('button', { name: 'Simulate submission' }).click();
  await expect(page.getByRole('heading', { name: 'Demo request complete.' })).toBeFocused();
  await expect(page.locator('main a[href="tel:+17784754320"]').last()).toBeVisible();
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);
  await page.getByRole('button', { name: 'Start again' }).click();
  await expect(page.getByRole('radio', { name: /My home/ })).not.toBeChecked();
});

test('reduced motion, blocked imagery and script-free contact fallback', async ({ browser, page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(/\.(?:avif|webp)(?:[?#]|$)/, (request) => request.abort());
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-signal-story]')).not.toHaveAttribute('data-webgl');
  await expect(page.getByRole('heading', { name: 'A person answers.' })).toBeVisible();
  await expect(page.locator('#contact').getByRole('link', { name: 'Get a quote' })).toBeVisible();
  await page.goto('./support/');
  await expect(page.locator('main a[href="tel:+17784754320"]')).toHaveCount(1);
  await page.locator('summary').filter({ hasText: /existing alarm/ }).click();
  await expect(page.getByText(/Compatibility depends/)).toBeVisible();

  const withoutScripts = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const fallback = await withoutScripts.newPage();
  await fallback.goto('./');
  await expect(fallback.getByRole('heading', { name: 'A person answers.' })).toBeVisible();
  await expect(fallback.getByRole('button', { name: 'Open the door' })).toBeHidden();
  await expect(fallback.locator('#contact a[href="tel:+17784754320"]')).toBeVisible();
  await fallback.goto('./technology/#ajax-equipment');
  await expect(fallback.getByRole('table', { name: 'Ajax equipment examples and their uses' }).getByRole('rowheader')).toHaveCount(13);
  await fallback.goto('./quote/');
  await expect(fallback.getByRole('link', { name: 'Hewberry’s contact page' })).toBeVisible();
  await expect(fallback.getByRole('button', { name: 'Continue' })).toBeHidden();
  await withoutScripts.close();
});

test('viewport sizes render loaded photography and stay within the screen', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [[320, 667], [390, 844], [768, 1024], [844, 390], [1024, 768], [1440, 900], [1920, 1080], [2560, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const broken = await page.locator('img:visible').evaluateAll(async (images) => {
      const rendered = images as HTMLImageElement[];
      for (const image of rendered) image.loading = 'eager';
      await Promise.allSettled(rendered.map((image) => image.decode()));
      return rendered.filter((image) => !image.naturalWidth).map((image) => image.currentSrc);
    });
    expect(broken, String(width)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), String(width)).toBe(width);
    if (width >= 1440) {
      const spread = await page.locator('#services > .shell').evaluate((shell) => shell.getBoundingClientRect().width / innerWidth);
      expect(spread, String(width)).toBeGreaterThan(.88);
    }
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Contact' })).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('home-' + width + '.png'), fullPage: true });
  }
});

test('axe checks primary pages, the mobile opening and quote review', async ({ page }) => {
  const scan = async (state: string) => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
      .analyze();
    expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target) })), state).toEqual([]);
  };

  for (const route of routes) {
    await page.goto(route);
    await scan(route);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await scan('mobile opening');
  await page.goto('./quote/?property=build&priority=wiring');
  await page.getByRole('button', { name: 'Continue' }).click();
  await scan('mobile priorities');
  await page.getByRole('button', { name: 'Review choices' }).click();
  await scan('mobile review');
});
