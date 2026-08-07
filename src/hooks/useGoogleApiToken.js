import { useCallback, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID } from '../context/AuthContext'

/**
 * Requests a short-lived OAuth2 ACCESS token (distinct from the ID token
 * used for sign-in), scoped to a specific Google API — needed to call
 * Google APIs like Search Console directly from the browser. Google
 * Identity Services splits "who is this person" (ID tokens, one consent at
 * sign-in) from "what can this app do on their behalf" (access tokens, a
 * separate, scope-specific consent) into two different client APIs:
 * `google.accounts.id` vs. `google.accounts.oauth2`.
 */
export function useGoogleApiToken(scope) {
  const [token, setToken] = useState(null)
  const clientRef = useRef(null)
  const pendingRef = useRef(null)

  const requestToken = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('google_not_loaded'))
        return
      }
      if (!clientRef.current) {
        clientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope,
          callback: (response) => {
            const pending = pendingRef.current
            pendingRef.current = null
            if (response.error) {
              pending?.reject(new Error(response.error))
              return
            }
            setToken(response.access_token)
            pending?.resolve(response.access_token)
          },
        })
      }
      pendingRef.current = { resolve, reject }
      clientRef.current.requestAccessToken()
    })
  }, [scope])

  return { token, requestToken }
}
