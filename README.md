# Hewberry Alarms website concept

Public redesign preview for a Vernon security installer. A filmed home exterior and a sourced Vernon statistic introduce a full-viewport alarm story. The Systems page presents installation services and a filterable Ajax photo gallery. The Contact page offers direct office details and a short demo form.

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
| `/`, `/#system` | Filmed opening, local statistic and three-scene alarm story |
| `/systems/`, `/systems/#equipment` | Installation services and Ajax equipment gallery |
| `/residential/`, `/commercial/`, `/construction/` | Project-specific guides and prefilled contact links |
| `/monitoring/`, `/technology/#ajax-equipment`, `/technology/#parts-catalogue` | Monitoring process, link to the Ajax gallery and published parts listings |
| `/about/`, `/about/#service-area` | Local business and coverage |
| `/support/`, `/support/#faqs` | Office contact, monitoring-account guidance and FAQs |
| `/contact/`, `/quote/` | Direct office details and the same short demo form through either route |
| `/photo-credits/` | Plain-text credits for the illustrative footage and images |

## Deployment

GitHub Pages serves the static `dist/` build at the repository subpath. The workflow checks Astro types, builds, then publishes with scoped Pages permissions. The demo is publicly reachable and marked `noindex` so it can be shared directly while avoiding competition with Hewberry's official website in search. The optional `CONCEPT_ORIGIN` and `CONCEPT_BASE` environment variables support other hosts.

The contact preview keeps form values on the current page. Before an official launch, confirm equipment, approved media and message routing with Hewberry. Review redirects and indexing when moving to the production domain.

- [Company and design research](docs/research.md)
- [Creative directions](docs/creative-direction.md)
- [Asset inventory](docs/assets.md)
- [Verification](docs/qa.md)
