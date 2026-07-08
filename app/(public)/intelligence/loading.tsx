export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading intelligence dashboard">
      <div className="skeleton skeleton--title" style={{ maxWidth: '35%' }} />
      <div className="skeleton skeleton--text" style={{ maxWidth: '60%' }} />
      <div className="skeleton-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton skeleton--block" style={{ minHeight: 90 }} />
        ))}
      </div>
      <div className="skeleton skeleton--block" style={{ minHeight: 280 }} />
    </div>
  )
}
