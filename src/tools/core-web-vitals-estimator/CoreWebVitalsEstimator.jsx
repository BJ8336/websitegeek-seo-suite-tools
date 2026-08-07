import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { estimatePage } from '../../lib/pageEstimator'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('core-web-vitals-estimator')

function CoreWebVitalsEstimator() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)

  const estimate = useMemo(() => (debounced.trim() ? estimatePage(debounced) : null), [debounced])

  const isEmpty = debounced.trim().length === 0
  const parseFailed = !isEmpty && estimate === null

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Estimated from pasted HTML only.</strong> This is not a real Core Web Vitals or Lighthouse
        measurement — those require an actual browser render and Google's own APIs. These numbers are
        heuristics based on the markup structure you paste in.
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Paste page HTML</span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste your page's full HTML source here..."
          rows={10}
          className="mt-1 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste HTML to estimate DOM size, text-to-code ratio, and image alt-text completeness.
        </p>
      ) : parseFailed ? (
        <p className="mt-4 text-sm text-red-600">
          Couldn't parse that as HTML — check that it's valid markup and try again.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              label="DOM elements"
              value={estimate.totalElements.toLocaleString()}
            />
            <StatTile label="Text-to-code ratio" value={`${estimate.textToCodeRatio.toFixed(1)}%`} />
            <StatTile label="Images" value={estimate.imagesTotal} />
            <StatTile label="Alt-text completeness" value={`${estimate.altCompleteness.toFixed(0)}%`} />
          </div>

          {estimate.isHighElementCount && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {estimate.totalElements.toLocaleString()} DOM elements is high (over 1,500) — large DOM trees
              are commonly linked to slower rendering and interaction responsiveness.
            </p>
          )}

          {estimate.missingAlt.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Images missing alt text ({estimate.missingAlt.length})
              </p>
              <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-sm text-amber-700">
                {estimate.missingAlt.slice(0, 30).map((src, index) => (
                  <li key={index} className="truncate font-mono text-xs">
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CoreWebVitalsEstimator
