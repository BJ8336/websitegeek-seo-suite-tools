import { useEffect, useState } from 'react'

function ImageWithFallback({ src, alt, className }) {
  const [status, setStatus] = useState(src ? 'loading' : 'empty')

  useEffect(() => {
    setStatus(src ? 'loading' : 'empty')
  }, [src])

  if (status === 'empty') {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}>
        No image set
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-slate-100 text-xs text-slate-400 ${className}`}
      >
        <span aria-hidden="true">🖼️</span>
        <span>Image failed to load</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
    />
  )
}

export default ImageWithFallback
