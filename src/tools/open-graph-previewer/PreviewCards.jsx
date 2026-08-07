import ImageWithFallback from './ImageWithFallback'

export function FacebookCard({ title, description, imageUrl, domain }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <ImageWithFallback src={imageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <div className="border-t border-slate-200 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">{domain || 'yourdomain.com'}</p>
        <p className="mt-1 line-clamp-2 font-semibold text-slate-900">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export function TwitterCard({ title, description, imageUrl, domain }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
      <ImageWithFallback src={imageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <div className="p-3">
        <p className="line-clamp-2 font-semibold text-slate-900">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
        <p className="mt-1 text-sm text-slate-400">🔗 {domain || 'yourdomain.com'}</p>
      </div>
    </div>
  )
}

export function LinkedInCard({ title, siteName, imageUrl, domain }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <ImageWithFallback src={imageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <div className="border-t border-slate-200 p-3">
        <p className="line-clamp-2 font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {domain || 'yourdomain.com'}
          {siteName ? ` · ${siteName}` : ''}
        </p>
      </div>
    </div>
  )
}
