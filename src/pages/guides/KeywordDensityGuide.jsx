import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'What is a good keyword density percentage?',
    answer:
      'There isn\'t one. Google has never published a target percentage, and chasing an exact number (like "always hit 2%") usually makes writing worse, not better. Density is a diagnostic signal, not a scoring rule — use it to catch obvious over-repetition, not to hit a quota.',
  },
  {
    question: 'What counts as keyword stuffing?',
    answer:
      'Repeating a word or phrase so often that it reads unnaturally to a human, especially when it stops adding meaning. A blog post that says "best running shoes" nine times in 300 words is stuffing, even if the percentage looks "reasonable" on paper.',
  },
  {
    question: 'Should I check density for every page I publish?',
    answer:
      "It's most useful as a final sanity check, not a writing guide. Draft naturally for a human reader first, then run the finished text through a checker to catch anything that crept in from repeated editing.",
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function KeywordDensityGuide() {
  return (
    <GuideLayout
      title="How to Check Keyword Density (Without Overdoing It) | WebsiteGeek"
      description="What keyword density actually measures, why there's no correct percentage, and how to spot real keyword stuffing in your content."
      schema={schema}
    >
      <h1>How to Check Keyword Density (Without Overdoing It)</h1>
      <p>
        Keyword density shows up in almost every SEO checklist, usually with a specific target
        percentage attached to it. That number is close to useless on its own — but the underlying
        signal, how often a term repeats relative to your total word count, is still worth checking
        before you publish. Here's what it actually tells you, and what it doesn't.
      </p>

      <h2>What Keyword Density Actually Measures</h2>
      <p>
        Density is simple arithmetic: how many times a word or phrase appears, divided by your total
        word count. If "email marketing" appears 6 times in a 400-word article, that's a 1.5% density
        for that phrase. Our{' '}
        <Link to="/tools/keyword-density-checker">free keyword density checker</Link> calculates this
        for both single words and two-word phrases automatically, stripping out common stop words like
        "the" and "and" so the results actually mean something.
      </p>
      <p>
        The number itself is descriptive, not prescriptive. It tells you what you did, not what you
        should do. Two articles can both sit at 2% density on their target phrase — one reads naturally,
        the other reads like it was written by a bot repeating a phrase on a timer.
      </p>

      <h2>Why There's No "Correct" Percentage</h2>
      <p>
        Google's ranking systems have moved well past simple term-frequency counting. Modern search
        relies on understanding topics and intent, not counting how many times a phrase repeats. Old
        advice like "keep it between 1% and 3%" comes from an era when search engines genuinely did
        rely on raw frequency — that era ended over a decade ago. Treating density as a hard target
        today tends to produce exactly the kind of repetitive, low-value writing search engines have
        gotten much better at penalizing.
      </p>

      <h2>How to Use the Checker Without Overthinking It</h2>
      <p>Write for a human reader first. Then use density checking as a proofreading step to catch:</p>
      <ul>
        <li>A phrase you unconsciously repeated too often while editing</li>
        <li>Sections where you swapped in synonyms so awkwardly it reads worse than repetition would</li>
        <li>Content that's accidentally thin — high density on a very short page is often a symptom of not enough real content, not too much keyword focus</li>
      </ul>
      <p>
        If your target phrase shows up 15-20 times in the term list with a plausible-looking percentage,
        that's not automatically a problem — read the surrounding sentences and judge whether each
        instance is doing real work.
      </p>

      <h2>Signs You're Keyword Stuffing</h2>
      <p>
        Percentage alone won't catch this reliably, but a few patterns usually will: the same exact
        phrase repeated in nearly identical sentences, keyword phrases jammed into image alt text or
        headings where they don't fit grammatically, or a term appearing in every single paragraph
        regardless of whether that paragraph is actually about it. If you're auditing anchor text at the
        same time, our{' '}
        <Link to="/guides/internal-linking-best-practices">internal linking best practices guide</Link>{' '}
        covers a related trap — stuffing keywords into link text instead of writing anchors that
        describe the destination.
      </p>

      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}

      <p>
        Once your keyword usage looks right, double-check that your title and meta description aren't
        making the same mistake — see our{' '}
        <Link to="/guides/meta-description-guide">meta description guide</Link> for the pixel-width
        limits that matter more than density does at that stage.
      </p>
    </GuideLayout>
  )
}

export default KeywordDensityGuide
