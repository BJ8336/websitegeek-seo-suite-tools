import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import CopyButton from '../../components/CopyButton'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { hasLetters, toLowerCase, toSentenceCase, toTitleCase, toUpperCase } from '../../lib/caseConverter'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('case-converter')

const VARIANTS = [
  { key: 'lower', label: 'lowercase', convert: toLowerCase },
  { key: 'upper', label: 'UPPERCASE', convert: toUpperCase },
  { key: 'sentence', label: 'Sentence case', convert: toSentenceCase },
  { key: 'title', label: 'Title Case', convert: toTitleCase },
]

function OutputCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <CopyButton getText={() => value} />
      </div>
      <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{value}</p>
    </div>
  )
}

function CaseConverter() {
  const [input, setInput] = useState('')
  const debounced = useDebouncedValue(input, 150)

  const outputs = useMemo(
    () => VARIANTS.map((variant) => ({ ...variant, value: variant.convert(debounced) })),
    [debounced],
  )

  const isEmpty = debounced.length === 0
  const noLetters = !isEmpty && !hasLetters(debounced)

  return (
    <div>
      <ToolHeader tool={tool} />

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Paste or type your text here..."
        rows={8}
        className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
      />

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">Start typing or paste text to see converted output.</p>
      ) : (
        <>
          {noLetters && (
            <p className="mt-4 text-sm text-amber-600">
              No letters found in your input — output will match what you typed.
            </p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {outputs.map((variant) => (
              <OutputCard key={variant.key} label={variant.label} value={variant.value} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CaseConverter
