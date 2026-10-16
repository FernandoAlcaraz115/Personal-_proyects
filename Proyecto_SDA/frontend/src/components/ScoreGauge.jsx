import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

export default function ScoreGauge({ score }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es

  const pct = Math.round(score * 100)
  let strokeGradient, color, label, glow
  if (score >= 0.80) {
    color = '#10b981'
    strokeGradient = 'url(#gauge-gradient-green)'
    label = t.riskLow
    glow = 'rgba(16,185,129,0.45)'
  } else if (score >= 0.50) {
    color = '#f59e0b'
    strokeGradient = 'url(#gauge-gradient-orange)'
    label = t.riskMedium
    glow = 'rgba(245,158,11,0.45)'
  } else {
    color = '#f43f5e'
    strokeGradient = 'url(#gauge-gradient-red)'
    label = t.riskHigh
    glow = 'rgba(244,63,94,0.5)'
  }

  const r = 56
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ filter: `drop-shadow(0 0 16px ${glow})`, transition: 'filter .4s ease' }}>
        <svg width={148} height={148} viewBox="0 0 148 148">
          <defs>
            <linearGradient id="gauge-gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gauge-gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle cx={74} cy={74} r={r} fill="none" stroke="#121826" strokeWidth={11} />
          
          {/* Animated active arc */}
          <circle
            cx={74} cy={74} r={r}
            fill="none" stroke={strokeGradient} strokeWidth={11}
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round" transform="rotate(-90 74 74)"
            style={{ transition: 'stroke-dashoffset .8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />

          <text x={74} y={69} textAnchor="middle" fill="#f8fafc" fontSize={26} fontWeight={800} fontFamily="var(--font-display)">
            {pct}%
          </text>
          <text x={74} y={87} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600} letterSpacing=".08em">
            {t.labelConfidence}
          </text>
        </svg>
      </div>

      <span style={{
        color, fontWeight: 700, fontSize: 12, textTransform: 'uppercase',
        letterSpacing: '.1em', background: `${color}18`, border: `1px solid ${color}44`,
        padding: '3px 12px', borderRadius: 20,
      }}>
        {label}
      </span>
    </div>
  )
}
