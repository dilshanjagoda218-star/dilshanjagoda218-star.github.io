/**
 * Build-time prerender for crawlers that do not execute JavaScript.
 *
 * 1. The normal Vite client build writes dist/.
 * 2. This script builds App.jsx for SSR into dist-ssr/.
 * 3. The rendered markup is injected into dist/index.html inside #root.
 * 4. main.jsx hydrates that markup in the browser.
 */
import { build } from 'vite'
import { readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const clientDir = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')
const entry = path.join(root, 'src', 'entry-server.jsx')

console.log('Prerendering static HTML for crawlers...')

await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: entry,
    outDir: ssrDir,
    emptyOutDir: true,
    copyPublicDir: false,
    minify: false,
    rollupOptions: {
      output: { entryFileNames: 'entry-server.js' },
    },
  },
})

const serverModule = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
// React 19 emits eager-image preloads during SSR. They are useful in <head>,
// but must not be part of #root or hydration sees extra DOM nodes. The logo
// preload is declared manually in index.html instead.
const markup = serverModule
  .render()
  .replace(/<link\s+rel="preload"[^>]*\/?>/g, '')

const indexPath = path.join(clientDir, 'index.html')
const template = await readFile(indexPath, 'utf8')
const marker = '<div id="root"></div>'

if (!template.includes(marker)) {
  throw new Error(`Could not find ${marker} in dist/index.html`)
}

const output = template.replace(marker, `<div id="root">${markup}</div>`)
await writeFile(indexPath, output, 'utf8')
await rm(ssrDir, { recursive: true, force: true })

console.log(`Prerendered ${markup.length.toLocaleString()} characters into dist/index.html`)
