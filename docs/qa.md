# Verification

## Navy film, Systems and Contact

The static build generates thirteen pages. The Chromium suite checks that Systems and Contact navigate to different documents, that a supported browser runs the native page transition, and that the contact form validates and simulates an enquiry without making a submission request. The previous quote URL opens the same simple form.

The three film chapters were inspected at desktop, phone and wide viewport sizes. After the masthead, each chapter occupied the full viewport. The tests verify that scroll advances and reverses the footage, reveals the next shot at the chapter boundary, and turns the hub on in its own scene. There are no door controls or door-status labels in the story. Reduced motion and narrow landscape use the three still scenes in document order. WebKit at 390 px and a 3× pixel ratio decoded and sought the doorway footage, rendered the hub and opened both new routes.

The gallery was checked with pointer reveals and mobile filters. Gallery changes hold the previous images until the first images in the chosen category have decoded. The contact page was visually checked on direct entry and from Systems. Its document bottom matched the footer in both cases.

A local Lighthouse 13.6 mobile run scored 100, with 1.81 s LCP and zero layout shift. The run requested neither film nor the 3D bundle during the initial page load. These are lab measurements.

## Editorial refinement

All eight browser scenarios passed. The suite verifies the sourced figure, the equipment page, the installation preview on hover, the quote simulation, and canvas alignment after resizing an already open window. Reduced motion and script-free reading remain covered.

The updated layouts were visually checked at phone, tablet, short landscape, desktop and a 2,530 CSS pixel viewport rendered at 75% scale. The door and hub drawing rectangles matched their photo frames in all five cases. WebKit at 390 px also rendered the doorway, opened the door and switched equipment categories without page errors.

Lighthouse 13.6 measured 95 for mobile performance on the local static build. LCP was 2.94 s and CLS was 0.001. The opening made no requests for the 3D scene.

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
