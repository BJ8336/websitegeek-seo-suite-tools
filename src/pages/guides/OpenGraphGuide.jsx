import { Link } from 'react-router-dom'
import GuideLayout from '../../components/GuideLayout'
import { buildSchema, SCHEMA_TYPES } from '../../lib/schemaGenerator'

const faqs = [
  {
    question: 'Why does my link show a random image instead of the one I want?',
    answer:
      "Most likely there's no og:image tag on the page, so the platform fell back to grabbing the first image it could find in your HTML — which is often a logo, icon, or unrelated graphic. Set og:image explicitly to control this.",
  },
  {
    question: 'Why does my link preview show old information after I updated the page?',
    answer:
      'Social platforms cache link previews aggressively and often don\'t re-check them for days or weeks. Facebook and LinkedIn both offer a "scrape again" debugging tool that forces a refresh; there\'s no way to force this from your own site alone.',
  },
  {
    question: 'Do I need separate tags for Twitter/X?',
    answer:
      'Twitter Cards can technically fall back to your Open Graph tags if dedicated twitter:* tags are missing, but the fallback is inconsistent, especially for images. Setting both explicitly is the reliable option.',
  },
]

const schema = buildSchema(SCHEMA_TYPES.FAQ_PAGE, { questions: faqs })

function OpenGraphGuide() {
  return (
    <GuideLayout
      title="Open Graph Tags: Why Your Links Look Broken When Shared | WebsiteGeek"
      description="What Open Graph and Twitter Card tags do, the required properties, and how to fix a link preview that looks wrong, blank, or outdated."
      schema={schema}
    >
      <h1>Open Graph Tags: Why Your Links Look Broken When Shared</h1>
      <p>
        You've probably seen it happen: a link gets pasted into Slack, Facebook, or X, and instead of a
        clean preview card with a title, description, and image, you get a blank box, the wrong image,
        or no preview at all. That's almost always a missing or incomplete set of Open Graph tags — not
        a bug in the platform.
      </p>

      <h2>What Open Graph Tags Actually Are</h2>
      <p>
        Open Graph is a set of meta tags, originally created by Facebook, that tell any platform reading
        your page's HTML what to show when your link gets shared: a title, description, image, and site
        name, independent of your regular page title and meta description. Without them, platforms fall
        back to guessing — grabbing whatever text and image happen to be first in your HTML, which is
        rarely what you'd choose on purpose.
      </p>

      <h2>The Required Properties</h2>
      <p>For a usable preview card, you need at minimum:</p>
      <ul>
        <li>
          <strong>og:title</strong> — the headline shown on the card, which can differ from your page's
          actual <code>&lt;title&gt;</code> tag if you want share-specific phrasing
        </li>
        <li>
          <strong>og:description</strong> — a short summary, separate from your meta description
        </li>
        <li>
          <strong>og:image</strong> — the preview image, ideally at least 1200×630px so it doesn't look
          stretched or pixelated on larger cards
        </li>
        <li>
          <strong>og:site_name</strong> — your site or brand name, shown in smaller text on most
          platforms
        </li>
      </ul>
      <p>
        You can preview exactly how these will render before publishing using our{' '}
        <Link to="/tools/open-graph-previewer">Open Graph / Twitter Card Previewer</Link>, which builds
        Facebook, X, and LinkedIn-style cards from the same inputs and shows a clear fallback state if
        your image URL fails to load, instead of a broken image icon.
      </p>

      <h2>Open Graph vs. Twitter Cards</h2>
      <p>
        Twitter (X) uses its own tag set — <code>twitter:title</code>, <code>twitter:description</code>,
        <code> twitter:image</code> — with its own card-type setting, most commonly{' '}
        <code>summary_large_image</code> for a full-width preview image. It can fall back to your Open
        Graph tags when its own tags are missing, but the fallback behavior isn't fully reliable across
        every card type, so it's worth setting both explicitly rather than assuming one covers the
        other.
      </p>

      <h2>Common Reasons a Preview Looks Wrong</h2>
      <p>
        Beyond simply missing tags, the most frequent causes are: an og:image URL that returns a 404 or
        redirects somewhere unexpected, an image that's too small for the platform's minimum size
        requirement and gets rejected silently, or a cached preview from before you fixed the tags —
        most platforms cache aggressively and won't re-check your page until you force a refresh through
        their own debugging tools.
      </p>
      <p>
        Open Graph tags work alongside, not instead of, your regular meta description — see our{' '}
        <Link to="/guides/meta-description-guide">meta description guide</Link> for how the two differ,
        and our <Link to="/guides/schema-markup-guide">schema markup guide</Link> if you also want rich
        results in search, which is a separate system from link previews entirely.
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

export default OpenGraphGuide
