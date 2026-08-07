const WORD_PATTERN = /[\p{L}\p{N}'-]+/gu
const SENTENCE_START_PATTERN = /(^\s*[\p{L}])|([.!?]+\s+[\p{L}])/gu

export function toLowerCase(text) {
  return text.toLowerCase()
}

export function toUpperCase(text) {
  return text.toUpperCase()
}

export function toSentenceCase(text) {
  const lower = text.toLowerCase()
  return lower.replace(SENTENCE_START_PATTERN, (match) => match.toUpperCase())
}

export function toTitleCase(text) {
  return text.toLowerCase().replace(WORD_PATTERN, (word) => word.charAt(0).toUpperCase() + word.slice(1))
}

export function hasLetters(text) {
  return /\p{L}/u.test(text)
}
