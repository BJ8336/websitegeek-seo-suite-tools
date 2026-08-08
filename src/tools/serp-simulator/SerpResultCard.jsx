function faviconLetter(domain) {
  return (domain || 'W')[0].toUpperCase()
}

function siteName(domain) {
  if (!domain) return 'yourdomain.com'
  const bare = domain.replace(/^www\./, '')
  const parts = bare.split('.')
  return parts.length > 1 ? parts[0][0].toUpperCase() + parts[0].slice(1) : bare
}

function breadcrumbFromPath(domain, path) {
  const site = domain || 'yourdomain.com'
  const segments = (path || '').split('/').filter(Boolean)
  return [site, ...segments].join(' › ')
}

function DesktopResult({ domain, path, title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {faviconLetter(domain)}
        </span>
        <div className="leading-tight">
          <p className="text-sm text-slate-900">{siteName(domain)}</p>
          <p className="text-xs text-slate-500">{breadcrumbFromPath(domain, path)}</p>
        </div>
      </div>
      <p className="mt-1 truncate text-[20px] text-blue-800 hover:underline">{title}</p>
      <p className="mt-1 truncate text-sm text-slate-600">{description}</p>
    </div>
  )
}

function MobileResult({ domain, path, title, description }) {
  return (
    <div className="mx-auto max-w-sm rounded-xl border border-slate-200 bg-white p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
          {faviconLetter(domain)}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-slate-900">{siteName(domain)}</p>
          <p className="truncate text-xs text-slate-500">{breadcrumbFromPath(domain, path)}</p>
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-lg text-slate-900">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
    </div>
  )
}

function SerpResultCard({ device, domain, path, title, description }) {
  return device === 'mobile' ? (
    <MobileResult domain={domain} path={path} title={title} description={description} />
  ) : (
    <DesktopResult domain={domain} path={path} title={title} description={description} />
  )
}

export default SerpResultCard
