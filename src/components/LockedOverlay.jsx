import { useUpgradeModal } from '../context/UpgradeModalContext'

/**
 * Wraps real (already-computed) output in a blur and overlays a lock CTA —
 * per the Phase 4 spec, locked features must show a dimmed preview of the
 * actual output, never a blank or fake-looking box.
 */
function LockedOverlay({ children, label = 'Unlock with Pro' }) {
  const { openUpgradeModal } = useUpgradeModal()

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div aria-hidden="true" className="pointer-events-none select-none blur-sm">
        {children}
      </div>
      <button
        type="button"
        onClick={openUpgradeModal}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70 text-sm font-medium text-slate-700 backdrop-blur-[1px] hover:bg-white/80"
      >
        <span aria-hidden="true" className="text-lg">
          🔒
        </span>
        {label}
      </button>
    </div>
  )
}

export default LockedOverlay
