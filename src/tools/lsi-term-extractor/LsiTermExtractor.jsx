import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { extractCooccurringTerms } from '../../lib/lsiExtractor'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('lsi-term-extractor')

function LsiTermExtractor() {
  const [keyword, setKeyword] = useState('')
  const [content, setContent] = useState('')
  const [windowSize, setWindowSize] = useState(5)

  const debouncedKeyword = useDebouncedValue(keyword, 150)
  const debouncedContent = useDebouncedValue(content, 150)

  const analysis = useMemo(
    () => extractCooccurringTerms(debouncedContent, debouncedKeyword, { windowSize }),
    [debouncedContent, debouncedKeyword, windowSize],
  )

  const isEmpty = !debouncedKeyword.trim() || !debouncedContent.trim()
  const keywordNotFound = !isEmpty && !analysis.keywordFound
  const noTermsFound = !isEmpty && analysis.keywordFound && analysis.terms.length === 0

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        These are related term suggestions based on simple word co-occurrence in your content — not an
        AI-powered or semantic LSI model.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Primary keyword</span>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="seo tools"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Window size (words on each side)</span>
          <select
            value={windowSize}
            onChange={(event) => setWindowSize(Number(event.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Content</span>
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
          Enter a primary keyword and paste content to find related terms that appear near it.
        </p>
      ) : keywordNotFound ? (
        <p className="mt-4 text-sm text-amber-600">
          "{debouncedKeyword.trim()}" was not found in your content.
        </p>
      ) : noTermsFound ? (
        <p className="mt-4 text-sm text-amber-600">
          Found "{debouncedKeyword.trim()}" {analysis.occurrences} time
          {analysis.occurrences === 1 ? '' : 's'}, but no meaningful related terms nearby — try more
          content around your keyword.
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Related terms ({analysis.occurrences} occurrence{analysis.occurrences === 1 ? '' : 's'} of your
            keyword)
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.terms.map((term) => (
              <span
                key={term.term}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                title={`${term.count} co-occurrences`}
              >
                {term.term} <span className="text-slate-400">×{term.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LsiTermExtractor
