const products = [
  {
    name: 'TurretCam',
    detail: 'See what happened. The 8 MP model records up to 4K.',
    image: 'turretcam',
    alt: 'Ajax TurretCam security camera in black',
  },
  {
    name: 'DoorProtect',
    detail: 'Know when an entry opens, even when you’re away.',
    image: 'doorprotect',
    alt: 'The two parts of a black Ajax DoorProtect entry sensor',
  },
  {
    name: 'KeyPad Plus',
    detail: 'Arm or disarm with a code or a compatible tag.',
    image: 'keypad-plus',
    alt: 'Black Ajax KeyPad Plus with a numeric touch panel',
  },
  {
    name: 'Hub 2',
    detail: 'One hub connects the alarm devices and relays alerts.',
    image: 'hub-2',
    alt: 'Rounded black Ajax Hub 2 control panel',
  },
  {
    name: 'Installed in place.',
    detail: 'Equipment fitted around the space you use.',
    image: 'installed',
    alt: 'Turret security camera mounted below a concrete ceiling',
  },
];

const incidentCount = 15947;
const incidentLabel = new Intl.NumberFormat('en-CA').format(incidentCount);

function opening(assets) {
  return `<div class="opening-story" data-opening-story>
  <div class="story-pin">
    <section class="photo-opening" aria-labelledby="opening-title" data-enter="opening">
      <picture class="opening-picture">
        <source media="(max-width: 650px)" srcset="${assets}story-house-phone.webp">
        <img src="${assets}story-house-wide.webp" width="1672" height="941" alt="Warm light from a modern brick home at dusk" fetchpriority="high" data-preload>
      </picture>
      <div class="opening-shade" aria-hidden="true"></div>
      <div class="opening-copy">
        <h1 id="opening-title" class="text-mask"><span>Alarms, security cameras and door access.</span></h1>
        <p class="text-mask"><span>Installed in Vernon and the Okanagan.</span></p>
      </div>
      <p class="opening-tenure">
        <span class="text-mask"><strong>25 years</strong></span>
        <span class="text-mask"><span>keeping you safe.</span></span>
      </p>
      <a class="opening-scroll" href="#why"><span class="scroll-mark" aria-hidden="true">↓</span> Scroll</a>
    </section>
    <section id="why" class="story-stat" aria-labelledby="story-stat-title">
      <div class="wrap stat-layout">
        <h2 id="story-stat-title" class="text-mask" aria-label="${incidentLabel}"><span data-count-to="${incidentCount}" aria-hidden="true">${incidentLabel}</span></h2>
        <div class="stat-copy">
          <p class="stat-label text-mask"><span>Break-ins reported to police in B.C. in 2025.</span></p>
          <p class="stat-note text-mask"><span>When you’re away, it matters knowing which door opened and what’s happening outside.</span></p>
          <div class="text-mask"><span><a class="stat-source text-link-arrow" href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3510017701">Statistics Canada <span aria-hidden="true">↗</span></a></span></div>
        </div>
      </div>
    </section>
  </div>
</div>`;
}

function equipmentStory(assets) {
  return `<section class="equipment-story" data-equipment-story aria-labelledby="install-title">
  <div class="story-pin">
    <div class="install-beat">
      <div class="install-copy">
        <p class="install-question text-mask"><span>Interested in a security system?</span></p>
        <h2 id="install-title" class="install-title">
          <span class="text-mask"><span>We can install</span></span> <span class="text-mask"><span>it for you.</span></span>
        </h2>
      </div>
    </div>
    <div id="equipment" class="equipment-sequence" aria-label="Equipment and installation">
      <div class="story-frame">
        ${products.map(({ name, detail, image, alt }) => `<figure class="story-slide${image === 'installed' ? ' mounted-slide' : ''}">
          <div class="story-image">
            <img src="${assets}story-${image}.webp" alt="${alt}" decoding="async" fetchpriority="low">
          </div>
          <figcaption><strong>${name}</strong><span>${detail}</span></figcaption>
        </figure>`).join('')}
      </div>
      <div class="story-caption" aria-hidden="true">
        ${products.map(({ name, detail }) => `<div class="story-caption-item">
          <p class="story-caption-name text-mask"><span>${name}</span></p>
          <p class="story-caption-detail text-mask"><span>${detail}</span></p>
        </div>`).join('')}
      </div>
      <div class="story-position" aria-hidden="true">
        <span class="story-position-cue">Scroll</span>
        <span class="story-position-track"><span></span></span>
      </div>
      <div class="system-copy">
        <h3 class="text-mask"><span>A system that works together.</span></h3>
        <p class="text-mask"><span>Cameras, sensors and monitoring planned around your property. Fitted together by Hewberry.</span></p>
      </div>
      <div class="story-darken" aria-hidden="true"></div>
    </div>
  </div>
</section>`;
}

export function homeStory(contactAction, assets, footer) {
  return `${opening(assets)}
${equipmentStory(assets)}
<div class="story-ending">
  <section id="contact" class="story-contact" aria-labelledby="closing-title">
    <div class="closing-stickers" aria-hidden="true">
      <span class="closing-sticker closing-sticker-camera"><img src="${assets}story-turretcam.webp" alt="" decoding="async"></span>
      <span class="closing-sticker closing-sticker-keypad"><img src="${assets}story-keypad-plus.webp" alt="" decoding="async"></span>
    </div>
    <div class="wrap story-contact-inner">
      <h2 id="closing-title"><span class="text-mask"><span>Let’s talk</span></span> <span class="text-mask"><span>security.</span></span></h2>
      <div class="story-contact-action">
        ${contactAction}
      </div>
    </div>
  </section>
  ${footer}
</div>`;
}
