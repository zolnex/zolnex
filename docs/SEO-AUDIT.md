# RankPulse launch SEO audit

**Scope:** static client application and its public landing page. This is a code-and-content audit, not a live crawl or keyword-volume report. Completed 18 September 2026.

## Executive finding

The inherited site described an unrelated HTML5 game portal, so it had no topical relevance for an SEO analytics product. Its public HTML had a single game-focused description, no canonical URL, no robots or sitemap files, and no structured data. Dashboard views also existed only as client-side routes, which is fine for product use but means the root landing page must carry the search intent and conversion content.

The RankPulse implementation addresses the launch-critical gaps: a focused title and description, canonical and social metadata, `WebApplication` and visible FAQ schema, a clear homepage hierarchy, `robots.txt`, and a sitemap. The page makes one transparent promise: it is an **SEO opportunity workspace using local projections**, not a real crawler or source of verified rankings.

## High-intent keyword map

There is no trustworthy search-volume source bundled with this static repository, so these are **intent-led targets**, not claimed volume winners. They were selected for close product fit and can be validated in Search Console and a keyword tool after launch.

| Priority | Primary target | Supporting terms | Recommended page / placement | Intent |
| --- | --- | --- | --- | --- |
| P1 | SEO analytics dashboard | SEO dashboard, SEO reporting dashboard | Homepage title, H1 context, product copy | Commercial investigation |
| P1 | keyword research dashboard | keyword ranking tracker, keyword position analysis | Keyword feature card and dashboard UI | Commercial investigation |
| P1 | SEO audit tool | technical SEO audit, website SEO audit checklist | Audit feature card and FAQ | Commercial investigation |
| P1 | competitor analysis tool | SEO competitor analysis, competitor keyword gap | Competitors feature card and product copy | Commercial investigation |
| P2 | backlink analysis | backlink profile, referring domains | Backlink feature and UI | Commercial investigation |
| P2 | organic traffic estimator | organic traffic analysis, website traffic estimate | Overview copy with the qualifier “projection” | Informational / commercial |
| P2 | AI SEO assistant | Gemini SEO assistant, AI SEO brief | Gemini feature copy and FAQ | Emerging commercial |

### On-page mapping now applied

- **Title:** `RankPulse | SEO Analytics Dashboard & Keyword Research`
- **Meta description:** references keyword demand, technical audit priorities, backlink profiles, and competitive context.
- **H1:** “Know what moves your organic growth.” The supporting copy establishes the SEO context naturally.
- **H2s:** cover keyword research, SEO audit, competitor analysis, backlinks, and Gemini-powered AI support without keyword stuffing.
- **FAQ:** answers four decision-stage questions, and its visible content exactly matches the FAQ structured data.

## Technical checklist

| Item | Status | Notes |
| --- | --- | --- |
| Descriptive title and unique meta description | Complete | Replaced inherited game metadata. |
| Canonical URL | Complete | Set to `https://zolnex.github.io/`; update if the production hostname changes. |
| Open Graph and Twitter basics | Complete | Title, description, type, locale, URL, and a 1200×630 social card are provided. |
| Structured data | Complete | `WebApplication` plus an accurate, visible `FAQPage`. |
| Semantic content hierarchy | Complete | One H1, topical H2s, feature sections, and FAQ on the public landing route. |
| Robots and sitemap | Complete | Static root files include the indexable landing page only. |
| Core Web Vitals hygiene | Complete | No hero image, no third-party tracker, responsive layout, and visual charts render only after app code loads. Measure on the deployed URL. |
| Accessible basics | Complete | Labeled form controls, semantic buttons, keyboard-operable table controls, theme labels, and visible focus states. |
| Public route crawlability | Deliberate limitation | The app uses hash routes for GitHub Pages portability. Keep dashboard routes out of the sitemap; create static marketing pages if later targeting feature-specific queries. |

## Final launch recommendations

1. **Validate the canonical host** before shipping. Replace `https://zolnex.github.io/` in `index.html`, `robots.txt`, and `sitemap.xml` if RankPulse receives its own custom domain.
2. **Keep the share image truthful.** A 1200×630 social card, `og:image`, `twitter:image`, and descriptive alt metadata are included. Refresh it only when product positioning or the canonical hostname changes; do not use a misleading performance screenshot.
3. **Submit the sitemap** in Google Search Console once the production property is verified. Monitor branded impressions, “SEO analytics dashboard,” “keyword research dashboard,” and “SEO audit tool” query families for 4–8 weeks.
4. **Turn internal product routes into static marketing pages** (for example `/keyword-research/`, `/site-audit/`, `/competitor-analysis/`) only when there is unique, substantive content for each. Do not index a thin client dashboard or query variations.
5. **Preserve the projection disclosure.** The product should not imply live rankings, a crawl, Google data, backlink index coverage, or verified search volume where none exists.

## Measurement plan

Connect Search Console and a privacy-respecting analytics tool after deployment. Track: branded clicks, landing-page conversion to first domain analysis, search impressions by target cluster, FAQ engagement, and Gemini brief completion rate. Review content and metadata quarterly based on real query data—not guessed volume.
