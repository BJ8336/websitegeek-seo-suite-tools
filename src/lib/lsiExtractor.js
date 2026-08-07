import { STOP_WORDS } from './stopWords'
import { tokenize } from './keywordDensity'

/**
 * Finds every occurrence of the keyword phrase in the content, then counts
 * which non-stop-word terms appear within `windowSize` tokens of each
 * occurrence. This is simple statistical co-occurrence, not a semantic
 * model — callers should label it as "related term suggestions," not "LSI."
 */
export function extractCooccurringTerms(content, keyword, { windowSize = 5, limit = 20 } = {}) {
  const tokens = tokenize(content)
  const keywordTokens = tokenize(keyword)

  if (tokens.length === 0 || keywordTokens.length === 0) {
    return { terms: [], keywordFound: false, occurrences: 0 }
  }

  const occurrenceIndices = []
  for (let i = 0; i <= tokens.length - keywordTokens.length; i += 1) {
    let matches = true
    for (let j = 0; j < keywordTokens.length; j += 1) {
      if (tokens[i + j] !== keywordTokens[j]) {
        matches = false
        break
      }
    }
    if (matches) occurrenceIndices.push(i)
  }

  if (occurrenceIndices.length === 0) {
    return { terms: [], keywordFound: false, occurrences: 0 }
  }

  const keywordSet = new Set(keywordTokens)
  const counts = new Map()

  for (const startIndex of occurrenceIndices) {
    const endIndex = startIndex + keywordTokens.length - 1
    const windowStart = Math.max(0, startIndex - windowSize)
    const windowEnd = Math.min(tokens.length - 1, endIndex + windowSize)

    for (let i = windowStart; i <= windowEnd; i += 1) {
      if (i >= startIndex && i <= endIndex) continue
      const token = tokens[i]
      if (STOP_WORDS.has(token) || keywordSet.has(token)) continue
      counts.set(token, (counts.get(token) || 0) + 1)
    }
  }

  const terms = [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return { terms, keywordFound: true, occurrences: occurrenceIndices.length }
}
