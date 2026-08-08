import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { API_BASE_URL } from '../../config'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('is-it-down-checker')

const ERROR_MESSAGES = {
  invalid_url: 'Enter a valid URL, e.g. https://example.com',
  blocked_host: "That URL can't be checked (private/internal addresses aren't allowed).",
  dns_lookup_failed: "That domain doesn't resolve — double-check the spelling. This usually means the site is down, not just you.",
}

function ResultCard({ data }) {
  const up = data.isUp
  return (
    <div
      className={`rounded-xl border p-6 text-center ${
        up ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <p className={`text-2xl font-bold ${up ? 'text-green-700' : 'text-red-700'}`}>
        {up ? "It's up — looks fine from here" : "It's down (or unreachable) from here"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {up
          ? "So if a page still isn't loading for you, it's likely just you — try clearing your cache or checking on another network."
          : "Our server couldn't reach it either. It could genuinely be down, or blocking automated requests — try loading it yourself in a browser to confirm."}
      </p>
      <div className="mx-auto mt-4 flex max-w-sm flex-wrap justify-center gap-4 text-sm">
        <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Status code</p>
          <p className="font-mono font-semibold text-slate-800">{data.status ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Response time</p>
          <p className="font-mono font-semibold text-slate-800">{data.responseTimeMs}ms</p>
        </div>
        {data.errorCode && (
          <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Reason</p>
            <p className="font-mono font-semibold text-slate-800">{data.errorCode}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function IsItDownChecker() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState({ status: 'idle' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!url.trim()) return
    setState({ status: 'loading' })
    try {
      const res = await fetch(`${API_BASE_URL}/api/check-uptime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
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

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Single vantage point, not a global outage network.</strong> This checks reachability from
        our server's location, once. A "down" result can mean the site is actually down, or that this
        specific network path/IP is blocked — it isn't crowd-sourced outage data.
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          required
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {state.status === 'loading' ? 'Checking…' : 'Check status'}
        </button>
      </form>

      {state.status === 'error' && <p className="mt-4 text-sm text-red-600">{state.message}</p>}

      {state.status === 'success' && (
        <div className="mt-6">
          <ResultCard data={state.data} />
        </div>
      )}
    </div>
  )
}

export default IsItDownChecker
