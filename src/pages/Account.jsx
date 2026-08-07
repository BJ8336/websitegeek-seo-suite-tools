import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { apiRequest, AuthRequiredError } from '../lib/apiClient'
import GoogleSignInButton from '../components/GoogleSignInButton'

function formatAmount(cents, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`
  }
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function PaymentHistory({ getFreshIdToken }) {
  const [state, setState] = useState({ status: 'loading', history: [] })

  useEffect(() => {
    let cancelled = false
    apiRequest('/api/payment-history', { getFreshIdToken })
      .then((history) => {
        if (!cancelled) setState({ status: 'ready', history })
      })
      .catch((err) => {
        if (cancelled) return
        setState({
          status: err instanceof AuthRequiredError ? 'auth' : 'error',
          history: [],
        })
      })
    return () => {
      cancelled = true
    }
  }, [getFreshIdToken])

  if (state.status === 'loading') {
    return <p className="mt-4 text-sm text-slate-500">Loading payment history…</p>
  }
  if (state.status === 'auth') {
    return <p className="mt-4 text-sm text-slate-500">Please sign in again to view payment history.</p>
  }
  if (state.status === 'error') {
    return <p className="mt-4 text-sm text-red-600">Couldn't load payment history — please try again later.</p>
  }
  if (state.history.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">No payments yet.</p>
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2.5">Date</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Invoice</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {state.history.map((invoice, index) => (
            <tr key={`${invoice.date}-${index}`}>
              <td className="px-4 py-2.5 text-slate-700">{formatDate(invoice.date)}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">
                {formatAmount(invoice.amount, invoice.currency)}
              </td>
              <td className="px-4 py-2.5 capitalize text-slate-600">{invoice.status}</td>
              <td className="px-4 py-2.5">
                {invoice.hostedInvoiceUrl ? (
                  <a
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Account() {
  useDocumentHead({
    title: 'Billing | WebsiteGeek SEO Suite',
    description: 'View your WebsiteGeek SEO Suite plan and payment history.',
  })
  const { user, isSignedIn, getFreshIdToken } = useAuth()
  const { isPro } = useSubscription()

  if (!isSignedIn) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="mt-3 max-w-md text-slate-600">
          Sign in with Google to view your plan and payment history.
        </p>
        <div className="mt-5">
          <GoogleSignInButton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
      <p className="mt-2 text-slate-600">Signed in as {user.email}</p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isPro ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isPro ? 'Pro' : 'Free'} plan
        </span>
        {!isPro && (
          <span className="text-sm text-slate-500">
            Visit <a href="#/pricing" className="text-blue-600 hover:underline">Pricing</a> to upgrade.
          </span>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Payment history</h2>
      <PaymentHistory getFreshIdToken={getFreshIdToken} />
    </div>
  )
}

export default Account
