// Canvas-based text measurement is inherently a browser API, so it lives
// here rather than in /lib (which stays DOM-free). Duplicated (rather than
// imported) from the Meta & Snippet Optimizer tool's copy, to keep each
// tool folder self-contained per this project's convention.
let sharedCanvas

function getContext() {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas')
  }
  return sharedCanvas.getContext('2d')
}

export function createPixelMeasurer(font) {
  return (text) => {
    const ctx = getContext()
    if (!ctx) return text.length * 8 // no canvas support — rough fallback so the UI doesn't crash
    ctx.font = font
    return ctx.measureText(text).width
  }
}
