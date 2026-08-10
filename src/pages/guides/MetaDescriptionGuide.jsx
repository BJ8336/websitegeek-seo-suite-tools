import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'What is the maximum meta description length?',
    answer:
      "There's no hard character limit — Google truncates based on pixel width, roughly 920px on desktop, which usually works out to about 150-160 characters depending on which letters you use (a title full of \"i\" and \"l\" fits more characters than one full of \"m\" and \"w\").",
  },
  {
    question: 'Does the meta description affect rankings?',
    answer:
      "Not directly — it's not a ranking factor. But it directly affects click-through rate, and click-through rate is one of the signals that can indirectly influence how a page performs over time. A description nobody clicks is a missed opportunity even on a well-ranked page.",
  },
  {
    question: "What happens if I don't write one?",
    answer:
      'Google will auto-generate a snippet by pulling text from your page, usually the first matching paragraph. This is unpredictable and rarely as compelling as a description you wrote on purpose.',
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function MetaDescriptionGuide() {
  return (
    <GuideLayout
      title="How to Write Meta Descriptions That Actually Get Clicked | WebsiteGeek"
      description="Meta description length limits, pixel width vs. character count, and what actually earns a click in Google search results."
      schema={schema}
    >
      <h1>How to Write Meta Descriptions That Actually Get Clicked</h1>
      <p>
        A meta description doesn't affect your ranking position directly, but it's the single biggest
        lever you have over whether someone actually clicks your result once it's on the page. Most
        meta descriptions are either an afterthought or a copy-pasted opening sentence — both are
        wasted opportunities.
      </p>

      <h2>What a Meta Description Actually Does</h2>
      <p>
        It's the gray summary text under your blue title link in search results. Its only job is to
        answer one question for the searcher: "is this the result that solves my problem?" You have
        one or two sentences to make that case before they scroll past you to the next listing.
      </p>

      <h2>The Length Limit Is a Pixel Width, Not a Character Count</h2>
      <p>
        This trips up a lot of writers. Google doesn't cut off your description at a fixed character
        count — it cuts it off at roughly 920 pixels of rendered width on desktop. Because letters have
        different widths, two descriptions with the same character count can truncate at different
        points. Our{' '}
        <Link to="/meta-snippet-optimizer">Meta &amp; Snippet Optimizer</Link> measures this the
        same way — using a canvas-rendered pixel width estimate rather than a flat character cap — so
        you can see exactly where your description would get cut off before you publish.
      </p>
      <p>
        As a rough guide, aim for 150-160 characters and preview it before publishing. Mobile results
        show a narrower snippet, so a description that fits perfectly on desktop may still wrap or
        truncate differently on a phone.
      </p>

      <h2>What Makes People Click</h2>
      <p>A meta description that earns clicks usually does three things:</p>
      <ul>
        <li>States clearly what the page delivers, in plain language, not marketing fluff</li>
        <li>Includes the searcher's likely term naturally, since Google bolds matching words in results</li>
        <li>Gives a reason to click this result over the five others that look similar</li>
      </ul>
      <p>
        Avoid stuffing the same phrase in twice hoping it'll bold more — one natural mention reads
        better and does the same job. If you're unsure whether your phrasing has tipped into repetition,
        our <Link to="/guides/keyword-density-checker">keyword density guide</Link> covers the same
        principle applied to body content, and the logic carries over directly.
      </p>

      <h2>Common Mistakes</h2>
      <p>
        The most common failure is writing the same generic description for every page on a site — "We
        offer the best [service] in [location]" tells a searcher nothing that distinguishes this page
        from the last five they scrolled past. The second most common mistake is leaving it blank and
        letting Google auto-generate one, which is unpredictable and often pulls an awkward mid-sentence
        fragment. The third is treating it like an SEO keyword slot rather than actual sales copy — it's
        the one piece of on-page content written entirely for a human, not a crawler.
      </p>
      <p>
        If your page is also meant to be shared on social media, remember the meta description and the
        Open Graph description are two separate fields — see our{' '}
        <Link to="/guides/open-graph-tags-guide">Open Graph tags guide</Link> for how link previews
        differ from search snippets.
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

export default MetaDescriptionGuide
