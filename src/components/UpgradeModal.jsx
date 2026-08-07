import { useState } from 'react'
import { useUpgradeModal } from '../context/UpgradeModalContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { apiRequest, AuthRequiredError, ApiError } from '../lib/apiClient'
import GoogleSignInButton from './GoogleSignInButton'

const BENEFITS = [
  'Full results on every tool — no row limits',
  'One-click JSON-LD, .htaccess, and CSV exports',
  'Complete XML sitemaps for unlimited URLs',
  'Priority access to new tools as they ship',
]

function UpgradeModal() {
  const { isOpen, closeUpgradeModal } = useUpgradeModal()
  const { isSignedIn, getFreshIdToken } = useAuth()
  const { showToast } = useToast()
  const [isStartingCheckout, setIsStartingCheckout] = useState(false)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    setIsStartingCheckout(true)
    try {
      const data = await apiRequest('/api/create-checkout-session', {
        method: 'POST',
        getFreshIdToken,
      })
      window.location.href = data.url
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        showToast('Please sign in again to continue.')
      } else if (err instanceof ApiError && err.code === 'already_purchased') {
        showToast("You're already on Pro.")
      } else {
        showToast("Couldn't start checkout — please try again.")
      }
      setIsStartingCheckout(false)
    }
  }

  return (
    <div
      className="light-surface fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeUpgradeModal}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">Unlock WebsiteGeek Pro Suite</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-green-600">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        {isSignedIn ? (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isStartingCheckout}
            className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isStartingCheckout ? 'Redirecting to checkout…' : 'Get Pro — $39 one-time'}
          </button>
        ) : (
          <div className="mt-5">
            <p className="mb-3 text-center text-sm text-slate-600">
              Sign in with Google first — your purchase and payment history are tied to your
              account.
            </p>
            <div className="flex justify-center">
              <GoogleSignInButton />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={closeUpgradeModal}
          className="mt-4 block w-full text-center text-xs text-slate-400 hover:text-slate-600"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default UpgradeModal
