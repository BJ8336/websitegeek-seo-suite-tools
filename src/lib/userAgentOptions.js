// Keys must match api/_lib/userAgents.js in the companion backend — the
// frontend only ever sends a key, never a raw UA string.
export const USER_AGENT_OPTIONS = [
  { key: 'chrome-desktop', label: 'Chrome (Desktop)' },
  { key: 'chrome-mobile', label: 'Chrome (Mobile)' },
  { key: 'safari-desktop', label: 'Safari (macOS)' },
  { key: 'safari-iphone', label: 'Safari (iPhone)' },
  { key: 'googlebot-desktop', label: 'Googlebot (Desktop)' },
  { key: 'googlebot-smartphone', label: 'Googlebot (Smartphone)' },
  { key: 'bingbot', label: 'Bingbot' },
  { key: 'generic-bot', label: 'Generic bot / curl' },
]
