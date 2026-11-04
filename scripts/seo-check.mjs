/**
 * Local SEO build audit. Run after `npm run build`.
 * Checks crawler files, metadata, structured data and prerendered content.
 */
import { readFile, access } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const site = 'https://funkydirtmusic.com'
const failures = []
const warnings = []

const pass = (message) => console.log(`  PASS  ${message}`)
const fail = (message) => {
  failures.push(message)
  console.log(`  FAIL  ${message}`)
}
const warn = (message) => {
  warnings.push(message)
  console.log(`  WARN  ${message}`)
}

async function read(relative) {
  return readFile(path.join(dist, relative), 'utf8')
}

async function exists(relative) {
  try {
    await access(path.join(dist, relative))
    return true
  } catch {
    return false
  }
}

function typeSet(value, set = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => typeSet(item, set))
    return set
  }
  if (value && typeof value === 'object') {
    if (value['@type']) {
      const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']]
      types.forEach((type) => set.add(type))
    }
    Object.values(value).forEach((item) => typeSet(item, set))
  }
  return set
}

console.log('\nFunky Dirt — local SEO audit\n')

if (!(await exists('index.html'))) {
  fail('dist/index.html is missing. Run npm run build first.')
  process.exit(1)
}

const requiredFiles = [
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'site.webmanifest',
  'feed.json',
  '404.html',
  'CNAME',
  '.nojekyll',
  '.well-known/security.txt',
  'og-image.png',
  'icon-192.png',
  'icon-512.png',
  'maskable-512.png',
  'apple-touch-icon.png',
]

for (const file of requiredFiles) {
  if (await exists(file)) pass(`public/${file}`)
  else fail(`Missing public/${file}`)
}

const html = await read('index.html')

const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? ''
if (title.length >= 20 && title.length <= 65) pass(`Title length (${title.length})`)
else fail(`Title should be 20–65 characters (currently ${title.length})`)

const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? ''
if (description.length >= 70 && description.length <= 165) pass(`Description length (${description.length})`)
else fail(`Description should be 70–165 characters (currently ${description.length})`)

if (html.includes('<html lang="en">')) pass('HTML lang is en')
else fail('HTML lang is missing or not "en"')

if (html.includes(`<link rel="canonical" href="${site}/" />`)) pass('Canonical URL')
else fail(`Canonical URL should be ${site}/`)

const robotsMeta = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/)?.[1] ?? ''
if (robotsMeta.includes('index') && robotsMeta.includes('max-image-preview:large')) pass('Robots meta allows rich previews')
else fail('Robots meta is missing index / max-image-preview:large')

for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
  const pattern = new RegExp(`property="${tag}"`)
  if (pattern.test(html)) pass(`Open Graph ${tag}`)
  else fail(`Missing Open Graph ${tag}`)
}

if (html.includes('name="twitter:card"') && html.includes('summary_large_image')) pass('Twitter large-image card')
else fail('Missing Twitter summary_large_image card')

if (html.includes('rel="alternate" type="application/feed+json"')) pass('JSON feed discovery link')
else warn('Missing JSON feed discovery link')

if (html.includes('rel="manifest"')) pass('Web manifest link')
else fail('Missing web manifest link')

const h1Count = (html.match(/<h1\b/g) ?? []).length
if (h1Count === 1) pass('Exactly one H1')
else fail(`Expected exactly one H1, found ${h1Count}`)

const rootMatch = html.match(/<div id="root">([\s\S]*)<\/div>\s*<noscript>/)
const rootHtml = rootMatch?.[1] ?? ''
if (rootHtml.length > 2000) pass(`Prerendered content (${rootHtml.length.toLocaleString()} characters)`)
else fail('Prerendered #root content is missing or too short')

if (/class="hero-title"/.test(rootHtml) && /id="faq"/.test(rootHtml)) pass('Prerendered semantic sections')
else fail('Prerendered HTML does not contain the expected page sections')

const ldBlocks = [
  ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
].map((match) => match[1])

const types = new Set()
let structuredValid = true
for (const block of ldBlocks) {
  try {
    typeSet(JSON.parse(block), types)
  } catch (error) {
    structuredValid = false
    fail(`Invalid JSON-LD: ${error.message}`)
  }
}

if (structuredValid && ldBlocks.length > 0) pass(`JSON-LD parses (${ldBlocks.length} block)`)
else if (ldBlocks.length === 0) fail('No JSON-LD found')

for (const requiredType of ['WebSite', 'MusicGroup', 'WebPage', 'FAQPage', 'ItemList', 'ImageObject', 'Person', 'MusicRecording']) {
  if (types.has(requiredType)) pass(`Schema.org ${requiredType}`)
  else fail(`Missing Schema.org ${requiredType}`)
}

const robots = await read('robots.txt')
if (robots.includes(`Sitemap: ${site}/sitemap.xml`)) pass('robots.txt declares sitemap')
else fail('robots.txt is missing the sitemap line')

for (const bot of ['OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot', 'Google-Extended', 'Applebot']) {
  if (robots.includes(`User-agent: ${bot}`)) pass(`robots.txt welcomes ${bot}`)
  else fail(`robots.txt does not mention ${bot}`)
}

const sitemap = await read('sitemap.xml')
if (sitemap.includes(`<loc>${site}/</loc>`)) pass('sitemap.xml contains canonical URL')
else fail('sitemap.xml is missing the canonical URL')
if (sitemap.includes('<lastmod>')) pass('sitemap.xml has lastmod')
else warn('sitemap.xml has no lastmod')
if (sitemap.includes('image:image')) pass('sitemap.xml includes image entries')
else warn('sitemap.xml has no image entries')

const llms = await read('llms.txt')
if (llms.startsWith('# Funky Dirt') && llms.includes(site)) pass('llms.txt identifies the entity and canonical URL')
else fail('llms.txt is missing its H1 or canonical URL')

const llmsFull = await read('llms-full.txt')
if (llmsFull.length > 4000 && llmsFull.includes('Booking and live performances')) pass('llms-full.txt contains the full reference')
else warn('llms-full.txt looks incomplete')

const manifest = JSON.parse(await read('site.webmanifest'))
if (manifest.name && manifest.icons?.length >= 3) pass('Web manifest has name and icons')
else fail('Web manifest is incomplete')

const feed = JSON.parse(await read('feed.json'))
if (feed.version && feed.items?.length > 0) pass('JSON feed is valid')
else fail('JSON feed is invalid')

const cname = (await read('CNAME')).trim()
if (cname === 'funkydirtmusic.com') pass('CNAME points to funkydirtmusic.com')
else fail(`CNAME should be funkydirtmusic.com (found "${cname}")`)

// Verify prerendered asset references exist on disk.
const assetRefs = [...rootHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)]
  .map((match) => match[1].replace(/^\//, ''))
for (const asset of new Set(assetRefs)) {
  if (await exists(asset)) pass(`Prerendered asset ${asset}`)
  else fail(`Prerendered asset ${asset} is missing from dist/`)
}

console.log(`\nResult: ${failures.length} failure(s), ${warnings.length} warning(s).\n`)
if (failures.length > 0) process.exitCode = 1
