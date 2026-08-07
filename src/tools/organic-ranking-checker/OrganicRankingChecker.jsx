import { useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import LockedOverlay from '../../components/LockedOverlay'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import { useAuth } from '../../context/AuthContext'
import { useSubscription } from '../../context/SubscriptionContext'
import { useGoogleApiToken } from '../../hooks/useGoogleApiToken'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('organic-ranking-checker')
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const FREE_ROW_LIMIT = 10
const FREE_DAYS = 7
const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 28 days', days: 28 },
  { label: 'Last 3 months', days: 90 },
]

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

async function fetchVerifiedSites(accessToken) {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`sites_${res.status}`)
  const data = await res.json()
  return (data.siteEntry || []).filter((site) => site.permissionLevel !== 'siteUnverifiedUser')
}

async function fetchSearchAnalytics(accessToken, siteUrl, days, rowLimit) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit,
      }),
    },
  )
  if (!res.ok) throw new Error(`query_${res.status}`)
  const data = await res.json()
  return (data.rows || []).sort((a, b) => b.clicks - a.clicks)
}

function ResultsTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Query</th>
            <th className="px-4 py-2.5">Clicks</th>
            <th className="px-4 py-2.5">Impressions</th>
            <th className="px-4 py-2.5">CTR</th>
            <th className="px-4 py-2.5">Avg. Position</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row.keys[0]}-${index}`}>
              <td className="px-4 py-2.5 font-medium text-slate-900">{row.keys[0]}</td>
              <td className="px-4 py-2.5 text-slate-700">{row.clicks.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-slate-700">{row.impressions.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-slate-700">{(row.ctr * 100).toFixed(1)}%</td>
              <td className="px-4 py-2.5 text-slate-700">{row.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrganicRankingChecker() {
  const { isSignedIn } = useAuth()
  const { isPro } = useSubscription()
  const { requestToken } = useGoogleApiToken(SEARCH_CONSOLE_SCOPE)

  const [connectStatus, setConnectStatus] = useState('idle') // idle | connecting | connected | error
  const [connectError, setConnectError] = useState('')
  const [accessToken, setAccessToken] = useState(null)
  const [sites, setSites] = useState([])
  const [selectedSite, setSelectedSite] = useState('')
  const [days, setDays] = useState(FREE_DAYS)
  const [rows, setRows] = useState(null)
  const [queryStatus, setQueryStatus] = useState('idle') // idle | loading | error
  const [queryError, setQueryError] = useState('')

  const handleConnect = async () => {
    setConnectStatus('connecting')
    setConnectError('')
    try {
      const token = await requestToken()
      setAccessToken(token)
      const verifiedSites = await fetchVerifiedSites(token)
      setSites(verifiedSites)
      setSelectedSite(verifiedSites[0]?.siteUrl || '')
      setConnectStatus('connected')
      if (verifiedSites.length === 0) {
        setConnectError('No verified Search Console properties found for this Google account.')
      }
    } catch {
      setConnectStatus('error')
      setConnectError("Couldn't connect to Search Console — please try again.")
    }
  }

  const handleGetRankings = async () => {
    if (!selectedSite || !accessToken) return
    setQueryStatus('loading')
    setQueryError('')
    try {
      const effectiveDays = isPro ? days : FREE_DAYS
      const data = await fetchSearchAnalytics(accessToken, selectedSite, effectiveDays, 100)
      setRows(data)
      setQueryStatus('idle')
    } catch (err) {
      if (String(err.message).endsWith('401')) {
        setConnectStatus('idle')
        setAccessToken(null)
        setQueryError('Your Search Console connection expired — please reconnect.')
      } else {
        setQueryError("Couldn't load ranking data — please try again.")
      }
      setQueryStatus('error')
    }
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Your own domains only, straight from Google.</strong> This connects to your Google
        Search Console account and shows real ranking data for properties you've verified there —
        it can't look up a domain you don't control (no free tool honestly can).
      </div>

      {!isSignedIn ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="mb-3 text-sm text-slate-600">Sign in with Google to connect Search Console.</p>
          <div className="flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>
      ) : connectStatus !== 'connected' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <button
            type="button"
            onClick={handleConnect}
            disabled={connectStatus === 'connecting'}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {connectStatus === 'connecting' ? 'Connecting…' : 'Connect Google Search Console'}
          </button>
          {connectError && <p className="mt-3 text-sm text-red-600">{connectError}</p>}
        </div>
      ) : (
        <div>
          {sites.length === 0 ? (
            <p className="text-sm text-slate-600">{connectError}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Property</span>
                  <select
                    value={selectedSite}
                    onChange={(event) => setSelectedSite(event.target.value)}
                    className="mt-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {sites.map((site) => (
                      <option key={site.siteUrl} value={site.siteUrl}>
                        {site.siteUrl}
                      </option>
                    ))}
                  </select>
                </label>

                {isPro ? (
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Date range</span>
                    <select
                      value={days}
                      onChange={(event) => setDays(Number(event.target.value))}
                      className="mt-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <option key={option.days} value={option.days}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div>
                    <span className="text-sm font-medium text-slate-700">Date range</span>
                    <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-500">
                      Last 7 days (Pro unlocks up to 3 months)
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGetRankings}
                  disabled={queryStatus === 'loading'}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {queryStatus === 'loading' ? 'Loading…' : 'Get rankings'}
                </button>
              </div>

              {queryError && <p className="mt-3 text-sm text-red-600">{queryError}</p>}

              {rows && (
                <div className="mt-4">
                  {rows.length === 0 ? (
                    <p className="text-sm text-slate-500">No query data for this property in this date range yet.</p>
                  ) : isPro ? (
                    <ResultsTable rows={rows} />
                  ) : (
                    <>
                      <ResultsTable rows={rows.slice(0, FREE_ROW_LIMIT)} />
                      {rows.length > FREE_ROW_LIMIT && (
                        <div className="mt-3">
                          <LockedOverlay label={`Unlock all ${rows.length} queries + longer date ranges with Pro`}>
                            <ResultsTable rows={rows.slice(FREE_ROW_LIMIT, FREE_ROW_LIMIT + 5)} />
                          </LockedOverlay>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default OrganicRankingChecker
