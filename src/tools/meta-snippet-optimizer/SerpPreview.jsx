function DesktopCard({ domain, path, title, description }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Desktop preview <span className="font-normal normal-case text-slate-400">(pixel-precise estimate)</span>
      </p>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <p className="text-sm text-slate-700">
          {domain || 'yourdomain.com'}
          {path}
        </p>
        <p className="truncate text-xl text-blue-800" style={{ fontSize: '20px' }}>
          {title}
        </p>
        <p className="mt-1 truncate text-sm text-slate-600" style={{ fontSize: '14px' }}>
          {description}
        </p>
      </div>
    </div>
  )
}

function MobileCard({ domain, title, description }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Mobile preview <span className="font-normal normal-case text-slate-400">(approximate — varies by device)</span>
      </p>
      <div className="mx-auto max-w-xs" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs">
            {(domain || 'W')[0].toUpperCase()}
          </span>
          {domain || 'yourdomain.com'}
        </div>
        <p className="mt-1 line-clamp-2 text-lg text-slate-900">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}

function SerpPreview({ domain, path, desktopTitle, desktopDescription, mobileTitle, mobileDescription }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DesktopCard domain={domain} path={path} title={desktopTitle} description={desktopDescription} />
      <MobileCard domain={domain} title={mobileTitle} description={mobileDescription} />
    </div>
  )
}

export default SerpPreview
