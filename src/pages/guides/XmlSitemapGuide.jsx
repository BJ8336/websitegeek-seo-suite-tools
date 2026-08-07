import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'Does an XML sitemap improve rankings?',
    answer:
      "No — a sitemap doesn't influence how a page ranks. It only helps crawlers discover and prioritize which URLs to fetch, which matters most for large or poorly-linked sites. A perfectly linked small site gets little benefit from one.",
  },
  {
    question: 'Do I need to update my sitemap every time I publish?',
    answer:
      "Ideally yes, or use a lastmod date so crawlers know what changed since their last visit. Most CMS platforms regenerate the sitemap automatically; for a hand-built sitemap, update it whenever you add or remove pages.",
  },
  {
    question: 'Should I include every URL on my site in the sitemap?',
    answer:
      'No — only include URLs you actually want indexed. Admin pages, duplicate parameter URLs, and pages you\'ve marked noindex shouldn\'t be in the sitemap; including them just wastes crawl budget and can send mixed signals.',
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function XmlSitemapGuide() {
  return (
    <GuideLayout
      title="XML Sitemaps: Do You Still Need One in 2026? | WebsiteGeek"
      description="What an XML sitemap actually does, when it matters most for crawling, and how to build one that helps rather than confuses search engines."
      schema={schema}
    >
      <h1>XML Sitemaps: Do You Still Need One in 2026?</h1>
      <p>
        An XML sitemap is a file listing the URLs on your site that you want search engines to crawl,
        along with optional metadata about how often each one changes and when it was last updated.
        It's been a standard part of SEO setup for two decades, and it's still worth having — just not
        for the reason most people think.
      </p>

      <h2>What a Sitemap Actually Does</h2>
      <p>
        A sitemap doesn't make Google index your pages faster or rank them higher. What it does is give
        crawlers a direct, explicit list of URLs to check, instead of relying entirely on discovering
        them by following links. For a site with good internal linking, a sitemap is a helpful backup.
        For a site with pages that are hard to reach through normal navigation — deep archive pages, a
        product catalog with thousands of SKUs — it can be the difference between a page getting crawled
        at all and sitting undiscovered indefinitely.
      </p>

      <h2>When a Sitemap Matters Most</h2>
      <p>Sitemaps earn their keep in a few specific situations:</p>
      <ul>
        <li>Large sites, where crawl budget is limited and prioritization actually matters</li>
        <li>New sites with few external links pointing in, since there's little for crawlers to follow yet</li>
        <li>Sites with pages that are deliberately hard to reach via navigation but should still be indexed</li>
        <li>Any site where you want to signal recently updated content via the lastmod field</li>
      </ul>
      <p>
        A small, well-linked site with a dozen pages gets comparatively little benefit — Google will
        find those pages through normal crawling regardless. It's still good practice to have one, just
        don't expect it to move the needle much in that scenario.
      </p>

      <h2>What Belongs in a Sitemap (and What Doesn't)</h2>
      <p>
        Only list canonical, indexable URLs — pages you actually want to show up in search results. Our{' '}
        <Link to="/tools/xml-sitemap-generator">XML Sitemap Generator</Link> validates each URL you
        submit before including it, rejecting anything missing a protocol or containing spaces, since
        malformed entries can cause an entire sitemap to be ignored rather than just the bad line.
        Leave out redirected URLs, pages blocked by{' '}
        <Link to="/guides/robots-txt-guide">robots.txt</Link>, and anything marked noindex — including
        them creates a contradiction that search engines have to resolve on their own, usually by
        trusting the sitemap less.
      </p>

      <h2>How to Build One</h2>
      <p>
        Paste your list of URLs, one per line, and set your preferred lastmod date, change frequency,
        and priority. Change frequency and priority are treated as hints rather than firm instructions —
        Google has said publicly it largely ignores priority values, so don't spend much time tuning
        them. The one field worth keeping accurate is lastmod, since it genuinely helps crawlers decide
        what to re-check first.
      </p>
      <p>
        Once your sitemap is built, reference its URL in your robots.txt file so crawlers can find it
        without extra configuration — that connection is one of the checks in our{' '}
        <Link to="/guides/complete-site-audit-checklist">complete site audit checklist</Link>.
      </p>

      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </GuideLayout>
  )
}

export default XmlSitemapGuide
