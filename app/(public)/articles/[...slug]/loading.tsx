export default function Loading() {
  return (
    <div className="skeleton-article" aria-busy="true" aria-label="Loading article">
      <div className="skeleton skeleton--text" style={{ maxWidth: '25%' }} />
      <div className="skeleton skeleton--title" style={{ maxWidth: '90%' }} />
      <div className="skeleton skeleton--title" style={{ maxWidth: '55%' }} />
      <div className="skeleton skeleton--text" style={{ maxWidth: '35%', marginBottom: 'var(--space-5)' }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton skeleton--text" style={{ maxWidth: i % 4 === 3 ? '72%' : '100%' }} />
      ))}
    </div>
  )
}
