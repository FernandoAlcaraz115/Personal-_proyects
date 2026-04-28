export default function ScoreGauge({ score }) {
  const pct   = Math.round(score * 100)
  const color = score >= 0.75 ? '#10b981' : score >= 0.5 ? '#f59e0b' : '#ef4444'
  const label = score >= 0.75 ? 'Low risk' : score >= 0.5 ? 'Medium risk' : 'High risk'

  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={136} height={136} viewBox="0 0 136 136">
        <circle cx={68} cy={68} r={r} fill="none" stroke="#334155" strokeWidth={10} />
        <circle
          cx={68} cy={68} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s' }}
        />
        <text x={68} y={64} textAnchor="middle" fill="#f1f5f9" fontSize={22} fontWeight={700}>
          {pct}%
        </text>
        <text x={68} y={84} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          confidence
        </text>
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: 14 }}>{label}</span>
    </div>
  )
}
