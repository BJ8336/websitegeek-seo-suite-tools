// DNS-over-HTTPS (DoH) JSON API client — genuinely free, no key required.
// Only resolvers confirmed to support the browser-friendly JSON GET format
// with CORS are listed here; several other public DoH services only expose
// the binary wire-format API (RFC 8484), which isn't fetchable directly
// from a browser without a lot of extra encoding work, so they're
// deliberately left out rather than shipping a row that would silently
// fail for every user.
export const DOH_RESOLVERS = [
  { id: 'google', name: 'Google', endpoint: 'https://dns.google/resolve' },
  { id: 'cloudflare', name: 'Cloudflare', endpoint: 'https://cloudflare-dns.com/dns-query' },
]

export const DEFAULT_RESOLVER = DOH_RESOLVERS[0]

export const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']

// RFC 1035 DNS type numbers — DoH JSON responses give the answer's type as
// a number, not the mnemonic.
const TYPE_NAMES = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
}

// Google's DoH status codes match standard DNS RCODEs.
export const DNS_STATUS = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  5: 'REFUSED',
}

// Accepts a bare domain, a full URL, or something with stray whitespace and
// returns just the hostname — same forgiving-input pattern used elsewhere
// in the suite (e.g. Responsive Website Tester's normalizeUrl).
export function extractHostname(input) {
  const trimmed = (input || '').trim()
  if (!trimmed) return ''
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProtocol).hostname
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').split('/')[0]
  }
}

// TXT record data comes back from DoH JSON wrapped in literal quotes
// (sometimes split into multiple quoted chunks for long values) — strip
// that so the displayed value matches what you'd type into a DNS panel.
function cleanTxtValue(data) {
  return data
    .split('" "')
    .join('')
    .replace(/^"|"$/g, '')
}

export async function queryDnsRecord(resolver, hostname, type) {
  const url = new URL(resolver.endpoint)
  url.searchParams.set('name', hostname)
  url.searchParams.set('type', type)

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/dns-json' },
  })
  if (!res.ok) {
    return { resolver: resolver.id, type, status: null, answers: [], error: `http_${res.status}` }
  }

  const data = await res.json()
  const answers = (data.Answer || [])
    .filter((entry) => TYPE_NAMES[entry.type] === type)
    .map((entry) => ({
      ttl: entry.TTL,
      data: type === 'TXT' ? cleanTxtValue(entry.data) : entry.data,
    }))

  return {
    resolver: resolver.id,
    type,
    status: DNS_STATUS[data.Status] || `CODE_${data.Status}`,
    answers,
    error: null,
  }
}

export async function queryAllTypes(resolver, hostname, types = RECORD_TYPES) {
  const results = await Promise.all(
    types.map((type) =>
      queryDnsRecord(resolver, hostname, type).catch((err) => ({
        resolver: resolver.id,
        type,
        status: null,
        answers: [],
        error: err.message || 'network_error',
      })),
    ),
  )
  return results
}
