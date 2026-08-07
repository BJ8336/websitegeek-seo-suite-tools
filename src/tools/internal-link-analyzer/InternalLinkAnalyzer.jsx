import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'
import { analyzeLinks, extractLinksFromHtml } from '../../lib/linkAnalyzer'
import { rowsToCsv } from '../../lib/csv'
import { downloadTextFile } from '../../utils/downloadFile'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('internal-link-analyzer')
const FREE_ROW_LIMIT = 5

const TYPE_STYLES = {
  internal: 'bg-green-100 text-green-700',
  external: 'bg-blue-100 text-blue-700',
  other: 'bg-slate-100 text-slate-600',
  unknown: 'bg-amber-100 text-amber-700',
  invalid: 'bg-red-100 text-red-700',
}

const TYPE_LABELS = {
  internal: 'Internal',
  external: 'External',
  other: 'Other (mailto/tel/anchor)',
  unknown: 'Unknown (no domain set)',
  invalid: 'Invalid href',
}

const CSV_COLUMNS = [
  { label: 'Anchor text', value: (row) => row.text },
  { label: 'Href', value: (row) => row.href },
  { label: 'Type', value: (row) => TYPE_LABELS[row.type] },
  { label: 'Generic anchor', value: (row) => (row.isGeneric ? 'Yes' : 'No') },
]

function LinkRows({ rows }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <th className="p-3">Anchor text</th>
          <th className="p-3">Href</th>
          <th className="p-3">Type</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((link, index) => (
          <tr key={index} className="border-b border-slate-100 last:border-b-0">
            <td className="p-3">
              {link.isEmptyAnchor ? (
                <span className="italic text-red-500">(empty anchor text)</span>
              ) : (
                <span className={link.isGeneric ? 'text-red-600' : 'text-slate-800'}>
                  {link.text}
                  {link.isGeneric ? ' ⚠' : ''}
                </span>
              )}
            </td>
            <td className="max-w-xs truncate p-3 text-slate-500">{link.href || '(no href)'}</td>
            <td className="p-3">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[link.type]}`}>
                {TYPE_LABELS[link.type]}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function InternalLinkAnalyzer() {
  const [html, setHtml] = useState('')
  const [ownDomain, setOwnDomain] = useState('')
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()

  const debouncedHtml = useDebouncedValue(html, 150)
  const debouncedDomain = useDebouncedValue(ownDomain, 150)

  const links = useMemo(() => extractLinksFromHtml(debouncedHtml), [debouncedHtml])
  const { results, summary } = useMemo(
    () => analyzeLinks(links, debouncedDomain.trim()),
    [links, debouncedDomain],
  )

  const isEmpty = debouncedHtml.trim().length === 0
  const noLinksFound = !isEmpty && results.length === 0

  const visibleRows = isPro ? results : results.slice(0, FREE_ROW_LIMIT)
  const lockedRows = isPro ? [] : results.slice(FREE_ROW_LIMIT)

  const handleExportCsv = () => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    downloadTextFile('internal-link-matrix.csv', rowsToCsv(results, CSV_COLUMNS), 'text/csv')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Your domain (for internal vs. external)</span>
          <input
            type="text"
            value={ownDomain}
            onChange={(event) => setOwnDomain(event.target.value)}
            placeholder="websitegeek.net"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Paste HTML source</span>
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          placeholder="Paste HTML containing links..."
          rows={10}
          className="mt-1 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste HTML to classify its links as internal/external and flag generic anchor text.
        </p>
      ) : noLinksFound ? (
        <p className="mt-4 text-sm text-amber-600">No &lt;a&gt; tags found in your input.</p>
      ) : (
        <>
          {!debouncedDomain.trim() && (
            <p className="mt-4 text-sm text-amber-600">
              Enter your domain above to classify absolute links as internal or external — without it,
              they show as "unknown."
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Total links" value={summary.total} />
            <StatTile label="Internal" value={summary.internal} />
            <StatTile label="External" value={summary.external} />
            <StatTile label="Generic anchors" value={summary.genericAnchors} />
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
            <LinkRows rows={visibleRows} />
          </div>

          {lockedRows.length > 0 && (
            <div className="mt-2">
              <LockedOverlay label={`Unlock ${lockedRows.length} more link${lockedRows.length === 1 ? '' : 's'} with Pro`}>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <LinkRows rows={lockedRows} />
                </div>
              </LockedOverlay>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InternalLinkAnalyzer
