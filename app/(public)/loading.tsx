export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading page">
      <div className="skeleton skeleton--title" style={{ maxWidth: '40%' }} />
      <div className="skeleton skeleton--text" style={{ maxWidth: '60%' }} />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton skeleton--block" />
        ))}
      </div>
    </div>
  )
}
