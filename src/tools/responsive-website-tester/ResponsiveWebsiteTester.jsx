import { useEffect, useRef, useState } from 'react'
import ToolHeader from '../../components/ToolHeader'
import { getToolBySlug } from '../../data/toolsConfig'

const tool = getToolBySlug('responsive-website-tester')

const DEVICES = [
  { id: 'mobile', label: 'Mobile', icon: '📱', width: 375, height: 667 },
  { id: 'tablet', label: 'Tablet', icon: '📟', width: 768, height: 1024 },
  { id: 'laptop', label: 'Laptop', icon: '💻', width: 1366, height: 768 },
  { id: 'desktop', label: 'Desktop', icon: '🖥️', width: 1920, height: 1080 },
]

function normalizeUrl(input) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function ResponsiveWebsiteTester() {
  const [urlInput, setUrlInput] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [deviceId, setDeviceId] = useState('mobile')
  const [frameKey, setFrameKey] = useState(0)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(900)

  useEffect(() => {
    function measure() {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeUrl])

  const device = DEVICES.find((d) => d.id === deviceId)
  const scale = Math.min(1, containerWidth / device.width)
  const displayWidth = Math.round(device.width * scale)
  const displayHeight = Math.round(device.height * scale)

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalized = normalizeUrl(urlInput)
    if (!normalized) return
    setActiveUrl(normalized)
    setFrameKey((key) => key + 1)
  }

  const handleReload = () => setFrameKey((key) => key + 1)

  return (
    <div>
      <ToolHeader tool={tool} />

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="https://example.com"
          className="min-w-[240px] flex-1 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Preview
        </button>
      </form>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <strong>Some sites can't be embedded.</strong> If the preview stays blank, that site has set
        its own <code>X-Frame-Options</code> or Content-Security-Policy header to block embedding —
        a security setting the site owner controls, not something this tool can override. Use
        "Open in new tab" below to check it directly instead.
      </div>

      {activeUrl && (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDeviceId(d.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  deviceId === d.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.icon} {d.label}{' '}
                <span className={deviceId === d.id ? 'text-blue-100' : 'text-slate-400'}>
                  {d.width}×{d.height}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleReload}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              ⟳ Reload
            </button>
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              Open in new tab ↗
            </a>
          </div>

          <div ref={containerRef} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div
              className="mx-auto overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"
              style={{ width: displayWidth, height: displayHeight }}
            >
              <iframe
                key={frameKey}
                src={activeUrl}
                title="Responsive website preview"
                width={device.width}
                height={device.height}
                style={{ border: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                // Omitting allow-top-navigation deliberately — lets the target
                // page render and behave normally, but stops a "framebusting"
                // script on the target site from hijacking this whole tab.
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsiveWebsiteTester
