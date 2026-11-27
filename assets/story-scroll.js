const springRate = 12;
const wheelPause = 135;
const wheelThreshold = 12;
const sustainedWheelThreshold = 560;

export function createStoryScroll(getStops, enabled) {
  let frame = 0;
  let position = 0;
  let destination = 0;
  let velocity = 0;
  let lastFrame = 0;
  let lastWrite = 0;
  let wheelDirection = 0;
  let wheelDistance = 0;
  let lastWheel = -Infinity;
  let lastStep = -Infinity;
  let touchStart = null;
  let touchHeld = false;
  let touchSettle = 0;

  function cancel() {
    cancelAnimationFrame(frame);
    frame = 0;
    velocity = 0;
  }

  function writeScroll(y) {
    window.scrollTo({ top: Math.round(y), behavior: 'instant' });
    lastWrite = window.scrollY;
  }

  function tick(now) {
    if (!enabled() || Math.abs(window.scrollY - lastWrite) > 3) {
      cancel();
      return;
    }
    const time = Math.max(0, (now - lastFrame) / 1000);
    lastFrame = now;
    // Solve the damped spring over the elapsed time so refresh rate does not change the glide.
    const offset = position - destination;
    const travel = (velocity + springRate * offset) * time;
    const decay = Math.exp(-springRate * time);
    position = destination + (offset + travel) * decay;
    velocity = (velocity - springRate * travel) * decay;
    if (Math.abs(position - destination) < 1.25 && Math.abs(velocity) < 24) {
      cancel();
      writeScroll(destination);
      return;
    }
    writeScroll(position);
    frame = requestAnimationFrame(tick);
  }

  function goTo(y, animate = true) {
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    destination = Math.min(Math.max(0, y), Math.max(0, limit));
    if (!animate || !enabled()) {
      cancel();
      writeScroll(destination);
      return;
    }
    if (frame) {
      if (velocity * (destination - position) < 0) velocity = 0;
      return;
    }
    position = lastWrite = window.scrollY;
    if (Math.abs(position - destination) < 1) return;
    lastFrame = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function advance(direction) {
    const stops = getStops();
    const current = window.scrollY;
    const from = frame && (destination - current) * direction > 0 ? destination : current;
    const next = direction > 0
      ? stops.find((stop) => stop > from + 9)
      : stops.findLast((stop) => stop < from - 9);
    if (next !== undefined) goTo(next);
  }

  window.addEventListener('wheel', (event) => {
    if (!enabled() || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey ||
      Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const direction = Math.sign(event.deltaY);
    const now = performance.now();
    const pause = now - lastWheel;
    const reversed = direction !== wheelDirection;
    if (pause > wheelPause || reversed) {
      wheelDirection = direction;
      if (reversed || pause > 320 || Number.isFinite(lastStep)) wheelDistance = 0;
      lastStep = -Infinity;
    }
    lastWheel = now;
    wheelDistance += Math.abs(event.deltaY) * unit;
    const continuing = Number.isFinite(lastStep);
    const threshold = continuing ? sustainedWheelThreshold : wheelThreshold;
    if (wheelDistance < threshold || now - lastStep < wheelPause) return;
    advance(direction);
    lastStep = now;
    wheelDistance = 0;
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    const focused = event.target instanceof Element ? event.target : document.activeElement;
    if (!enabled() || event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey ||
      focused?.closest('input, textarea, select, [contenteditable]')) return;
    const down = event.key === 'ArrowDown' || event.key === 'PageDown';
    const up = event.key === 'ArrowUp' || event.key === 'PageUp';
    const space = event.key === ' ' && !focused?.closest('a, button, summary');
    if (down || up || space) {
      event.preventDefault();
      advance(down || (space && !event.shiftKey) ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const stops = getStops();
      goTo(event.key === 'Home' ? stops[0] : stops.at(-1));
    }
  });

  function queueTouchSettle() {
    clearTimeout(touchSettle);
    touchSettle = setTimeout(() => {
      const from = touchStart;
      touchStart = null;
      if (!enabled() || from === null || Math.abs(window.scrollY - from) < 36) return;
      const stops = getStops();
      const current = window.scrollY;
      const nearest = stops.reduce((best, stop) => Math.abs(stop - current) < Math.abs(best - current) ? stop : best);
      const deliberate = Math.abs(current - from) >= Math.min(112, innerHeight * .14);
      if (Math.abs(nearest - from) < 10 && deliberate) advance(Math.sign(current - from));
      else goTo(nearest);
    }, 135);
  }

  window.addEventListener('touchstart', (event) => {
    clearTimeout(touchSettle);
    touchStart = null;
    if (!enabled()) return;
    cancel();
    if (event.touches.length !== 1) return;
    touchStart = window.scrollY;
    touchHeld = true;
  }, { passive: true });

  function finishTouch() {
    touchHeld = false;
    if (touchStart !== null) queueTouchSettle();
  }
  window.addEventListener('touchend', finishTouch, { passive: true });
  window.addEventListener('touchcancel', finishTouch, { passive: true });
  window.addEventListener('scroll', () => {
    if (touchStart !== null && !touchHeld) queueTouchSettle();
  }, { passive: true });
  window.addEventListener('resize', cancel, { passive: true });

  return { goTo, cancel };
}
