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
  const view = story.querySelector<HTMLElement>('[data-signal-view]');
  const canvas = story.querySelector<HTMLCanvasElement>('[data-signal-canvas]');
  const caption = story.querySelector<HTMLElement>('[data-signal-caption]');
  const stateLabel = story.querySelector<HTMLElement>('[data-signal-status-label]');
  const steps = Array.from(story.querySelectorAll<HTMLElement>('[data-signal-step]'));
  const door = story.querySelector<HTMLButtonElement>('[data-signal-door]');
  const doorLabel = story.querySelector<HTMLElement>('[data-signal-door-label]');
  const announcement = story.querySelector<HTMLElement>('[data-signal-door-announcement]');
  if (!stage || !view || !canvas || !caption || !stateLabel || !door || !doorLabel || !announcement || steps.length !== 3) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const stacked = matchMedia('(max-width: 900px) and (min-height: 481px), (max-width: 619px)');
  let models: Models | null = null;
  let loading = false;
  let unavailable = false;
  let frame = 0;
  let near = false;
  let visible = false;
  let progress = 0;
  let opening = 0;
  let pointX = 0;
  let pointY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let override: boolean | null = null;
  let previous = 0;
  let active = -1;
  let sensorOpen = false;

  const captions = ['Ajax DoorProtect', 'Ajax Hub 2', 'Monitoring centre'];

  function setDoorState(value: boolean | null) {
    override = value;
    doorLabel!.textContent = value === true ? 'Close the door' : 'Open the door';
  }

  function targetProgress() {
    const anchor = window.innerHeight * (stacked.matches ? .32 : .53);
    const index = steps.findIndex((step) => step.getBoundingClientRect().bottom >= anchor);
    if (index === -1) return 3;
    const rect = steps[index].getBoundingClientRect();
    return index + clamp((anchor - rect.top) / rect.height);
  }

  function update(time: number) {
    frame = 0;
    if (!models || !motion.matches || !visible || document.hidden) return;
    const target = targetProgress();
    const dt = previous ? clamp((time - previous) / 1000, .004, .06) : .03;
    previous = time;
    const amount = 1 - Math.exp(-dt * 13);
    progress += (target - progress) * amount;

    if (target > 1.03 && override !== null) setDoorState(null);
    const nextOpening = override === null ? easing(.49, .89, progress) : Number(override);
    opening += (nextOpening - opening) * amount;
    pointX += (mouseX - pointX) * amount;
    pointY += (mouseY - pointY) * amount;
    const beat = progress < 1.055 ? 0 : progress < 1.94 ? 1 : 2;
    if (beat !== active) {
      active = beat;
      stage!.dataset.beat = ['door', 'hub', 'response'][beat];
      caption!.textContent = captions[beat];
    }
    const open = opening > .48;
    if (open !== sensorOpen) {
      sensorOpen = open;
      stage!.dataset.doorOpen = String(open);
      stateLabel!.textContent = open ? 'Door open' : 'Door closed';
    }
    view!.style.setProperty('--response-alpha', String(easing(1.76, 2.08, progress)));
    view!.style.setProperty('--response-scale', String(1.12 - easing(1.76, 2.69, progress) * .10));
    if (progress < 2.08) models.render(progress, opening, pointX, pointY);

    if (Math.abs(target - progress) > .0007 || Math.abs(nextOpening - opening) > .001
      || Math.abs(mouseX - pointX) + Math.abs(mouseY - pointY) > .003) schedule();
  }

  function schedule() {
    if (!frame && visible && models && motion.matches) frame = requestAnimationFrame(update);
  }

  function refreshSize() {
    if (!models || story.dataset.webgl !== 'true') return;
    const { width, height } = view!.getBoundingClientRect();
    models.size(width, height);
    schedule();
  }

  function syncPreference() {
    if (unavailable || !motion.matches) {
      delete story.dataset.webgl;
      door!.hidden = true;
      return;
    }
    if (models) {
      story.dataset.webgl = 'true';
      door!.hidden = false;
      progress = targetProgress();
      opening = easing(.49, .89, progress);
      refreshSize();
      return;
    }
    if (!near || loading) return;
    loading = true;
    void import('./signal-models').then(({ createSignalModels: createModels }) => {
      models = createModels(canvas!, schedule);
      unavailable = !models;
    }).catch(() => { unavailable = true; }).finally(() => {
      loading = false;
      syncPreference();
    });
  }

  if (typeof ResizeObserver === 'function') new ResizeObserver(refreshSize).observe(view);
  else window.addEventListener('resize', refreshSize, { passive: true });
  const sceneThreshold = .035;
  const prepare = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio < sceneThreshold) return;
    near = true;
    syncPreference();
    prepare.disconnect();
  }, { threshold: sceneThreshold });
  prepare.observe(story);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previous = 0;
    if (visible && models) progress = targetProgress();
    schedule();
  }).observe(story);

  motion.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  story.addEventListener('pointermove', (event) => {
    if (!pointer.matches || event.pointerType !== 'mouse' || !models) return;
    mouseX = clamp(event.clientX / window.innerWidth * 2 - 1, -1, 1);
    mouseY = clamp(event.clientY / window.innerHeight * 2 - 1, -1, 1);
    schedule();
  }, { passive: true });
  story.addEventListener('pointerleave', () => {
    mouseX = mouseY = 0;
    schedule();
  });
  door.addEventListener('click', () => {
    setDoorState(override === true ? false : true);
    announcement.textContent = override === true ? 'Door opened. The sensor sends a signal to the hub.' : 'Door closed.';
    schedule();
  });
  canvas.addEventListener('webglcontextlost', () => {
    unavailable = true;
    syncPreference();
  });
}
