# Verification

## Interactive product story

Astro generated eleven pages. The eight Chromium scenarios cover every content route, anchor navigation, reversible 3D motion, keyboard operation of the door, equipment filtering, and the simulated quote. The quote check verifies the browser makes no requests during submission and stores no answers. Axe scans the primary routes, mobile opening and quote review.

The WebGL scene was visually reviewed in Chromium at 390, 768, 844 landscape, 1024, 1440 and 1920 px. The tablet scene was moved to the full-width composition after the original 768 px render cropped the hub. The browser suite checks responsive photography and page width from 320 to 2560 px. WebKit at 390 px with a 3× pixel ratio used the dedicated portrait image, rendered the doorway and switched equipment categories without page errors.

With reduced motion or unavailable WebGL, the walkthrough uses the manufacturer’s reference images and the same written explanation. The complete equipment table, contact link and quote fallback are present when JavaScript is disabled. The 3D bundle loads when the walkthrough comes into view and is approximately 137 kB gzip. The browser suite verifies the opening does not fetch it. [Playwright suite](../tests/site.spec.ts)

Lighthouse 13.6 measured the local production build at 95 for mobile performance, with a 2.94 s LCP, 0.001 CLS and 0 ms TBT. The run selected the 960 px portrait AVIF and made no requests for the 3D bundle. These are simulated lab measurements.

A clean Linux checkout passed `npm ci`, `npm run check`, and `npm run build` with Node 24.22.3 and npm 11.19.1, matching the Pages runner.

## Earlier dusk-to-night edition

The dusk-to-night edition passed all eight Chromium scenarios on the deployed site. The suite checks the two-link navigation, no links in photo figures, one continuous property, pointer response, the replayable sample alert, equipment and quote routes, blocked images, reduced motion, and script-free access to contact information. [Playwright suite](../tests/site.spec.ts), [Pages deployment](https://github.com/jlsp124/hewberry-website-concept/actions/runs/45541424685).

### Visual review

The production build was checked at 320, 390, 768, 844, 1024, 1440, 1920 and 2560 px. The 844 px test used a 390 px high landscape viewport. A short-landscape layout brings the full introduction above the fold. Mobile WebKit emulation at 320, 390 and 430 px portrait and 844 px landscape caught a floating diagram layer competing with the reading surface. Smaller screens now show the example inside the monitoring chapter. Chromium portrait reflow at 200% text size passed at 320 and 390 px. [Dusk-to-night design](creative-direction.md#dusk-to-night-concept).

### Functionality and accessibility

- The home story uses one photograph throughout. Native scrolling changes the lighting, and a fine pointer changes the photo’s perspective. Motion preferences preserve the written explanation and instantly complete the optional example.
- The keyboard can follow both header links, play and replay the example, and complete the quote. The contact link and page copy also work with JavaScript disabled.
- The installation table and Ajax examples fit mobile widths. The full set of fourteen older parts listings remains available in a disclosure.
- The quote test records network requests, checks that no request occurs during the simulated submission and checks browser storage afterward.
- Axe scans cover the primary routes, the mobile opening and quote states. These are automated checks with browser emulation.

### Lighthouse lab results

Lighthouse 13.6 measured the locally served dusk-to-night build before the final visibility adjustment to the ambient signal. Timing and scores reflect the simulated lab profiles.

| Page and profile | Performance | Accessibility | Best practices | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home, mobile | 99 | 100 | 100 | 2.1 s | 0.002 | 10 ms |
| Home, desktop | 100 | 100 | 100 | 0.2 s | 0.001 | 0 ms |

The SEO score of 66 reflects the intentional `noindex` marker for the concept. These measurements provide lab evidence. Field Core Web Vitals require real visitor traffic.
