// Matches candidate word chunks, then callers filter out chunks with no
// actual letter/number (e.g. a bare "---" or "'''" shouldn't count as a word).
const WORD_CHUNK_PATTERN = /[\p{L}\p{N}'-]+/gu
const HAS_LETTER_OR_NUMBER = /[\p{L}\p{N}]/u

export function countCharacters(text) {
  const total = text.length
  const withoutSpaces = text.replace(/\s/g, '').length
  return { total, withoutSpaces }
}

export function countWords(text) {
  const chunks = text.match(WORD_CHUNK_PATTERN) || []
  const words = chunks.filter((chunk) => HAS_LETTER_OR_NUMBER.test(chunk))
  return { count: words.length, words }
}

export function countLines(text) {
  if (text === '') {
    return { total: 0, nonBlank: 0 }
  }
  const lines = text.split(/\r\n|\r|\n/)
  const nonBlank = lines.filter((line) => line.trim().length > 0).length
  return { total: lines.length, nonBlank }
}
