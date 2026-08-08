import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { truncateToPixelWidth } from '../../lib/pixelWidth'
import { extractDomain, extractPath } from '../../lib/urlHelpers'
import { getToolBySlug } from '../../data/toolsConfig'
import { createPixelMeasurer } from './canvasTextMeasurer'
import SerpResultCard from './SerpResultCard'

const tool = getToolBySlug('serp-simulator')

const TITLE_FONT = '400 20px Arial, sans-serif'
const TITLE_MAX_WIDTH = 600
const DESCRIPTION_FONT = '400 14px Arial, sans-serif'
const DESCRIPTION_MAX_WIDTH = 920

const measureTitle = createPixelMeasurer(TITLE_FONT)
const measureDescription = createPixelMeasurer(DESCRIPTION_FONT)

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function SerpSimulator() {
  const [pageUrl, setPageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [device, setDevice] = useState('desktop')

  const debouncedTitle = useDebouncedValue(title, 150)
  const debouncedDescription = useDebouncedValue(description, 150)
  const debouncedUrl = useDebouncedValue(pageUrl, 150)

  const normalizedTitle = useMemo(() => normalize(debouncedTitle), [debouncedTitle])
  const normalizedDescription = useMemo(() => normalize(debouncedDescription), [debouncedDescription])

  const domain = useMemo(() => extractDomain(debouncedUrl), [debouncedUrl])
  const path = useMemo(() => extractPath(debouncedUrl), [debouncedUrl])

  const desktopTitle = useMemo(
    () => truncateToPixelWidth(normalizedTitle, TITLE_MAX_WIDTH, measureTitle).text,
    [normalizedTitle],
  )
  const desktopDescription = useMemo(
    () => truncateToPixelWidth(normalizedDescription, DESCRIPTION_MAX_WIDTH, measureDescription).text,
    [normalizedDescription],
  )

  const isEmpty = normalizedTitle === '' && normalizedDescription === ''

  const previewTitle = (device === 'desktop' ? desktopTitle : normalizedTitle) || '(Your title will appear here)'
  const previewDescription =
    (device === 'desktop' ? desktopDescription : normalizedDescription) || '(Your meta description will appear here)'

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Page URL</span>
          <input
            type="text"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://websitegeek.net/blog/example-page"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title Tag</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write your page title..."
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-slate-400">{normalizedTitle.length} characters (~50-60 typical)</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Meta Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write your meta description..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="mt-1 block text-xs text-slate-400">{normalizedDescription.length} characters (~150-160 typical)</span>
        </label>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${device === 'desktop' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${device === 'mobile' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Mobile
          </button>
        </div>

        {isEmpty ? (
          <p className="text-sm text-slate-500">Enter a title and/or meta description to see the live preview.</p>
        ) : (
          <SerpResultCard device={device} domain={domain} path={path} title={previewTitle} description={previewDescription} />
        )}

        <p className="mt-3 text-xs text-slate-400">
          {device === 'desktop'
            ? 'Desktop titles/descriptions are pixel-truncated using canvas measureText() with Arial, matching Google\'s approximate display width — actual rendering varies by device, browser, and font substitution.'
            : 'Mobile preview uses a 2-line clamp rather than exact pixel widths, since mobile truncation varies more by device and viewport.'}
        </p>
      </div>
    </div>
  )
}

export default SerpSimulator
