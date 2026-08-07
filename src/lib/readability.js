import { tokenize } from './keywordDensity'
import { splitSentences } from './textSegmentation'

// Standard approximate English syllable counter — counts vowel-sound groups
// and adjusts for a few common patterns (silent trailing "e", leading "y").
// This is a heuristic, the same kind every client-side readability tool
// (Hemingway, Yoast) uses — real syllable counts require a pronunciation
// dictionary, which isn't available offline.
function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!cleaned) return 1
  if (cleaned.length <= 3) return 1
  const reduced = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  const matches = reduced.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function labelFor(score) {
  if (score >= 90) return 'Very Easy'
  if (score >= 80) return 'Easy'
  if (score >= 70) return 'Fairly Easy'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  if (score >= 30) return 'Difficult'
  return 'Very Difficult'
}

/**
 * Flesch Reading Ease score, computed entirely from the text itself —
 * no external data needed. 0 (very difficult) to 100 (very easy).
 */
export function analyzeReadability(text) {
  const words = tokenize(text)
  const sentences = splitSentences(text)

  if (words.length === 0 || sentences.length === 0) return null

  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0)
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllableCount / words.length

  const rawScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  const score = Math.round(Math.max(0, Math.min(100, rawScore)))

  return {
    score,
    label: labelFor(score),
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    wordCount: words.length,
    sentenceCount: sentences.length,
  }
}
