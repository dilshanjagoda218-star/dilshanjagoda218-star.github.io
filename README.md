# Funky Dirt — official site

Single-page React + Vite site for **Funky Dirt**, the Sri Lankan funk, pop and rap trio from Colombo.

Live site: **https://funkydirtmusic.com/**

## Run locally

```bash
npm install
npm run dev
```

Production build and preview:

```bash
npm run build
npm run preview
```

`npm run build` does two things:

1. Builds the client bundle with Vite.
2. Prerenders the full React page into `dist/index.html` with `scripts/prerender.mjs`.

The browser hydrates the prerendered HTML, so search engines and AI crawlers get real content without waiting for JavaScript.

## Deploy

```bash
npm run deploy
```

`gh-pages` publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain (`funkydirtmusic.com`) attached. `.nojekyll` prevents Jekyll from dropping files.

## SEO and AI-search architecture

| File / feature | Purpose |
| --- | --- |
| `index.html` | Title, description, canonical, robots directives, Open Graph, Twitter card, geo/entity signals, hreflang, manifest, JSON-LD |
| Prerendered `#root` | Full HTML for crawlers that do not run JavaScript |
| JSON-LD `@graph` | `MusicGroup`, `WebSite`, `WebPage`, `ImageObject`, `ItemList` of `MusicRecording`, `FAQPage`, `Person` members |
| `public/robots.txt` | Explicitly welcomes Google, Bing and AI answer engines (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Google-Extended, Applebot and more) |
| `public/sitemap.xml` | Canonical URL, `lastmod`, image sitemap entries |
| `public/llms.txt` | Short, citable fact sheet for AI assistants (llmstxt.org format) |
| `public/llms-full.txt` | Full reference: members, discography, booking, FAQs, official channels |
| `public/feed.json` | JSON Feed 1.1 of releases and booking info |
| `public/site.webmanifest` | PWA metadata and install icons |
| `public/og-image.png` | 1200×630 social/AI preview card |
| `public/404.html` | Branded, `noindex` not-found page |
| `public/.well-known/security.txt` | Security contact |
| `scripts/crawl.mjs` | Production crawler: validates live metadata, schema, robots, sitemap, `llms.txt`; writes `seo-report.json` |
| `scripts/seo-check.mjs` | Local build audit: required files, metadata lengths, JSON-LD types, prerender output, asset integrity |
| `scripts/generate-social-images.ps1` | Regenerates the OG card and install icons from `public/logo.png` |

### Verify before deploying

```bash
npm run seo
```

Or run the pieces separately:

```bash
npm run build
npm run seo:check
```

### Crawl the live site

```bash
npm run seo:crawl
```

Crawl a preview instead of production:

```bash
SITE_URL=http://localhost:4173 npm run seo:crawl
```

The crawler checks:

- HTTP status and response time
- title and description length
- canonical URL
- one `<h1>` and crawlable word count
- missing image `alt` text
- Open Graph and Twitter tags
- JSON-LD types
- robots.txt and sitemap.xml
- `llms.txt` and `llms-full.txt`
- AI crawler access

### Regenerate social images

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-social-images.ps1
```

## Post-deploy checklist

1. Add the site to [Google Search Console](https://search.google.com/search-console) and verify the domain.
2. Submit `https://funkydirtmusic.com/sitemap.xml` in Google Search Console.
3. Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters) and submit the sitemap (Bing also powers some AI answers).
4. Test the structured data with the [Rich Results Test](https://search.google.com/test/rich-results).
5. Validate social cards with the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
6. Run `npm run seo:crawl` after deployment and keep the report clean.
7. Optionally submit `llms.txt` to AI directories and keep the file current.

## When content changes

Keep these in sync:

- `src/App.jsx` — visible members, songs, FAQs and booking copy
- `index.html` — JSON-LD, meta description, FAQ schema
- `public/llms.txt` and `public/llms-full.txt` — AI fact sheets
- `public/sitemap.xml` — `lastmod`
- `public/feed.json` — releases and updates
- `index.html` WebPage `dateModified` and the “Last updated” lines in the `llms` files

For a new release, add it to the `tracks` array in `src/App.jsx`, the `ItemList` in `index.html`, and the discography sections in both `llms` files.
