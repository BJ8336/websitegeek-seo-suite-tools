export function extractDomain(url) {
  if (!url || !url.trim()) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
    return new URL(withProtocol).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function extractPath(url) {
  if (!url || !url.trim()) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
    const { pathname } = new URL(withProtocol)
    return pathname === '/' ? '' : pathname
  } catch {
    return ''
  }
}
