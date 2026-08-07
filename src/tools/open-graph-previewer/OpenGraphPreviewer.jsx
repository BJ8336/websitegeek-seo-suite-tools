import { useMemo, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { extractDomain } from '../../lib/urlHelpers'
import { getToolBySlug } from '../../data/toolsConfig'
import { FacebookCard, LinkedInCard, TwitterCard } from './PreviewCards'

const tool = getToolBySlug('open-graph-previewer')

function OpenGraphPreviewer() {
  const [pageUrl, setPageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [siteName, setSiteName] = useState('')

  const debouncedUrl = useDebouncedValue(pageUrl, 150)
  const debouncedTitle = useDebouncedValue(title, 150)
  const debouncedDescription = useDebouncedValue(description, 150)
  const debouncedImageUrl = useDebouncedValue(imageUrl, 150)
  const debouncedSiteName = useDebouncedValue(siteName, 150)

  const domain = useMemo(() => extractDomain(debouncedUrl), [debouncedUrl])

  const isEmpty =
    !debouncedUrl.trim() &&
    !debouncedTitle.trim() &&
    !debouncedDescription.trim() &&
    !debouncedImageUrl.trim() &&
    !debouncedSiteName.trim()

  const cardProps = {
    title: debouncedTitle.trim() || '(Your OG title will appear here)',
    description: debouncedDescription.trim() || '(Your OG description will appear here)',
    imageUrl: debouncedImageUrl.trim(),
    siteName: debouncedSiteName.trim(),
    domain,
  }

  return (
    <div>
      <ToolHeader tool={tool} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Page URL</span>
          <input
            type="text"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://websitegeek.net/blog/example"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Site Name</span>
          <input
            type="text"
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            placeholder="WebsiteGeek"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">OG Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write your share title..."
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">OG Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write your share description..."
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Image URL</span>
          <input
            type="text"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://example.com/share-image.jpg"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {isEmpty ? (
        <p className="mt-6 text-sm text-slate-500">
          Fill in the fields above to preview how this page will look when shared on Facebook, X, and
          LinkedIn.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Facebook</p>
            <FacebookCard {...cardProps} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">X / Twitter</p>
            <TwitterCard {...cardProps} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">LinkedIn</p>
            <LinkedInCard {...cardProps} />
          </div>
        </div>
      )}
    </div>
  )
}

export default OpenGraphPreviewer
