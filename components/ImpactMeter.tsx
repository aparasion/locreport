// Impact score as a five-step meter — the lead story's one hard number,
// shown as a shape you can read at a glance rather than a bare digit.
// Tone 'gold' is reserved for a 5/5 "Disruptive" story: the design system's
// single rare highlight, not a second brand colour.
export function ImpactMeter({ score, label, tone = 'accent' }: {
  score: number
  label: string
  tone?: 'accent' | 'gold'
}) {
  return (
    <div className={`impact-meter${tone === 'gold' ? ' impact-meter--gold' : ''}`}>
      <p className="graphic-panel__label">Impact</p>
      <div className="impact-meter__row">
        <span className="impact-meter__bars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`impact-meter__bar${i <= score ? ' is-on' : ''}`} />
          ))}
        </span>
        <span className="impact-meter__value">
          {score}<span className="impact-meter__max">/5</span>
        </span>
      </div>
      <p className="impact-meter__caption">{label}</p>
    </div>
  )
}
