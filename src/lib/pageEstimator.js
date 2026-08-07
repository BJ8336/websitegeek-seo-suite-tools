const HIGH_ELEMENT_THRESHOLD = 1500

export function estimatePage(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const totalElements = doc.querySelectorAll('*').length
    const visibleText = doc.body ? doc.body.textContent.replace(/\s+/g, ' ').trim() : ''
    const textLength = visibleText.length
    const codeLength = html.length
    const textToCodeRatio = codeLength === 0 ? 0 : (textLength / codeLength) * 100

    const images = [...doc.querySelectorAll('img')]
    const imagesTotal = images.length
    const missingAlt = images
      .filter((img) => {
        const alt = img.getAttribute('alt')
        return alt === null || alt.trim().length === 0
      })
      .map((img) => img.getAttribute('src') || '(no src)')
    const imagesWithAlt = imagesTotal - missingAlt.length
    const altCompleteness = imagesTotal === 0 ? 100 : (imagesWithAlt / imagesTotal) * 100

    return {
      totalElements,
      isHighElementCount: totalElements > HIGH_ELEMENT_THRESHOLD,
      textLength,
      codeLength,
      textToCodeRatio,
      imagesTotal,
      imagesWithAlt,
      missingAlt,
      altCompleteness,
    }
  } catch {
    return null
  }
}

export { HIGH_ELEMENT_THRESHOLD }
