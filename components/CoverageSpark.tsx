import type { SignalWeekPoint } from '@/lib/intelligence'

// Server-rendered inline SVG area chart — no Recharts, no hydration, no
// layout shift. Used where a trend shape has to be visible in the first
// paint (the lead story panel), unlike the client SignalSparkline.
export function CoverageSpark({ data, tone = 'accent', width = 208, height = 54 }: {
  data: SignalWeekPoint[]
  tone?: 'accent' | 'gold'
  width?: number
  height?: number
}) {
  const counts = data.map(d => d.count)
  if (counts.length < 2) return null

  const max = Math.max(1, ...counts)
  const pad = 4
  const x = (i: number) => (i / (counts.length - 1)) * width
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2)

  const line = counts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const lastX = x(counts.length - 1)
  const lastY = y(counts[counts.length - 1])

  return (
    <svg
      className={`cspark${tone === 'gold' ? ' cspark--gold' : ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="presentation"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" fillOpacity="0.13" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.8" fill="currentColor" />
    </svg>
  )
}
