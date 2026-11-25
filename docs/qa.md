# Verification

The dusk-to-night edition passed all eight Chromium scenarios on the deployed site. The suite checks the two-link navigation, no links in photo figures, one continuous property, pointer response, the replayable sample alert, equipment and quote routes, blocked images, reduced motion, and script-free access to contact information. [Playwright suite](../tests/site.spec.ts), [Pages deployment](https://github.com/jlsp124/hewberry-website-concept/actions/runs/45541424685).

## Visual review

The production build was checked at 320, 390, 768, 844, 1024, 1440, 1920 and 2560 px. The 844 px test used a 390 px high landscape viewport. A short-landscape layout brings the full introduction above the fold. Mobile WebKit emulation at 320, 390 and 430 px portrait and 844 px landscape caught a floating diagram layer competing with the reading surface. Smaller screens now show the example inside the monitoring chapter. Chromium portrait reflow at 200% text size passed at 320 and 390 px. [Dusk-to-night design](creative-direction.md#dusk-to-night-concept).

## Functionality and accessibility

- The home story uses one photograph throughout. Native scrolling changes the lighting, and a fine pointer changes the photo’s perspective. Motion preferences preserve the written explanation and instantly complete the optional example.
- The keyboard can follow both header links, play and replay the example, and complete the quote. The contact link and page copy also work with JavaScript disabled.
- The installation table and Ajax examples fit mobile widths. The full set of fourteen older parts listings remains available in a disclosure.
- The quote test records network requests, checks that no request occurs during the simulated submission and checks browser storage afterward.
- Axe scans cover the primary routes, the mobile opening and quote states. These are automated checks with browser emulation.

## Lighthouse lab results

Lighthouse 13.6 measured the locally served dusk-to-night build before the final visibility adjustment to the ambient signal. Timing and scores reflect the simulated lab profiles.

| Page and profile | Performance | Accessibility | Best practices | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home, mobile | 99 | 100 | 100 | 2.1 s | 0.002 | 10 ms |
| Home, desktop | 100 | 100 | 100 | 0.2 s | 0.001 | 0 ms |

The SEO score of 66 reflects the intentional `noindex` marker for the concept. These measurements provide lab evidence. Field Core Web Vitals require real visitor traffic.
