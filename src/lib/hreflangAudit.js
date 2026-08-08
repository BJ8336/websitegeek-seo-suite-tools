// Validates <link rel="alternate" hreflang="..."> tags parsed from pasted
// HTML. hreflang also legally appears in HTTP headers and XML sitemaps, but
// for a paste-HTML tool, <head> link tags are the relevant, expected scope.

// Common real-world hreflang values: an ISO 639-1 language (2-3 letters),
// optionally a region/script subtag, or the special "x-default". This isn't
// a full BCP47 validator (e.g. it won't catch every script-subtag edge
// case), but it covers the vast majority of real hreflang usage.
const VALID_CODE = /^(x-default|[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?(-[a-zA-Z]{2})?)$/

export function extractHreflangTags(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const links = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]'))
  return links.map((link) => ({
    hreflang: (link.getAttribute('hreflang') || '').trim(),
    href: (link.getAttribute('href') || '').trim(),
  }))
}

function isValidHref(href) {
  if (!href) return false
  try {
    // Accept absolute URLs and root-relative paths; reject empty/garbage.
    if (href.startsWith('/')) return true
    // eslint-disable-next-line no-new
    new URL(href)
    return true
  } catch {
    return false
  }
}

export function auditHreflang(html, { pageUrl } = {}) {
  const tags = extractHreflangTags(html)

  const rows = tags.map((tag, index) => {
    const codeValid = VALID_CODE.test(tag.hreflang)
    const hrefValid = isValidHref(tag.href)
    return {
      index,
      hreflang: tag.hreflang,
      href: tag.href,
      codeValid,
      hrefValid,
      valid: codeValid && hrefValid,
    }
  })

  const codes = rows.map((r) => r.hreflang.toLowerCase()).filter(Boolean)
  const duplicates = [...new Set(codes.filter((code, i) => codes.indexOf(code) !== i))]

  const hasXDefault = codes.includes('x-default')

  let selfReferencing = null
  if (pageUrl && pageUrl.trim()) {
    const normalizedPage = pageUrl.trim().replace(/\/$/, '')
    selfReferencing = rows.some((r) => r.href.trim().replace(/\/$/, '') === normalizedPage)
  }

  const checklist = [
    {
      id: 'has-tags',
      label: 'Hreflang tags present',
      status: rows.length > 0 ? 'pass' : 'fail',
      detail: rows.length > 0 ? `Found ${rows.length} hreflang tag${rows.length === 1 ? '' : 's'}.` : 'No <link rel="alternate" hreflang="..."> tags found in the pasted HTML.',
    },
    {
      id: 'valid-format',
      label: 'Language/region codes are valid',
      status: rows.length === 0 ? 'skip' : rows.every((r) => r.codeValid) ? 'pass' : 'fail',
      detail: rows.every((r) => r.codeValid) ? 'All hreflang codes look well-formed.' : 'Some hreflang codes don’t match expected language[-region] format.',
    },
    {
      id: 'valid-href',
      label: 'href values are valid URLs',
      status: rows.length === 0 ? 'skip' : rows.every((r) => r.hrefValid) ? 'pass' : 'fail',
      detail: rows.every((r) => r.hrefValid) ? 'All href values look like valid URLs.' : 'Some href values are missing or malformed.',
    },
    {
      id: 'no-duplicates',
      label: 'No duplicate language codes',
      status: rows.length === 0 ? 'skip' : duplicates.length === 0 ? 'pass' : 'fail',
      detail: duplicates.length === 0 ? 'Each language code appears once.' : `Duplicate codes found: ${duplicates.join(', ')}.`,
    },
    {
      id: 'x-default',
      label: 'x-default fallback present',
      status: rows.length === 0 ? 'skip' : hasXDefault ? 'pass' : 'fail',
      detail: hasXDefault ? 'x-default is set for unmatched languages.' : 'Recommended: add an x-default tag for visitors whose language doesn’t match any listed variant.',
    },
    {
      id: 'self-reference',
      label: 'Page references itself',
      status: !pageUrl || !pageUrl.trim() ? 'skip' : selfReferencing ? 'pass' : 'fail',
      detail: !pageUrl || !pageUrl.trim()
        ? 'Enter this page’s own URL above to check self-referencing.'
        : selfReferencing
          ? 'This page includes a hreflang tag pointing back to itself, as recommended.'
          : 'Google recommends each page include a self-referencing hreflang tag pointing to its own URL.',
    },
  ]

  return { rows, checklist, hasXDefault, duplicates, selfReferencing }
}
