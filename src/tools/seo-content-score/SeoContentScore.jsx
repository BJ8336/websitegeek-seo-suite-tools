import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { analyzeContentScore } from '../../lib/contentScore'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('seo-content-score')

const STATUS_STYLES = {
  pass: { icon: '✓', badge: 'bg-green-100 text-green-700', row: 'border-slate-200' },
  warn: { icon: '!', badge: 'bg-amber-100 text-amber-700', row: 'border-slate-200' },
  fail: { icon: '✕', badge: 'bg-red-100 text-red-700', row: 'border-slate-200' },
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
        <p className="text-sm text-slate-500">SEO Content Score</p>
      </div>
    </div>
  )
}

function ResultsPanel({ result }) {
  const colors = scoreColor(result.score)
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border border-slate-200 p-5 ${colors.bg}`}>
        <ScoreRing score={result.score} />
      </div>
      <div className="space-y-2">
        {result.checks.map((check) => {
          const style = STATUS_STYLES[check.status]
          return (
            <div key={check.id} className={`flex gap-3 rounded-lg border bg-white p-3 ${style.row}`}>
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

function SeoContentScore() {
  const [title, setTitle] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [content, setContent] = useState('')
  const { isPro } = useSubscription()

  const debouncedTitle = useDebouncedValue(title, 150)
  const debouncedKeyword = useDebouncedValue(focusKeyword, 150)
  const debouncedContent = useDebouncedValue(content, 150)

  const result = useMemo(() => {
    if (!debouncedContent.trim()) return null
    return analyzeContentScore({ title: debouncedTitle, focusKeyword: debouncedKeyword, content: debouncedContent })
  }, [debouncedTitle, debouncedKeyword, debouncedContent])

  const isEmpty = !debouncedContent.trim()

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Structural &amp; on-page score only.</strong> This checks your content against SEO
        best practices — keyword placement, headings, readability, length, links. It does not
        compare against live competitor rankings, which needs real-time search data this app
        doesn't have access to.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title (optional)</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Your page title"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Focus keyword (1-2 words)</span>
          <input
            type="text"
            value={focusKeyword}
            onChange={(event) => setFocusKeyword(event.target.value)}
            placeholder="e.g. seo tools"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Content</span>
        <p className="text-xs text-slate-500">
          Paste plain text, HTML, or markdown-style ("#") headings — heading and link checks only
          run when they're detected.
        </p>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Paste your article or page content here..."
          rows={10}
          className="mt-1 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste your content to get a consolidated SEO score and checklist.
        </p>
      ) : isPro ? (
        <div className="mt-4">
          <ResultsPanel result={result} />
        </div>
      ) : (
        <div className="mt-4">
          <LockedOverlay label="Unlock your SEO Content Score with Pro">
            <ResultsPanel result={result} />
          </LockedOverlay>
        </div>
      )}
    </div>
  )
}

export default SeoContentScore
