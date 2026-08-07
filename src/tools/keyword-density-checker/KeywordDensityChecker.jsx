import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { analyzeKeywordDensity } from '../../lib/keywordDensity'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('keyword-density-checker')
const DEFAULT_THRESHOLD = 3
const FREE_ROW_LIMIT = 5

function parseThreshold(raw) {
  const parsed = parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD
}

function TermRows({ rows }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-slate-500">
          <th className="pb-2">Term</th>
          <th className="pb-2">Count</th>
          <th className="pb-2">Density</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.term} className={`border-t border-slate-100 ${row.isStuffed ? 'bg-red-50' : ''}`}>
            <td className="py-1.5 pr-2 text-slate-900">{row.term}</td>
            <td className="py-1.5 pr-2 text-slate-600">{row.count}</td>
            <td className={`py-1.5 font-medium ${row.isStuffed ? 'text-red-700' : 'text-slate-600'}`}>
              {row.percentage.toFixed(1)}%{row.isStuffed ? ' ⚠ over threshold' : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TermTable({ title, rows, emptyMessage, isPro }) {
  const visibleRows = isPro ? rows : rows.slice(0, FREE_ROW_LIMIT)
  const lockedRows = isPro ? [] : rows.slice(FREE_ROW_LIMIT)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <>
          <TermRows rows={visibleRows} />
          {lockedRows.length > 0 && (
            <div className="mt-2">
              <LockedOverlay label={`Unlock ${lockedRows.length} more term${lockedRows.length === 1 ? '' : 's'} with Pro`}>
                <TermRows rows={lockedRows} />
              </LockedOverlay>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KeywordDensityChecker() {
  const [input, setInput] = useState('')
  const [thresholdInput, setThresholdInput] = useState(String(DEFAULT_THRESHOLD))
  const debounced = useDebouncedValue(input, 150)
  const threshold = parseThreshold(thresholdInput)
  const { isPro } = useSubscription()

  const analysis = useMemo(() => analyzeKeywordDensity(debounced, { threshold }), [debounced, threshold])

  const isEmpty = debounced.length === 0
  const hasNoTokens = !isEmpty && analysis.totalWords === 0
  const allStopWords = !isEmpty && analysis.totalWords > 0 && !analysis.hasContent

  return (
    <div>
      <ToolHeader tool={tool} />

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste your page content here..."
        rows={10}
        className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
      />

      <div className="mt-3 flex items-center gap-2">
        <label htmlFor="stuffing-threshold" className="text-sm text-slate-600">
          Flag terms above
        </label>
        <input
          id="stuffing-threshold"
          type="number"
          min="0.1"
          step="0.1"
          value={thresholdInput}
          onChange={(event) => setThresholdInput(event.target.value)}
          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
        />
        <span className="text-sm text-slate-600">% density</span>
      </div>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste content to estimate keyword density for single words and two-word phrases.
        </p>
      ) : hasNoTokens ? (
        <p className="mt-4 text-sm text-amber-600">
          No valid words found — your input only contains whitespace or symbols.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Total words" value={analysis.totalWords.toLocaleString()} />
          </div>

          {allStopWords && (
            <p className="mt-4 text-sm text-amber-600">
              Every word in this text is a common stop word (e.g. "the", "and", "of") — nothing
              meaningful left to analyze.
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TermTable
              title="Single-word density"
              rows={analysis.singleWords}
              emptyMessage="No countable single-word terms."
              isPro={isPro}
            />
            <TermTable
              title="Two-word phrase density"
              rows={analysis.phrases}
              emptyMessage="No countable two-word phrases."
              isPro={isPro}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default KeywordDensityChecker
