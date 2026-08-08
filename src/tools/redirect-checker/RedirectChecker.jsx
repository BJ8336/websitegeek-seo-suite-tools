import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { API_BASE_URL } from '../../config'
import { USER_AGENT_OPTIONS } from '../../lib/userAgentOptions'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('redirect-checker')

const STATUS_STYLES = {
  2: 'bg-green-100 text-green-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-red-100 text-red-700',
}

const REDIRECT_LABELS = {
  301: 'Moved Permanently',
  302: 'Found (Temporary)',
  303: 'See Other',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
}

function StatusChip({ status }) {
  if (!status) return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">No response</span>
  const bucket = Math.floor(status / 100)
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[bucket] || 'bg-slate-100 text-slate-600'}`}>
      {status} {REDIRECT_LABELS[status] || ''}
    </span>
  )
}

const ERROR_MESSAGES = {
  invalid_url: 'Enter a valid URL, e.g. https://example.com',
  blocked_host: "That URL can't be checked (private/internal addresses aren't allowed).",
  dns_lookup_failed: "That domain doesn't resolve — check the spelling.",
  timeout: 'A hop in the chain took too long to respond.',
  fetch_failed: "Couldn't connect to that host.",
  redirect_loop: 'This chain loops back to a URL it already visited.',
  too_many_redirects: 'Stopped after 10 hops — this chain may be longer or looping.',
  invalid_redirect_target: 'A redirect pointed to an invalid URL.',
  blocked_redirect_target: 'A redirect in the chain pointed to a blocked/internal address.',
}

function RedirectChecker() {
  const [url, setUrl] = useState('')
  const [userAgent, setUserAgent] = useState('chrome-desktop')
  const [state, setState] = useState({ status: 'idle' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!url.trim()) return
    setState({ status: 'loading' })
    try {
      const res = await fetch(`${API_BASE_URL}/api/check-redirects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), userAgent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState({ status: 'error', message: ERROR_MESSAGES[data.error] || "Couldn't check that URL." })
        return
      }
      setState({ status: 'success', data })
    } catch {
      setState({ status: 'error', message: 'Network error — please try again.' })
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/old-page"
          required
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={userAgent}
          onChange={(event) => setUserAgent(event.target.value)}
          className="rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          {USER_AGENT_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {state.status === 'loading' ? 'Checking…' : 'Check redirects'}
        </button>
      </form>

      <p className="mt-2 text-xs text-slate-400">
        Follows up to 10 redirect hops from our server, using the selected User-Agent. Private/internal
        addresses are always blocked.
      </p>

      {state.status === 'error' && <p className="mt-4 text-sm text-red-600">{state.message}</p>}

      {state.status === 'success' && (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span>
              <strong>{state.data.hopCount}</strong> hop{state.data.hopCount === 1 ? '' : 's'}
            </span>
            <span>·</span>
            <span>{state.data.timingMs}ms total</span>
            {state.data.error && (
              <span className="text-amber-600">· {ERROR_MESSAGES[state.data.error] || state.data.error}</span>
            )}
          </div>

          <ol className="space-y-2">
            {state.data.chain.map((hop) => (
              <li key={hop.hop} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hop {hop.hop}</span>
                  <StatusChip status={hop.status} />
                </div>
                <p className="mt-1.5 truncate font-mono text-sm text-slate-700">{hop.url}</p>
                {hop.location && (
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <span aria-hidden="true">→</span>
                    <span className="truncate font-mono">{hop.location}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>

          {state.data.finalStatus && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Final destination: <span className="font-mono">{state.data.finalUrl}</span> — <StatusChip status={state.data.finalStatus} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RedirectChecker
