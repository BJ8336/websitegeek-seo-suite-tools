import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { auditHreflang } from '../../lib/hreflangAudit'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('hreflang-checker')

function StatusBadge({ status }) {
  if (status === 'skip') return <span className="text-xs font-medium text-slate-400">—</span>
  if (status === 'pass') {
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pass</span>
  }
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Fail</span>
}

function HreflangChecker() {
  const [html, setHtml] = useState('')
  const [pageUrl, setPageUrl] = useState('')

  const debouncedHtml = useDebouncedValue(html, 200)
  const debouncedPageUrl = useDebouncedValue(pageUrl, 200)

  const result = useMemo(
    () => (debouncedHtml.trim() ? auditHreflang(debouncedHtml, { pageUrl: debouncedPageUrl }) : null),
    [debouncedHtml, debouncedPageUrl],
  )

  const isEmpty = debouncedHtml.trim().length === 0

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        Paste a page's HTML source — this reads <code className="font-mono">&lt;link rel="alternate"
        hreflang="..."&gt;</code> tags from the <code className="font-mono">&lt;head&gt;</code>. It doesn't
        fetch a live URL, and it can't verify that other-language pages return the matching hreflang back
        (reciprocal tags) — check that manually on each variant.
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">This page's own URL (optional, for the self-reference check)</span>
          <input
            type="text"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://example.com/en/page"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paste HTML source</span>
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            placeholder="Paste your page's <head> HTML here..."
            rows={10}
            className="mt-2 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste HTML to detect and validate hreflang alternate-language tags.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Checklist</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.checklist.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {result.rows.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Detected hreflang tags ({result.rows.length})</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Language / Region</th>
                      <th className="px-3 py-2">Href</th>
                      <th className="px-3 py-2">Valid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.index} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-2 font-mono text-slate-700">{row.hreflang || '(empty)'}</td>
                        <td className="max-w-xs truncate px-3 py-2 font-mono text-slate-600">{row.href || '(empty)'}</td>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Valid</span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HreflangChecker
