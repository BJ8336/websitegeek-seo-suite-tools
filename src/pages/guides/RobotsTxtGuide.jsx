import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'Does Disallow in robots.txt remove a page from Google?',
    answer:
      "No — this is the single most common misunderstanding. Disallow tells crawlers not to fetch a page's content, but if other pages link to it, Google can still index the URL itself (with no description, since it never crawled the content). To actually remove a page from search results, use a noindex meta tag or HTTP header instead, which requires the page to be crawlable so Google can see the instruction.",
  },
  {
    question: 'Is robots.txt required?',
    answer:
      "No. If you don't have one, search engines assume everything is allowed and crawl normally. You only need a robots.txt file when you want to restrict crawling of specific paths or point crawlers to your sitemap.",
  },
  {
    question: 'Can I have different rules for different search engines?',
    answer:
      'Yes — that\'s what separate User-agent blocks are for. A block targeting "Googlebot" only applies to Google\'s crawler, while a block targeting "*" applies to any crawler not covered by a more specific block.',
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function RobotsTxtGuide() {
  return (
    <GuideLayout
      title="Robots.txt Explained: What It Does and What It Doesn't | WebsiteGeek"
      description="How robots.txt actually controls crawling (not indexing), the mistake that can deindex a whole site, and how to build one safely."
      schema={schema}
    >
      <h1>Robots.txt Explained: What It Does and What It Doesn't</h1>
      <p>
        Robots.txt is one of the oldest and most misunderstood files in SEO. It's a plain text file at
        the root of your domain that gives crawlers instructions about which parts of your site they're
        allowed to fetch — and that's it. It does not control indexing, ranking, or whether a URL can
        appear in search results, which is where most of the confusion starts.
      </p>

      <h2>What Robots.txt Actually Controls</h2>
      <p>
        Robots.txt controls crawling: whether a bot is allowed to request a given URL path at all. Each
        rule is a simple Allow or Disallow directive under a User-agent block, plus an optional Sitemap
        line pointing crawlers to your XML sitemap. Our{' '}
        <Link to="/robots-txt-generator">Robots.txt &amp; Meta Robots Generator</Link> builds this
        exact structure from simple toggles, so you don't have to remember the syntax.
      </p>

      <h2>The Mistake That Deindexes an Entire Site</h2>
      <p>
        The most damaging robots.txt mistake is a single accidental line: <code>Disallow: /</code> under
        a User-agent block that applies to everyone. This blocks crawling of the entire site. It's an
        easy mistake to make when copying a staging-site robots.txt (which should block everything) to
        production (which shouldn't). Always check a live robots.txt file after deployment — a typo here
        can undo months of SEO work overnight, and it's rarely caught quickly because nothing looks
        broken to a human visitor.
      </p>

      <h2>Robots.txt vs. Meta Robots vs. Noindex</h2>
      <p>These three tools get confused constantly because they sound similar but do different jobs:</p>
      <ul>
        <li>
          <strong>Robots.txt</strong> — stops crawling of a path. The page can still be indexed by URL
          if it's linked from elsewhere.
        </li>
        <li>
          <strong>Meta robots noindex tag</strong> — placed in a page's HTML, tells search engines not
          to index that specific page. Requires the page to be crawlable so the tag can actually be
          seen.
        </li>
        <li>
          <strong>Nofollow</strong> — tells crawlers not to pass ranking credit through a specific link,
          unrelated to whether the linked page itself gets indexed.
        </li>
      </ul>
      <p>
        If your goal is genuinely removing a page from search results, you want noindex, not Disallow —
        and critically, the page needs to remain crawlable until Google has processed the noindex tag,
        or it'll never see the instruction.
      </p>

      <h2>How to Build One Safely</h2>
      <p>
        Start narrow. Disallow only paths you're certain shouldn't be crawled — admin areas, internal
        search result pages, duplicate parameter-based URLs — rather than broad guesses. Add your
        sitemap URL so crawlers can find it without needing to discover it through Search Console. Once
        you've generated a robots.txt file, this is a good moment to also confirm your{' '}
        <Link to="/guides/xml-sitemap-guide">XML sitemap</Link> only lists URLs you actually want
        indexed — the two files should agree with each other, not contradict.
      </p>
      <p>
        Robots.txt is one of the first things worth checking on any site, new or existing — it's
        step one in our <Link to="/guides/complete-site-audit-checklist">complete site audit checklist</Link>.
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

export default RobotsTxtGuide
