import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { truncateToPixelWidth } from '../../lib/pixelWidth'
import { analyzeKeywordDensity } from '../../lib/keywordDensity'
import { extractDomain, extractPath } from '../../lib/urlHelpers'
import { getToolBySlug } from '../../data/toolsConfig'
import { createPixelMeasurer } from './canvasTextMeasurer'
import WidthMeter from './WidthMeter'
import SerpPreview from './SerpPreview'

const tool = getToolBySlug('meta-snippet-optimizer')

const TITLE_FONT = '400 20px Arial, sans-serif'
const TITLE_MAX_WIDTH = 580
const DESCRIPTION_FONT = '400 14px Arial, sans-serif'
const DESCRIPTION_MAX_WIDTH = 920

const measureTitle = createPixelMeasurer(TITLE_FONT)
const measureDescription = createPixelMeasurer(DESCRIPTION_FONT)

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function MetaSnippetOptimizer() {
  const [pageUrl, setPageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [focusKeyword, setFocusKeyword] = useState('')

  const debouncedTitle = useDebouncedValue(title, 150)
  const debouncedDescription = useDebouncedValue(description, 150)
  const debouncedUrl = useDebouncedValue(pageUrl, 150)
  const debouncedKeyword = useDebouncedValue(focusKeyword, 150)

  const normalizedTitle = useMemo(() => normalize(debouncedTitle), [debouncedTitle])
  const normalizedDescription = useMemo(() => normalize(debouncedDescription), [debouncedDescription])

  const titleWidth = useMemo(() => measureTitle(normalizedTitle), [normalizedTitle])
  const descriptionWidth = useMemo(() => measureDescription(normalizedDescription), [normalizedDescription])

  const desktopTitle = useMemo(
    () => truncateToPixelWidth(normalizedTitle, TITLE_MAX_WIDTH, measureTitle).text,
    [normalizedTitle],
  )
  const desktopDescription = useMemo(
    () => truncateToPixelWidth(normalizedDescription, DESCRIPTION_MAX_WIDTH, measureDescription).text,
    [normalizedDescription],
  )

  const domain = useMemo(() => extractDomain(debouncedUrl), [debouncedUrl])
  const path = useMemo(() => extractPath(debouncedUrl), [debouncedUrl])

  const keywordAnalysis = useMemo(() => {
    const combined = `${normalizedTitle} ${normalizedDescription}`.trim()
    if (!combined || !debouncedKeyword.trim()) return null
    return analyzeKeywordDensity(combined, { focusTerm: debouncedKeyword })
  }, [normalizedTitle, normalizedDescription, debouncedKeyword])

  const isEmpty = normalizedTitle === '' && normalizedDescription === ''

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="grid grid-cols-1 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Page URL (optional, for the preview)</span>
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
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Focus Keyword (optional, 1-2 words)</span>
          <input
            type="text"
            value={focusKeyword}
            onChange={(event) => setFocusKeyword(event.target.value)}
            placeholder="e.g. seo tools"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {isEmpty ? (
        <p className="mt-6 text-sm text-slate-500">
          Enter a title and/or meta description to see character counts, an estimated pixel width, and a
          live SERP preview.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WidthMeter
              label="Title"
              charCount={normalizedTitle.length}
              pixelWidth={titleWidth}
              maxPixelWidth={TITLE_MAX_WIDTH}
            />
            <WidthMeter
              label="Meta Description"
              charCount={normalizedDescription.length}
              pixelWidth={descriptionWidth}
              maxPixelWidth={DESCRIPTION_MAX_WIDTH}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Pixel widths are estimated using canvas measureText() with Arial — actual rendering varies by
            device, browser, and font substitution.
          </p>

          {debouncedKeyword.trim() && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Focus keyword density (title + description)
              </p>
              {!keywordAnalysis?.focusMatch ? (
                <p className="mt-1 text-sm text-slate-500">Add a title or description to check density.</p>
              ) : keywordAnalysis.focusMatch.unsupported ? (
                <p className="mt-1 text-sm text-amber-600">
                  Density checking supports 1-2 word focus keywords.
                </p>
              ) : (
                <p
                  className={`mt-1 text-sm font-medium ${
                    keywordAnalysis.focusMatch.isStuffed ? 'text-red-600' : 'text-slate-700'
                  }`}
                >
                  "{keywordAnalysis.focusMatch.term}" appears {keywordAnalysis.focusMatch.count} time
                  {keywordAnalysis.focusMatch.count === 1 ? '' : 's'} (
                  {keywordAnalysis.focusMatch.percentage.toFixed(1)}%)
                  {keywordAnalysis.focusMatch.count === 0 ? ' — not found' : ''}
                </p>
              )}
            </div>
          )}

          <div className="mt-6">
            <SerpPreview
              domain={domain}
              path={path}
              desktopTitle={desktopTitle || '(Your title will appear here)'}
              desktopDescription={desktopDescription || '(Your meta description will appear here)'}
              mobileTitle={normalizedTitle || '(Your title will appear here)'}
              mobileDescription={normalizedDescription || '(Your meta description will appear here)'}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default MetaSnippetOptimizer
