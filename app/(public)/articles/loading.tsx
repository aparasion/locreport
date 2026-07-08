export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading articles">
      <div className="skeleton skeleton--title" style={{ maxWidth: '30%' }} />
      <div className="skeleton skeleton--text" style={{ maxWidth: '55%' }} />
      <div className="skeleton-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="skeleton skeleton--block" />
        ))}
      </div>
    </div>
  )
}
