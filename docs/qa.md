# Verification

The site is built as static Astro output and served under the GitHub Pages repository subpath. The repeatable checks live in [the Playwright suite](../tests/site.spec.ts).

## Visual review

The initial responsive review examined the 390, 768, 1024, 1440 and 1920 px homepage renders, plus the individual service, monitoring, regional imagery, support and quote sections. The second pass moved the mobile photograph toward the lit rooms, eased headline spacing, strengthened the overlay, improved the regional headline wrap and surfaced the quote choices higher on mobile. A built-output check caught the CSS optimizer collapsing scroll animation into an unsupported shorthand. The final build emits separate rules and the browser test confirms image movement in response to normal scrolling.

Q-Industrial offered a useful benchmark for a single clear focal subject, while Enpal and Custom Alarm informed how soon a visitor can choose an action on mobile. Hewberry’s strongest visual moment is the high-contrast dusk composition. Below it, the service index and monitoring diagram do most of the explanatory work. ERA and Igloo show how much more production depth is possible with bespoke 3D art. Here, a dedicated architectural shoot would create more distinctive, brand-specific proof than increasing the complexity of the opening animation. See [design research](research.md#design-research).

## Functionality and accessibility

- Routes, document headings, noindex metadata, all internal links and their fragments.
- Mobile navigation, keyboard activation and dismissal, service disclosure, service-specific quote preselection and customer support.
- Quote validation, keyboard selection, review, back navigation, reset and confirmation. Test listeners check for network requests during the quote journey, and the test checks browser storage afterward.
- Reduced motion, blocked images and a no-JavaScript contact fallback. A separate default-motion test exercises the native scroll animation and monitoring diagram.
- Five full-page screenshot widths, first-screen visibility of the main action and horizontal reflow.
- Axe checks cover all primary routes, the open mobile menu, mobile quote priorities and review. Automated scans are narrower than an accessibility conformance audit. Physical devices and assistive-technology pairings need separate validation.
