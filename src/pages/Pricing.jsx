import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSubscription } from '../context/SubscriptionContext'
import { useUpgradeModal } from '../context/UpgradeModalContext'
import { useToast } from '../context/ToastContext'
import { useDocumentHead } from '../hooks/useDocumentHead'

const FREE_FEATURES = [
  '16 free tools, fully usable — no signup required',
  'Character, word, and line counters, case converter — unlimited',
  'Meta & Snippet Optimizer, Heading Auditor, Open Graph Previewer, Robots.txt Generator, Core Web Vitals Estimator, LSI Extractor — fully free',
  'Keyword Density Checker — top 5 terms per table',
  'Schema Markup Generator — build and validate any schema type',
  'Internal Link Analyzer, Broken Link Checker — first 5 results',
  'XML Sitemap Generator — full sitemaps up to 5 URLs',
  'Redirect & .htaccess Builder — preview of your first rule',
]

const PRO_FEATURES = [
  'Everything in Free, plus:',
  'AI Content Detector — heuristic AI-writing likelihood score, exclusive to Pro',
  'SEO Content Score — one consolidated on-page score, exclusive to Pro',
  'Full keyword density results — up to 25 ranked terms per table',
  'Full JSON-LD code reveal + one-click copy',
  'Complete internal link matrix + CSV export',
  'XML sitemaps for unlimited URLs + file download',
  'Full .htaccess / Nginx output + one-click copy',
  'Complete broken-link results + CSV export',
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0">
      <path d="M3 8.5L6.2 12L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Pricing() {
  useDocumentHead({
    title: 'Pricing | WebsiteGeek SEO Suite',
    description: 'Compare Free and Pro plans for the WebsiteGeek SEO Suite.',
  })
  const { isPro, refreshSubscriptionStatus } = useSubscription()
  const { openUpgradeModal } = useUpgradeModal()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (!checkout) return

    if (checkout === 'success') {
      setShowSuccessBanner(true)
      refreshSubscriptionStatus()
    } else if (checkout === 'cancel') {
      showToast('Checkout canceled.')
    }

    const next = new URLSearchParams(searchParams)
    next.delete('checkout')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {showSuccessBanner && (
        <div className="mx-auto mb-8 flex max-w-2xl items-start gap-4 rounded-2xl border-2 border-green-500 bg-green-50 p-5 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-xl text-white">
            ✓
          </span>
          <div className="flex-1">
            <p className="text-lg font-bold text-green-900">Payment successful!</p>
            <p className="mt-1 text-sm text-green-800">
              Your Pro purchase went through. If the Pro badge below doesn't appear right away,{' '}
              <strong>sign out and sign back in</strong> — that refreshes your account status and
              will unlock it immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessBanner(false)}
            aria-label="Dismiss"
            className="shrink-0 text-green-700 hover:text-green-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Simple, honest pricing</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          16 tools work for free, no signup. Pro unlocks 2 exclusive tools — an AI Content
          Detector and an SEO Content Score — plus removes the row limits and unlocks bulk
          exports on everything else.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Free</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">
            $0<span className="text-base font-medium text-slate-400"> forever</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">For anyone optimizing a page here and there.</p>

          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="mt-7 w-full cursor-default rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-400"
          >
            {isPro ? 'Included in your plan' : 'Your current plan'}
          </button>
        </div>

        <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-7 shadow-lg">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
            Most popular
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Pro</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">
            $39<span className="text-base font-medium text-slate-400"> one-time</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Pay once, unlock Pro for good — no subscription, no recurring charge.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {PRO_FEATURES.map((feature, index) => (
              <li
                key={feature}
                className={`flex items-start gap-2 ${
                  index === 0 ? 'font-semibold text-slate-900' : index <= 2 ? 'font-medium text-slate-900' : ''
                }`}
              >
                {index !== 0 && <CheckIcon />}
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openUpgradeModal}
            disabled={isPro}
            className="mt-7 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isPro ? "You're on Pro" : 'Get Pro — $39 one-time'}
          </button>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-slate-400">
        Payments are processed securely by Stripe — you'll never enter card details on this site.
        Sign in with Google first so your purchase is tied to your account, not just this device.
      </p>
    </div>
  )
}

export default Pricing
