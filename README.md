# Hewberry Alarms website concept

Public redesign preview for a Vernon security installer. A photographed porch at dusk leads into an interactive 3D doorway and a three-part alarm story. The Ajax equipment guide has product imagery and four filterable categories. The closing view of Vernon offers a direct call or guided demo quote. The equipment page also includes Hewberry’s published parts listings.

[Open the live concept](https://jlsp124.github.io/hewberry-website-concept/)

## Run locally

Use Node 24.11.1 or a newer Node 24 release.

```sh
npm ci
npm run dev
```

Visit `http://localhost:4321/hewberry-website-concept/`. To verify the deployable build, run the type check, build and browser suite.

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

Tests can use an existing Chrome install through `HEWBERRY_BROWSER=chrome`. Set `HEWBERRY_TEST_URL` to a full base URL with a trailing slash to test a running preview or deployment. Playwright writes full-page captures to `test-results/`.

## Site map

| Route | Purpose |
| --- | --- |
| `/`, `/#system`, `/#services`, `/#contact` | Photographed opening, 3D alarm story, Ajax equipment and installation guide, and contact |
| `/residential/`, `/commercial/`, `/construction/` | Project-specific guides and prefilled quote routes |
| `/monitoring/`, `/technology/#ajax-equipment`, `/technology/#parts-catalogue` | Monitoring process, Ajax examples and the published parts listings |
| `/about/`, `/about/#service-area` | Local business and coverage |
| `/support/`, `/support/#faqs` | Office contact, monitoring-account guidance and FAQs |
| `/quote/` | Property, priorities, review and simulated confirmation |
| `/photo-credits/` | Plain-text photographer and licence credits for the illustrative images |

## Deployment

GitHub Pages serves the static `dist/` build at the repository subpath. The workflow checks Astro types, builds, then publishes with scoped Pages permissions. The demo is publicly reachable and marked `noindex` so it can be shared directly while avoiding competition with Hewberry's official website in search. The optional `CONCEPT_ORIGIN` and `CONCEPT_BASE` environment variables support other hosts.

The quote preview holds the visitor’s choices on the current page. Before an official launch, confirm the equipment, approved images and quote routing with Hewberry. Review redirects and indexing when moving to the production domain.

- [Company and design research](docs/research.md)
- [Creative directions](docs/creative-direction.md)
- [Asset inventory](docs/assets.md)
- [Verification](docs/qa.md)
