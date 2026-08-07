import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { auditHeadings, parseHeadings } from '../../lib/headingAudit'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('heading-structure-auditor')

function HeadingTree({ headings, skippedIndexes, h1Count }) {
  return (
    <ol className="rounded-lg border border-slate-200 bg-white p-4">
      {headings.map((heading, index) => {
        const isFlaggedH1 = heading.level === 1 && h1Count > 1
        const isSkipTarget = skippedIndexes.has(index)
        const flagged = isFlaggedH1 || isSkipTarget

        return (
          <li
            key={index}
            style={{ marginLeft: `${(heading.level - 1) * 20}px` }}
            className={`flex items-center gap-2 border-t border-slate-100 py-1.5 text-sm first:border-t-0 ${
              flagged ? 'text-red-700' : 'text-slate-700'
            }`}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                flagged ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              H{heading.level}
            </span>
            <span className="truncate">{heading.text || '(empty heading)'}</span>
            {flagged && <span className="text-xs text-red-500">⚠</span>}
          </li>
        )
      })}
    </ol>
  )
}

function HeadingStructureAuditor() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)

  const { headings, format } = useMemo(() => parseHeadings(debounced), [debounced])
  const { issues, h1Count } = useMemo(() => auditHeadings(headings), [headings])

  const skippedIndexes = useMemo(
    () => new Set(issues.filter((issue) => issue.type === 'skipped-level').map((issue) => issue.index)),
    [issues],
  )

  const isEmpty = debounced.trim().length === 0
  const noHeadingsFound = !isEmpty && headings.length === 0

  return (
    <div>
      <ToolHeader tool={tool} />

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Paste HTML source</span>
        <p className="text-xs text-slate-500">
          This checks headings in text you paste — it does not fetch a live URL. Markdown-style headings
          (e.g. "## Heading") also work.
        </p>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste your page's HTML source (or markdown-style headings) here..."
          rows={10}
          className="mt-2 w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </label>

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste HTML source to audit your heading structure for missing/multiple H1s and skipped levels.
        </p>
      ) : noHeadingsFound ? (
        <p className="mt-4 text-sm text-amber-600">
          No H1-H6 headings found in your input.
          {format === 'html' ? ' If you pasted markdown, make sure lines start with "#" through "######".' : ''}
        </p>
      ) : (
        <>
          <div className="mt-4">
            {issues.length === 0 ? (
              <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                No structural issues found — one H1, and no skipped heading levels.
              </p>
            ) : (
              <ul className="space-y-2">
                {issues.map((issue, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Heading structure</p>
            <HeadingTree headings={headings} skippedIndexes={skippedIndexes} h1Count={h1Count} />
          </div>
        </>
      )}
    </div>
  )
}

export default HeadingStructureAuditor
