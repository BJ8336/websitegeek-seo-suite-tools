import { extractLinksFromHtml } from './linkAnalyzer'

const HTML_HINT = /<a[\s>]/i

function looksLikeHtml(text) {
  return HTML_HINT.test(text)
}

function splitPlainList(text) {
  return text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function hasPlausibleTld(hostname) {
  const parts = hostname.split('.')
  if (parts.length < 2) return false
  const tld = parts[parts.length - 1]
  return /^[a-zA-Z]{2,24}$/.test(tld)
}

export function validateLinkFormat(raw) {
  const trimmed = raw.trim()
  const issues = []

  if (/\s/.test(trimmed)) issues.push('Contains spaces')
  if (!/^https?:\/\//i.test(trimmed)) issues.push('Missing http:// or https:// protocol')

  if (issues.length === 0) {
    try {
      const url = new URL(trimmed)
      if (!hasPlausibleTld(url.hostname)) issues.push('Suspicious or missing TLD')
    } catch {
      issues.push('Malformed URL')
    }
  }

  return { url: raw, issues, isHealthy: issues.length === 0 }
}

export function extractCandidateLinks(text) {
  if (looksLikeHtml(text)) {
    return { mode: 'html', urls: extractLinksFromHtml(text).map((link) => link.href).filter(Boolean) }
  }
  return { mode: 'list', urls: splitPlainList(text) }
}

export function checkLinks(text) {
  const { mode, urls } = extractCandidateLinks(text)
  const results = urls.map((url) => validateLinkFormat(url))

  return {
    mode,
    results,
    total: results.length,
    healthy: results.filter((r) => r.isHealthy).length,
    flagged: results.filter((r) => !r.isHealthy).length,
  }
}
