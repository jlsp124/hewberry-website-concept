import type { createSignalModels } from './signal-models';

const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));

function easing(start: number, end: number, value: number) {
  const fraction = clamp((value - start) / (end - start));
  return fraction * fraction * (3 - 2 * fraction);
}

type Models = NonNullable<ReturnType<typeof createSignalModels>>;

export function initializeSignalStory(story: HTMLElement) {
  if (typeof IntersectionObserver !== 'function') return;
  const stage = story.querySelector<HTMLElement>('[data-signal-stage]');
  const canvas = story.querySelector<HTMLCanvasElement>('[data-signal-canvas]');
  const slots = Array.from(story.querySelectorAll<HTMLElement>('[data-signal-slot]'));
  const state = story.querySelector<HTMLElement>('[data-signal-status-label]');
  const door = story.querySelector<HTMLButtonElement>('[data-signal-door]');
  const doorLabel = story.querySelector<HTMLElement>('[data-signal-door-label]');
  const announcement = story.querySelector<HTMLElement>('[data-signal-door-announcement]');
  if (!stage || !canvas || !state || !door || !doorLabel || !announcement || slots.length !== 3) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let models: Models | null = null;
  let near = false;
  let visible = false;
  let loading = false;
  let unavailable = false;
  let frame = 0;
  let previous = 0;
  let active = -1;
  let width = 0;
  let height = 0;
  let progress = 0;
  let opening = 0;
  let manualOpening: boolean | null = null;
  let mouseX = 0;
  let mouseY = 0;
  let pointX = 0;
  let pointY = 0;
  let entered: Animation | null = null;

  function updateDoor(open: boolean) {
    if (state!.dataset.open === String(open)) return;
    state!.textContent = open ? 'Door open' : 'Door closed';
    state!.dataset.open = String(open);
    doorLabel!.textContent = open ? 'Close the door' : 'Open the door';
  }

  function currentShot() {
    const height = window.innerHeight;
    const anchor = height * .51;
    const frames = slots.map((slot, index) => ({ index, rect: slot.getBoundingClientRect() }));
    return frames
      .filter(({ rect }) => rect.bottom > 0 && rect.top < height)
      .reduce<(typeof frames)[number] | null>((current, shot) => {
        const distance = (rect: DOMRect) => Math.abs(rect.top + rect.height * .5 - anchor);
        return !current || distance(shot.rect) < distance(current.rect) ? shot : current;
      }, null);
  }

  function placeCanvas(rect: DOMRect) {
    const origin = story.getBoundingClientRect();
    // Viewport-to-document rectangle tracking adapted from Lusion's MIT WebGL Scroll Sync demo.
    // The section is the origin here, so the scroll offset cancels out.
    const x = rect.left - origin.left;
    const y = rect.top - origin.top;
    stage!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (Math.abs(rect.width - width) < .1 && Math.abs(rect.height - height) < .1) return;
    width = rect.width;
    height = rect.height;
    stage!.style.width = `${width}px`;
    stage!.style.height = `${height}px`;
    models!.size(width, height);
  }

  function update(time: number) {
    frame = 0;
    if (!models || !motion.matches || !visible || document.hidden) return;
    const shot = currentShot();
    if (!shot || shot.index === 2) {
      stage!.hidden = true;
      stage!.dataset.beat = shot ? 'response' : '';
      active = -1;
      manualOpening = null;
      updateDoor(false);
      return;
    }

    const { index, rect } = shot;
    const target = clamp((window.innerHeight * .56 - rect.top) / rect.height);
    const dt = previous ? clamp((time - previous) / 1000, .004, .06) : .03;
    previous = time;
    const amount = 1 - Math.exp(-dt * 12);
    const changed = index !== active;
    if (changed) {
      active = index;
      manualOpening = null;
      pointX = pointY = mouseX = mouseY = 0;
      progress = target;
      opening = index === 0 ? easing(.65, .97, progress) * .65 : 0;
      stage!.dataset.beat = index === 0 ? 'door' : 'hub';
    }

    placeCanvas(rect);
    progress += (target - progress) * amount;
    const nextOpening = index === 0
      ? manualOpening === null ? easing(.65, .97, progress) * .65 : Number(manualOpening)
      : 0;
    opening += (nextOpening - opening) * amount;
    pointX += (mouseX - pointX) * amount;
    pointY += (mouseY - pointY) * amount;
    if (index === 0) updateDoor(opening > .32);

    const timeline = index === 0 ? .12 + progress * .56 : 1.19 + progress * .55;
    models.render(timeline, opening, pointX, pointY);
    stage!.hidden = false;
    if (changed) {
      entered?.cancel();
      entered = stage!.animate?.(
        [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 430, easing: 'cubic-bezier(.22,.67,.25,1)' },
      ) ?? null;
    }

    if (Math.abs(target - progress) > .001 || Math.abs(nextOpening - opening) > .001
      || Math.abs(mouseX - pointX) + Math.abs(mouseY - pointY) > .003) schedule();
  }

  function schedule() {
    if (!frame && visible && models && motion.matches) frame = requestAnimationFrame(update);
  }

  function syncPreference() {
    if (unavailable || !motion.matches) {
      delete story.dataset.webgl;
      stage!.hidden = door!.hidden = state!.hidden = true;
      return;
    }
    if (models) {
      story.dataset.webgl = 'true';
      door!.hidden = state!.hidden = false;
      schedule();
      return;
    }
    if (!near || loading) return;
    loading = true;
    void import('./signal-models').then(({ createSignalModels }) => {
      models = createSignalModels(canvas!, schedule);
      unavailable = !models;
    }).catch(() => { unavailable = true; }).finally(() => {
      loading = false;
      syncPreference();
    });
  }

  const threshold = .045;
  const prepare = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < threshold) return;
    near = true;
    syncPreference();
    prepare.disconnect();
  }, { threshold });
  prepare.observe(story);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = 0;
    schedule();
  }).observe(story);

  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(schedule);
    slots.forEach((slot) => observer.observe(slot));
  }
  motion.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });

  story.addEventListener('pointermove', (event) => {
    if (!pointer.matches || event.pointerType !== 'mouse' || active < 0) return;
    const slot = slots[active];
    if (event.target instanceof Node && slot.contains(event.target)) {
      const rect = slot.getBoundingClientRect();
      // Keep the response inside the artwork. The local clamp is adapted from ObsidianUI's MIT hover-img.
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      mouseX = x / rect.width * 2 - 1;
      mouseY = y / rect.height * 2 - 1;
    } else {
      mouseX = mouseY = 0;
    }
    schedule();
  }, { passive: true });
  story.addEventListener('pointerleave', () => {
    mouseX = mouseY = 0;
    schedule();
  });

  door.addEventListener('click', () => {
    manualOpening = !(manualOpening ?? opening > .32);
    announcement.textContent = manualOpening ? 'Door opened. The sensor sends a signal to the hub.' : 'Door closed.';
    schedule();
  });
  canvas.addEventListener('webglcontextlost', () => {
    unavailable = true;
    syncPreference();
  });
}
