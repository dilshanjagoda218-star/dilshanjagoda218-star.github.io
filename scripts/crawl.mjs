/**
 * Production SEO + AI-search crawler.
 *
 * Crawls the live site (or a preview URL), validates metadata, structured data,
 * robots.txt, sitemap.xml and llms.txt, and writes seo-report.json.
 *
 * Usage:
 *   npm run seo:crawl
 *   SITE_URL=http://localhost:4173 npm run seo:crawl
 */
import { writeFile } from 'node:fs/promises'

const CANONICAL = 'https://funkydirtmusic.com'
const BASE = (process.env.SITE_URL || CANONICAL).replace(/\/$/, '')
const TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS || 20000)
const failures = []
const warnings = []

const report = {
  base: BASE,
  generatedAt: new Date().toISOString(),
  resources: {},
  pages: [],
  checks: { failures, warnings },
}

function log(message) {
  console.log(message)
}

function fail(message) {
  failures.push(message)
  log(`  FAIL  ${message}`)
}

function warn(message) {
  warnings.push(message)
  log(`  WARN  ${message}`)
}

function pass(message) {
  log(`  PASS  ${message}`)
}

function resolveUrl(value) {
  if (/^https?:\/\//.test(value)) {
    return BASE === CANONICAL ? value : value.replace(CANONICAL, BASE)
  }
  return `${BASE}${value}`
}

async function fetchText(pathname) {
  const url = resolveUrl(pathname)
  const started = Date.now()
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'FunkyDirtSEOCrawler/1.0 (+https://funkydirtmusic.com/)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const body = await response.text()
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get('content-type') || '',
      xRobotsTag: response.headers.get('x-robots-tag') || '',
      ms: Date.now() - started,
      body,
    }
  } catch (error) {
    return { url, status: 0, error: error.message, ms: Date.now() - started, body: '' }
  }
}

function firstMatch(value, pattern) {
  return value.match(pattern)?.[1]?.trim() ?? ''
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function collectTypes(value, set = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTypes(item, set))
    return set
  }
  if (value && typeof value === 'object') {
    const type = value['@type']
    if (type) {
      ;(Array.isArray(type) ? type : [type]).forEach((item) => set.add(item))
    }
    Object.values(value).forEach((item) => collectTypes(item, set))
  }
  return set
}

async function checkResource(pathname, label, validate) {
  const result = await fetchText(pathname)
  report.resources[pathname] = {
    status: result.status,
    contentType: result.contentType,
    finalUrl: result.finalUrl,
    ms: result.ms,
    bytes: result.body.length,
  }
  if (result.status !== 200) {
    fail(`${label} returned HTTP ${result.status || 'error'}${result.error ? ` (${result.error})` : ''}`)
    return result
  }
  pass(`${label} (${result.ms} ms, ${result.body.length.toLocaleString()} bytes)`)
  validate?.(result)
  return result
}

console.log(`\nFunky Dirt — production crawl: ${BASE}\n`)

await checkResource('/robots.txt', 'robots.txt', (result) => {
  if (!result.body.includes(`${CANONICAL}/sitemap.xml`) && !result.body.includes(`${BASE}/sitemap.xml`)) {
    fail('robots.txt does not point to the sitemap')
  } else {
    pass('robots.txt points to the sitemap')
  }

  const bots = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Claude-SearchBot',
    'Googlebot',
    'Bingbot',
    'Applebot',
  ]
  for (const bot of bots) {
    if (result.body.includes(`User-agent: ${bot}`) || result.body.includes('User-agent: *')) {
      pass(`robots.txt allows ${bot}`)
    } else {
      warn(`robots.txt does not explicitly mention ${bot}`)
    }
  }
})

const sitemapResult = await checkResource('/sitemap.xml', 'sitemap.xml', (result) => {
  const urls = [...result.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  report.sitemapUrls = urls
  if (urls.length === 0) fail('sitemap.xml contains no URLs')
  else pass(`sitemap.xml contains ${urls.length} URL(s)`)
  if (!urls.includes(`${CANONICAL}/`)) fail(`sitemap.xml does not include ${CANONICAL}/`)
})

await checkResource('/llms.txt', 'llms.txt', (result) => {
  if (!result.body.startsWith('# Funky Dirt')) fail('llms.txt does not start with the entity name')
  else pass('llms.txt identifies the entity')
  if (!result.body.includes(CANONICAL)) warn('llms.txt does not reference the canonical URL')
})

await checkResource('/llms-full.txt', 'llms-full.txt', (result) => {
  if (result.body.length < 4000) warn('llms-full.txt looks short')
  else pass('llms-full.txt has the full reference')
})

await checkResource('/site.webmanifest', 'site.webmanifest')
await checkResource('/feed.json', 'feed.json')
await checkResource('/og-image.png', 'Open Graph image')

const urls = sitemapResult.body
  ? [...sitemapResult.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  : [`${BASE}/`]

for (const url of urls) {
  const pathname = url.startsWith(BASE) ? url.slice(BASE.length) || '/' : url
  const result = await fetchText(pathname)
  const html = result.body
  const page = {
    url,
    status: result.status,
    ms: result.ms,
    title: firstMatch(html, /<title>([\s\S]*?)<\/title>/),
    description: firstMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/),
    canonical: firstMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"/),
    robots: firstMatch(html, /<meta\s+name="robots"\s+content="([^"]*)"/),
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((match) => stripTags(match[1])),
    wordCount: stripTags(html).split(/\s+/).filter(Boolean).length,
    headings: {
      h1: (html.match(/<h1\b/g) ?? []).length,
      h2: (html.match(/<h2\b/g) ?? []).length,
      h3: (html.match(/<h3\b/g) ?? []).length,
    },
    jsonLdTypes: [],
    imagesMissingAlt: [...html.matchAll(/<img\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => !/\balt=/.test(tag)).length,
    openGraph: /property="og:title"/.test(html),
    twitterCard: /name="twitter:card"/.test(html),
    hreflang: [...html.matchAll(/hreflang="([^"]+)"/g)].map((match) => match[1]),
  }

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const types = new Set()
  for (const block of ldBlocks) {
    try {
      collectTypes(JSON.parse(block[1]), types)
    } catch {
      fail(`${url} contains invalid JSON-LD`)
    }
  }
  page.jsonLdTypes = [...types]

  report.pages.push(page)

  console.log(`\nPage: ${url}`)
  if (result.status !== 200) {
    fail(`${url} returned HTTP ${result.status}`)
    continue
  }
  pass(`HTTP 200 in ${result.ms} ms`)

  if (page.title.length >= 20 && page.title.length <= 65) pass(`Title (${page.title.length} chars)`)
  else warn(`Title length is ${page.title.length} chars`)

  if (page.description.length >= 70 && page.description.length <= 165) pass(`Description (${page.description.length} chars)`)
  else warn(`Description length is ${page.description.length} chars`)

  if (page.canonical === url || page.canonical === `${url}/`) pass('Canonical matches URL')
  else fail(`Canonical is "${page.canonical}", expected "${url}"`)

  if (page.headings.h1 === 1) pass('One H1')
  else fail(`Found ${page.headings.h1} H1 elements`)

  if (page.wordCount > 700) pass(`Crawlable text (${page.wordCount.toLocaleString()} words)`)
  else warn(`Only ${page.wordCount} words of crawlable text`)

  if (page.imagesMissingAlt === 0) pass('All images have alt text')
  else warn(`${page.imagesMissingAlt} image(s) are missing alt text`)

  if (page.openGraph) pass('Open Graph tags present')
  else fail('Open Graph tags missing')

  if (page.twitterCard) pass('Twitter card present')
  else warn('Twitter card missing')

  for (const requiredType of ['MusicGroup', 'WebSite', 'WebPage', 'FAQPage', 'ItemList']) {
    if (page.jsonLdTypes.includes(requiredType)) pass(`Schema.org ${requiredType}`)
    else fail(`Schema.org ${requiredType} missing`)
  }

  if (result.xRobotsTag) warn(`X-Robots-Tag header: ${result.xRobotsTag}`)
}

await writeFile('seo-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8')

console.log(`\nReport written to seo-report.json`)
console.log(`Result: ${failures.length} failure(s), ${warnings.length} warning(s).\n`)
if (failures.length > 0) process.exitCode = 1
