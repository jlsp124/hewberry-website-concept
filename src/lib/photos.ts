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
} as const;

export const footage = {
  exterior: {
    caption: 'Modern home at sunset',
    author: 'Alef Morais',
    source: 'https://www.pexels.com/video/luxurious-modern-home-exterior-at-sunset-40807486/',
    ...pexels,
  },
  doorway: {
    caption: 'Opening a door',
    author: 'Nazar Matveichev',
    source: 'https://www.pexels.com/video/person-opening-and-closing-the-door-2108274/',
    ...pexels,
  },
} as const;
