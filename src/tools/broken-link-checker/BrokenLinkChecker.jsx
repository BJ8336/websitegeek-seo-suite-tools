import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'
import { checkLinks } from '../../lib/linkFormatValidator'
import { rowsToCsv } from '../../lib/csv'
import { downloadTextFile } from '../../utils/downloadFile'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('broken-link-checker')
const FREE_ROW_LIMIT = 5

const CSV_COLUMNS = [
  { label: 'URL', value: (row) => row.url },
  { label: 'Well-formed', value: (row) => (row.isHealthy ? 'Yes' : 'No') },
  { label: 'Issues', value: (row) => row.issues.join('; ') },
]

function ResultRows({ rows }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <th className="p-3">URL</th>
          <th className="p-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((result, index) => (
          <tr key={index} className="border-b border-slate-100 last:border-b-0">
            <td className="max-w-md truncate p-3 font-mono text-slate-700">{result.url}</td>
            <td className="p-3">
              {result.isHealthy ? (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Well-formed
                </span>
              ) : (
                <span className="text-xs text-red-600">{result.issues.join(', ')}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BrokenLinkChecker() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()

  const { mode, results, total, healthy, flagged } = useMemo(() => checkLinks(debounced), [debounced])

  const isEmpty = debounced.trim().length === 0
  const noLinksFound = !isEmpty && total === 0

  const visibleRows = isPro ? results : results.slice(0, FREE_ROW_LIMIT)
  const lockedRows = isPro ? [] : results.slice(FREE_ROW_LIMIT)

  const handleExportCsv = () => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    downloadTextFile('link-health-check.csv', rowsToCsv(results, CSV_COLUMNS), 'text/csv')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Format check only.</strong> This cannot make live HTTP requests (that needs a server, to
        avoid browser CORS restrictions) — it flags malformed URLs, missing protocols, spaces, and
        suspicious TLDs. It cannot tell you whether a link actually returns 200 or 404.
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Paste a list of URLs or HTML containing links</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'https://websitegeek.net/\nhttps://example.com/page\n(or paste HTML with <a> tags)'}
          rows={8}
          className="mt-1 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste a URL list (one per line) or HTML source to check link formatting.
        </p>
      ) : noLinksFound ? (
        <p className="mt-4 text-sm text-amber-600">No links found in your input.</p>
      ) : (
        <>
          <p className="mt-4 text-xs text-slate-400">
            Detected input as {mode === 'html' ? 'HTML — extracted href values' : 'a plain URL list'}.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Total links" value={total} />
            <StatTile label="Well-formed" value={healthy} />
            <StatTile label="Flagged" value={flagged} />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {isPro ? 'Export CSV' : '🔒 Export CSV (Pro)'}
            </button>
          </div>

          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <ResultRows rows={visibleRows} />
          </div>

          {lockedRows.length > 0 && (
            <div className="mt-2">
              <LockedOverlay label={`Unlock ${lockedRows.length} more result${lockedRows.length === 1 ? '' : 's'} with Pro`}>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <ResultRows rows={lockedRows} />
                </div>
              </LockedOverlay>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BrokenLinkChecker
