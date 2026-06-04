'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-[760px] py-12">
      <h2 className="text-xl font-bold text-[#111827] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#5A6278] mb-6">
        {error.message || 'An unexpected error occurred loading this page.'}
        {error.digest && (
          <span className="block mt-1 font-mono text-xs text-[#9CA3AF]">
            Digest: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-[#3D5AFE] text-white hover:bg-[#3451e8]"
      >
        Try again
      </button>
    </div>
  )
}
