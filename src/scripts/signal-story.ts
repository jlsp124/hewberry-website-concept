import { clamp, seekOnScroll } from './scroll-media';
import type { createHubModel } from './signal-models';

type HubModel = NonNullable<ReturnType<typeof createHubModel>>;
const ease = (value: number) => value * value * (3 - 2 * value);

export function initializeSignalStory(story: HTMLElement) {
  if (typeof IntersectionObserver !== 'function') return;
  const screen = story.querySelector<HTMLElement>('[data-alarm-screen]');
  const scenes = Array.from(story.querySelectorAll<HTMLElement>('[data-alarm-scene]'));
  const door = story.querySelector<HTMLVideoElement>('[data-door-film]');
  const hub = story.querySelector<HTMLElement>('[data-hub-stage]');
  const canvas = story.querySelector<HTMLCanvasElement>('[data-hub-canvas]');
  const header = document.querySelector('header');
  if (!screen || !door || !hub || !canvas || !header || scenes.length !== 3) return;

  const motion = matchMedia('(min-height: 520px) and (prefers-reduced-motion: no-preference)');
  const pointer = matchMedia('(pointer: fine) and (hover: hover)');
  const seekDoor = seekOnScroll(door);
  let frame = 0;
  let showing = false;
  let current = -1;
  let entering = -1;
  let model: HubModel | null = null;
  let loadingHub = false;
  let unavailable = false;
  let mouseX = 0;
  let mouseY = 0;
  let pointX = 0;
  let pointY = 0;
  let lastProgress = 0;

  function schedule() {
    if (!frame && showing && story.dataset.flow === 'true') frame = requestAnimationFrame(update);
  }

  function syncPreference() {
    // Direct chapter links can enter the ordinary reading layout at their heading.
    const directChapter = /^#signal-(?:door|hub|response)$/.test(location.hash);
    if (!motion.matches || directChapter) {
      delete story.dataset.flow;
      return;
    }
    story.dataset.flow = 'true';
    schedule();
  }

  function sizeHub() {
    if (!model) return;
    const { width, height } = hub!.getBoundingClientRect();
    model.size(width, height);
    schedule();
  }

  function loadHub() {
    if (model || loadingHub || unavailable) return;
    loadingHub = true;
    void import('./signal-models').then(({ createHubModel }) => {
      model = createHubModel(canvas!);
      unavailable = !model;
    }).catch(() => { unavailable = true; }).finally(() => {
      loadingHub = false;
      if (model) {
        sizeHub();
        model.render(0, 0, 0);
        hub!.dataset.rendered = 'true';
        schedule();
      }
    });
  }

  function update() {
    frame = 0;
    if (!showing || story.dataset.flow !== 'true' || document.hidden) return;
    const height = screen!.offsetHeight;
    if (!height) return;
    const top = header!.getBoundingClientRect().bottom;
    const bounds = story.getBoundingClientRect();
    const progress = clamp((top - bounds.top) / height, 0, scenes.length - .001);
    const index = Math.floor(progress);
    const phase = progress - index;
    const next = index < scenes.length - 1 && phase > .77 ? index + 1 : -1;
    const reveal = next < 0 ? 0 : ease(clamp((phase - .77) / .23));
    const outgoing = next < 0 ? 0 : ease(clamp((phase - .77) / .085));

    if (index !== current || next !== entering) {
      current = index;
      entering = next;
      story.dataset.chapter = String(index);
      scenes.forEach((scene, i) => {
        scene.dataset.layer = i === index ? 'current' : i === next ? 'incoming' : 'inactive';
      });
    }
    scenes[index].style.setProperty('--scene-phase', String(phase));
    scenes[index].style.setProperty('--scene-copy', String(1 - outgoing));
    scenes[index].style.setProperty('--copy-shift', `${-outgoing * 18}px`);
    if (next >= 0) {
      const arrival = ease(clamp((reveal - .63) / .34));
      scenes[next].style.setProperty('--scene-edge', `${100 - reveal * 104}%`);
      scenes[next].style.setProperty('--scene-phase', '0');
      scenes[next].style.setProperty('--scene-copy', String(arrival));
      scenes[next].style.setProperty('--copy-shift', `${(1 - arrival) * 20}px`);
    }

    if (index === 0 && bounds.top < innerHeight * .93) seekDoor(clamp((phase - .11) / .63));
    if (index === 1 || next === 1 || (index === 0 && phase > .66)) loadHub();
    if (index === 1 || next === 1) {
      pointX += (mouseX - pointX) * .14;
      pointY += (mouseY - pointY) * .14;
      model?.render(index === 1 ? phase : 0, pointX, pointY);
    }
    lastProgress = progress;
    if (Math.abs(mouseX - pointX) + Math.abs(mouseY - pointY) > .012 && index === 1) schedule();
  }

  new IntersectionObserver(([entry]) => {
    showing = entry.isIntersecting;
    schedule();
  }, { rootMargin: '80px 0px' }).observe(story);
  if (typeof ResizeObserver === 'function') new ResizeObserver(sizeHub).observe(hub);

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('hashchange', syncPreference);
  motion.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', schedule);
  hub.addEventListener('pointermove', (event) => {
    if (!pointer.matches || event.pointerType !== 'mouse' || Math.floor(lastProgress) !== 1) return;
    const rect = hub.getBoundingClientRect();
    mouseX = clamp((event.clientX - rect.x) / rect.width) * 2 - 1;
    mouseY = clamp((event.clientY - rect.y) / rect.height) * 2 - 1;
    schedule();
  }, { passive: true });
  hub.addEventListener('pointerleave', () => {
    mouseX = mouseY = 0;
    schedule();
  });
  canvas.addEventListener('webglcontextlost', () => {
    unavailable = true;
    model = null;
    delete hub.dataset.rendered;
  });
  syncPreference();
}
