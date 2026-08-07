// Shared sentence-splitting used by both the AI Content Detector and the
// SEO Content Score — a simple punctuation-based split. It won't handle
// every abbreviation ("Dr.", "e.g.") perfectly, but it's a reasonable
// approximation for statistical text analysis, not a linguistic parser.
export function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((s) => s.trim()).filter(Boolean)
}
