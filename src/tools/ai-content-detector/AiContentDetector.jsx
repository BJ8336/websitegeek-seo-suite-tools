import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import LockedOverlay from '../../components/LockedOverlay'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useSubscription } from '../../context/SubscriptionContext'
import { analyzeAiLikelihood } from '../../lib/aiContentDetector'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('ai-content-detector')

function verdictFor(score) {
  if (score < 30) return { label: 'Likely Human-Written', color: 'text-green-600', bg: 'bg-green-50', ring: 'stroke-green-500' }
  if (score < 60) return { label: 'Mixed / Uncertain Signals', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'stroke-amber-500' }
  return { label: 'Likely AI-Assisted', color: 'text-red-600', bg: 'bg-red-50', ring: 'stroke-red-500' }
}

function ScoreRing({ score }) {
  const verdict = verdictFor(score)
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - score / 100)
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={verdict.ring}
        />
      </svg>
      <div>
        <p className={`text-3xl font-bold ${verdict.color}`}>{score}</p>
        <p className={`text-sm font-semibold ${verdict.color}`}>{verdict.label}</p>
      </div>
    </div>
  )
}

function SignalRow({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}/100</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-400" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function ResultsPanel({ result }) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border border-slate-200 p-5 ${verdictFor(result.score).bg}`}>
        <ScoreRing score={result.score} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SignalRow
          label="Sentence-length uniformity"
          value={result.signals.burstiness.value}
          detail={`Avg ${result.signals.burstiness.avgSentenceLength} words/sentence, ±${result.signals.burstiness.stdDev} std dev. Human writing usually varies more.`}
        />
        <SignalRow
          label="Overused AI phrases"
          value={result.signals.aiPhrases.value}
          detail={
            result.signals.aiPhrases.matches.length > 0
              ? `Found: "${result.signals.aiPhrases.matches.slice(0, 5).join('", "')}"${result.signals.aiPhrases.matches.length > 5 ? '…' : ''}`
              : 'No common AI stock phrases detected.'
          }
        />
        <SignalRow
          label="Repeated sentence openers"
          value={result.signals.sentenceOpenerRepetition.value}
          detail={`Most repeated opener: "${result.signals.sentenceOpenerRepetition.mostRepeated[0]}" (${result.signals.sentenceOpenerRepetition.mostRepeated[1]} times).`}
        />
        <SignalRow
          label="Vocabulary repetition"
          value={result.signals.vocabularyDiversity.value}
          detail={`${Math.round(result.signals.vocabularyDiversity.typeTokenRatio * 100)}% of words are unique.`}
        />
      </div>
    </div>
  )
}

function AiContentDetector() {
  const [content, setContent] = useState('')
  const { isPro } = useSubscription()
  const debounced = useDebouncedValue(content, 150)

  const result = useMemo(() => (debounced.trim() ? analyzeAiLikelihood(debounced) : null), [debounced])
  const isEmpty = !debounced.trim()

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Heuristic indicator, not a trained classifier.</strong> This scores statistical
        writing patterns (sentence-length uniformity, stock AI phrases, repeated structure) — it is
        not the same technology as trained detectors like GPTZero or Originality.ai, and it can be
        wrong in both directions. Use it as one signal, not a verdict.
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Paste the text you want to check..."
        rows={10}
        className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
      />

      {isEmpty ? (
        <p className="mt-4 text-sm text-slate-500">
          Paste at least a few sentences to get a reading — very short text doesn't give the
          statistics enough to work with.
        </p>
      ) : result.insufficientData ? (
        <p className="mt-4 text-sm text-amber-600">
          Need at least ~30 words across 3+ sentences for a meaningful reading — you have{' '}
          {result.wordCount} word{result.wordCount === 1 ? '' : 's'} in {result.sentenceCount}{' '}
          sentence{result.sentenceCount === 1 ? '' : 's'} so far.
        </p>
      ) : isPro ? (
        <div className="mt-4">
          <ResultsPanel result={result} />
        </div>
      ) : (
        <div className="mt-4">
          <LockedOverlay label="Unlock AI-writing analysis with Pro">
            <ResultsPanel result={result} />
          </LockedOverlay>
        </div>
      )}
    </div>
  )
}

export default AiContentDetector
