import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  './', './systems/', './contact/', './residential/', './commercial/', './construction/',
  './monitoring/', './technology/', './about/', './support/', './quote/', './photo-credits/',
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

test('main navigation opens separate pages and supports native transitions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    addEventListener('pagereveal', (event) => {
      document.documentElement.dataset.pageTransition =
        String(Boolean((event as Event & { viewTransition?: unknown }).viewTransition));
    });
  });
  await page.goto('./');
  const nativeTransitions = await page.evaluate(() => 'PageRevealEvent' in window);
  const menu = page.getByRole('navigation', { name: 'Main' });
  await expect(menu.getByRole('link')).toHaveText(['Systems', 'Contact']);

  await menu.getByRole('link', { name: 'Systems' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/systems\/$/);
  await expect(page.getByRole('heading', { name: 'Security systems.' })).toBeVisible();
  if (nativeTransitions) await expect(page.locator('html')).toHaveAttribute('data-page-transition', 'true');
  await menu.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(page.getByRole('heading', { name: 'Get in touch.' })).toBeVisible();
  if (nativeTransitions) await expect(page.locator('html')).toHaveAttribute('data-page-transition', 'true');

  await menu.getByRole('link', { name: 'Systems' }).click();
  await page.getByRole('link', { name: 'Businesses' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Security for the way your business works.');
  await page.locator('main').getByRole('link', { name: 'Get a quote' }).first().click();
  await expect(page).toHaveURL(/\/contact\/\?property=business$/);
  await expect(page.getByLabel('Message')).toHaveValue(/^My business/);
});

test('scroll runs the film in full-screen chapters and reveals the next shot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    if (/(?:signal-models\..+\.js|estate-motion\.mp4|door-motion\.mp4)$/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto('./');
  await page.locator('.arrival picture img').evaluate((image) => (image as HTMLImageElement).decode());
  expect(mediaRequests).toHaveLength(0);
  await expect(page.getByRole('heading', { name: /200 break-ins/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Statistics Canada' })).toHaveAttribute('href', /3510018401/);

  const hero = page.locator('[data-arrival-film]');
  await page.evaluate(() => scrollTo(0, 200));
  await expect.poll(() => hero.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(.4);

  const film = page.locator('[data-alarm-film]');
  await expect(film).toHaveAttribute('data-flow', 'true');
  const jump = async (position: number) => film.evaluate((story, progress) => {
    const height = story.querySelector<HTMLElement>('[data-alarm-screen]')!.offsetHeight;
    const top = document.querySelector('header')!.getBoundingClientRect().bottom;
    scrollTo(0, story.getBoundingClientRect().top + scrollY - top + height * progress);
  }, position);

  await jump(.36);
  await expect(film).toHaveAttribute('data-chapter', '0');
  await expect(film.getByRole('button')).toHaveCount(0);
  await expect(film.getByText('Door open', { exact: true })).toHaveCount(0);
  const door = page.locator('[data-door-film]');
  await expect.poll(() => door.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(.5);
  const earlier = await door.evaluate((video) => (video as HTMLVideoElement).currentTime);
  await jump(.63);
  await expect.poll(() => door.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(earlier + .7);
  await expect(film.locator('[data-layer="incoming"]')).toHaveCount(0);

  await jump(.895);
  const incoming = film.locator('[data-layer="incoming"]');
  await expect(incoming).toHaveAttribute('id', 'signal-hub');
  await expect(incoming).toHaveCSS('clip-path', /polygon/);
  await jump(1.42);
  await expect(film).toHaveAttribute('data-chapter', '1');
  await expect(film.locator('[data-hub-stage]')).toHaveAttribute('data-rendered', 'true');

  await page.setViewportSize({ width: 2510, height: 1200 });
  await jump(2.47);
  await expect(film).toHaveAttribute('data-chapter', '2');
  await expect.poll(() => film.locator('[data-alarm-screen]').evaluate((screen) => {
    const rect = screen.getBoundingClientRect();
    const header = document.querySelector('header')!.getBoundingClientRect();
    return Math.max(Math.abs(rect.top - header.bottom), Math.abs(rect.bottom - innerHeight));
  })).toBeLessThan(2);
  await jump(.3);
  await expect(film).toHaveAttribute('data-chapter', '0');
  await expect.poll(() => door.evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeLessThan(earlier + .12);
});

test('the equipment gallery filters large illustrated examples on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./systems/#equipment');
  const collection = page.locator('#equipment-collection');
  await expect(collection.locator('li:visible')).toHaveCount(13);
  await expect(collection.getByRole('img', { name: 'Ajax DoorProtect' })).toBeVisible();
  const filter = page.getByRole('group', { name: 'Equipment category' });
  await filter.getByRole('button', { name: 'Video', exact: true }).click();
  await expect(collection.getByRole('heading')).toHaveText(['DoorBell', 'TurretCam', 'NVR']);
  await expect(filter.getByRole('button', { name: 'Video', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => collection.getByRole('img', { name: 'Ajax DoorBell' }).evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await filter.getByRole('button', { name: 'Fire & water' }).focus();
  await page.keyboard.press('Space');
  await expect(collection.getByRole('heading')).toHaveText(['FireProtect 2', 'LeaksProtect', 'WaterStop']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  await page.goto('./technology/#ajax-equipment');
  await expect(page.getByRole('link', { name: 'Browse the equipment gallery' })).toHaveAttribute('href', /systems\/#equipment$/);
  await page.locator('.catalogue summary').click();
  await expect(page.locator('.catalogue a[href*="/product/"]')).toHaveCount(14);
});

test('the short contact form validates and simulates a message without transmission', async ({ page }) => {
  await page.goto('./contact/');
  await expect(page.locator('main a[href^="tel:"]')).toHaveAttribute('href', 'tel:+17784754320');
  await expect(page.locator('main a[href^="mailto:"]')).toBeVisible();

  const requests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr', 'document', 'ping', 'websocket'].includes(request.resourceType())) requests.push(request.url());
  });
  const send = page.getByRole('button', { name: 'Send message' });
  await send.click();
  await expect(page.getByLabel('Name')).toBeFocused();
  await page.getByLabel('Name').fill('Preview Tester');
  await page.getByLabel('Email').fill('wrong-email');
  await send.click();
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.getByLabel('Email').fill('preview@example.com');
  await page.getByLabel('Message').fill('I would like to discuss alarm monitoring.');
  await send.click();
  await expect(page.getByRole('status')).toHaveText(/Demo message complete/);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, '']);

  await page.goto('./quote/?property=build&priority=wiring');
  await expect(page.getByRole('heading', { name: 'Get a quote.' })).toBeVisible();
  await expect(page.getByLabel('Message')).toHaveValue(/new build.*wiring/i);
});

test('reduced motion and script-free contact and equipment remain usable', async ({ browser, page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('[data-alarm-film]')).not.toHaveAttribute('data-flow');
  await expect(page.getByRole('heading', { name: 'A person answers.' })).toBeVisible();
  await expect(page.locator('[data-arrival-film]')).not.toHaveAttribute('src');
  await expect(page.locator('[data-door-film]')).not.toHaveAttribute('src');

  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const fallback = await context.newPage();
  await fallback.goto('./contact/');
  await expect(fallback.getByRole('button', { name: 'Send message' })).toBeHidden();
  await expect(fallback.locator('main a[href="tel:+17784754320"]')).toBeVisible();
  await fallback.goto('./systems/#equipment');
  await expect(fallback.locator('#equipment-collection li')).toHaveCount(13);
  await context.close();
});

test('viewport sizes render loaded photography without horizontal overflow', async ({ page }, testInfo) => {
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
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Contact' })).toBeInViewport();
    await page.screenshot({ path: testInfo.outputPath('home-' + width + '.png'), fullPage: true });
  }
});

test('axe checks the primary pages and the filled mobile contact form', async ({ page }) => {
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
  await page.goto('./contact/');
  await page.getByLabel('Name').fill('Preview Tester');
  await page.getByLabel('Email').fill('preview@example.com');
  await page.getByLabel('Message').fill('I want to discuss monitoring.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await scan('mobile contact confirmation');
});
