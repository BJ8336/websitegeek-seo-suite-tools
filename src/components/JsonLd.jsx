// JSON-LD is valid anywhere in the document, not just <head>, so this
// renders straight into the page body — no head-injection needed.
function JsonLd({ data }) {
  if (!data) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export default JsonLd
