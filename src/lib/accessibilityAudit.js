import { parseHtmlHeadings, auditHeadings } from './headingAudit'
import { estimatePage } from './pageEstimator'
import { extractLinksFromHtml } from './linkAnalyzer'

// --- WCAG contrast math (relative luminance / contrast ratio, per spec) ---

function srgbToLinear(channel) {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

export function parseColor(value) {
  if (!value) return null
  const trimmed = value.trim().toLowerCase()

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (hexMatch) {
    const hex = hexMatch[1]
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
    const num = parseInt(full, 16)
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) }
  }

  return null
}

export function contrastRatio(color1, color2) {
  const l1 = relativeLuminance(color1)
  const l2 = relativeLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export const WCAG_THRESHOLDS = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
}

export function rateContrast(ratio, textSize = 'normal') {
  const thresholds = WCAG_THRESHOLDS[textSize]
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= thresholds.AA,
    passesAAA: ratio >= thresholds.AAA,
  }
}

// Best-effort scan: only elements with BOTH `color` and `background`/
// `background-color` declared on the same inline style attribute, since
// that's the only case where the actual rendered contrast can be known
// without a live CSS cascade — colors set via a stylesheet or inherited
// from a parent aren't visible to a paste-in HTML tool.
function parseInlineDeclarations(styleAttr) {
  const declarations = {}
  for (const part of styleAttr.split(';')) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const prop = part.slice(0, idx).trim().toLowerCase()
    const val = part.slice(idx + 1).trim()
    if (prop) declarations[prop] = val
  }
  return declarations
}

export function scanInlineContrast(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const findings = []
    for (const el of doc.querySelectorAll('[style]')) {
      const decl = parseInlineDeclarations(el.getAttribute('style') || '')
      const fg = parseColor(decl.color)
      const bg = parseColor(decl['background-color'] || decl.background)
      if (!fg || !bg) continue
      const text = el.textContent.trim()
      if (!text) continue

      const rated = rateContrast(contrastRatio(fg, bg), 'normal')
      findings.push({
        tag: el.tagName.toLowerCase(),
        snippet: text.length > 40 ? `${text.slice(0, 40)}…` : text,
        ...rated,
      })
    }
    return findings
  } catch {
    return []
  }
}

const LABELABLE_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select'

function findUnlabeledFormFields(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const fields = [...doc.querySelectorAll(LABELABLE_SELECTOR)]
    return fields
      .filter((field) => {
        const id = field.getAttribute('id')
        const hasFor = id && doc.querySelector(`label[for="${CSS.escape(id)}"]`)
        const wrappedInLabel = field.closest('label')
        const hasAriaLabel = field.getAttribute('aria-label')?.trim()
        const hasAriaLabelledby = field.getAttribute('aria-labelledby')?.trim()
        return !hasFor && !wrappedInLabel && !hasAriaLabel && !hasAriaLabelledby
      })
      .map((field) => ({
        tag: field.tagName.toLowerCase(),
        type: field.getAttribute('type') || field.tagName.toLowerCase(),
        name: field.getAttribute('name') || field.getAttribute('id') || '(unnamed)',
      }))
  } catch {
    return []
  }
}

function findUnnamedInteractiveElements(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const elements = [...doc.querySelectorAll('a[href], button')]
    return elements
      .filter((el) => {
        const text = el.textContent.trim()
        const hasAriaLabel = el.getAttribute('aria-label')?.trim()
        const hasAriaLabelledby = el.getAttribute('aria-labelledby')?.trim()
        const hasImgAlt = [...el.querySelectorAll('img')].some((img) => img.getAttribute('alt')?.trim())
        return !text && !hasAriaLabel && !hasAriaLabelledby && !hasImgAlt
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href') || null,
      }))
  } catch {
    return []
  }
}

function looksLikeFullDocument(html) {
  return /<!doctype/i.test(html) || /<html[\s>]/i.test(html)
}

function getDocumentMeta(html) {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return {
      lang: doc.documentElement.getAttribute('lang'),
      title: doc.querySelector('title')?.textContent.trim() || '',
    }
  } catch {
    return { lang: null, title: '' }
  }
}

/**
 * Consolidates image alt-text (pageEstimator), heading structure
 * (headingAudit), and link-text (linkAnalyzer) checks already built for
 * other tools with new accessibility-specific checks (form labels, unnamed
 * interactive elements, document lang/title, inline-style contrast) into
 * one severity-rated checklist. Structural/best-effort only — this can't
 * see CSS from a linked stylesheet or JS-rendered content, same limitation
 * as every other paste-in-HTML tool in this suite.
 */
export function auditAccessibility(html) {
  const pageStats = estimatePage(html)
  const headings = parseHtmlHeadings(html)
  const { issues: headingIssues } = auditHeadings(headings)
  const links = extractLinksFromHtml(html)
  const emptyLinks = links.filter((l) => l.text.trim().length === 0)
  const unlabeledFields = findUnlabeledFormFields(html)
  const unnamedInteractive = findUnnamedInteractiveElements(html)
  const contrastFindings = scanInlineContrast(html)
  const failingContrast = contrastFindings.filter((f) => !f.passesAA)
  const isFullDocument = looksLikeFullDocument(html)
  const { lang, title } = getDocumentMeta(html)

  const checklist = [
    {
      id: 'alt-text',
      label: 'Images have alt text',
      severity: 'critical',
      status: !pageStats || pageStats.imagesTotal === 0 ? 'skip' : pageStats.missingAlt.length === 0 ? 'pass' : 'fail',
      detail: !pageStats || pageStats.imagesTotal === 0
        ? 'No images found.'
        : `${pageStats.imagesWithAlt} of ${pageStats.imagesTotal} images have alt text.`,
      items: pageStats?.missingAlt || [],
    },
    {
      id: 'form-labels',
      label: 'Form fields have labels',
      severity: 'critical',
      status: unlabeledFields.length === 0 ? 'pass' : 'fail',
      detail: unlabeledFields.length === 0
        ? 'All form fields have an associated label.'
        : `${unlabeledFields.length} field${unlabeledFields.length === 1 ? '' : 's'} missing a label, aria-label, or aria-labelledby.`,
      items: unlabeledFields.map((f) => `<${f.tag}${f.type ? ` type="${f.type}"` : ''}> "${f.name}"`),
    },
    {
      id: 'interactive-names',
      label: 'Links and buttons have accessible names',
      severity: 'critical',
      status: unnamedInteractive.length === 0 && emptyLinks.length === 0 ? 'pass' : 'fail',
      detail: unnamedInteractive.length === 0
        ? 'All links and buttons have discernible text.'
        : `${unnamedInteractive.length} link${unnamedInteractive.length === 1 ? '' : 's'}/button${unnamedInteractive.length === 1 ? '' : 's'} with no text, aria-label, or labeled image.`,
      items: unnamedInteractive.map((el) => `<${el.tag}>${el.href ? ` href="${el.href}"` : ''}`),
    },
    {
      id: 'heading-structure',
      label: 'Heading structure is logical',
      severity: 'serious',
      status: headings.length === 0 ? 'skip' : headingIssues.length === 0 ? 'pass' : 'fail',
      detail: headings.length === 0
        ? 'No headings detected.'
        : headingIssues.length === 0
          ? 'No missing H1, duplicate H1s, or skipped levels.'
          : headingIssues.map((i) => i.message).join(' '),
      items: [],
    },
    {
      id: 'contrast',
      label: 'Inline text/background color pairs meet AA contrast',
      severity: 'serious',
      status: contrastFindings.length === 0 ? 'skip' : failingContrast.length === 0 ? 'pass' : 'fail',
      detail: contrastFindings.length === 0
        ? 'No elements with both an inline text color and background color to check — most contrast comes from stylesheets, which this tool can\'t see (use the manual checker above for those).'
        : failingContrast.length === 0
          ? `All ${contrastFindings.length} inline-styled element(s) checked pass AA contrast.`
          : `${failingContrast.length} of ${contrastFindings.length} inline-styled element(s) fail AA contrast (below 4.5:1).`,
      items: failingContrast.map((f) => `<${f.tag}> "${f.snippet}" — ${f.ratio}:1`),
    },
    {
      id: 'lang-attribute',
      label: 'Page declares a language',
      severity: 'moderate',
      status: !isFullDocument ? 'skip' : lang ? 'pass' : 'fail',
      detail: !isFullDocument
        ? 'Paste a full page (with <html>) to check this.'
        : lang
          ? `Declared as "${lang}".`
          : 'No lang attribute on <html> — screen readers may mispronounce content.',
      items: [],
    },
    {
      id: 'page-title',
      label: 'Page has a descriptive title',
      severity: 'moderate',
      status: !isFullDocument ? 'skip' : title ? 'pass' : 'fail',
      detail: !isFullDocument
        ? 'Paste a full page (with <html>) to check this.'
        : title
          ? `"${title}"`
          : 'No <title> found.',
      items: [],
    },
  ]

  return { checklist, pageStats, headingIssues }
}
