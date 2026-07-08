export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Searching">
      <div className="skeleton skeleton--title" style={{ maxWidth: '30%' }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton skeleton--block" style={{ minHeight: 84 }} />
      ))}
    </div>
  )
}
