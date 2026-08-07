import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'Does adding schema markup improve my rankings?',
    answer:
      "Not directly — it's not a ranking factor by itself. What it can do is unlock rich results (star ratings, FAQ dropdowns, breadcrumbs) that make your listing more visible and clickable, which indirectly helps.",
  },
  {
    question: 'Which schema format should I use?',
    answer:
      'JSON-LD. Google explicitly recommends it over the older Microdata and RDFa formats because it lives in a single script block instead of being woven into your visible HTML, so it\'s far less likely to break when you redesign a page.',
  },
  {
    question: 'Can I add schema markup that doesn\'t match my visible content?',
    answer:
      "You technically can, but you shouldn't — it violates Google's structured data guidelines and can get the markup ignored or the page manually penalized. Your FAQPage schema, for example, should mirror an actual visible FAQ section on the page, the way this one does.",
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function SchemaMarkupGuide() {
  return (
    <GuideLayout
      title="Schema Markup Guide: JSON-LD for Beginners | WebsiteGeek"
      description="What schema markup does for SEO, which types matter most, and how to add valid JSON-LD structured data without writing code by hand."
      schema={schema}
    >
      <h1>Schema Markup Guide: JSON-LD for Beginners</h1>
      <p>
        Schema markup is a way of labeling the content on your page so search engines don't have to
        guess what it means. It's the difference between a search engine seeing "4.8 stars, 212
        reviews, $12" as three unrelated fragments of text versus understanding it's a product rating,
        a review count, and a price, all describing the same item.
      </p>

      <h2>What Schema Markup Actually Does</h2>
      <p>
        Search engines are good at reading text but bad at understanding structure without help. Schema
        markup, built on the shared vocabulary at schema.org, explicitly tells a crawler "this block of
        text is an Article, this one is a Question, this one is a LocalBusiness address." When Google
        trusts that markup, it can use it to build rich results — the star ratings, FAQ dropdowns, and
        breadcrumb trails you see in search results that make a listing take up more visual space and
        earn more clicks.
      </p>

      <h2>Why JSON-LD Specifically</h2>
      <p>
        There are three ways to add structured data: Microdata, RDFa, and JSON-LD. Google recommends
        JSON-LD because it's self-contained — a single script block you can add anywhere in the page,
        completely separate from your visible HTML. The older formats require adding special attributes
        directly onto the HTML elements themselves, which means a redesign that changes your markup can
        silently break your structured data without anyone noticing.
      </p>

      <h2>Which Schema Types Matter Most</h2>
      <p>
        Most sites only need a handful of types. Our{' '}
        <Link to="/tools/schema-markup-generator">Schema Markup Generator</Link> covers the four most
        common ones with a validated, form-based builder:
      </p>

      <h3>Article</h3>
      <p>
        For blog posts and news content. Requires a headline, author, and publish date at minimum —
        these are the fields Google checks for before considering rich-result eligibility.
      </p>

      <h3>FAQPage</h3>
      <p>
        For question-and-answer content, like the section at the bottom of this page. Each question
        needs a matching visible answer on the page — this is the type most often misused by sites
        trying to mark up content that isn't really formatted as an FAQ.
      </p>

      <h3>LocalBusiness</h3>
      <p>
        For a physical business location — name, address, and typically a phone number and price range.
        This is what powers map-pack style rich results for "near me" searches.
      </p>

      <h3>SoftwareApplication</h3>
      <p>
        For apps and web tools, requiring a name, application category, and operating system. Pricing
        information is optional but strengthens eligibility for rich results showing a price.
      </p>

      <h2>How to Add It Without a Developer</h2>
      <p>
        You don't need to hand-write JSON. Fill in the form fields for whichever type matches your
        content, and the generator outputs validated JSON-LD you can paste directly into your page —
        it flags missing required fields as you go, so you won't publish incomplete markup by accident.
        Once it's live, run the page through Google's Rich Results Test to confirm it was picked up
        correctly; that step happens outside this tool, since it requires Google to actually fetch your
        live URL.
      </p>
      <p>
        Schema markup works best alongside a clear, accurate meta description — see our{' '}
        <Link to="/guides/meta-description-guide">meta description guide</Link> — and it's one of the
        checks worth running on every page during a{' '}
        <Link to="/guides/complete-site-audit-checklist">full site audit</Link>.
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

export default SchemaMarkupGuide
