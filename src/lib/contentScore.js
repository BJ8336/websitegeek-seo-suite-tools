import { analyzeKeywordDensity, tokenize } from './keywordDensity'
import { parseHeadings, auditHeadings } from './headingAudit'
import { analyzeReadability } from './readability'
import { extractLinksFromHtml } from './linkAnalyzer'
import { estimatePage } from './pageEstimator'

/**
 * Consolidates several already-built analyzers (keyword density, heading
 * structure, readability, link/alt-text checks) into one weighted checklist
 * and score — reusing that logic rather than re-implementing it. This is
 * explicitly a structural/on-page score, not a live competitor comparison
 * (that needs real-time search data this app has no access to).
 */
export function analyzeContentScore({ title = '', focusKeyword = '', content = '' }) {
  const checks = []
  let earnedPoints = 0
  let totalPoints = 0

  const addCheck = (id, label, status, detail, points) => {
    totalPoints += points
    if (status === 'pass') earnedPoints += points
    else if (status === 'warn') earnedPoints += points * 0.5
    checks.push({ id, label, status, detail, points })
  }

  const contentTokens = tokenize(content)
  const keywordTokens = tokenize(focusKeyword)
  const hasKeyword = keywordTokens.length > 0
  const keywordPhrase = keywordTokens.join(' ')

  if (hasKeyword) {
    const titleHasKeyword = tokenize(title).join(' ').includes(keywordPhrase)
    addCheck(
      'title-keyword',
      'Focus keyword in title',
      titleHasKeyword ? 'pass' : 'fail',
      titleHasKeyword
        ? 'Your title includes the focus keyword.'
        : 'Add your focus keyword to the title for a stronger relevance signal.',
      15,
    )

    const densityAnalysis = analyzeKeywordDensity(content, { focusTerm: focusKeyword })
    if (densityAnalysis.focusMatch?.unsupported) {
      addCheck(
        'keyword-density',
        'Focus keyword density',
        'warn',
        'Density checking supports 1-2 word focus keywords — shorten it to get a density reading.',
        15,
      )
    } else {
      const percentage = densityAnalysis.focusMatch?.percentage || 0
      const densityStatus = percentage === 0 ? 'fail' : percentage > 3 ? 'warn' : percentage >= 0.3 ? 'pass' : 'warn'
      addCheck(
        'keyword-density',
        'Focus keyword density',
        densityStatus,
        `"${focusKeyword.trim()}" appears at ${percentage.toFixed(1)}% density.${
          percentage > 3
            ? ' This may read as keyword stuffing.'
            : percentage > 0 && percentage < 0.3
              ? ' Consider using it a little more.'
              : percentage === 0
                ? ' It doesn\'t appear in your content at all.'
                : ' Healthy range.'
        }`,
        15,
      )
    }

    const first100 = contentTokens.slice(0, 100).join(' ')
    const inFirst100 = first100.includes(keywordPhrase)
    addCheck(
      'keyword-intro',
      'Focus keyword in first 100 words',
      inFirst100 ? 'pass' : 'fail',
      inFirst100
        ? 'Found early in your content.'
        : 'Mention your focus keyword early so readers and crawlers see relevance immediately.',
      10,
    )
  }

  const { headings, format } = parseHeadings(content)
  if (headings.length > 0) {
    const { issues } = auditHeadings(headings)
    addCheck(
      'headings',
      'Heading structure',
      issues.length === 0 ? 'pass' : 'warn',
      issues.length === 0
        ? 'No missing H1, duplicate H1s, or skipped levels.'
        : issues.map((issue) => issue.message).join(' '),
      15,
    )
  } else {
    addCheck(
      'headings',
      'Heading structure',
      'warn',
      'No H1-H6 headings detected — paste HTML, or markdown-style "#" headings, to check structure.',
      15,
    )
  }

  const readability = analyzeReadability(content)
  if (readability) {
    const readabilityStatus = readability.score >= 50 ? 'pass' : readability.score >= 30 ? 'warn' : 'fail'
    addCheck(
      'readability',
      'Readability',
      readabilityStatus,
      `Flesch Reading Ease score: ${readability.score} (${readability.label}). Averaging ${readability.avgWordsPerSentence} words per sentence.`,
      15,
    )
  }

  const wordCount = contentTokens.length
  const lengthStatus = wordCount >= 600 ? 'pass' : wordCount >= 300 ? 'warn' : 'fail'
  addCheck(
    'length',
    'Content length',
    lengthStatus,
    `${wordCount.toLocaleString()} word${wordCount === 1 ? '' : 's'}.${
      wordCount < 300
        ? ' Most competitive topics need 600+ words to cover the subject well.'
        : wordCount < 600
          ? ' Solid start — 600+ words often performs better for competitive topics.'
          : ' Good depth for most topics.'
    }`,
    15,
  )

  if (format === 'html') {
    const links = extractLinksFromHtml(content)
    addCheck(
      'links',
      'Internal/external links',
      links.length > 0 ? 'pass' : 'warn',
      links.length > 0
        ? `Found ${links.length} link${links.length === 1 ? '' : 's'} in your content.`
        : 'No links found — linking to related pages helps both readers and crawlers.',
      10,
    )

    const estimate = estimatePage(content)
    if (estimate && estimate.imagesTotal > 0) {
      const completeness = estimate.altCompleteness
      const altStatus = completeness === 100 ? 'pass' : completeness >= 50 ? 'warn' : 'fail'
      addCheck(
        'alt-text',
        'Image alt text',
        altStatus,
        `${estimate.imagesWithAlt} of ${estimate.imagesTotal} images have alt text (${Math.round(completeness)}%).`,
        10,
      )
    }
  }

  const score = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100)
  return { score, checks, wordCount }
}
