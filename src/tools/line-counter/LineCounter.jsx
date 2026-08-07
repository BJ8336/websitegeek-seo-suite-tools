import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { countLines } from '../../lib/textStats'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('line-counter')

function LineCounter() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)
  const stats = useMemo(() => countLines(debounced), [debounced])

  const isEmpty = debounced.length === 0
  const allLinesBlank = !isEmpty && stats.nonBlank === 0

  return (
    <div>
      <ToolHeader tool={tool} />

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste or type your text here..."
        rows={10}
        className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
      />

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">Start typing or paste text to see line counts.</p>
      ) : (
        <>
          {allLinesBlank && (
            <p className="mt-4 text-sm text-amber-600">
              Every line in your input is blank — nothing but whitespace to count.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Total lines" value={stats.total.toLocaleString()} />
            <StatTile label="Non-blank lines" value={stats.nonBlank.toLocaleString()} />
          </div>
        </>
      )}
    </div>
  )
}

export default LineCounter
