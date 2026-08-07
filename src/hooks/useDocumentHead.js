import { useEffect } from 'react'

const DEFAULT_TITLE = 'WebsiteGeek SEO Suite — Free SEO Tools'
const DEFAULT_DESCRIPTION =
  'Free, client-side SEO tools for keyword density, meta tags, schema markup, sitemaps, and more — nothing you paste ever leaves your browser.'

/**
 * Sets document.title and the <meta name="description"> tag for the
 * currently mounted page, restoring the previous values on unmount.
 *
 * IMPORTANT LIMITATION: this only updates the live DOM after React mounts —
 * a search crawler that doesn't execute JavaScript (or fetches this SPA's
 * index.html directly) sees the same default title/description for every
 * route. True per-page <title>/meta tags for crawlers require either
 * pre-rendering, static-site generation, or a prerender service configured
 * at deploy time — none of which this static client-side build has. This is
 * a known gap, not an oversight; see PROGRESS notes for Phase 5.
 */
export function useDocumentHead({ title, description } = {}) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title || DEFAULT_TITLE

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== null) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [title, description])
}
