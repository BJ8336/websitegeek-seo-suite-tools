import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'Are Core Web Vitals a ranking factor?',
    answer:
      "Yes, but a minor one relative to content relevance and quality. Google has said good content that answers the query well will generally outrank a technically faster page that doesn't. Vitals act more as a tiebreaker among otherwise-similar results.",
  },
  {
    question: 'Can I measure real Core Web Vitals scores in a browser tool with no backend?',
    answer:
      "Not accurately. Real Core Web Vitals require either field data from real visitors or a Lighthouse lab test that renders your page in an actual browser engine. A static HTML parser can only estimate contributing factors like DOM size — it can't replicate an actual render.",
  },
  {
    question: 'What single change usually helps the most?',
    answer:
      "It depends on the site, but oversized, unoptimized images are the most common cause of poor LCP, and DOM bloat (thousands of unnecessary elements) is a common contributor to poor responsiveness. Both are usually cheaper to fix than they are to diagnose.",
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function CoreWebVitalsGuide() {
  return (
    <GuideLayout
      title="Core Web Vitals Explained in Plain English | WebsiteGeek"
      description="What LCP, INP, and CLS actually measure, why they matter for SEO, and what you can and can't estimate without a real browser render."
      schema={schema}
    >
      <h1>Core Web Vitals Explained in Plain English</h1>
      <p>
        Core Web Vitals are three specific measurements Google uses to judge how a page feels to use,
        beyond just whether it loads. They're often discussed in vague terms like "page speed," but each
        one measures something distinct and fixable once you know what it's actually tracking.
      </p>

      <h2>The Three Metrics</h2>

      <h3>LCP (Largest Contentful Paint)</h3>
      <p>
        How long it takes for the largest visible element — usually a hero image or a heading — to
        finish rendering. This is the closest thing to "does this page feel fast to load," measured from
        the moment a visitor requests the page to the moment its main content is visibly ready.
      </p>

      <h3>INP (Interaction to Next Paint)</h3>
      <p>
        How long the page takes to visibly respond after someone clicks, taps, or types. This replaced
        an older metric called First Input Delay in 2024 because it measures responsiveness across the
        entire visit, not just the very first interaction. A page that feels laggy when you click a
        button has a poor INP.
      </p>

      <h3>CLS (Cumulative Layout Shift)</h3>
      <p>
        How much visible content unexpectedly jumps around as a page loads — the classic case being an
        ad or image loading late and pushing the text you were about to tap on down the screen. It's
        measured as a score, not a time, based on how much of the viewport shifted and how far.
      </p>

      <h2>Why They Matter for SEO</h2>
      <p>
        Google incorporated Core Web Vitals into ranking as part of the Page Experience signals, though
        it's consistently described them as a minor factor compared to actually answering the search
        query well. The practical impact is usually more direct than the ranking algorithm itself: pages
        that load slowly or shift around under a visitor's finger get abandoned more often, and that
        abandonment shows up in engagement metrics that matter for a business regardless of what Google
        does with them.
      </p>

      <h2>What You Can Estimate From HTML Alone (and What You Can't)</h2>
      <p>
        Real Core Web Vitals require an actual browser render — either lab data from a tool like
        Lighthouse or field data from real visitors via the Chrome User Experience Report. Neither is
        possible from a pasted block of HTML with no server and no rendering engine, which is why our{' '}
        <Link to="/core-web-vitals-estimator">Core Web Vitals &amp; Resource Size Estimator</Link>{' '}
        is explicit about what it actually does: it estimates contributing factors from your markup —
        DOM element count, text-to-code ratio, and how many images are missing alt text — rather than
        pretending to produce a real LCP or INP score it has no way to measure.
      </p>
      <p>
        A bloated DOM is a real, verifiable signal correlated with slower rendering, even without a live
        render to confirm it. Use it as an early warning, then confirm with a real tool like Lighthouse
        before investing time fixing something that might not actually be slow.
      </p>
      <p>
        Core Web Vitals checks pair naturally with an{' '}
        <Link to="/guides/internal-linking-best-practices">internal linking review</Link> — both are
        steps in our <Link to="/guides/complete-site-audit-checklist">complete site audit checklist</Link>.
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

export default CoreWebVitalsGuide
