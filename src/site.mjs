import { randomUUID } from 'node:crypto';
import { splash } from './splash.mjs';
import { homeStory } from './home-story.mjs';

const telephone = '778-475-4320';
const phoneLink = 'tel:+17784754320';
const officeEmail = 'hewberryoffice@gmail.com';
const addressLink = 'https://www.google.com/maps/search/?api=1&amp;query=3410+28th+Ave+Vernon+BC';
const pageSplash = splash.replace('class="hewberry-splash"', 'class="hewberry-splash" data-site-splash');
const splashStyles = `<style>
  #preloader[data-site-splash] {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    background: white;
  }
  #preloader[data-site-splash][hidden] { display: none; }
  #preloader .hewberry-shield { width: clamp(5rem,8.1vw,6.9rem); height: auto; }
  #preloader .hewberry-shield-outline { fill: none; stroke: #202b47; stroke-width: 2.5; stroke-linejoin: round; }
  #preloader .hewberry-shield-bands { fill: #ef3e4c; }
  #preloader .hewberry-splash-fill { transform: translateY(calc((1 - var(--splash-progress,0)) * 94px)); }
</style>`;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

function actionLabel(text, arrow = '↗') {
  return `<span class="action-arrow" aria-hidden="true">${arrow}</span><span class="action-label">${text}</span><span class="action-dot" aria-hidden="true"></span>`;
}

const contactLink = (root, extra = '') => `<a class="button button-primary action-button${extra}" href="${root}contact/" data-route-transition>${actionLabel('Contact')}</a>`;

function rollingLabel(text) {
  return `<span class="label-mask"><span class="link-roll"><span>${text}</span><span aria-hidden="true">${text}</span></span></span>`;
}

function header(page, root, assets) {
  const home = page === 'home';
  const contact = page === 'contact';
  const section = home ? '' : root;
  const navigation = contact
    ? `<a class="button button-secondary action-button contact-back" href="${root}" data-route-transition data-return>${actionLabel('Back to site', '←')}</a>`
    : `${contactLink(root, ' header-contact')}
      <button class="button button-secondary menu-toggle" type="button" aria-controls="main-menu" aria-expanded="false" aria-label="Menu">
        <span class="label-mask" aria-hidden="true"><span class="menu-state"><span>Menu</span><span>Close</span></span></span>
        <span class="menu-dots" aria-hidden="true"></span>
      </button>`;
  return `<header class="site-header">
  <div class="wrap header-row">
    <a id="header-logo" href="${root}" aria-label="Hewberry Alarms home">
      <span class="header-logo-art"><img src="${assets}story-logo.png" width="560" height="209" alt=""${home ? ' data-preload' : ''}></span>
    </a>
    <div class="header-actions">${navigation}</div>
    ${contact ? '' : `<nav class="site-menu" id="main-menu" aria-label="Main navigation" hidden>
      <a href="${section}#why">${rollingLabel('Why security')}<span class="menu-arrow" aria-hidden="true">↗</span></a>
      <a href="${section}#equipment">${rollingLabel('Equipment')}<span class="menu-arrow" aria-hidden="true">↗</span></a>
      <a href="${root}contact/" data-route-transition>${rollingLabel('Contact')}<span class="menu-arrow" aria-hidden="true">↗</span></a>
    </nav>`}
  </div>
</header>`;
}

function footer(root) {
  return `<footer id="site-footer" class="site-footer" role="contentinfo">
  <div class="wrap footer-inner">
    <p class="footer-name">Hewberry<br>Alarms Ltd.</p>
    <address class="footer-details">
      <a href="${phoneLink}">${telephone}</a>
      <a href="mailto:${officeEmail}">${officeEmail}</a>
      <a href="${addressLink}">3410 28th Ave, Vernon, BC</a>
    </address>
    <nav class="footer-links" aria-label="Footer">
      <a class="text-link-arrow" href="${root}equipment/">Equipment <span aria-hidden="true">↗</span></a>
      <a class="text-link-arrow" href="${root}contact/" data-route-transition>Contact <span aria-hidden="true">↗</span></a>
    </nav>
  </div>
</footer>`;
}

function form(staticSite) {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', autocomplete: 'name', maxlength: 120, required: true },
    { name: 'telephone', label: 'Telephone', type: 'tel', autocomplete: 'tel', maxlength: 40 },
    { name: 'email', label: 'Email', type: 'email', autocomplete: 'email', maxlength: 254, required: true },
    { name: 'message', label: 'Your message', maxlength: 2400 },
  ];
  const delivery = staticSite
    ? `action="mailto:${officeEmail}" enctype="text/plain" data-email-contact`
    : 'action="/_hewberry/contact" data-contact-form';
  return `<form class="contact-form" method="post" ${delivery}>
  ${staticSite ? '' : `<input type="hidden" name="submission_id" value="${randomUUID()}">`}
  ${fields.map(({ name, label, type, autocomplete, maxlength, required }) => {
    const marker = required ? '<span aria-hidden="true"> *</span>' : '';
    const attributes = `name="${name}" id="contact-${name}" maxlength="${maxlength}" aria-describedby="contact-${name}-error"`;
    const control = type
      ? `<input ${attributes} type="${type}" autocomplete="${autocomplete}"${required ? ' required' : ''}>`
      : `<textarea ${attributes} rows="4"></textarea>`;
    return `<div class="form-field">
      <label for="contact-${name}">${label}${marker}</label>
      ${control}
      <p class="field-error" id="contact-${name}-error"></p>
    </div>`;
  }).join('')}
  <div class="form-actions">
    <button class="button button-primary action-button" type="submit">${actionLabel(staticSite ? 'Open email draft' : 'Send message')}</button>
    <p class="form-result" role="status"></p>
  </div>
</form>`;
}

function contactPage(receipt, staticSite) {
  return `<section class="wrap contact-page" aria-labelledby="contact-title">
  <div class="contact-intro">
    <h1 id="contact-title"><span class="text-mask"><span>Let’s talk</span></span> <span class="text-mask"><span>security.</span></span></h1>
    <p class="text-mask"><span>Tell us about your property and what you’d like help with.</span></p>
    <address>
      <a href="${phoneLink}">${telephone}</a>
      <a href="mailto:${officeEmail}">${officeEmail}</a>
      <a href="${addressLink}">3410 28th Ave, Vernon, BC V1T 1W9</a>
    </address>
  </div>
  <div class="contact-fields">
    ${receipt ? '<p class="contact-receipt" role="status">Message saved in this local preview.</p>' : ''}
    ${form(staticSite)}
  </div>
</section>`;
}

function equipmentGrid(items, equipmentAssets, eagerCount = 0) {
  return `<div class="equipment-grid">
  ${items.map((item, index) => {
    const title = escapeHtml(item.fullName ?? item.name);
    return `<article class="equipment-item" data-equipment-group="${escapeHtml(item.group)}">
      <a class="equipment-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener" aria-label="${title} (opens in a new tab)">
        <div class="equipment-image"><img src="${equipmentAssets}${escapeHtml(item.id)}/home.webp" alt="" width="880" height="580" loading="${index < eagerCount ? 'eager' : 'lazy'}" decoding="async"></div>
        <div class="equipment-label"><span class="equipment-class">${escapeHtml(item.category)}</span><span aria-hidden="true">↗</span></div>
        <h3>${escapeHtml(item.name)}</h3>
      </a>
    </article>`;
  }).join('')}
</div>`;
}

function equipmentPage(items, equipmentAssets) {
  return `<section class="wrap equipment-page section-space" aria-labelledby="equipment-title">
  <div class="section-intro equipment-heading">
    <h1 id="equipment-title">Equipment.</h1>
    <p>Explore Ajax devices and items listed in Hewberry’s catalogue.</p>
  </div>
  <div class="equipment-controls" role="group" aria-label="Filter equipment">
    <button class="button button-secondary" type="button" data-equipment-filter="all" aria-pressed="true">All equipment</button>
    <button class="button button-secondary" type="button" data-equipment-filter="ajax" aria-pressed="false">Ajax</button>
    <button class="button button-secondary" type="button" data-equipment-filter="listed" aria-pressed="false">Hewberry catalogue</button>
    <span class="equipment-count" role="status">${items.length} items</span>
  </div>
  ${equipmentGrid(items, equipmentAssets, 3)}
</section>`;
}

function closing(root) {
  return `<section id="contact" class="closing" aria-labelledby="closing-title">
  <div class="wrap closing-inner">
    <h2 id="closing-title">Tell us what you need secured.</h2>
    <div>
      <p>Talk with our Vernon team about a new installation, an upgrade or ongoing monitoring.</p>
      <div class="closing-actions">
        ${contactLink(root, ' button-light')}
        <a class="text-link" href="${phoneLink}">${telephone}</a>
      </div>
    </div>
  </div>
</section>`;
}

export function renderSite(page, items, receipt = false, { staticSite = false, publishedUrl } = {}) {
  const home = page === 'home';
  const contact = page === 'contact';
  const root = staticSite ? (home ? './' : '../') : '/';
  const assets = `${root}${staticSite ? 'assets' : '_hewberry'}/`;
  const equipmentAssets = staticSite ? `${assets}equipment/` : '/_mirror/equipment/';
  const favicon = staticSite ? `${assets}favicon.png` : '/_mirror/hewberry-shield.png';
  const previewImage = publishedUrl
    ? new URL('assets/story-house-wide.webp', publishedUrl).href
    : `${assets}story-house-wide.webp`;
  const title = home ? 'Hewberry Alarms | Vernon, BC' : `${contact ? 'Contact' : 'Equipment'} | Hewberry Alarms`;
  const description = home
    ? 'Hewberry installs alarms, security cameras and door access for homes and businesses in Vernon and the Okanagan.'
    : contact ? 'Contact Hewberry Alarms in Vernon about a security installation, upgrade or monitoring.'
      : 'Browse Ajax equipment and the Hewberry Alarms catalogue.';
  return `<!doctype html>
<html lang="en-CA" data-type="service">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <meta name="page-type" content="service">
  <meta name="site-kind" content="other">
  <meta name="theme-color" content="#f6f6f3">
  <meta name="robots" content="noindex">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${previewImage}">
  <title>${title}</title>
  ${splashStyles}
  <link rel="icon" href="${favicon}" type="image/png">
  <link rel="preload" as="font" href="${assets}work-sans-latin.woff2" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${assets}brand.css">
  <link rel="stylesheet" href="${assets}site.css">
  ${home ? `<link rel="stylesheet" href="${assets}story.css">` : ''}
  <noscript><style>#preloader.hewberry-splash[data-site-splash],.menu-toggle{display:none}.cinematic-page .site-header{position:absolute}</style></noscript>
  <script src="${assets}site.js" defer></script>
  ${home ? `<script src="${assets}story.js" type="module"></script>` : ''}
</head>
<body id="top" class="${home ? 'home-page cinematic-page' : contact ? 'contact-route' : 'equipment-route'}"${home ? ' data-scene="photo"' : ''}>
  ${home || contact ? pageSplash : pageSplash.replace('id="preloader"', 'id="preloader" hidden')}
  <a class="skip" href="#main">Skip to content</a>
  ${header(page, root, assets)}
  <main id="main">
    ${home ? homeStory(contactLink(root, ' story-contact-button'), assets, footer(root)) : contact ? contactPage(receipt, staticSite) : equipmentPage(items, equipmentAssets)}
    ${!home && !contact ? closing(root) : ''}
  </main>
  ${home || contact ? '' : footer(root)}
</body>
</html>`;
}
