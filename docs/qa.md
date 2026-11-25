# Verification

The site is built as static Astro output and served under the GitHub Pages repository subpath. The redesigned edition passed eight Chromium scenarios against both a local production build and the deployed site. [Playwright suite](../tests/site.spec.ts) and [successful Pages build and deployment](https://github.com/jlsp124/hewberry-website-concept/actions/runs/45535823739).

## Visual review

The initial responsive review examined the 390, 768, 1024, 1440 and 1920 px homepage renders, plus the individual service, monitoring, regional imagery, support and quote sections. The second pass moved the mobile photograph toward the lit rooms, eased headline spacing, strengthened the overlay, improved the regional headline wrap and surfaced the quote choices higher on mobile. A built-output check caught the CSS optimizer collapsing scroll animation into an unsupported shorthand. The final build emits separate rules and the browser test confirms image movement in response to normal scrolling.

Q-Industrial offered a useful benchmark for a single clear focal subject, while Enpal and Custom Alarm informed how soon a visitor can choose an action on mobile. Hewberry’s strongest visual moment is the high-contrast dusk composition. Below it, the service index and monitoring diagram do most of the explanatory work. ERA and Igloo show how much more production depth is possible with bespoke 3D art. Here, a dedicated architectural shoot would create more distinctive, brand-specific proof than increasing the complexity of the opening animation. See [design research](research.md#design-research).

The redesign prompted by DBYDT, BCG and Eleos was re-captured at all five widths. A cap on the headline scale keeps the wide composition on one line at 1920 px. At 390 px the large type, two actions and main photograph fit in the first screen. The 1140 px desktop opening was inspected as an additional windowed layout. The sticky desktop chapters were inspected individually on the deployed site. The mobile and reduced-motion views retain every illustrated chapter as ordinary page content. The home, equipment guide, quote and support routes also reflowed at 320 px. [Revised creative direction](creative-direction.md#typography-and-composition-revision).

## Functionality and accessibility

- Routes, document headings, noindex metadata, all internal links and their fragments.
- Mobile navigation, keyboard activation and dismissal, service disclosure, service-specific quote preselection and customer support.
- Quote validation, keyboard selection, review, back navigation, reset and confirmation. Test listeners check for network requests during the quote journey, and the test checks browser storage afterward.
- Reduced motion, blocked images and a no-JavaScript contact fallback. A separate default-motion test exercises the native scroll animation and monitoring diagram.
- All five desktop scroll states, the stable mobile chapters, the call at the end of the walk-through and the complete set of 14 product links.
- Five full-page screenshot widths, first-screen visibility of the main action and horizontal reflow.
- Axe checks cover all primary routes, the open mobile menu, mobile quote priorities and review. Automated scans are narrower than an accessibility conformance audit. Physical devices and assistive-technology pairings need separate validation.

## Lighthouse lab results

Lighthouse 13.6 measured the revised, locally served production build. Timing and scores reflect the simulated lab profiles.

| Page and profile | Performance | Accessibility | Best practices | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home, mobile | 97 | 100 | 100 | 2.4 s | 0.006 | 80 ms |
| Home, desktop | 100 | 100 | 100 | 0.6 s | 0.019 | 0 ms |
| Quote, mobile | 100 | 100 | 100 | 0.8 s | 0.002 | 0 ms |

The SEO score of 66 reflects the intentional `noindex` marker for the concept. These measurements provide lab evidence. Field Core Web Vitals require real visitor traffic.
