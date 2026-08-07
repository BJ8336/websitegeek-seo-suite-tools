import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import StatTile from '../../components/StatTile'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { countCharacters } from '../../lib/textStats'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('character-counter')

function CharacterCounter() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)
  const stats = useMemo(() => countCharacters(debounced), [debounced])

  const isEmpty = debounced.length === 0
  const isWhitespaceOnly = !isEmpty && stats.withoutSpaces === 0

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
        <p className="mt-4 text-sm text-slate-500">Start typing or paste text to see character counts.</p>
      ) : (
        <>
          {isWhitespaceOnly && (
            <p className="mt-4 text-sm text-amber-600">
              Your input contains only whitespace — no visible characters to count.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Total characters" value={stats.total.toLocaleString()} />
            <StatTile label="Characters (no spaces)" value={stats.withoutSpaces.toLocaleString()} />
          </div>
        </>
      )}
    </div>
  )
}

export default CharacterCounter
