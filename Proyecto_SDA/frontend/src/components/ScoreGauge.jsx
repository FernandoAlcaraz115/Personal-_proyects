export default function ScoreGauge({ score }) {
  const pct = Math.round(score * 100)

  let color, label, glow
  if (score >= 0.75) {
    color = '#22c55e'; label = 'Low risk';    glow = 'rgba(34,197,94,.3)'
  } else if (score >= 0.5) {
    color = '#f97316'; label = 'Medium risk'; glow = 'rgba(249,115,22,.3)'
  } else {
    color = '#ef4444'; label = 'High risk';   glow = 'rgba(239,68,68,.35)'
  }

  const r    = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ filter: `drop-shadow(0 0 10px ${glow})`, transition: 'filter .4s' }}>
        <svg width={136} height={136} viewBox="0 0 136 136">
          {/* Track */}
          <circle cx={68} cy={68} r={r} fill="none" stroke="#1e1e1e" strokeWidth={10} />
          {/* Progress */}
          <circle
            cx={68} cy={68} r={r}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={circ}
            strokeDashoffset={dash}
            strokeLinecap="round"
            transform="rotate(-90 68 68)"
            style={{ transition: 'stroke-dashoffset .7s ease, stroke .4s' }}
          />
          {/* Center text */}
          <text x={68} y={62} textAnchor="middle" fill="#f0f0f0" fontSize={24} fontWeight={800}>
            {pct}%
          </text>
          <text x={68} y={80} textAnchor="middle" fill="#555" fontSize={11} letterSpacing=".05em">
            CONFIDENCE
          </text>
        </svg>
      </div>
      <span style={{
        color,
        fontWeight: 700,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '.08em',
      }}>
        {label}
      </span>
    </div>
  )
}
