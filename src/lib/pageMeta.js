// Pulls the handful of on-page SEO signals worth surfacing at a glance from
// a fetched page's raw HTML — same DOMParser-based approach as
// headingAudit.js/linkAnalyzer.js (pure string-in, tree-out, no live DOM).
export function extractPageMeta(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return {
      title: doc.querySelector('title')?.textContent.trim() || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '',
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      h1: doc.querySelector('h1')?.textContent.trim() || '',
    }
  } catch {
    return { title: '', description: '', canonical: '', h1: '' }
  }
}
