import { useState } from 'react'

function CopyButton({ getText, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable (insecure context, permissions) — the text
      // stays selectable in the UI as a fallback.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}

export default CopyButton
