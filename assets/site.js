const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-menu');
const splash = document.querySelector('[data-site-splash]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const contactControls = {
  header: '.header-contact',
  menu: '.menu-toggle',
  closing: '#contact a[data-route-transition]',
  footer: '.site-footer a[data-route-transition]',
};
let navigationTimer = 0;
let menuCloseTimer = 0;

function isMenuOpen() {
  return menuButton?.getAttribute('aria-expanded') === 'true';
}

function setMenu(open) {
  if (!menu || open === isMenuOpen()) return;
  clearTimeout(menuCloseTimer);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  menu.inert = !open;
  if (open) {
    menu.hidden = false;
    if (!reducedMotion.matches) menu.getBoundingClientRect();
    menu.classList.add('is-open');
  } else {
    menu.classList.remove('is-open');
    if (reducedMotion.matches) menu.hidden = true;
    else menuCloseTimer = window.setTimeout(() => { menu.hidden = true; }, 420);
  }
}

menuButton?.addEventListener('click', () => setMenu(!isMenuOpen()));
menu?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });

document.addEventListener('click', (event) => {
  if (isMenuOpen() && !event.target.closest('.header-row')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMenuOpen()) {
    setMenu(false);
    menuButton.focus();
  }
});

function canReturn(link) {
  if (!link.hasAttribute('data-return') || !document.referrer || history.length < 2) return false;
  const referrer = new URL(document.referrer);
  const rootPath = new URL(document.getElementById('header-logo').href).pathname;
  return referrer.origin === location.origin && referrer.pathname.startsWith(rootPath) &&
    /^(?:(?:equipment|projects)\/?)?$/.test(referrer.pathname.slice(rootPath.length));
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-route-transition]');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (navigationTimer) return;
  const returning = canReturn(link);
  if (!link.hasAttribute('data-return')) {
    let returnFocus = null;
    if (event.detail === 0) {
      if (link.closest('#main-menu')) returnFocus = 'menu';
      else if (link.closest('.site-footer')) returnFocus = 'footer';
      else returnFocus = link.classList.contains('header-contact') ? 'header' : 'closing';
    }
    history.replaceState({ ...history.state, hewberryReturnY: window.scrollY, hewberryReturnFocus: returnFocus }, '');
  }
  setMenu(false);

  function navigate() {
    if (returning) history.back();
    else location.assign(link.href);
  }

  if (reducedMotion.matches || !splash?.hidden) {
    navigate();
    return;
  }
  document.documentElement.classList.add('route-leaving');
  delete splash.dataset.complete;
  splash.dataset.leaving = '';
  splash.style.removeProperty('opacity');
  splash.style.setProperty('--splash-progress', 0);
  splash.setAttribute('aria-valuenow', '0');
  splash.hidden = false;
  navigationTimer = window.setTimeout(navigate, 350);
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted && splash) {
    clearTimeout(navigationTimer);
    navigationTimer = 0;
    document.documentElement.classList.remove('route-leaving');
    delete splash.dataset.leaving;
    splash.hidden = true;
    document.documentElement.classList.add('site-ready');
  }
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!event.persisted && navigation?.type !== 'back_forward') return;
  const selector = contactControls[history.state?.hewberryReturnFocus];
  if (typeof selector === 'string') {
    requestAnimationFrame(() => document.querySelector(selector)?.focus({ preventScroll: true }));
  }
});

function fieldError(field, message) {
  const label = document.getElementById(field.getAttribute('aria-describedby'));
  if (!label) return;
  label.textContent = message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

for (const form of document.querySelectorAll('[data-contact-form], [data-email-contact]')) {
  const result = form.querySelector('.form-result');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('invalid', (event) => fieldError(event.target, event.target.validationMessage), true);
  form.addEventListener('input', (event) => {
    fieldError(event.target, '');
    if (!button.disabled) result.textContent = '';
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    if (form.hasAttribute('data-email-contact')) {
      const fields = new FormData(form);
      const message = [
        String(fields.get('message')).trim(),
        '',
        `Name: ${fields.get('name')}`,
        `Email: ${fields.get('email')}`,
      ];
      const telephone = String(fields.get('telephone')).trim();
      if (telephone) message.push(`Telephone: ${telephone}`);
      const draft = document.createElement('a');
      const subject = encodeURIComponent('Hewberry security enquiry');
      const body = encodeURIComponent(message.join('\r\n'));
      draft.href = `${form.action}?subject=${subject}&body=${body}`;
      draft.click();
      result.textContent = 'Review and send the draft in your email app.';
      return;
    }
    button.disabled = true;
    result.textContent = 'Saving message…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form)),
      });
      const reply = await response.json();
      result.textContent = reply.message;
      if (response.ok) {
        form.reset();
        form.elements.submission_id.value = reply.nextSubmissionId;
      } else if (reply.errors) {
        for (const [name, message] of Object.entries(reply.errors)) fieldError(form.elements[name], message);
        form.elements[Object.keys(reply.errors)[0]]?.focus();
      }
    } catch {
      result.textContent = 'The message could not be saved. Try again or call 778-475-4320.';
    } finally {
      button.disabled = false;
    }
  });
}

const filterButtons = document.querySelectorAll('[data-equipment-filter]');
for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const filter = button.dataset.equipmentFilter;
    for (const control of filterButtons) control.setAttribute('aria-pressed', String(control === button));
    let count = 0;
    for (const item of document.querySelectorAll('[data-equipment-group]')) {
      item.hidden = filter !== 'all' && item.dataset.equipmentGroup !== filter;
      if (!item.hidden) {
        count += 1;
        if (count <= 3) item.querySelector('img').loading = 'eager';
      }
    }
    document.querySelector('.equipment-count').textContent = `${count} items`;
  });
}

function startSplash() {
  if (!splash || splash.hidden) return;
  const assets = [
    document.fonts?.ready,
    ...Array.from(document.querySelectorAll('img[data-preload]'), (image) => image.decode()),
  ];
  let ready = 0;
  let displayed = 0;
  let reported = 0;
  let lastFrame = performance.now();
  let exitStarted = 0;
  const cinematic = document.body.classList.contains('cinematic-page');
  const deadline = lastFrame + (cinematic ? 12000 : 4800);
  const hold = cinematic ? 180 : 90;
  const dissolve = cinematic ? 430 : 330;
  const fillTime = cinematic ? 660 : 350;
  for (const asset of assets) {
    Promise.resolve(asset).then(() => { ready += 1; }, () => { ready += 1; });
  }
  function finish() {
    splash.hidden = true;
    document.documentElement.classList.add('site-ready');
  }
  function frame(now) {
    const instant = reducedMotion.matches;
    const elapsed = Math.min(now - lastFrame, 80);
    lastFrame = now;
    displayed = Math.min(ready / assets.length, displayed + (instant ? 1 : elapsed / fillTime));
    splash.style.setProperty('--splash-progress', displayed);
    const percent = Math.floor(displayed * 100);
    if (percent !== reported) {
      splash.setAttribute('aria-valuenow', percent);
      reported = percent;
    }
    if (now >= deadline && displayed < 1) {
      finish();
      return;
    }
    if (displayed === 1) {
      if (instant) {
        finish();
        return;
      }
      if (!exitStarted) {
        exitStarted = now;
        splash.dataset.complete = '';
      }
      const opacity = Math.max(0, 1 - Math.max(0, now - exitStarted - hold) / dissolve);
      if (opacity < .85) document.documentElement.classList.add('site-ready');
      splash.style.opacity = opacity;
      if (opacity === 0) {
        finish();
        return;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

startSplash();

const pointerMotion = matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
const unit = (value) => Math.max(0, Math.min(1, value));

for (const link of document.querySelectorAll('.equipment-link')) {
  const image = link.querySelector('.equipment-image');
  link.addEventListener('pointermove', (event) => {
    if (!pointerMotion.matches || event.pointerType === 'touch') return;
    const bounds = image.getBoundingClientRect();
    const relativeX = unit((event.clientX - bounds.left) / bounds.width) - .5;
    const relativeY = unit((event.clientY - bounds.top) / bounds.height) - .5;
    image.style.setProperty('--image-x', `${relativeX * 11}px`);
    image.style.setProperty('--image-y', `${relativeY * 9}px`);
  });
  link.addEventListener('pointerleave', () => {
    image.style.removeProperty('--image-x');
    image.style.removeProperty('--image-y');
  });
}
