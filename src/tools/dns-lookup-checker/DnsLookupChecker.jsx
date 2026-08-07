import { useEffect, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import LockedOverlay from '../../components/LockedOverlay'
import { useSubscription } from '../../context/SubscriptionContext'
import {
  DOH_RESOLVERS,
  DEFAULT_RESOLVER,
  RECORD_TYPES,
  extractHostname,
  queryAllTypes,
  queryDnsRecord,
} from '../../lib/dnsLookup'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('dns-lookup-checker')

function AnswerList({ answers }) {
  if (answers.length === 0) {
    return <span className="text-sm text-slate-400">No records found</span>
  }
  return (
    <ul className="space-y-1">
      {answers.map((a, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-2">
          <span className="break-all font-mono text-sm text-slate-900">{a.data}</span>
          <span className="text-xs text-slate-400">TTL {a.ttl}s</span>
        </li>
      ))}
    </ul>
  )
}

function RecordCard({ result }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{result.type}</span>
        {result.status && result.status !== 'NOERROR' && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
            {result.status}
          </span>
        )}
      </div>
      {result.error ? (
        <span className="text-sm text-red-600">Couldn't fetch this record.</span>
      ) : (
        <AnswerList answers={result.answers} />
      )}
    </div>
  )
}

function valuesKey(result) {
  return result.answers
    .map((a) => a.data)
    .sort()
    .join(', ')
}

function ComparisonTable({ results, type }) {
  const distinctValueSets = new Set(results.filter((r) => !r.error).map(valuesKey))
  const allAgree = distinctValueSets.size <= 1

  return (
    <div>
      <div className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        allAgree ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {allAgree ? '✓ Resolvers agree' : '! Resolvers show different values'}
      </div>
      {!allAgree && (
        <p className="mb-2 text-xs text-slate-500">
          This usually means a recent DNS change hasn't reached every resolver yet — but large sites
          using geo-load-balancing (multiple valid IPs by design) will show this too, even when
          correctly configured.
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Resolver</th>
              <th className="px-3 py-2">{type} value(s)</th>
              <th className="px-3 py-2">TTL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((r) => (
              <tr key={r.resolver}>
                <td className="px-3 py-2 font-medium text-slate-900">
                  {DOH_RESOLVERS.find((res) => res.id === r.resolver)?.name || r.resolver}
                </td>
                <td className="px-3 py-2">
                  {r.error ? (
                    <span className="text-red-600">Couldn't fetch</span>
                  ) : (
                    <AnswerList answers={r.answers} />
                  )}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.answers[0]?.ttl ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DnsLookupChecker() {
  const { isPro } = useSubscription()
  const [domain, setDomain] = useState('')
  const [activeHostname, setActiveHostname] = useState('')
  const [mainStatus, setMainStatus] = useState('idle')
  const [mainResults, setMainResults] = useState([])
  const [compareType, setCompareType] = useState('A')
  const [compareStatus, setCompareStatus] = useState('idle')
  const [compareResults, setCompareResults] = useState([])

  useEffect(() => {
    if (!activeHostname) return
    let cancelled = false
    setMainStatus('loading')
    queryAllTypes(DEFAULT_RESOLVER, activeHostname)
      .then((results) => {
        if (!cancelled) {
          setMainResults(results)
          setMainStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setMainStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [activeHostname])

  useEffect(() => {
    if (!activeHostname) return
    let cancelled = false
    setCompareStatus('loading')
    Promise.all(DOH_RESOLVERS.map((resolver) => queryDnsRecord(resolver, activeHostname, compareType)))
      .then((results) => {
        if (!cancelled) {
          setCompareResults(results)
          setCompareStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setCompareStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [activeHostname, compareType])

  const handleSubmit = (event) => {
    event.preventDefault()
    const hostname = extractHostname(domain)
    if (!hostname) return
    setActiveHostname(hostname)
  }

  const allNxdomain = mainResults.length > 0 && mainResults.every((r) => r.status === 'NXDOMAIN')

  return (
    <div>
      <ToolHeader tool={tool} />

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="example.com"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {mainStatus === 'loading' ? 'Looking up…' : 'Lookup'}
        </button>
      </form>

      {activeHostname && (
        <div className="mt-6">
          {mainStatus === 'error' ? (
            <p className="text-sm text-red-600">Couldn't reach the DNS resolver — please try again.</p>
          ) : allNxdomain ? (
            <p className="text-sm text-slate-600">
              <strong>{activeHostname}</strong> doesn't resolve (NXDOMAIN) — check the domain is spelled
              correctly and actually registered.
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-slate-500">
                Records for <strong className="text-slate-900">{activeHostname}</strong> via {DEFAULT_RESOLVER.name} DNS
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mainResults
                  .filter((r) => r.status !== 'NXDOMAIN')
                  .map((result) => (
                    <RecordCard key={result.type} result={result} />
                  ))}
              </div>
            </>
          )}

          {!allNxdomain && mainStatus !== 'error' && (
            <div className="mt-8">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Resolver comparison</p>
                  <p className="text-xs text-slate-500">
                    Compares {RECORD_TYPES.includes(compareType) ? compareType : 'this'} records across{' '}
                    {DOH_RESOLVERS.map((r) => r.name).join(' and ')} — useful right after a DNS change to
                    see if it's reached both providers yet.
                  </p>
                </div>
                <select
                  value={compareType}
                  onChange={(event) => setCompareType(event.target.value)}
                  className="rounded-lg border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {compareStatus === 'loading' ? (
                <p className="text-sm text-slate-500">Comparing…</p>
              ) : compareStatus === 'error' ? (
                <p className="text-sm text-red-600">Couldn't complete the comparison — please try again.</p>
              ) : isPro ? (
                <ComparisonTable results={compareResults} type={compareType} />
              ) : (
                <LockedOverlay label="Unlock multi-resolver comparison with Pro">
                  <ComparisonTable results={compareResults} type={compareType} />
                </LockedOverlay>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DnsLookupChecker
