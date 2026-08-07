import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const schema = buildSchema(SCHEMA_TYPES.ARTICLE, {
  headline: 'The Complete Free SEO Site Audit Checklist',
  author: 'WebsiteGeek Team',
  datePublished: '2026-01-20',
  description:
    'A step-by-step technical and on-page SEO audit checklist you can run entirely with free, browser-based tools.',
  publisherName: 'WebsiteGeek',
})

function SiteAuditChecklistGuide() {
  return (
    <GuideLayout
      title="The Complete Free SEO Site Audit Checklist | WebsiteGeek"
      description="A step-by-step technical and on-page SEO audit checklist you can run entirely with free browser-based tools, in the order that actually matters."
      schema={schema}
    >
      <h1>The Complete Free SEO Site Audit Checklist</h1>
      <p>
        A full SEO audit sounds like it needs an expensive platform, but most of what actually matters
        can be checked manually, page by page, with a handful of focused tools. This checklist walks
        through the same sequence we'd use ourselves, roughly in the order problems tend to compound —
        fix the technical foundation first, then the on-page details, then content quality.
      </p>

      <h2>Before You Start</h2>
      <p>
        Pick 3-5 representative pages rather than trying to audit an entire site by hand: your homepage,
        your best-performing content page, and one or two pages you suspect are underperforming. Patterns
        that show up across all of them are worth fixing site-wide; issues on just one page are usually
        page-specific.
      </p>

      <h2>Technical Checks</h2>

      <h3>Robots.txt &amp; Sitemap</h3>
      <p>
        Confirm your robots.txt file isn't accidentally blocking the whole site (a stray{' '}
        <code>Disallow: /</code> is the classic mistake — see our{' '}
        <Link to="/guides/robots-txt-guide">robots.txt guide</Link>), and that it references your XML
        sitemap. Then confirm the sitemap itself only lists canonical, indexable URLs using our{' '}
        <Link to="/tools/xml-sitemap-generator">XML Sitemap Generator</Link>.
      </p>

      <h3>Internal Links</h3>
      <p>
        Paste each audited page's HTML into the{' '}
        <Link to="/tools/internal-link-analyzer">Internal Link &amp; Anchor Text Matrix Analyzer</Link>{' '}
        and check for two things: generic anchor text like "click here," and an unusually low ratio of
        internal to external links, which can indicate a page that isn't pulling its weight in your
        site's link structure. See our{' '}
        <Link to="/guides/internal-linking-best-practices">internal linking guide</Link> for the
        reasoning behind this.
      </p>

      <h3>Redirects &amp; Broken Links</h3>
      <p>
        Check for redirect chains (A → B → C instead of a direct A → C) and format-invalid links using
        our <Link to="/tools/broken-link-checker">Broken Link &amp; Anchor Health Checker</Link>. Note
        that this only validates URL format, not whether a link actually returns a 200 — a real link
        check needs a server-side crawler, which is outside what a browser-only tool can do.
      </p>

      <h3>DOM Size &amp; Core Web Vitals Signals</h3>
      <p>
        Run each page's HTML through the{' '}
        <Link to="/tools/core-web-vitals-estimator">Core Web Vitals &amp; Resource Size Estimator</Link>{' '}
        to flag an oversized DOM (over roughly 1,500 elements) and check for images missing alt text.
        This is an estimate from markup structure, not a real Lighthouse score — see our{' '}
        <Link to="/guides/core-web-vitals-explained">Core Web Vitals guide</Link> for what it can and
        can't tell you.
      </p>

      <h2>On-Page Checks</h2>

      <h3>Title &amp; Meta Description</h3>
      <p>
        Confirm every page has a unique title and description that fits within the approximate pixel
        cutoffs, using the <Link to="/tools/meta-snippet-optimizer">Meta &amp; Snippet Optimizer</Link>.
        Duplicate titles across multiple pages are a common, easy-to-miss issue on larger sites.
      </p>

      <h3>Heading Structure</h3>
      <p>
        Every page should have exactly one H1 and no skipped heading levels. Check this with the{' '}
        <Link to="/tools/heading-structure-auditor">Heading Structure Auditor</Link> — this very page
        was checked against the same rule set before publishing.
      </p>

      <h3>Schema Markup</h3>
      <p>
        Confirm structured data exists where relevant and matches the page's visible content — see our{' '}
        <Link to="/guides/schema-markup-guide">schema markup guide</Link> for which type fits which kind
        of page.
      </p>

      <h2>Content Checks</h2>
      <p>
        Finally, check keyword usage for natural language rather than repetition using the{' '}
        <Link to="/tools/keyword-density-checker">Keyword Density Checker</Link>, and if you're targeting
        a specific term, use the LSI Term Extractor to see what related vocabulary is already showing up
        in your content versus what might be missing.
      </p>

      <h2>Putting It Together</h2>
      <p>
        None of these checks require a paid platform or a developer — they're the same fundamentals a
        much more expensive audit tool would flag, just run manually and one page at a time. The
        tradeoff is honest: this is slower than an automated crawl of your entire site, but it costs
        nothing and never sends your content anywhere you didn't choose to paste it.
      </p>
    </GuideLayout>
  )
}

export default SiteAuditChecklistGuide
