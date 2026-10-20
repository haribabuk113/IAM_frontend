# UI corrections — 20 October 2026

Source: [UI/UX corrections](https://docs.google.com/document/d/164iP92inEs9WmqGUqbYvtDB6HRtrdkwXYznT5czXLFE/edit). Reviewed the full 17-page PDF export, including its annotated screenshots.

## Implemented in the UI

| Area | Changes |
| --- | --- |
| Header | Thinner sticky navigation, installation control, application allowance and credit balance for signed-in users or an enabled membership preview. |
| Sign-in / signup | All 11 existing SSO providers visible. Removed password forms and their page actions. Updated recovery guidance. |
| Landing | Separate designation/company wording, predictive multi-select designation and location controls, platform figures immediately after the search section, removed the intervening company strip. |
| Search | Country/state/city prediction, multiple selections, worldwide remote first, minimum annual salary and currency, compact checkbox filters. Worldwide roles remain eligible for every selected geography while still respecting other criteria. |
| Cards | Smaller grid/list cards, whole-card link with separate interactive controls, employment type and experience beneath the title, extra locations, expandable skills, converted salary with the original below it. |
| Matching | Skill overlap percentage, green existing/red missing skills with text indicators, confirmation before adding a skill. Minimum-match thresholds and highest-match sorting. |
| Membership | Day/month pricing, custom durations, credits, top-up preview, expiry, unlimited preview applications and gold profile border. Settings determine which filters require premium. URL filters pass through the same entitlement check. |
| Admin | Membership prices, credit value, daily allowance and premium filter controls under Membership & filters. |
| Profile | Edit action at top, mini weekly analytics, icon-only social links and custom icons, contact/resume controls respecting privacy, copy controls, compact skill groups and all-skills dialog. |
| Background | Education, languages and work authorization in the sidebar. Employer-verified badge only on verified experience. Animated career path with focus/hover details, gap markers, reduced-motion support and links to experience entries. |
| Preferences | Minimum expected annual salary and hourly gig rate, display currency and public visibility rules. |
| Profile jobs | In-page jobs tab using the same Job_card component. A shared poster-ID filter returns active jobs; public visitors do not see drafts, closed or direct-link-only listings. Owner management link retained. |
| Activity | Separate weekly profile and posting analytics, free/premium totals, application conversion and 70%+ match totals. Public view exposes aggregates, not applicant identities. |
| Applications | Phone, email and résumé metadata included in the local application snapshot regardless of public visibility, with explicit application consent. Preview allowance enforced. |
| PWA | Manifest, app icons, install guidance and offline fallback. Only versioned application assets are cached; account responses and profile HTML are not cached. |

## Decisions and integration limits

- The document says both “six months” and “90 days” for posting analytics. The selector supports 90 and 180 days; 90 is the default.
- Match scores are explicitly a preview of skill overlap, not a backend recommendation model.
- Prices (20/day, 400/30 days), 500 sample credits and five free daily applications are demo settings, not approved commercial rates. The preview resets allowance at midnight UTC; confirm the production timezone.
- Membership, admin settings, job posting and application interactions still use local preview state. Billing, gateway checkout, server-side entitlement enforcement and authoritative balances are not available in this repository. Direct payment is visibly unavailable; no real payment is simulated as a success.
- Uploaded résumés are held for the browser session. Copy résumé shares a public **preview route**, not an uploaded file. Public visibility must be enabled first. Cross-device file sharing, private recruiter access and actual delivery require file storage and application APIs.
- Profile analytics and posting analytics remain labelled illustrative data. The poster query uses the stable demo user ID `preview-alex`; production should pass the authenticated/visited user's ID to the existing jobs API.
- Provider buttons use the existing IAM SSO routes. Provider availability and successful external sign-in depend on IAM configuration. No provider credentials were used during verification.
- Installation support varies by browser. A website cannot force every external link into an installed app. The manifest requests `navigate-existing` where supported; OS/browser link handling remains user-controlled. See [MDN launch_handler](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/launch_handler).
- Repository hosting is configured for Vercel, and the source document links the Vercel site. A separate Netlify URL was requested from the user but has not been supplied.

## Verification

- Portal diagnostics: zero errors and zero warnings.
- Portal tests: 29 passing, including currency, worldwide geography, match thresholds, premium URL gating, pricing, expiry, allowance reset and poster visibility.
- Browser checks: predictive search, selected designation/location URL, skill confirmation and score refresh, preview credit purchase, premium match filter, card-body navigation, public privacy, profile jobs and 90/180-day analytics.
- Mobile checks include 390px sign-in, search and profile views; SSO choices fit a normal 844px-high viewport and these pages have no horizontal document overflow.

Production deployment verification is recorded in the delivery message after the push.
