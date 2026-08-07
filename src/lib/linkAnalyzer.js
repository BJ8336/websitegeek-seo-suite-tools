// Generic anchor text that tells a reader (and a search engine) nothing
// about the destination — matched case-insensitively after trimming.
export const GENERIC_ANCHORS = new Set([
  'click here',
  'here',
  'this link',
  'this page',
  'link',
  'more',
  'read more',
  'learn more',
  'see more',
  'more info',
  'more information',
  'continue reading',
  'website',
  'this website',
  'go',
])

export function extractLinksFromHtml(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const anchors = [...doc.querySelectorAll('a')]
    return anchors.map((el) => ({
      href: el.getAttribute('href') || '',
      text: el.textContent.trim(),
    }))
  } catch {
    return []
  }
}

function normalizeDomain(hostname) {
  return hostname.replace(/^www\./i, '').toLowerCase()
}

function classifyHref(href, ownDomain) {
  const trimmed = href.trim()
  if (!trimmed) return 'invalid'
  if (/^(mailto|tel|javascript):/i.test(trimmed)) return 'other'
  if (trimmed.startsWith('#')) return 'other'

  try {
    // Relative URLs (e.g. "/about") need a base to resolve against — any
    // valid base works since we only care about hostname when one exists.
    const resolved = new URL(trimmed, 'https://placeholder.internal')
    const isRelative = resolved.origin === 'https://placeholder.internal'
    if (isRelative) return 'internal'
    if (!ownDomain) return 'unknown'
    return normalizeDomain(resolved.hostname) === normalizeDomain(ownDomain) ? 'internal' : 'external'
  } catch {
    return 'invalid'
  }
}

export function analyzeLinks(links, ownDomain) {
  const results = links.map((link) => ({
    ...link,
    type: classifyHref(link.href, ownDomain),
    isGeneric: link.text.length > 0 && GENERIC_ANCHORS.has(link.text.trim().toLowerCase()),
    isEmptyAnchor: link.text.trim().length === 0,
  }))

  const summary = {
    total: results.length,
    internal: results.filter((r) => r.type === 'internal').length,
    external: results.filter((r) => r.type === 'external').length,
    other: results.filter((r) => r.type === 'other').length,
    invalid: results.filter((r) => r.type === 'invalid').length,
    unknown: results.filter((r) => r.type === 'unknown').length,
    genericAnchors: results.filter((r) => r.isGeneric).length,
    emptyAnchors: results.filter((r) => r.isEmptyAnchor).length,
  }

  return { results, summary }
}
