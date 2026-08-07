import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import CopyButton from '../../components/CopyButton'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { useUpgradeModal } from '../../context/UpgradeModalContext'
import { buildSitemapXml, parseUrlList } from '../../lib/sitemapGenerator'
import { downloadTextFile } from '../../utils/downloadFile'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('xml-sitemap-generator')
const CHANGEFREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
const FREE_URL_LIMIT = 5

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function XmlSitemapGenerator() {
  const [input, setInput] = useState('')
  const [includeLastmod, setIncludeLastmod] = useState(true)
  const [lastmod, setLastmod] = useState(todayIsoDate)
  const [includeChangefreq, setIncludeChangefreq] = useState(true)
  const [changefreq, setChangefreq] = useState('weekly')
  const [includePriority, setIncludePriority] = useState(true)
  const [priority, setPriority] = useState('0.5')
  const { isPro } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()

  const debounced = useDebouncedValue(input, 150)
  const { valid, rejected } = useMemo(() => parseUrlList(debounced), [debounced])

  const sitemapOptions = { includeLastmod, lastmod, includeChangefreq, changefreq, includePriority, priority }

  const fullXml = useMemo(
    () => (valid.length === 0 ? '' : buildSitemapXml(valid, sitemapOptions)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valid, includeLastmod, lastmod, includeChangefreq, changefreq, includePriority, priority],
  )
  const freePreviewXml = useMemo(
    () => (valid.length === 0 ? '' : buildSitemapXml(valid.slice(0, FREE_URL_LIMIT), sitemapOptions)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valid, includeLastmod, lastmod, includeChangefreq, changefreq, includePriority, priority],
  )

  const isOverFreeLimit = valid.length > FREE_URL_LIMIT
  const showFullXml = isPro || !isOverFreeLimit

  const isEmpty = debounced.trim().length === 0

  const handleDownload = () => {
    if (!isPro) {
      openUpgradeModal()
      return
    }
    downloadTextFile('sitemap.xml', fullXml, 'application/xml')
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <label className="block">
        <span className="text-sm font-medium text-slate-700">URLs (one per line, or comma-separated)</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={'https://websitegeek.net/\nhttps://websitegeek.net/blog\nhttps://websitegeek.net/about'}
          rows={8}
          className="mt-1 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste a list of URLs to generate an XML sitemap. Each must include http:// or https:// and
          contain no spaces.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Valid URLs" value={valid.length} />
            <StatTile label="Rejected" value={rejected.length} />
          </div>

          {rejected.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejected lines</p>
              <ul className="mt-1 space-y-1 text-sm text-red-700">
                {rejected.map((item, index) => (
                  <li key={index}>
                    <span className="font-mono">{item.line}</span> — {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeLastmod}
                onChange={(e) => setIncludeLastmod(e.target.checked)}
              />
              Include lastmod
            </label>
            <input
              type="date"
              value={lastmod}
              onChange={(e) => setLastmod(e.target.value)}
              disabled={!includeLastmod}
              className="rounded-md border border-slate-300 p-2 text-sm disabled:opacity-50"
            />
            <span />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeChangefreq}
                onChange={(e) => setIncludeChangefreq(e.target.checked)}
              />
              Include changefreq
            </label>
            <select
              value={changefreq}
              onChange={(e) => setChangefreq(e.target.value)}
              disabled={!includeChangefreq}
              className="rounded-md border border-slate-300 p-2 text-sm disabled:opacity-50"
            >
              {CHANGEFREQ_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includePriority}
                onChange={(e) => setIncludePriority(e.target.checked)}
              />
              Include priority
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={!includePriority}
              className="rounded-md border border-slate-300 p-2 text-sm disabled:opacity-50"
            />
          </div>

          {valid.length > 0 && (
            <>
              {isOverFreeLimit && !isPro && (
                <p className="mt-4 text-sm text-amber-600">
                  Showing a complete sitemap for the first {FREE_URL_LIMIT} URLs — upgrade to Pro for all{' '}
                  {valid.length}.
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {isPro ? 'Download sitemap.xml' : '🔒 Download sitemap.xml (Pro)'}
                </button>
              </div>

              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    sitemap.xml {showFullXml ? '' : `(preview — first ${FREE_URL_LIMIT} URLs)`}
                  </p>
                  <CopyButton getText={() => (showFullXml ? fullXml : freePreviewXml)} />
                </div>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                  {showFullXml ? fullXml : freePreviewXml}
                </pre>
              </div>

              {!showFullXml && (
                <div className="mt-2">
                  <LockedOverlay label={`Unlock the complete sitemap (${valid.length} URLs) with Pro`}>
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                      {fullXml}
                    </pre>
                  </LockedOverlay>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default XmlSitemapGenerator
