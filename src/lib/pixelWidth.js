/**
 * Truncates text to fit within maxWidth using a caller-supplied measureFn
 * (text: string) => number, so this stays DOM-free and unit-testable with a
 * fake measurer — the real measurer (canvas measureText) lives with the tool
 * that needs it, not here.
 */
export function truncateToPixelWidth(text, maxWidth, measureFn) {
  if (text === '') {
    return { text: '', width: 0, truncated: false }
  }

  const fullWidth = measureFn(text)
  if (fullWidth <= maxWidth) {
    return { text, width: fullWidth, truncated: false }
  }

  let low = 0
  let high = text.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const candidate = `${text.slice(0, mid).trimEnd()}…`
    if (measureFn(candidate) <= maxWidth) {
      low = mid
    } else {
      high = mid - 1
    }
  }

  const truncatedText = low === 0 ? '…' : `${text.slice(0, low).trimEnd()}…`
  return { text: truncatedText, width: measureFn(truncatedText), truncated: true }
}
