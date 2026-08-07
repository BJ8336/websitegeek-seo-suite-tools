// File downloads require the DOM (creating and clicking an <a> element), so
// this lives outside /lib, which stays DOM-free. Shared across any tool that
// offers a Pro-gated export/download.
export function downloadTextFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
