import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useSubscription } from '../../context/SubscriptionContext'
import { useAuth } from '../../context/AuthContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'
import { apiRequest, AuthRequiredError, ApiError } from '../../lib/apiClient'
import { extractPageMeta } from '../../lib/pageMeta'
import { analyzeContentScore } from '../../lib/contentScore'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('competitor-page-auditor')

const ERROR_MESSAGES = {
  pro_required: 'This tool requires Pro.',
  too_large: "That page is too large to audit (2MB limit) — try a different URL.",
  not_html: "That URL didn't return an HTML page.",
  timeout: 'The page took too long to respond — try again.',
  fetch_failed: "Couldn't reach that URL — check it's correct and publicly accessible.",
  blocked_host: 'That URL points at a private/internal address and can\'t be fetched.',
  invalid_url: 'Enter a valid URL, e.g. https://example.com/page',
  invalid_protocol: 'Only http:// and https:// URLs are supported.',
  missing_url: 'Enter a URL to audit.',
}

function scoreColor(score) {
  if (score >= 80) return { text: 'text-green-600', ring: 'stroke-green-500', bg: 'bg-green-50' }
  if (score >= 50) return { text: 'text-amber-600', ring: 'stroke-amber-500', bg: 'bg-amber-50' }
  return { text: 'text-red-600', ring: 'stroke-red-500', bg: 'bg-red-50' }
}

function ScoreRing({ score }) {
  const colors = scoreColor(score)
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - score / 100)
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colors.ring}
        />
      </svg>
      <div>
        <p className={`text-3xl font-bold ${colors.text}`}>{score}</p>
        <p className="text-sm text-slate-500">On-Page SEO Score</p>
      </div>
    </div>
  )
}

const STATUS_STYLES = {
  pass: { icon: '✓', badge: 'bg-green-100 text-green-700' },
  warn: { icon: '!', badge: 'bg-amber-100 text-amber-700' },
  fail: { icon: '✕', badge: 'bg-red-100 text-red-700' },
}

function MetaRow({ label, value, charLimit }) {
  const length = value.length
  const over = charLimit && length > charLimit
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {charLimit ? (
          <p className={`text-xs font-semibold ${over ? 'text-red-600' : 'text-slate-500'}`}>
            {length} / {charLimit} chars
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-900">{value || <span className="text-slate-400">Not found</span>}</p>
    </div>
  )
}

function ResultsPanel({ meta, finalUrl, result }) {
  const colors = scoreColor(result.score)
  return (
    <div className="mt-6 space-y-4">
      <p className="break-all text-xs text-slate-500">Fetched: {finalUrl}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetaRow label="Title tag" value={meta.title} charLimit={60} />
        <MetaRow label="Meta description" value={meta.description} charLimit={160} />
        <MetaRow label="H1" value={meta.h1} />
        <MetaRow label="Canonical URL" value={meta.canonical} />
      </div>

      <div className={`rounded-xl border border-slate-200 p-5 ${colors.bg}`}>
        <ScoreRing score={result.score} />
      </div>
      <div className="space-y-2">
        {result.checks.map((check) => {
          const style = STATUS_STYLES[check.status]
          return (
            <div key={check.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}>
                {style.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{check.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{check.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompetitorPageAuditor() {
  const { isPro } = useSubscription()
  const { getFreshIdToken } = useAuth()
  const { openUpgradeModal } = useUpgradeModal()
  const [url, setUrl] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [state, setState] = useState({ status: 'idle' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return

    setState({ status: 'loading' })
    try {
      const data = await apiRequest('/api/fetch-page', {
        method: 'POST',
        body: { url: trimmedUrl },
        getFreshIdToken,
      })
      const meta = extractPageMeta(data.html)
      const result = analyzeContentScore({ title: meta.title, focusKeyword, content: data.html })
      setState({ status: 'success', meta, result, finalUrl: data.finalUrl })
    } catch (err) {
      let message = "Couldn't audit that page — please try again."
      if (err instanceof AuthRequiredError) {
        message = 'Please sign in again to continue.'
      } else if (err instanceof ApiError) {
        message = ERROR_MESSAGES[err.code] || message
      }
      setState({ status: 'error', message })
    }
  }

  if (!isPro) {
    return (
      <div>
        <ToolHeader tool={tool} />
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">This is a Pro tool</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Fetch any public competitor page and run the same on-page SEO analysis your other
            tools do — title/meta checks, heading structure, readability, content length, links.
          </p>
          <button
            type="button"
            onClick={openUpgradeModal}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Get Pro — $39 one-time
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>On-page SEO audit, not traffic/ranking data.</strong> This fetches a page's public
        HTML and checks it against the same on-page SEO best practices as the SEO Content
        Score tool — it doesn't have access to a competitor's real traffic, backlinks, or ad
        spend (nothing free does).
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://competitor.com/some-page"
          required
          className="rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          value={focusKeyword}
          onChange={(event) => setFocusKeyword(event.target.value)}
          placeholder="Focus keyword (optional)"
          className="rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {state.status === 'loading' ? 'Fetching…' : 'Audit page'}
        </button>
      </form>

      {state.status === 'error' && <p className="mt-4 text-sm text-red-600">{state.message}</p>}

      {state.status === 'success' && (
        <ResultsPanel meta={state.meta} finalUrl={state.finalUrl} result={state.result} />
      )}
    </div>
  )
}

export default CompetitorPageAuditor
