import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import LockedOverlay from '../../components/LockedOverlay'
import { useSubscription } from '../../context/SubscriptionContext'
import { useAuth } from '../../context/AuthContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { apiRequest, AuthRequiredError, ApiError } from '../../lib/apiClient'
import { parseColor, contrastRatio, rateContrast, auditAccessibility } from '../../lib/accessibilityAudit'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('accessibility-contrast-checker')

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-700',
  serious: 'bg-amber-100 text-amber-700',
  moderate: 'bg-slate-100 text-slate-600',
}

function PassBadge({ status }) {
  if (status === 'skip') return <span className="text-xs font-medium text-slate-400">—</span>
  if (status === 'pass') {
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pass</span>
  }
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Fail</span>
}

function ChecklistItem({ item, showSeverity }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900">{item.label}</span>
          {showSeverity && item.status === 'fail' && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${SEVERITY_STYLES[item.severity]}`}>
              {item.severity}
            </span>
          )}
        </div>
        <PassBadge status={item.status} />
      </div>
      <p className="text-xs text-slate-500">{item.detail}</p>
      {item.items.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-xs text-slate-500">
          {item.items.slice(0, 8).map((line, i) => (
            <li key={i} className="truncate font-mono">{line}</li>
          ))}
          {item.items.length > 8 && <li>…and {item.items.length - 8} more</li>}
        </ul>
      )}
    </div>
  )
}

function ManualContrastChecker() {
  const [fg, setFg] = useState('#1f2937')
  const [bg, setBg] = useState('#ffffff')
  const [textSize, setTextSize] = useState('normal')

  const result = useMemo(() => {
    const fgColor = parseColor(fg)
    const bgColor = parseColor(bg)
    if (!fgColor || !bgColor) return null
    return rateContrast(contrastRatio(fgColor, bgColor), textSize)
  }, [fg, bg, textSize])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-3 text-sm font-medium text-slate-700">Manual contrast checker</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Text color</span>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-9 rounded border border-slate-300" />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Background color</span>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-9 rounded border border-slate-300" />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Text size</span>
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="normal">Normal text</option>
            <option value="large">Large text (18pt+/14pt bold+)</option>
          </select>
        </label>
      </div>

      <div
        className="mt-4 rounded-lg border border-slate-200 p-6 text-center text-lg font-semibold"
        style={{ color: fg, backgroundColor: bg }}
      >
        Sample text on this background
      </div>

      {result ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold text-slate-900">{result.ratio}:1</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.passesAA ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {result.passesAA ? 'Passes' : 'Fails'} WCAG AA
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.passesAAA ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {result.passesAAA ? 'Passes' : 'Fails'} WCAG AAA
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-red-600">Enter valid colors (hex, e.g. #333333) to check contrast.</p>
      )}
    </div>
  )
}

function AccessibilityContrastChecker() {
  const { isPro } = useSubscription()
  const { getFreshIdToken } = useAuth()
  const { openUpgradeModal } = useUpgradeModal()
  const [mode, setMode] = useState('paste')
  const [html, setHtml] = useState('')
  const [url, setUrl] = useState('')
  const [fetchState, setFetchState] = useState({ status: 'idle' })

  const debouncedHtml = useDebouncedValue(html, 200)
  const source = mode === 'url' && fetchState.status === 'success' ? fetchState.html : debouncedHtml

  const result = useMemo(() => (source.trim() ? auditAccessibility(source) : null), [source])

  const handleFetchUrl = async (event) => {
    event.preventDefault()
    if (!url.trim()) return
    setFetchState({ status: 'loading' })
    try {
      const data = await apiRequest('/api/fetch-page', {
        method: 'POST',
        body: { url: url.trim() },
        getFreshIdToken,
      })
      setFetchState({ status: 'success', html: data.html, finalUrl: data.finalUrl })
    } catch (err) {
      let message = "Couldn't fetch that page — please try again."
      if (err instanceof AuthRequiredError) message = 'Please sign in again to continue.'
      else if (err instanceof ApiError) {
        const messages = {
          pro_required: 'This requires Pro.',
          too_large: 'That page is too large to audit (2MB limit).',
          not_html: "That URL didn't return an HTML page.",
          timeout: 'The page took too long to respond.',
          blocked_host: "That URL can't be fetched.",
          invalid_url: 'Enter a valid URL, e.g. https://example.com',
        }
        message = messages[err.code] || message
      }
      setFetchState({ status: 'error', message })
    }
  }

  const basicItems = result ? result.checklist.filter((i) => ['alt-text', 'heading-structure'].includes(i.id)) : []
  const advancedItems = result ? result.checklist.filter((i) => !['alt-text', 'heading-structure'].includes(i.id)) : []

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Structural, best-effort checks — not a full audit.</strong> This can only see inline
        styles and markup, not colors/layout from a linked stylesheet or content rendered by
        JavaScript. It's a strong first pass, not a replacement for a real WCAG 2.2 conformance
        review before claiming compliance.
      </div>

      <ManualContrastChecker />

      <div className="mt-8">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === 'paste' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Paste HTML
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Audit a live URL {!isPro && '(Pro)'}
          </button>
        </div>

        {mode === 'paste' ? (
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            placeholder="Paste page HTML here..."
            rows={8}
            className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        ) : !isPro ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Live URL auditing is a Pro feature</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Fetch and audit any public page directly instead of copy-pasting its HTML.
            </p>
            <button
              type="button"
              onClick={openUpgradeModal}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get Pro — $39 one-time
            </button>
          </div>
        ) : (
          <form onSubmit={handleFetchUrl} className="flex flex-wrap gap-3">
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/page"
              required
              className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={fetchState.status === 'loading'}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {fetchState.status === 'loading' ? 'Fetching…' : 'Audit page'}
            </button>
          </form>
        )}

        {fetchState.status === 'error' && <p className="mt-3 text-sm text-red-600">{fetchState.message}</p>}

        {!result ? (
          <p className="mt-4 text-sm text-slate-500">
            {mode === 'paste' ? 'Paste HTML to run the checks.' : 'Enter a URL to run the checks.'}
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Basic checks</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {basicItems.map((item) => (
                  <ChecklistItem key={item.id} item={item} showSeverity={false} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Full WCAG 2.2 checklist</p>
              {isPro ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {advancedItems.map((item) => (
                    <ChecklistItem key={item.id} item={item} showSeverity />
                  ))}
                </div>
              ) : (
                <LockedOverlay label="Unlock the full WCAG 2.2 checklist with severity levels — Pro">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {advancedItems.map((item) => (
                      <ChecklistItem key={item.id} item={item} showSeverity />
                    ))}
                  </div>
                </LockedOverlay>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccessibilityContrastChecker
