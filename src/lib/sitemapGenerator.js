function splitUrlList(text) {
  return text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function validateUrl(raw) {
  if (/\s/.test(raw)) {
    return { valid: false, reason: 'Contains spaces' }
  }
  if (!/^https?:\/\//i.test(raw)) {
    return { valid: false, reason: 'Missing http:// or https:// protocol' }
  }
  try {
    // eslint-disable-next-line no-new
    new URL(raw)
    return { valid: true }
  } catch {
    return { valid: false, reason: 'Malformed URL' }
  }
}

export function parseUrlList(text) {
  const lines = splitUrlList(text)
  const valid = []
  const rejected = []

  for (const line of lines) {
    const result = validateUrl(line)
    if (result.valid) {
      valid.push(line)
    } else {
      rejected.push({ line, reason: result.reason })
    }
  }

  return { valid, rejected }
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildSitemapXml(urls, options = {}) {
  const { includeLastmod, lastmod, includeChangefreq, changefreq, includePriority, priority } = options

  const entries = urls.map((url) => {
    const parts = [`    <loc>${escapeXml(url)}</loc>`]
    if (includeLastmod && lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
    if (includeChangefreq && changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`)
    if (includePriority && priority) parts.push(`    <priority>${priority}</priority>`)
    return `  <url>\n${parts.join('\n')}\n  </url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}
