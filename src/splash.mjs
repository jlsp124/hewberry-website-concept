export const shieldOutline = '<path class="hewberry-shield-outline" d="M41 5c-8 9-19 15-33 18 2 30 13 50 33 65 20-15 31-35 33-65C60 20 49 14 41 5Z"/>';
export const shieldBands = `
  <path d="M41 15c-7 7-17 12-27 15l1.4 8.1C25 35 34 30.8 41 25.5c7 5.3 16 9.5 25.6 12.6L68 30c-10-3-20-8-27-15Z"/>
  <path d="M18 45c8.2-5.9 16-8.9 23-8.9s14.8 3 23 8.9l-3.1 7.2c-7.2-5.2-14-7.8-19.9-7.8s-12.7 2.6-19.9 7.8Z"/>
  <path d="M25 58c5.8-5.8 11-8.2 16-8.2s10.2 2.4 16 8.2l-4.3 6.4c-4.1-4.2-8.2-6.4-11.7-6.4s-7.6 2.2-11.7 6.4Z"/>
  <path d="M33.6 70.6c2.4-3.2 4.8-4.8 7.4-4.8s5 1.6 7.4 4.8L44.1 76c-1.1-1.3-2.1-2-3.1-2s-2 .7-3.1 2Z"/>`;
export const shieldSvg = '<svg class="hewberry-shield" viewBox="0 0 82 94" aria-hidden="true" focusable="false">';

export const splash = `<div id="preloader" class="hewberry-splash" role="progressbar" aria-label="Loading Hewberry" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  ${shieldSvg}
    <defs><clipPath id="hewberry-splash-fill"><rect class="hewberry-splash-fill" width="82" height="94"/></clipPath></defs>
    ${shieldOutline}
    <g class="hewberry-shield-bands" clip-path="url(#hewberry-splash-fill)">${shieldBands}</g>
  </svg>
</div>`;
