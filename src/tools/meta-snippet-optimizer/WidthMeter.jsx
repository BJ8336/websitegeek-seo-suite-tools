function WidthMeter({ label, charCount, pixelWidth, maxPixelWidth }) {
  const ratio = maxPixelWidth === 0 ? 0 : pixelWidth / maxPixelWidth
  const statusColor = ratio > 1 ? 'text-red-600' : ratio > 0.9 ? 'text-amber-600' : 'text-green-600'

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{charCount.toLocaleString()} characters</p>
      <p className={`text-sm font-medium ${statusColor}`}>
        ~{Math.round(pixelWidth)}px / {maxPixelWidth}px estimated
        {ratio > 1 ? ' — likely to be truncated' : ''}
      </p>
    </div>
  )
}

export default WidthMeter
