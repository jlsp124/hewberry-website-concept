const springRate = 12;
const touchSpringRate = 9.5;
const wheelPause = 135;
const wheelThreshold = 12;
const sustainedWheelThreshold = 560;

function nearestStop(stops, y) {
  let nearest = 0;
  for (let index = 1; index < stops.length; index += 1) {
    if (Math.abs(stops[index] - y) < Math.abs(stops[nearest] - y)) nearest = index;
  }
  return nearest;
}

function projectPosition(y, before, after) {
  if (y <= before[0]) return after[0];
  const next = before.findIndex((stop) => stop >= y);
  if (next === -1) return after.at(-1);
  const progress = (y - before[next - 1]) / (before[next] - before[next - 1]);
  return after[next - 1] + (after[next] - after[next - 1]) * progress;
}

export function createStoryScroll(getStops, enabled) {
  const touchEnabled = () => enabled() && document.documentElement.classList.contains('story-touch');
  let stops = [];
  let frame = 0;
  let position = 0;
  let destination = 0;
  let velocity = 0;
  let lastFrame = 0;
  let lastWrite = 0;
  let rate = springRate;
  let wheelDirection = 0;
  let wheelDistance = 0;
  let lastWheel = -Infinity;
  let lastStep = -Infinity;
  let gesture = null;

  function cancel() {
    cancelAnimationFrame(frame);
    frame = 0;
    velocity = 0;
  }

  function writeScroll(y) {
    window.scrollTo({ top: Math.round(y), behavior: 'instant' });
    lastWrite = window.scrollY;
  }

  function refreshLayout() {
    const previous = stops;
    stops = enabled() ? getStops() : [];
    if (!previous.length || previous.length !== stops.length ||
      previous.every((stop, index) => Math.abs(stop - stops[index]) < .5)) return;
    if (gesture?.claimed) gesture.startScroll = projectPosition(gesture.startScroll, previous, stops);
    if (frame) {
      position = projectPosition(position, previous, stops);
      destination = projectPosition(destination, previous, stops);
      writeScroll(position);
    } else {
      const current = window.scrollY;
      const end = stops.at(-1);
      writeScroll(Math.abs(current - end) < 2 ? end : projectPosition(current, previous, stops));
    }
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
    const travel = (velocity + rate * offset) * time;
    const decay = Math.exp(-rate * time);
    position = destination + (offset + travel) * decay;
    velocity = (velocity - rate * travel) * decay;
    if (Math.abs(position - destination) < 1.25 && Math.abs(velocity) < 24) {
      cancel();
      writeScroll(destination);
      return;
    }
    writeScroll(position);
    frame = requestAnimationFrame(tick);
  }

  function goTo(y, animate = true) {
    const root = document.documentElement;
    const limit = root.scrollHeight - root.clientHeight;
    destination = Math.min(Math.max(0, y), Math.max(0, limit));
    rate = touchEnabled() ? touchSpringRate : springRate;
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
      goTo(event.key === 'Home' ? stops[0] : stops.at(-1));
    }
  });

  window.addEventListener('touchstart', (event) => {
    if (!touchEnabled() || event.touches.length !== 1) {
      gesture = null;
      return;
    }
    const finger = event.touches[0];
    gesture = { x: finger.clientX, y: finger.clientY, id: finger.identifier, distance: 0, claimed: false };
  }, { passive: true });

  function touchDestination(origin, distance) {
    const next = Math.min(stops.length - 1, Math.max(0, origin + Math.sign(distance)));
    return stops[next];
  }

  window.addEventListener('touchmove', (event) => {
    if (!gesture || !touchEnabled() || event.touches.length !== 1) return;
    const finger = event.touches[0];
    if (finger.identifier !== gesture.id) return;
    const vertical = gesture.y - finger.clientY;
    if (!gesture.claimed) {
      const horizontal = Math.abs(gesture.x - finger.clientX);
      if (horizontal > 9 && horizontal > Math.abs(vertical)) {
        gesture = null;
        return;
      }
      if (Math.abs(vertical) < 8 || !event.cancelable) return;
      cancel();
      gesture.claimed = true;
      gesture.startScroll = window.scrollY;
      gesture.origin = nearestStop(stops, gesture.startScroll);
    }
    if (event.cancelable) event.preventDefault();
    gesture.distance = vertical;
    const destination = touchDestination(gesture.origin, vertical);
    const remaining = destination - gesture.startScroll;
    // Keep the drag preview within the current transition. The release commits the adjacent scene.
    const preview = Math.min(Math.abs(vertical) * .52, Math.abs(remaining) * .28);
    writeScroll(gesture.startScroll + Math.sign(remaining) * preview);
  }, { passive: false });

  function finishTouch(event) {
    const swipe = gesture;
    gesture = null;
    if (!swipe?.claimed || !touchEnabled()) return;
    const height = window.visualViewport?.height ?? window.innerHeight;
    const threshold = Math.min(76, Math.max(47, height * .095));
    const advance = event.type === 'touchend' && Math.abs(swipe.distance) >= threshold;
    goTo(advance ? touchDestination(swipe.origin, swipe.distance) : stops[swipe.origin]);
  }

  window.addEventListener('touchend', finishTouch, { passive: true });
  window.addEventListener('touchcancel', finishTouch, { passive: true });

  return { goTo, cancel, refreshLayout };
}
