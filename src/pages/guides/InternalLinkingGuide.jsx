import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const schema = buildSchema(SCHEMA_TYPES.ARTICLE, {
  headline: 'Internal Linking Best Practices That Actually Move Rankings',
  author: 'WebsiteGeek Team',
  datePublished: '2026-01-10',
  description:
    'How internal links pass authority around a site, why generic anchor text wastes the opportunity, and a simple framework for linking pages together.',
  publisherName: 'WebsiteGeek',
})

function InternalLinkingGuide() {
  return (
    <GuideLayout
      title="Internal Linking Best Practices That Actually Move Rankings | WebsiteGeek"
      description="How internal links pass authority around your site, why 'click here' wastes the opportunity, and a simple linking framework you can apply today."
      schema={schema}
    >
      <h1>Internal Linking Best Practices That Actually Move Rankings</h1>
      <p>
        External backlinks get most of the attention in SEO conversations, but internal links — the
        ones connecting your own pages to each other — are entirely within your control, cost nothing
        to fix, and are one of the most consistently underused levers on most sites.
      </p>

      <h2>What Internal Links Actually Do</h2>
      <p>
        Every internal link does two jobs at once: it helps crawlers discover a page, and it passes
        some amount of your site's internal authority to whatever it points at. A page with many
        internal links pointing to it, from relevant surrounding content, tends to be treated as more
        important than an identical page buried three clicks deep with no links pointing in. This is
        true even when every page lives on the same domain — internal link equity is real, and it's the
        one kind of "backlink" you can add or remove yourself in minutes.
      </p>

      <h2>Why "Click Here" Is a Wasted Opportunity</h2>
      <p>
        Anchor text — the clickable words in a link — tells both readers and search engines what the
        destination page is about. "Click here" or "read more" tells them nothing. Compare "our pricing
        page" to "click here" as a link to a pricing page: one reinforces what that page is about every
        single time it's linked, the other contributes zero topical signal no matter how many times it
        appears. Our{' '}
        <Link to="/internal-link-analyzer">Internal Link &amp; Anchor Text Matrix Analyzer</Link>{' '}
        scans pasted HTML specifically for this pattern, flagging generic phrases like "click here,"
        "read more," and "this link" so you can find and fix them in bulk.
      </p>

      <h2>A Simple Linking Framework</h2>
      <p>
        Rather than linking randomly whenever it feels natural, it helps to think in three directions:
      </p>

      <h3>Link Down (Hub to Detail)</h3>
      <p>
        Broad overview pages should link to the specific, detailed pages underneath them — the way this
        very guide sits under our <Link to="/guides">Guides hub</Link>, and the hub links back out to
        every individual guide. This gives crawlers a clear path from general topics to specific ones.
      </p>

      <h3>Link Across (Related Content)</h3>
      <p>
        Pages covering adjacent topics should link to each other where it's genuinely useful to the
        reader, not just for SEO's sake. A guide about robots.txt linking to a guide about sitemaps
        makes sense because a reader fixing one is likely to need the other next.
      </p>

      <h3>Link Up (Detail Back to Hub)</h3>
      <p>
        Detail pages should link back to their parent category or hub page, both for navigation and to
        reinforce that the hub page is the authoritative overview for that topic.
      </p>

      <h2>How to Audit What You Already Have</h2>
      <p>
        Most sites don't have too few internal links — they have the right number pointing in the wrong
        way, with generic anchor text and no real strategy behind placement. Start by pasting your most
        important pages' HTML into the anchor text analyzer above and fixing anything flagged as
        generic. From there, look for orphaned pages — content with no internal links pointing to it at
        all — since those are effectively invisible to both crawlers and readers browsing your site
        normally.
      </p>
      <p>
        Internal linking is one part of a broader technical audit — see our{' '}
        <Link to="/guides/complete-site-audit-checklist">complete site audit checklist</Link> for the
        full sequence, including where link auditing fits relative to schema markup and Core Web Vitals
        checks.
      </p>
    </GuideLayout>
  )
}

export default InternalLinkingGuide
