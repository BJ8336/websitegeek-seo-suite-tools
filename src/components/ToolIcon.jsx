// One small hand-drawn glyph per tool, kept in a single file so the whole
// icon set stays visually consistent (same stroke weight, same viewBox).
const PATHS = {
  'ai-content-detector': (
    <>
      <path d="M10 3l1.2 3.8L15 8l-3.8 1.2L10 13l-1.2-3.8L5 8l3.8-1.2L10 3z" />
      <path d="M15.5 13l.6 1.9L18 15.5l-1.9.6L15.5 18l-.6-1.9L13 15.5l1.9-.6L15.5 13z" />
    </>
  ),
  'seo-content-score': (
    <>
      <rect x="5" y="3" width="10" height="14" rx="1.5" />
      <path d="M8 3V2.3a.3.3 0 01.3-.3h3.4a.3.3 0 01.3.3V3" />
      <path d="M7.5 8.2l1.3 1.3L11.5 6" />
      <path d="M7 12.5h6M7 14.8h4" />
    </>
  ),
  'character-counter': <path d="M7 4h6M10 4v12M7 16h6" />,
  'word-counter': <path d="M4 6h12M4 10h9M4 14h6" />,
  'line-counter': <path d="M3 5h1M6 5h11M3 10h1M6 10h11M3 15h1M6 15h11" />,
  'case-converter': <path d="M4 7l3-3 3 3M7 4v9M16 13l-3 3-3-3M13 16V7" />,
  'keyword-density-checker': (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="14" cy="14" r="2" />
      <path d="M15 5L5 15" />
    </>
  ),
  'meta-snippet-optimizer': (
    <>
      <path d="M11 3l6 6-8 8-6-6V4a1 1 0 011-1h7z" />
      <circle cx="7.5" cy="7.5" r="1.1" />
    </>
  ),
  'heading-structure-auditor': <path d="M4 4v12M4 10h5M9 4v12M12 6h4M12 10h3M12 14h2" />,
  'schema-markup-generator': <path d="M7 5L3 10l4 5M13 5l4 5-4 5" />,
  'open-graph-previewer': (
    <>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <circle cx="7" cy="9" r="1.2" />
      <path d="M4 15l4-4 3 3 3-4 3 4" />
    </>
  ),
  'internal-link-analyzer': (
    <>
      <path d="M8.5 12.5a3 3 0 010-4.2l1.8-1.8a3 3 0 014.2 4.2l-.9.9" />
      <path d="M11.5 7.5a3 3 0 010 4.2l-1.8 1.8a3 3 0 01-4.2-4.2l.9-.9" />
    </>
  ),
  'robots-txt-generator': (
    <>
      <rect x="5" y="7" width="10" height="8" rx="2" />
      <path d="M10 7V4M8 4h4" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="12" cy="11" r="1" />
      <path d="M7 15v1M13 15v1" />
    </>
  ),
  'xml-sitemap-generator': (
    <>
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="4" cy="15.5" r="1.5" />
      <circle cx="10" cy="15.5" r="1.5" />
      <circle cx="16" cy="15.5" r="1.5" />
      <path d="M10 5.5v4M10 9.5H4v4.5M10 9.5h6v4.5" />
    </>
  ),
  'redirect-htaccess-builder': <path d="M4 12a6 6 0 016-6h6M13 3l3 3-3 3" />,
  'broken-link-checker': (
    <>
      <path d="M8 12l-2 2a2.5 2.5 0 01-3.5-3.5l2-2" />
      <path d="M12 8l2-2a2.5 2.5 0 013.5 3.5l-2 2" />
      <path d="M8.5 11.5l1-1M10.5 9.5l1-1" strokeDasharray="0.5 2.2" />
    </>
  ),
  'core-web-vitals-estimator': (
    <>
      <path d="M4 14a6 6 0 1112 0" />
      <path d="M10 14l3-4" />
      <circle cx="10" cy="14" r="1" />
    </>
  ),
  'responsive-website-tester': (
    <>
      <rect x="2.5" y="4" width="10" height="7" rx="1" />
      <path d="M5.5 13.5h4" />
      <rect x="14.5" y="7" width="4" height="7" rx="0.8" />
    </>
  ),
  'dns-lookup-checker': (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" />
    </>
  ),
  'lsi-term-extractor': (
    <>
      <circle cx="8.5" cy="8.5" r="4.5" />
      <path d="M15.5 15.5l-3.6-3.6" />
    </>
  ),
  'organic-ranking-checker': (
    <>
      <path d="M3 16h3v-4H3v4zM8.5 16h3V7h-3v9zM14 16h3V3h-3v13z" />
    </>
  ),
  'competitor-page-auditor': (
    <>
      <circle cx="7.5" cy="7.5" r="4.5" />
      <path d="M14.5 14.5L17.5 17.5" />
      <path d="M6 7.5l1 1 2-2" />
    </>
  ),
}

function ToolIcon({ slug, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[slug] || <circle cx="10" cy="10" r="6" />}
    </svg>
  )
}

export default ToolIcon
