// Static metadata for every planned tool. Route stubs in App.jsx and the
// homepage tool grid are both generated from this list — add a tool here
// once, it shows up everywhere.

export const TOOL_CATEGORIES = {
  AI_CONTENT: 'AI & Content Tools',
  CONTENT: 'Content',
  KEYWORD_RESEARCH: 'Keyword Research',
  RANKINGS: 'Rankings & Competitors',
  ON_PAGE: 'On-Page SEO',
  TECHNICAL: 'Technical SEO',
  LINKS: 'Links',
}

export const CATEGORY_ORDER = [
  TOOL_CATEGORIES.AI_CONTENT,
  TOOL_CATEGORIES.CONTENT,
  TOOL_CATEGORIES.KEYWORD_RESEARCH,
  TOOL_CATEGORIES.RANKINGS,
  TOOL_CATEGORIES.ON_PAGE,
  TOOL_CATEGORIES.TECHNICAL,
  TOOL_CATEGORIES.LINKS,
]

export const tools = [
  {
    slug: 'ai-content-detector',
    name: 'AI Content Detector',
    description: 'Heuristic AI-writing likelihood score based on sentence patterns, stock phrases, and vocabulary diversity.',
    category: TOOL_CATEGORIES.AI_CONTENT,
    proOnly: true,
  },
  {
    slug: 'seo-content-score',
    name: 'SEO Content Score',
    description: 'One consolidated score for keyword placement, headings, readability, length, and links.',
    category: TOOL_CATEGORIES.AI_CONTENT,
    proOnly: true,
  },
  {
    slug: 'character-counter',
    name: 'Character Counter',
    description: 'Live character counts, with and without spaces, as you type.',
    category: TOOL_CATEGORIES.CONTENT,
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Live word counts as you type.',
    category: TOOL_CATEGORIES.CONTENT,
  },
  {
    slug: 'line-counter',
    name: 'Line Counter',
    description: 'Live line counts, including how many lines have actual content.',
    category: TOOL_CATEGORIES.CONTENT,
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between lowercase, UPPERCASE, Sentence case, and Title Case.',
    category: TOOL_CATEGORIES.CONTENT,
  },
  {
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: 'Estimate keyword and phrase density from pasted content, with a stuffing threshold.',
    category: TOOL_CATEGORIES.KEYWORD_RESEARCH,
    hasProFeatures: true,
  },
  {
    slug: 'lsi-term-extractor',
    name: 'LSI Term Extractor',
    description: 'Suggest related terms based on co-occurrence with your primary keyword.',
    category: TOOL_CATEGORIES.KEYWORD_RESEARCH,
  },
  {
    slug: 'organic-ranking-checker',
    name: 'Organic Ranking Checker',
    description: 'Connect Google Search Console to see which keywords your site ranks for and at what position.',
    category: TOOL_CATEGORIES.RANKINGS,
    hasProFeatures: true,
  },
  {
    slug: 'competitor-page-auditor',
    name: 'Competitor Page Auditor',
    description: "Fetch any public page and run a full on-page SEO audit — meta tags, headings, content score, links.",
    category: TOOL_CATEGORIES.RANKINGS,
    proOnly: true,
  },
  {
    slug: 'meta-snippet-optimizer',
    name: 'Meta & Snippet Optimizer',
    description: 'Preview title and description length against an approximate Google SERP snippet.',
    category: TOOL_CATEGORIES.ON_PAGE,
  },
  {
    slug: 'heading-structure-auditor',
    name: 'Heading Structure Auditor',
    description: 'Paste HTML to check H1-H6 structure for missing or skipped heading levels.',
    category: TOOL_CATEGORIES.ON_PAGE,
  },
  {
    slug: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    description: 'Build JSON-LD structured data for common schema types.',
    category: TOOL_CATEGORIES.ON_PAGE,
    hasProFeatures: true,
  },
  {
    slug: 'open-graph-previewer',
    name: 'Open Graph / Twitter Card Previewer',
    description: 'Preview how a page will look when shared on Facebook, X, and LinkedIn.',
    category: TOOL_CATEGORIES.ON_PAGE,
  },
  {
    slug: 'robots-txt-generator',
    name: 'Robots.txt & Meta Robots Generator',
    description: 'Allow or block specific bots (Googlebot, GPTBot, AhrefsBot, and more) with live preview, plus a matching meta robots tag.',
    category: TOOL_CATEGORIES.TECHNICAL,
    hasProFeatures: true,
  },
  {
    slug: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    description: 'Turn a list of URLs into a validated XML sitemap.',
    category: TOOL_CATEGORIES.TECHNICAL,
    hasProFeatures: true,
  },
  {
    slug: 'redirect-htaccess-builder',
    name: 'Redirect & .htaccess Rule Builder',
    description: 'Generate 301/302 redirect rules in both Apache and Nginx syntax.',
    category: TOOL_CATEGORIES.TECHNICAL,
    hasProFeatures: true,
  },
  {
    slug: 'core-web-vitals-estimator',
    name: 'Core Web Vitals & Resource Size Estimator',
    description: 'Estimate page weight and structure issues from pasted HTML.',
    category: TOOL_CATEGORIES.TECHNICAL,
  },
  {
    slug: 'internal-link-analyzer',
    name: 'Internal Link & Anchor Text Matrix Analyzer',
    description: 'Paste HTML to classify internal vs. external links and flag generic anchor text.',
    category: TOOL_CATEGORIES.LINKS,
    hasProFeatures: true,
  },
  {
    slug: 'broken-link-checker',
    name: 'Broken Link & Anchor Health Checker',
    description: 'Format-validate a list of links for malformed URLs and bad patterns.',
    category: TOOL_CATEGORIES.LINKS,
    hasProFeatures: true,
  },
]

export function getToolBySlug(slug) {
  return tools.find((tool) => tool.slug === slug)
}

export function getToolsByCategory(category) {
  return tools.filter((tool) => tool.category === category)
}
