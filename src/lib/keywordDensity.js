import { STOP_WORDS } from './stopWords'

const WORD_CHUNK_PATTERN = /[\p{L}\p{N}'-]+/gu
const HAS_LETTER_OR_NUMBER = /[\p{L}\p{N}]/u

export function tokenize(text) {
  const chunks = text.toLowerCase().match(WORD_CHUNK_PATTERN) || []
  return chunks.filter((chunk) => HAS_LETTER_OR_NUMBER.test(chunk))
}

/**
 * Density % is always computed against the full token count (matching how
 * most keyword-density tools define it), even though stop words are
 * excluded from which terms get *listed*.
 */
export function analyzeKeywordDensity(text, { threshold = 3, limit = 25, focusTerm = '' } = {}) {
  const tokens = tokenize(text)
  const totalWords = tokens.length

  if (totalWords === 0) {
    return { totalWords: 0, singleWords: [], phrases: [], hasContent: false, focusMatch: null }
  }

  const singleCounts = new Map()
  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue
    singleCounts.set(token, (singleCounts.get(token) || 0) + 1)
  }

  const totalBigrams = Math.max(tokens.length - 1, 0)
  const phraseCounts = new Map()
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const a = tokens[i]
    const b = tokens[i + 1]
    if (STOP_WORDS.has(a) && STOP_WORDS.has(b)) continue
    const phrase = `${a} ${b}`
    phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1)
  }

  const rank = (counts, denominator) =>
    [...counts.entries()]
      .map(([term, count]) => ({ term, count, percentage: denominator === 0 ? 0 : (count / denominator) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((entry) => ({ ...entry, isStuffed: entry.percentage >= threshold }))

  const singleWords = rank(singleCounts, totalWords)
  const phrases = rank(phraseCounts, totalBigrams)

  return {
    totalWords,
    singleWords,
    phrases,
    hasContent: singleWords.length > 0 || phrases.length > 0,
    focusMatch: computeFocusMatch(tokens, focusTerm, threshold),
  }
}

/**
 * Computes density for one specific term directly from the raw token list,
 * bypassing the stop-word filtering and top-N ranking applied to singleWords/
 * phrases above — so a focus keyword that happens to be a stop word, or that
 * doesn't rank in the top N, still gets an accurate count. Reuses the same
 * tokenizer and density formula as the rest of this module rather than a
 * separate implementation.
 */
function computeFocusMatch(tokens, focusTerm, threshold) {
  const focusTokens = tokenize(focusTerm)
  if (focusTokens.length === 0) return null

  if (focusTokens.length > 2) {
    return { term: focusTerm.trim(), unsupported: true }
  }

  const totalWords = tokens.length

  if (focusTokens.length === 1) {
    const count = tokens.filter((token) => token === focusTokens[0]).length
    const percentage = totalWords === 0 ? 0 : (count / totalWords) * 100
    return { term: focusTokens[0], count, percentage, isStuffed: percentage >= threshold }
  }

  const totalBigrams = Math.max(tokens.length - 1, 0)
  let count = 0
  for (let i = 0; i < tokens.length - 1; i += 1) {
    if (tokens[i] === focusTokens[0] && tokens[i + 1] === focusTokens[1]) count += 1
  }
  const percentage = totalBigrams === 0 ? 0 : (count / totalBigrams) * 100
  return { term: focusTokens.join(' '), count, percentage, isStuffed: percentage >= threshold }
}
