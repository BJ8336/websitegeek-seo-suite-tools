function splitPaths(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// Named, commonly-blocked/allowed crawlers, grouped for the Bot Access
// Control UI. '*' ("All Bots") is the robots.txt wildcard group.
export const BOT_CATEGORIES = [
  {
    label: 'Search Engines',
    bots: [
      { id: '*', name: 'All Bots' },
      { id: 'Googlebot', name: 'Googlebot' },
      { id: 'Bingbot', name: 'Bingbot' },
      { id: 'YandexBot', name: 'YandexBot' },
      { id: 'DuckDuckBot', name: 'DuckDuckBot' },
    ],
  },
  {
    label: 'AI Crawlers',
    proOnly: true,
    bots: [
      { id: 'GPTBot', name: 'GPTBot' },
      { id: 'ClaudeBot', name: 'ClaudeBot' },
      { id: 'Google-Extended', name: 'Google-Extended' },
      { id: 'PerplexityBot', name: 'PerplexityBot' },
    ],
  },
  {
    label: 'SEO Tools',
    proOnly: true,
    bots: [
      { id: 'AhrefsBot', name: 'AhrefsBot' },
      { id: 'SemrushBot', name: 'SemrushBot' },
      { id: 'MJ12bot', name: 'MJ12bot' },
    ],
  },
  {
    label: 'Social Bots',
    proOnly: true,
    bots: [
      { id: 'Facebot', name: 'Facebot' },
      { id: 'Twitterbot', name: 'Twitterbot' },
    ],
  },
]

const FREE_CATEGORY_LABELS = BOT_CATEGORIES.filter((c) => !c.proOnly).map((c) => c.label)
const PRO_ONLY_CATEGORY_LABELS = BOT_CATEGORIES.filter((c) => c.proOnly).map((c) => c.label)

export function defaultBotAccess() {
  const access = {}
  for (const category of BOT_CATEGORIES) {
    for (const bot of category.bots) {
      access[bot.id] = 'allow'
    }
  }
  return access
}

// A bot only reads the rules from the group that names it exactly — it
// falls back to "User-agent: *" solely when no group names it at all. So
// once "All Bots" is set to Block, any individually-Allowed bot needs its
// own explicit "Allow: /" group, or it would inherit the wildcard block.
//
// `categoryLabels` restricts which categories' bots get a line emitted —
// used to split output into a free-tier preview and a Pro-only preview —
// but `allBlocked` is always read from the full botAccess so the cascade
// logic stays correct regardless of which subset is being rendered.
function buildBotAccessGroups(botAccess, categoryLabels = null) {
  if (!botAccess) return []
  const allBlocked = botAccess['*'] === 'block'
  const lines = []
  const categories = categoryLabels
    ? BOT_CATEGORIES.filter((c) => categoryLabels.includes(c.label))
    : BOT_CATEGORIES

  for (const category of categories) {
    for (const bot of category.bots) {
      if (bot.id === '*') continue
      const setting = botAccess[bot.id]
      if (setting === 'block') {
        lines.push(`User-agent: ${bot.id}`, 'Disallow: /', '')
      } else if (allBlocked) {
        lines.push(`User-agent: ${bot.id}`, 'Allow: /', '')
      }
    }
  }

  const includesWildcard = !categoryLabels || categoryLabels.includes('Search Engines')
  if (allBlocked && includesWildcard) {
    lines.push('User-agent: *', 'Disallow: /', '')
  }

  return lines
}

export function buildRobotsTxt({ groups, sitemapUrl, botAccess, botCategoryLabels } = {}) {
  const lines = []

  for (const group of groups || []) {
    const agent = group.userAgent?.trim() || '*'
    const allowPaths = splitPaths(group.allow)
    const disallowPaths = splitPaths(group.disallow)
    if (allowPaths.length === 0 && disallowPaths.length === 0) continue

    lines.push(`User-agent: ${agent}`)
    for (const path of allowPaths) lines.push(`Allow: ${path}`)
    for (const path of disallowPaths) lines.push(`Disallow: ${path}`)
    lines.push('')
  }

  lines.push(...buildBotAccessGroups(botAccess, botCategoryLabels))

  if (sitemapUrl?.trim()) {
    lines.push(`Sitemap: ${sitemapUrl.trim()}`)
  }

  const text = lines.join('\n').trim()
  return text ? `${text}\n` : ''
}

// Splits a full robots.txt build into what a free user can copy (custom
// path rules + Search Engines bot rules + sitemap) and what's Pro-only
// (AI Crawlers/SEO Tools/Social Bots rules) — both computed from the same
// real botAccess state, never faked.
export function buildRobotsTxtTiers({ groups, sitemapUrl, botAccess }) {
  const free = buildRobotsTxt({ groups, sitemapUrl, botAccess, botCategoryLabels: FREE_CATEGORY_LABELS })
  const proOnlyExtra = buildRobotsTxt({ groups: [], sitemapUrl: '', botAccess, botCategoryLabels: PRO_ONLY_CATEGORY_LABELS })
  const full = buildRobotsTxt({ groups, sitemapUrl, botAccess })
  return { free, proOnlyExtra, full }
}

export function buildMetaRobotsTag({ index, follow, noarchive, nosnippet, noimageindex, notranslate }) {
  const directives = [index ? 'index' : 'noindex', follow ? 'follow' : 'nofollow']
  if (noarchive) directives.push('noarchive')
  if (nosnippet) directives.push('nosnippet')
  if (noimageindex) directives.push('noimageindex')
  if (notranslate) directives.push('notranslate')
  return `<meta name="robots" content="${directives.join(', ')}" />`
}
