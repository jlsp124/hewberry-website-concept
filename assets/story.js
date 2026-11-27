import { createStoryScroll } from './story-scroll.js';

const body = document.body;
const page = document.documentElement;
const intro = document.querySelector('[data-opening-story]');
const photo = intro.querySelector('.photo-opening');
const statistic = intro.querySelector('.story-stat');
const count = statistic.querySelector('[data-count-to]');
const total = Number(count.dataset.countTo);
const numberFormat = new Intl.NumberFormat('en-CA');
const sequence = document.querySelector('[data-equipment-story]');
const cards = Array.from(sequence.querySelectorAll('.story-slide'));
const captions = Array.from(sequence.querySelectorAll('.story-caption-item'));
const logo = document.getElementById('header-logo');
const contact = document.querySelector('.story-contact');
const ending = contact.parentElement;
const footer = ending.querySelector('.site-footer');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const galleryStart = .234;
const galleryEnd = .744;
const statStop = .93;
const installStop = .087;
const systemStop = .92;
const clamp = (value) => Math.max(0, Math.min(1, value));
const between = (value, start, end) => clamp((value - start) / (end - start));
const ease = (value) => value * value * (3 - 2 * value);
const eased = (value, start, end) => ease(between(value, start, end));
const expoOut = (value) => value >= 1 ? 1 : value <= 0 ? 0 : 1 - 2 ** (-10 * value);
const rise = (progress, start, end) => `${(1 - expoOut(between(progress, start, end))) * 112}%`;
const pinnedTravel = (stage) => Math.max(1, stage.offsetHeight - stage.firstElementChild.offsetHeight);
const stageTop = (stage) => window.scrollY + stage.getBoundingClientRect().top;
const stageStop = (stage, phase) => stageTop(stage) + pinnedTravel(stage) * phase;
const lastStop = () => page.scrollHeight - innerHeight;

let frame = 0;
let previousOpening = -1;
let previousStatExit = -1;
let previousReel = -1;

const scroll = createStoryScroll(() => {
  const sequenceTop = stageTop(sequence);
  const travel = pinnedTravel(sequence);
  return [
    0,
    stageStop(intro, statStop),
    sequenceTop + travel * installStop,
    ...cards.map((_, index) => sequenceTop + travel * (galleryStart + (galleryEnd - galleryStart) * index / (cards.length - 1))),
    sequenceTop + travel * systemStop,
    stageTop(ending),
    lastStop(),
  ];
}, () => motion.matches && !page.classList.contains('route-leaving'));

function applyLogo(scale, width) {
  const phone = innerWidth <= 650;
  const fullWidth = Math.min(phone ? 250 : 620, innerWidth * (phone ? .59 : .38));
  const logoScale = Math.max(1, fullWidth / (width || 150));
  const displayedScale = 1 + (logoScale - 1) * scale;
  const drop = phone ? scale * 59 : 0;
  body.style.setProperty('--nav-logo-scale', displayedScale);
  body.style.setProperty('--nav-logo-drop', `${drop}px`);
  if (phone) {
    const menuTop = logo.offsetTop + drop + logo.offsetHeight * displayedScale + 8;
    body.style.setProperty('--mobile-menu-top', `${menuTop}px`);
  }
}

function paintOpening(progress, exit, fade) {
  if (progress !== previousOpening) {
    previousOpening = progress;
    intro.style.setProperty('--photo-alpha', 1 - fade);
    intro.style.setProperty('--photo-scale', 1 + progress * .026);
    intro.style.setProperty('--opening-copy-alpha', 1 - eased(progress, .035, .36));
    intro.style.setProperty('--opening-details-alpha', 1 - eased(progress, .08, .41));
    intro.style.setProperty('--opening-rise', `${32 * progress}px`);
    intro.style.setProperty('--stat-number-y', rise(progress, .55, .77));
    intro.style.setProperty('--stat-label-y', rise(progress, .60, .81));
    intro.style.setProperty('--stat-note-y', rise(progress, .655, .86));
    intro.style.setProperty('--stat-source-y', rise(progress, .70, .91));
    const countProgress = 1 - (1 - between(progress, .56, .895)) ** 1.65;
    const numeral = numberFormat.format(Math.round(total * countProgress));
    if (count.textContent !== numeral) count.textContent = numeral;
    photo.inert = progress > .42;
  }
  if (exit !== previousStatExit) {
    previousStatExit = exit;
    intro.style.setProperty('--stat-exit-alpha', 1 - exit);
  }
  const statInactive = progress < .62 || exit > .95;
  if (statistic.inert !== statInactive) statistic.inert = statInactive;
  applyLogo(1 - eased(progress, .065, .53), logo.offsetWidth);
}

function paintEquipment(progress, expand, black) {
  if (progress === previousReel) return;
  previousReel = progress;
  const titleOut = eased(progress, .093, .208);
  const titleFade = eased(progress, .108, .177);
  const galleryIn = eased(progress, .143, galleryStart);
  const travel = between(progress, galleryStart, galleryEnd) * (cards.length - 1);
  const step = Math.floor(travel);
  const fraction = between(travel - step, .1, .9);
  const position = step + (1 - Math.cos(fraction * Math.PI)) / 2;
  sequence.style.setProperty('--question-y', rise(progress, 0, .038));
  sequence.style.setProperty('--install-first-y', rise(progress, .015, .067));
  sequence.style.setProperty('--install-second-y', rise(progress, .027, .084));
  sequence.style.setProperty('--install-alpha', 1 - titleFade);
  sequence.style.setProperty('--install-scale', 1 - titleOut * .52);
  sequence.style.setProperty('--gallery-alpha', eased(progress, .148, .196));
  sequence.style.setProperty('--frame-scale', .54 + galleryIn * .46);
  sequence.style.setProperty('--frame-entry', `${(1 - galleryIn) * 11}vw`);
  sequence.style.setProperty('--gallery-caption-alpha', eased(progress, .18, galleryStart) * (1 - eased(progress, .74, .85)));
  sequence.style.setProperty('--gallery-progress', travel / (cards.length - 1));
  sequence.style.setProperty('--expand', expand);
  sequence.style.setProperty('--system-alpha', eased(progress, .82, .90));
  sequence.style.setProperty('--system-title-y', rise(progress, .849, .901));
  sequence.style.setProperty('--system-note-y', rise(progress, .866, .918));
  sequence.style.setProperty('--close-veil', black);
  for (let index = 0; index < cards.length; index += 1) {
    const distance = Math.abs(index - position);
    const visibility = 1 - between(distance, .08, .46);
    cards[index].style.setProperty('--slide-x', `${(index - position) * 100}%`);
    captions[index].style.setProperty('--caption-opacity', visibility);
    captions[index].style.setProperty('--caption-name-y', rise(visibility, 0, .93));
    captions[index].style.setProperty('--caption-detail-y', rise(visibility, .12, 1));
  }
}

function paint() {
  frame = 0;
  const closing = contact.getBoundingClientRect().top < 54;
  const footerTop = footer.getBoundingClientRect().top;
  if (!motion.matches) {
    const firstScreen = photo.getBoundingClientRect().bottom > innerHeight * .52;
    applyLogo(firstScreen ? 1 : 0, logo.offsetWidth);
    body.dataset.scene = closing && footerTop > 54 ? 'dark' : firstScreen ? 'photo' : 'paper';
    return;
  }

  const openingScrolled = -intro.getBoundingClientRect().top;
  const openingTravel = pinnedTravel(intro);
  const opening = clamp(openingScrolled / openingTravel);
  const statExit = eased(openingScrolled - openingTravel, 0, innerHeight * .25);
  const reel = clamp(-sequence.getBoundingClientRect().top / pinnedTravel(sequence));
  const fade = eased(opening, .115, .55);
  const expand = eased(reel, .755, .878);
  const black = eased(reel, .943, 1);
  paintOpening(opening, statExit, fade);
  paintEquipment(reel, expand, black);
  const footerCoveringAction = footerTop < innerHeight * .59;
  if (contact.inert !== footerCoveringAction) contact.inert = footerCoveringAction;
  const scene = footerTop < 54 ? 'paper' : closing || black > .3 ? 'dark' : expand > .78 ? 'mounted' : fade < .49 ? 'photo' : 'paper';
  if (body.dataset.scene !== scene) body.dataset.scene = scene;
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(paint);
}

function seekScene(hash, animate) {
  if (!motion.matches) return false;
  if (hash === '#why') scroll.goTo(stageStop(intro, statStop), animate);
  else if (hash === '#equipment') scroll.goTo(stageStop(sequence, galleryStart), animate);
  else if (hash === '#contact') scroll.goTo(stageTop(ending), animate);
  else if (hash === '#site-footer') scroll.goTo(lastStop(), animate);
  else return false;
  return true;
}

document.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target.closest('a[href^="#"]');
  const hash = anchor?.getAttribute('href');
  if (!seekScene(hash, true)) return;
  event.preventDefault();
  if (location.hash !== hash) history.pushState(null, '', hash);
});

window.addEventListener('hashchange', () => seekScene(location.hash, false));
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule, { passive: true });

new IntersectionObserver(([entry], observer) => {
  if (!entry.isIntersecting) return;
  contact.classList.add('is-arriving');
  observer.disconnect();
}, { threshold: .32 }).observe(contact);

function restoreScroll() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const saved = history.state?.hewberryReturnY;
  if (navigation?.type === 'back_forward' && Number.isFinite(saved)) scroll.goTo(saved, false);
  else if (location.hash) seekScene(location.hash, false);
}

function configure() {
  scroll.cancel();
  page.classList.toggle('cinematic-ready', motion.matches);
  previousOpening = -1;
  previousStatExit = -1;
  previousReel = -1;
  if (!motion.matches) {
    photo.inert = false;
    statistic.inert = false;
    contact.inert = false;
    count.textContent = numberFormat.format(total);
  }
  requestAnimationFrame(restoreScroll);
  schedule();
}

window.addEventListener('pageshow', (event) => {
  if (!event.persisted && performance.getEntriesByType('navigation')[0]?.type === 'back_forward') restoreScroll();
});

motion.addEventListener('change', configure);
document.fonts?.ready.then(schedule);
configure();
