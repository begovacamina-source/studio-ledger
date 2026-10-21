// Builds docs/case-study.pdf from docs/case-study.md: npm run case-study:pdf
// The Markdown is rendered with marked, styled with the app's fonts (Inter Tight for
// headings, Inter for text), and printed to an A4 PDF by Chromium through Playwright.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'
import { Marked } from 'marked'

const root = path.resolve(import.meta.dirname, '..')
const docs = path.join(root, 'docs')
const source = path.join(docs, 'case-study.md')
const output = path.join(docs, 'case-study.pdf')
const REPO = 'https://github.com/begovacamina-source/studio-ledger'
const fonts = path.join(root, 'node_modules/@fontsource')
const font = (file) => pathToFileURL(path.join(fonts, file)).href
const LATIN_EXT = 'U+0100-024F, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF'
const face = (family, pkg, weight, style, subset) =>
  `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: ${style}; src: url('${font(`${pkg}/files/${pkg}-${subset}-${weight}-${style}.woff2`)}') format('woff2');${subset === 'latin-ext' ? ` unicode-range: ${LATIN_EXT};` : ''} }`
const faces = [
  ...[400, 500, 600].flatMap((w) => ['latin', 'latin-ext'].map((sub) => face('Inter', 'inter', w, 'normal', sub))),
  face('Inter', 'inter', 400, 'italic', 'latin'),
  face('Inter', 'inter', 600, 'italic', 'latin'),
  face('Inter Tight', 'inter-tight', 600, 'normal', 'latin'),
  face('Inter Tight', 'inter-tight', 600, 'normal', 'latin-ext'),
].join('\n  ')

// GitHub-style heading ids, so the case study's own #links work inside the PDF.
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .trim()
    .replace(/ /g, '-')

const marked = new Marked({
  // Line breaks inside a paragraph are kept, so the Role, Live demo, Code and Stack lines stay apart.
  breaks: true,
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens)
      return `<h${depth} id="${slug(html)}">${html}</h${depth}>\n`
    },
    // A table whose cells are screenshots is laid out as a gallery, not a data table.
    table(token) {
      const html = marked.Renderer.prototype.table.call(this, token)
      const images = token.rows.flat().filter((cell) => cell.tokens.some((t) => t.type === 'image')).length
      return images ? html.replace('<table>', '<table class="screens">') : html
    },
    // Relative links (to files in the repository) point to GitHub, not to this computer.
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens)
      const url = /^(#|[a-z]+:)/i.test(href) ? href : `${REPO}/blob/main/docs/${href}`
      return `<a href="${url}"${title ? ` title="${title}"` : ''}>${text}</a>`
    },
    // A blockquote that starts with ✍️ is a placeholder still to fill in.
    blockquote({ tokens }) {
      const html = this.parser.parse(tokens)
      return `<blockquote${html.includes('✍️') ? ' class="todo"' : ''}>${html}</blockquote>\n`
    },
  },
})

const markdown = readFileSync(source, 'utf8')
const title = markdown.match(/^# (.+)$/m)?.[1] ?? 'Case study'
const body = marked.parse(markdown)

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<base href="${pathToFileURL(docs).href}/">
<style>
  /* Static font files: Chromium embeds variable fonts as Type 3 glyphs, which breaks
     copying and searching the PDF's text. These are the same typefaces as the app's. */
${faces}

  /* The app's colours, from src/index.css. */
  :root { --text: #171717; --muted: #5f5f5f; --border: #e5e5e5; --tint: #f7f7f7; --blue: #2971c6; }
  @page { size: A4; margin: 18mm 16mm 20mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font: 400 9.5pt/1.55 'Inter', sans-serif; color: var(--text); margin: 0; }
  h1, h2, h3, h4 { font-family: 'Inter Tight', sans-serif; font-weight: 600; letter-spacing: -0.01em; line-height: 1.2; break-after: avoid; }
  h1 { font-size: 24pt; margin: 0 0 6mm; }
  h2 { font-size: 15pt; margin: 9mm 0 3mm; padding-top: 3mm; border-top: 1px solid var(--border); }
  h3 { font-size: 11.5pt; margin: 6mm 0 2mm; }
  p, ul, ol { margin: 0 0 2.6mm; }
  ul, ol { padding-left: 5mm; }
  li { margin-bottom: 0.8mm; }
  a { color: var(--blue); text-decoration: none; }
  strong { font-weight: 600; }
  code { font: 500 8.5pt/1 ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--tint); border-radius: 3px; padding: 0.3mm 1mm; }
  hr { display: none; }
  img { max-width: 100%; border: 1px solid var(--border); border-radius: 6px; display: block; margin: 3mm 0 4mm; break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 8.5pt; }
  th, td { text-align: left; vertical-align: top; padding: 1.6mm 2mm; border-bottom: 1px solid var(--border); }
  th { font-weight: 600; color: var(--muted); }
  tr { break-inside: avoid; }
  /* Tables with an empty header row are key/value lists. */
  thead:has(th:empty) { display: none; }
  table.screens th { color: var(--text); font-family: 'Inter Tight', sans-serif; font-size: 10pt; }
  table.screens td { border: none; padding: 1mm 2mm 4mm; vertical-align: top; }
  table.screens td:first-child { width: 68%; }
  table.screens img { margin: 0; max-height: 120mm; width: auto; max-width: 100%; }
  /* A phone screenshot on its own stays phone-sized. */
  p > img[src*="-phone"] { max-width: 62mm; }
  blockquote { margin: 3mm 0 4mm; padding: 3mm 4mm; border-left: 3px solid var(--border); background: var(--tint); border-radius: 0 6px 6px 0; break-inside: avoid; }
  blockquote p:last-child, blockquote ul:last-child, blockquote table:last-child { margin-bottom: 0; }
  blockquote.todo { border-left-color: #c58a1b; background: #fdf7ea; }
  /* Section 9, the gallery of release screens, starts on a new page. */
  h2[id='9-release-screens'] { break-before: page; border-top: none; padding-top: 0; margin-top: 0; }
</style>
</head>
<body>
${body}
</body>
</html>`

const htmlPath = path.join(docs, '.case-study.print.html')
writeFileSync(htmlPath, html)
const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage()
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({
    path: output,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font:8px -apple-system,'Helvetica Neue',Arial,sans-serif;color:#8a8a8a;padding:0 16mm;display:flex;justify-content:space-between"><span>${title}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    tagged: true,
    outline: true,
  })
} finally {
  await browser.close()
  const { rmSync } = await import('node:fs')
  rmSync(htmlPath, { force: true })
}
console.log(`Wrote ${path.relative(root, output)}`)
