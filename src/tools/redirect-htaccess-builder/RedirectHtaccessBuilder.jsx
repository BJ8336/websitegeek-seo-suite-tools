import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import CopyButton from '../../components/CopyButton'
import LockedOverlay from '../../components/LockedOverlay'
import { useSubscription } from '../../context/SubscriptionContext'
import { buildApacheRules, buildNginxRules, splitFirstBlock } from '../../lib/redirectRules'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('redirect-htaccess-builder')
const EMPTY_ROW = { from: '', to: '', type: '301' }

function RedirectHtaccessBuilder() {
  const [redirects, setRedirects] = useState([EMPTY_ROW])
  const [wwwMode, setWwwMode] = useState('none')
  const [trailingSlashMode, setTrailingSlashMode] = useState('none')
  const [activeTab, setActiveTab] = useState('apache')
  const { isPro } = useSubscription()

  const updateRow = (index, key, value) => {
    setRedirects((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }
  const removeRow = (index) => setRedirects((prev) => prev.filter((_, i) => i !== index))
  const addRow = () => setRedirects((prev) => [...prev, { from: '', to: '', type: '301' }])

  const apacheOutput = useMemo(
    () => buildApacheRules({ redirects, wwwMode, trailingSlashMode }),
    [redirects, wwwMode, trailingSlashMode],
  )
  const nginxOutput = useMemo(
    () => buildNginxRules({ redirects, wwwMode, trailingSlashMode }),
    [redirects, wwwMode, trailingSlashMode],
  )

  const activeOutput = activeTab === 'apache' ? apacheOutput : nginxOutput
  const { first, rest } = useMemo(() => splitFirstBlock(activeOutput), [activeOutput])

  return (
    <div>
      <ToolHeader tool={tool} />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Redirects</p>
        <div className="space-y-2">
          {redirects.map((row, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2">
              <select
                value={row.type}
                onChange={(e) => updateRow(index, 'type', e.target.value)}
                className="rounded-md border border-slate-300 p-2 text-sm"
              >
                <option value="301">301</option>
                <option value="302">302</option>
              </select>
              <input
                type="text"
                value={row.from}
                onChange={(e) => updateRow(index, 'from', e.target.value)}
                placeholder="/old-page"
                className="min-w-[10rem] flex-1 rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-slate-400">→</span>
              <input
                type="text"
                value={row.to}
                onChange={(e) => updateRow(index, 'to', e.target.value)}
                placeholder="/new-page"
                className="min-w-[10rem] flex-1 rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              {redirects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
        >
          + Add redirect
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">www ↔ non-www</span>
          <select
            value={wwwMode}
            onChange={(e) => setWwwMode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          >
            <option value="none">No change</option>
            <option value="force-www">Force www</option>
            <option value="force-non-www">Force non-www</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Trailing slash</span>
          <select
            value={trailingSlashMode}
            onChange={(e) => setTrailingSlashMode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          >
            <option value="none">No change</option>
            <option value="add">Always add</option>
            <option value="remove">Always remove</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('apache')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeTab === 'apache' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Apache (.htaccess)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nginx')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeTab === 'nginx' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nginx
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {activeTab === 'apache' ? '.htaccess' : 'nginx.conf (server block)'}
              {!isPro && rest ? ' (preview — first rule only)' : ''}
            </p>
            <CopyButton getText={() => (isPro ? activeOutput : first)} />
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {isPro ? activeOutput : first}
          </pre>
        </div>

        {!isPro && rest && (
          <div className="mt-2">
            <LockedOverlay label="Unlock the full output with Pro">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {rest}
              </pre>
            </LockedOverlay>
          </div>
        )}
      </div>
    </div>
  )
}

export default RedirectHtaccessBuilder
