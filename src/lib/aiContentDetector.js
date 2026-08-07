import { tokenize } from './keywordDensity'
import { splitSentences } from './textSegmentation'

// Common overused AI-writing transitions and stock phrases. Not exhaustive
// and not proof of anything on its own — just one signal among several.
const AI_TELL_PHRASES = [
  "in today's fast-paced world", "in today's digital age", "in today's digital landscape",
  'it’s important to note', 'it is important to note', "it's worth noting",
  'in conclusion', 'in summary', 'in essence', 'on the other hand',
  'delve into', 'dive deeper', 'navigate the complexities', 'navigate the landscape',
  'in the realm of', 'unlock the potential', 'unlock the power', 'game-changer',
  'game changer', 'testament to', 'stands as a', 'underscores the',
  'elevate your', 'seamless', 'seamlessly', 'robust', 'leverage', 'leveraging',
  'tapestry', 'boasts a', 'boasts an', 'plays a crucial role', 'plays a vital role',
  'furthermore', 'moreover', 'additionally', 'as previously mentioned',
  'a myriad of', 'a plethora of', 'foster a', 'holistic approach',
  'in a world where', 'ever-evolving', 'cutting-edge', 'at the end of the day',
  'when it comes to', 'it goes without saying',
]

function mean(values) {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
}

function stdDev(values) {
  if (values.length < 2) return 0
  const m = mean(values)
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Heuristic AI-writing likelihood based on statistical text patterns —
 * sentence-length uniformity ("burstiness"), overused AI transition
 * phrases, repeated sentence openers, and vocabulary diversity. This is
 * the same category of signal real detectors use, but without a trained
 * classifier behind it — see the tool's own on-page disclaimer.
 */
export function analyzeAiLikelihood(text) {
  const sentences = splitSentences(text)
  const words = tokenize(text)

  if (sentences.length < 3 || words.length < 30) {
    return { insufficientData: true, wordCount: words.length, sentenceCount: sentences.length }
  }

  const sentenceLengths = sentences.map((s) => tokenize(s).length).filter((n) => n > 0)
  const avgSentenceLength = mean(sentenceLengths)
  const sentenceLengthStdDev = stdDev(sentenceLengths)
  const burstiness = avgSentenceLength > 0 ? sentenceLengthStdDev / avgSentenceLength : 0
  const burstinessSignal = clamp(100 - burstiness * 130, 0, 100)

  const lowerText = text.toLowerCase()
  const phraseMatches = AI_TELL_PHRASES.filter((phrase) => lowerText.includes(phrase))
  const phraseDensity = phraseMatches.length / (words.length / 100)
  const phraseSignal = clamp(phraseDensity * 25, 0, 100)

  const openers = sentences.map((s) => tokenize(s)[0]).filter(Boolean)
  const openerCounts = new Map()
  for (const opener of openers) {
    openerCounts.set(opener, (openerCounts.get(opener) || 0) + 1)
  }
  const topOpener = [...openerCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const openerRepetitionRatio = openers.length ? topOpener[1] / openers.length : 0
  const openerSignal = clamp((openerRepetitionRatio - 0.15) * 200, 0, 100)

  const uniqueWords = new Set(words)
  const typeTokenRatio = uniqueWords.size / words.length
  const diversitySignal = clamp(100 - typeTokenRatio * 140, 0, 100)

  const score = Math.round(
    clamp(burstinessSignal * 0.4 + phraseSignal * 0.3 + openerSignal * 0.2 + diversitySignal * 0.1, 0, 100),
  )

  return {
    insufficientData: false,
    wordCount: words.length,
    sentenceCount: sentences.length,
    score,
    signals: {
      burstiness: {
        value: Math.round(burstinessSignal),
        avgSentenceLength: Math.round(avgSentenceLength),
        stdDev: Math.round(sentenceLengthStdDev * 10) / 10,
      },
      aiPhrases: { value: Math.round(phraseSignal), matches: phraseMatches },
      sentenceOpenerRepetition: {
        value: Math.round(openerSignal),
        mostRepeated: topOpener,
      },
      vocabularyDiversity: {
        value: Math.round(diversitySignal),
        typeTokenRatio: Math.round(typeTokenRatio * 100) / 100,
      },
    },
  }
}
