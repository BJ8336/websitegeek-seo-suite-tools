const MARKDOWN_HEADING_PATTERN = /^(#{1,6})\s+(.*)$/
const HTML_HEADING_HINT = /<h[1-6][\s>]/i

/**
 * DOMParser is technically a "DOM" API by name, but unlike the rest of what
 * Phase 0 wants kept out of /lib, it doesn't touch the live page — it's a
 * pure string-in, tree-out transform (same input always produces the same
 * result), and it's what the phase spec explicitly requires over regex for
 * reliability against malformed HTML.
 */
export function detectInputFormat(text) {
  if (HTML_HEADING_HINT.test(text)) return 'html'
  if (new RegExp(MARKDOWN_HEADING_PATTERN.source, 'm').test(text)) return 'markdown'
  return 'html'
}

export function parseHtmlHeadings(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const headingEls = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    return headingEls.map((el) => ({
      level: Number(el.tagName.slice(1)),
      text: el.textContent.trim(),
    }))
  } catch {
    return []
  }
}

export function parseMarkdownHeadings(text) {
  const lines = text.split(/\r\n|\r|\n/)
  const headings = []
  for (const line of lines) {
    const match = line.match(MARKDOWN_HEADING_PATTERN)
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() })
    }
  }
  return headings
}

export function parseHeadings(text) {
  const format = detectInputFormat(text)
  const headings = format === 'markdown' ? parseMarkdownHeadings(text) : parseHtmlHeadings(text)
  return { headings, format }
}

function truncateLabel(text, max = 40) {
  if (!text) return '(empty heading)'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function auditHeadings(headings) {
  const h1Count = headings.filter((h) => h.level === 1).length
  const issues = []

  if (headings.length > 0) {
    if (h1Count === 0) {
      issues.push({ type: 'missing-h1', message: 'No H1 found — every page should have exactly one.' })
    } else if (h1Count > 1) {
      issues.push({
        type: 'multiple-h1',
        message: `Found ${h1Count} H1 tags — pages should have exactly one.`,
      })
    }
  }

  for (let i = 1; i < headings.length; i += 1) {
    const prev = headings[i - 1]
    const curr = headings[i]
    if (curr.level - prev.level > 1) {
      issues.push({
        type: 'skipped-level',
        message: `Jumps from H${prev.level} ("${truncateLabel(prev.text)}") to H${curr.level} ("${truncateLabel(curr.text)}") — skips H${prev.level + 1}.`,
        index: i,
      })
    }
  }

  return { issues, h1Count }
}
