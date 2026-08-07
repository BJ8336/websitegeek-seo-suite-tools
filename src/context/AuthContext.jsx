import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'websitegeek_seo_auth'

// Public by design — Google Client IDs are meant to be visible in
// client-side code, unlike a Client Secret (which this app never uses).
export const GOOGLE_CLIENT_ID = '582104601121-jvudbmiijtunc7d1obnhklj00824n6jm.apps.googleusercontent.com'

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.name && parsed?.email ? parsed : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage unavailable — sign-in state just won't persist this session.
  }
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

/**
 * Decodes (does NOT cryptographically verify) the JWT ID token Google
 * Identity Services hands back after sign-in. This app has no backend, so
 * there's nothing to check the token's signature against Google's public
 * keys — real verification needs a server. What we get instead: a real,
 * Google-issued token whose *contents* we trust because it came straight
 * from Google's own script running in this tab, with a couple of sanity
 * checks (audience + expiry) as a light guard against something malformed
 * making it this far. A sufficiently motivated visitor could still forge a
 * fake session client-side — that's the tradeoff of a static, backend-free
 * app, and it's why nothing in this suite treats "signed in" as a security
 * boundary (e.g. Pro-tier gating deliberately doesn't depend on it).
 */
function decodeGoogleCredential(credential) {
  try {
    const payload = JSON.parse(base64UrlDecode(credential.split('.')[1]))
    if (payload.aud !== GOOGLE_CLIENT_ID) return null
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    if (!payload.email) return null
    return {
      name: payload.name || payload.email,
      email: payload.email,
      picture: payload.picture || '',
      provider: 'google',
    }
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  // The raw Google ID token (JWT string) — kept in memory only, never
  // persisted. It's a bearer credential sent to the payments backend, so it
  // shouldn't sit in localStorage/sessionStorage where XSS could read it
  // later; it also can't be silently refreshed from storage anyway.
  const [idToken, setIdToken] = useState(null)
  const pendingTokenResolveRef = useRef(null)

  useEffect(() => {
    writeStoredUser(user)
  }, [user])

  const handleGoogleCredential = useCallback((credentialResponse) => {
    const decoded = decodeGoogleCredential(credentialResponse.credential)
    if (!decoded) return false
    setUser(decoded)
    setIdToken(credentialResponse.credential)
    pendingTokenResolveRef.current?.(credentialResponse.credential)
    pendingTokenResolveRef.current = null
    return true
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    setIdToken(null)
    // Stops Google from silently re-signing this browser back in next visit.
    window.google?.accounts?.id?.disableAutoSelect()
  }, [])

  // Returns the current ID token if we have one, otherwise tries a silent
  // Google One Tap re-prompt (works if the browser still has an active
  // Google session) and resolves with the new token, or null if that fails.
  const getFreshIdToken = useCallback(() => {
    if (idToken) return Promise.resolve(idToken)
    if (!window.google?.accounts?.id) return Promise.resolve(null)

    return new Promise((resolve) => {
      pendingTokenResolveRef.current = resolve
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          pendingTokenResolveRef.current = null
          resolve(null)
        }
      })
      setTimeout(() => {
        if (pendingTokenResolveRef.current === resolve) {
          pendingTokenResolveRef.current = null
          resolve(null)
        }
      }, 5000)
    })
  }, [idToken])

  const value = {
    user,
    isSignedIn: Boolean(user),
    idToken,
    getFreshIdToken,
    handleGoogleCredential,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
