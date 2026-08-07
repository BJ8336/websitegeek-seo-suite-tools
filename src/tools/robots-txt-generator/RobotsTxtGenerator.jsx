import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import CopyButton from '../../components/CopyButton'
import LockedOverlay from '../../components/LockedOverlay'
import { useSubscription } from '../../context/SubscriptionContext'
import { BOT_CATEGORIES, buildMetaRobotsTag, buildRobotsTxtTiers, defaultBotAccess } from '../../lib/robotsGenerator'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('robots-txt-generator')
const EMPTY_GROUP = { userAgent: '*', allow: '', disallow: '' }

function BotToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex overflow-hidden rounded-full border border-slate-300 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onChange('allow')}
          aria-pressed={value === 'allow'}
          className={`px-3 py-1 transition ${
            value === 'allow' ? 'bg-green-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          Allow
        </button>
        <button
          type="button"
          onClick={() => onChange('block')}
          aria-pressed={value === 'block'}
          className={`px-3 py-1 transition ${
            value === 'block' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          Block
        </button>
      </div>
    </div>
  )
}

function BotAccessControl({ botAccess, onChange }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">Bot Access Control</p>
      <p className="mb-3 text-xs text-slate-500">
        Allow or block specific crawlers by name. Blocking "All Bots" blocks everything except the
        ones you individually set back to Allow. Toggle any bot freely — AI Crawlers, SEO Tools,
        and Social Bots rules show up in the Pro preview below until you upgrade.
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {BOT_CATEGORIES.map((category) => (
          <div key={category.label}>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {category.label}
              {category.proOnly && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-amber-700">
                  Pro
                </span>
              )}
            </p>
            <div className="space-y-2">
              {category.bots.map((bot) => (
                <BotToggle
                  key={bot.id}
                  label={bot.name}
                  value={botAccess[bot.id]}
                  onChange={(next) => onChange(bot.id, next)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupEditor({ group, onChange, onRemove, canRemove }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          type="text"
          value={group.userAgent}
          onChange={(event) => onChange({ ...group, userAgent: event.target.value })}
          placeholder="*"
          className="w-40 rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:underline">
            Remove group
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Allow (one path per line)
          </span>
          <textarea
            value={group.allow}
            onChange={(event) => onChange({ ...group, allow: event.target.value })}
            placeholder="/blog/"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Disallow (one path per line)
          </span>
          <textarea
            value={group.disallow}
            onChange={(event) => onChange({ ...group, disallow: event.target.value })}
            placeholder="/admin/"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>
    </div>
  )
}

function RobotsTxtGenerator() {
  const [groups, setGroups] = useState([EMPTY_GROUP])
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [botAccess, setBotAccess] = useState(defaultBotAccess)
  const { isPro } = useSubscription()

  const [metaIndex, setMetaIndex] = useState(true)
  const [metaFollow, setMetaFollow] = useState(true)
  const [noarchive, setNoarchive] = useState(false)
  const [nosnippet, setNosnippet] = useState(false)
  const [noimageindex, setNoimageindex] = useState(false)
  const [notranslate, setNotranslate] = useState(false)

  const { free: freeRobotsTxt, proOnlyExtra, full: fullRobotsTxt } = useMemo(
    () => buildRobotsTxtTiers({ groups, sitemapUrl, botAccess }),
    [groups, sitemapUrl, botAccess],
  )
  const robotsTxt = isPro ? fullRobotsTxt : freeRobotsTxt
  const metaTag = useMemo(
    () =>
      buildMetaRobotsTag({
        index: metaIndex,
        follow: metaFollow,
        noarchive,
        nosnippet,
        noimageindex,
        notranslate,
      }),
    [metaIndex, metaFollow, noarchive, nosnippet, noimageindex, notranslate],
  )

  const updateGroup = (index, next) => {
    setGroups((prev) => prev.map((g, i) => (i === index ? next : g)))
  }
  const removeGroup = (index) => setGroups((prev) => prev.filter((_, i) => i !== index))
  const addGroup = () => setGroups((prev) => [...prev, { userAgent: '', allow: '', disallow: '' }])
  const updateBotAccess = (botId, value) => setBotAccess((prev) => ({ ...prev, [botId]: value }))

  return (
    <div>
      <ToolHeader tool={tool} />

      <BotAccessControl botAccess={botAccess} onChange={updateBotAccess} />

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-slate-700">Advanced: custom rules by path</p>
        <div className="space-y-3">
          {groups.map((group, index) => (
            <GroupEditor
              key={index}
              group={group}
              onChange={(next) => updateGroup(index, next)}
              onRemove={() => removeGroup(index)}
              canRemove={groups.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addGroup}
          className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
        >
          + Add user-agent group
        </button>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-slate-700">Sitemap URL (optional)</span>
          <input
            type="text"
            value={sitemapUrl}
            onChange={(event) => setSitemapUrl(event.target.value)}
            placeholder="https://websitegeek.net/sitemap.xml"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              robots.txt (live preview){!isPro && proOnlyExtra ? ' — Search Engines only' : ''}
            </p>
            <CopyButton getText={() => robotsTxt} />
          </div>
          {robotsTxt ? (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
              {robotsTxt}
            </pre>
          ) : (
            <p className="text-sm text-slate-500">Allow at least one bot, add a path rule, or set a sitemap URL.</p>
          )}
        </div>

        {!isPro && proOnlyExtra && (
          <div className="mt-3">
            <LockedOverlay label="Unlock AI Crawlers, SEO Tools & Social Bots rules with Pro">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Pro-only bot rules (from your toggles above)
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                  {proOnlyExtra}
                </pre>
              </div>
            </LockedOverlay>
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-slate-700">Meta robots tag</p>
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={metaIndex} onChange={(e) => setMetaIndex(e.target.checked)} />
            Index
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={metaFollow} onChange={(e) => setMetaFollow(e.target.checked)} />
            Follow
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={noarchive} onChange={(e) => setNoarchive(e.target.checked)} />
            Noarchive
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={nosnippet} onChange={(e) => setNosnippet(e.target.checked)} />
            Nosnippet
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={noimageindex}
              onChange={(e) => setNoimageindex(e.target.checked)}
            />
            Noimageindex
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={notranslate} onChange={(e) => setNotranslate(e.target.checked)} />
            Notranslate
          </label>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Meta tag</p>
            <CopyButton getText={() => metaTag} />
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-3 text-xs text-slate-100">
            {metaTag}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default RobotsTxtGenerator
