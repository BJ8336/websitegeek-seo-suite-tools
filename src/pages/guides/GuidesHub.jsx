import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'
import { guides } from '../../data/guidesConfig'

const schema = buildSchema(SCHEMA_TYPES.ARTICLE, {
  headline: 'Free SEO Tools & Guides',
  author: 'WebsiteGeek Team',
  datePublished: '2026-01-05',
  description:
    'An overview of the free, browser-based SEO tools and guides available on WebsiteGeek, and how to use them together.',
  publisherName: 'WebsiteGeek',
})

function GuidesHub() {
  return (
    <GuideLayout
      title="Free SEO Tools & Guides | WebsiteGeek"
      description="An overview of WebsiteGeek's free, browser-based SEO tools and the guides that explain how to use them well."
      schema={schema}
    >
      <h1>Free SEO Tools & Guides</h1>
      <p>
        WebsiteGeek's SEO Suite is a set of small, single-purpose tools that run entirely in your
        browser — no account, no upload, and nothing you paste is sent anywhere. This page is the
        starting point: a plain-language explanation of what each tool actually does, and links to
        deeper guides if you want the reasoning behind the numbers, not just the numbers themselves.
      </p>

      <h2>Why These Tools Are Free (and What "Free" Actually Means Here)</h2>
      <p>
        Every tool in the suite works entirely client-side — your browser does the parsing, counting,
        and formatting, and none of it touches a server. That's what makes the free tier genuinely
        useful rather than a crippled demo: a single meta tag preview, a basic heading check, or a
        character count doesn't need a subscription to be correct. Where a Pro tier exists, it's
        reserved for things that are naturally "more" of the same feature — a full ranked keyword list
        instead of the top five, a complete redirect rule set instead of a preview, that kind of thing.
      </p>

      <h2>What You Can Do Without Leaving Your Browser</h2>
      <p>
        The suite covers three broad areas. Text tools handle the basics: character, word, and line
        counts, case conversion, and keyword density. On-page tools help with what search engines and
        social platforms see when they read your page — title and meta description length, heading
        structure, schema markup, and Open Graph tags. Technical tools cover the site-wide plumbing:
        internal link auditing, robots.txt and sitemap generation, redirect rules, and a couple of
        honest estimators for things like Core Web Vitals that can't be measured for real without a
        server-side render.
      </p>

      <h3>If You're Optimizing a Single Page</h3>
      <p>
        Start with the{' '}
        <Link to="/tools/meta-snippet-optimizer">Meta &amp; Snippet Optimizer</Link> to check your title
        and description length against Google's approximate pixel cutoffs, then run your content through
        the <Link to="/guides/keyword-density-checker">keyword density guide</Link> to make sure you're
        not accidentally stuffing your target phrase.
      </p>

      <h3>If You're Auditing a Whole Site</h3>
      <p>
        The technical tools are built for this: check your robots.txt and sitemap setup, scan a page's
        internal links for generic anchor text, and estimate DOM bloat before it becomes a performance
        problem. Our <Link to="/guides/complete-site-audit-checklist">complete site audit checklist</Link>{' '}
        walks through all of it in order.
      </p>

      <h2>A Note on What These Tools Can't Do</h2>
      <p>
        Because everything runs in your browser with no backend, a few things are structurally
        impossible here — and we'd rather tell you that plainly than fake it. There's no live crawl of
        a URL you don't paste in, no real backlink count, and no actual Google PageSpeed score. Where a
        tool estimates something (like DOM size or text-to-code ratio), it says "estimated" right on the
        page. If a tool needs real data it can't get without a paid API and a server, we didn't build a
        version that pretends to.
      </p>
      <p>
        Ready to dig in? <Link to="/">Browse the full tool directory</Link> to see everything at once, or
        pick a guide below for a deeper walkthrough of a specific topic.
      </p>

      <h2>All Guides</h2>
      <ul>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link to={`/guides/${guide.slug}`}>{guide.title}</Link>
          </li>
        ))}
      </ul>
    </GuideLayout>
  )
}

export default GuidesHub
