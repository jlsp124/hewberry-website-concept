const bound = (value: number, min = 0, max = 1) => Math.max(min, Math.min(value, max));

export function initializePropertyStory() {
  const story = document.querySelector<HTMLElement>('[data-property-journey]');
  const stage = story?.querySelector<HTMLElement>('[data-journey-stage]');
  const door = story?.querySelector<HTMLElement>('#system');
  const response = story?.querySelector<HTMLElement>('#system-monitor');
  if (!story || !stage || !door || !response) return;

  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const target = { progress: 0, x: 0, y: 0 };
  const current = { ...target };
  let frame = 0;
  let active = false;
  let previousTime = 0;

  function schedule() {
    if (motion.matches && active && !frame) frame = requestAnimationFrame(paint);
  }

  function paint(time: number) {
    frame = 0;
    const elapsed = previousTime ? Math.min(time - previousTime, 40) : 16;
    const ease = 1 - Math.exp(-elapsed / 135);
    previousTime = time;
    current.progress += (target.progress - current.progress) * ease;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;

    stage!.style.setProperty('--journey-progress', current.progress.toFixed(4));
    stage!.style.setProperty('--journey-light-x', (50 + current.x * 43).toFixed(2) + '%');
    stage!.style.setProperty('--journey-light-y', (50 + current.y * 43).toFixed(2) + '%');
    stage!.style.setProperty('--journey-pan-x', (current.x * -13).toFixed(2) + 'px');
    stage!.style.setProperty('--journey-pan-y', (current.y * -9).toFixed(2) + 'px');
    stage!.style.setProperty('--journey-tilt-x', (current.y * 1.7).toFixed(2) + 'deg');
    stage!.style.setProperty('--journey-tilt-y', (current.x * -2.4).toFixed(2) + 'deg');

    if (Math.abs(target.progress - current.progress) + Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > .001) {
      schedule();
    } else {
      previousTime = 0;
    }
  }

  function measure() {
    if (!motion.matches) return;
    const rect = story!.getBoundingClientRect();
    active = rect.bottom > 0 && rect.top < innerHeight;
    if (!active) return;
    target.progress = bound(-rect.top / Math.max(1, rect.height - stage!.offsetHeight));
    const readingLine = innerHeight * .59;
    const beat = response!.getBoundingClientRect().top < readingLine ? 'response'
      : door!.getBoundingClientRect().top < readingLine ? 'door' : 'dusk';
    if (stage!.dataset.beat !== beat) stage!.dataset.beat = beat;
    schedule();
  }

  function applyPreference() {
    if (motion.matches) {
      story!.dataset.immersive = 'true';
      measure();
    } else {
      delete story!.dataset.immersive;
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      active = false;
    }
  }

  story.addEventListener('pointermove', (event) => {
    if (!motion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    const rect = stage.getBoundingClientRect();
    target.x = bound((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    target.y = bound((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    schedule();
  }, { passive: true });

  story.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    schedule();
  }, { passive: true });

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  motion.addEventListener('change', applyPreference);
  applyPreference();
}
