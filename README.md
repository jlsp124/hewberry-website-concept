# Hewberry Alarms website concept

Independent, public redesign demonstration for a Vernon security installer. It preserves the published company mark and adds a photographed walkthrough of a security system, a 14-model equipment guide, dedicated service pages and customer support. The guided quote simulates a submission using non-identifying service choices held only on the current page.

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
| `/` and `/#system` | Overview, five illustrated system chapters and service chooser |
| `/residential/`, `/commercial/`, `/construction/` | Project-specific guides and prefilled quote routes |
| `/monitoring/`, `/technology/#parts-catalogue` | Monitoring process, equipment compatibility and guide to all published parts listings |
| `/about/`, `/about/#service-area` | Local business and coverage |
| `/support/`, `/support/#faqs` | Office contact, monitoring-account guidance and FAQs |
| `/quote/` | Property, priorities, review and simulated confirmation |
| `/photo-credits/` | Actual image sources, credits and licences |

## Deployment

GitHub Pages serves the static `dist/` build at the repository subpath. The workflow checks Astro types, builds, then publishes with scoped Pages permissions. The demo is publicly reachable and marked `noindex` so it can be shared directly while avoiding competition with Hewberry's official website in search. The optional `CONCEPT_ORIGIN` and `CONCEPT_BASE` environment variables support other hosts.

The quote preview has no form endpoint, contact fields, analytics or browser storage. Before any official launch, confirm the business facts and asset approvals in the research, agree on a quote and support workflow, and configure redirects and production indexing.

- [Company and design research](docs/research.md)
- [Creative directions](docs/creative-direction.md)
- [Asset inventory](docs/assets.md)
- [Verification](docs/qa.md)
