import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

const RISK = {
  high:   { bg: 'rgba(239,68,68,.18)',  border: '#ef4444', color: '#fca5a5' },
  medium: { bg: 'rgba(249,115,22,.15)', border: '#f97316', color: '#fdba74' },
  low:    { bg: 'rgba(34,197,94,.12)',  border: '#22c55e', color: '#86efac' },
}

export default function HighlightedText({ text, claims }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const segments = buildSegments(text, claims)

  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '14px 16px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
        {t.analyzedText}
      </p>

      <p style={{ fontSize: 14, lineHeight: 1.9, color: '#777' }}>
        {segments.map((seg, i) => {
          if (!seg.claim) return <span key={i}>{seg.text}</span>
          const s = RISK[seg.claim.risk_level] ?? RISK.medium
          const pct = Math.round(seg.claim.confidence * 100)
          return (
            <span
              key={i}
              title={`${pct}% — ${seg.claim.risk_level}`}
              style={{
                background: s.bg, borderBottom: `2px solid ${s.border}`,
                color: s.color, borderRadius: '3px 3px 0 0',
                padding: '1px 3px', cursor: 'help', transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.target.style.opacity = '.75'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              {seg.text}
            </span>
          )
        })}
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
        {[
          { label: t.legendHigh,   color: '#ef4444' },
          { label: t.legendMedium, color: '#f97316' },
          { label: t.legendLow,    color: '#22c55e' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 3, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: '#444' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: '#2a2a2a', marginLeft: 'auto' }}>{t.legendHover}</span>
      </div>
    </div>
  )
}

function buildSegments(originalText, claims) {
  let segments = [{ text: originalText, claim: null }]
  for (const claim of claims) {
    const claimLower = claim.text.toLowerCase()
    const next = []
    for (const seg of segments) {
      if (seg.claim !== null) { next.push(seg); continue }
      const idx = seg.text.toLowerCase().indexOf(claimLower)
      if (idx === -1) { next.push(seg); continue }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx), claim: null })
      next.push({ text: seg.text.slice(idx, idx + claim.text.length), claim })
      const tail = seg.text.slice(idx + claim.text.length)
      if (tail) next.push({ text: tail, claim: null })
    }
    segments = next
  }
  return segments
}
