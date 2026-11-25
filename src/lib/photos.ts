const pexels = { license: 'Pexels License', terms: 'https://www.pexels.com/license/' };

export const photos = {
  residential: {
    alt: 'Contemporary brick home with a softly lit front window at twilight',
    caption: 'Brick home at twilight · example property',
    author: 'Littlehampton Bricks',
    source: 'https://www.pexels.com/photo/modern-house-facade-with-glowing-lights-at-dusk-4626268/',
    ...pexels,
  },
  commercial: {
    alt: 'Brick office building with a central glass entrance',
    caption: 'Brick office building · example property',
    author: 'Jonas Bollion',
    source: 'https://www.pexels.com/photo/modern-brick-office-building-exterior-40989253/',
    ...pexels,
  },
  construction: {
    alt: 'Exposed timber framing inside a building under construction',
    caption: 'Timber framing · example property',
    author: 'Ron Lach',
    source: 'https://www.pexels.com/photo/wooden-construction-of-a-house-8830259/',
    ...pexels,
  },
  monitoring: {
    alt: 'A view over the water toward softly lit hills in Vernon at dusk',
    caption: 'Evening in Vernon, BC',
    author: 'Chelsea Chehade',
    source: 'https://unsplash.com/photos/body-of-water-near-mountain-during-daytime-AuRKEkFTB8s',
    license: 'Unsplash License',
    terms: 'https://unsplash.com/license',
  },
  'gear-detect': {
    alt: 'Close-up of a Nest Protect smoke and carbon monoxide alarm with its light ring illuminated',
    caption: 'Nest Protect detector · equipment example',
    author: 'Raysonho @ Open Grid Scheduler / Grid Engine',
    source: 'https://commons.wikimedia.org/wiki/File:NestProtect.JPG',
    license: 'CC0 1.0',
    terms: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'gear-video': {
    alt: 'A compact CCTV camera against a gold-toned building façade',
    caption: 'Outdoor CCTV camera · equipment example',
    author: 'Jan van der Wolf',
    source: 'https://www.pexels.com/photo/the-facade-of-a-building-with-a-security-camera-12571569/',
    ...pexels,
  },
  'gear-access': {
    alt: 'An electronic card reader on a concrete wall beside a dark door',
    caption: 'Electronic card reader · equipment example',
    author: 'Jakub Żerdzicki',
    source: 'https://unsplash.com/photos/a-card-reader-and-a-dark-door-are-visible-pLD-QID7x3k',
    license: 'Unsplash License',
    terms: 'https://unsplash.com/license',
  },
  'gear-wiring': {
    alt: 'Blue and white network cables feeding into a structured cabling panel',
    caption: 'Structured cabling · equipment example',
    author: 'Brett Sayles',
    source: 'https://www.pexels.com/photo/structured-cabling-system-with-numerous-network-cables-4508748/',
    ...pexels,
  },
  valley: {
    alt: 'Forested slopes and clouds reflected in Kalamalka Lake near Oyama',
    caption: 'Kalamalka Lake near Oyama, BC',
    author: 'Murray Foubister',
    source: 'https://commons.wikimedia.org/wiki/File:Shores_of_Kalamalka_Lake_near_Oyama.jpg',
    license: 'CC BY-SA 2.0',
    terms: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },
} as const;

export const openingPhoto = {
  caption: 'An illuminated house at dusk · example property',
  author: 'Gustavo Galeano Maz',
  source: 'https://www.pexels.com/photo/exterior-of-a-modern-villa-13752348/',
  ...pexels,
};
