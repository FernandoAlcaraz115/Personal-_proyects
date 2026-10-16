import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

const RISK = {
  high:   { bg: 'rgba(244,63,94,0.18)',  border: '#f43f5e', color: '#fca5a5' },
  medium: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', color: '#fde68a' },
  low:    { bg: 'rgba(16,185,129,0.14)', border: '#10b981', color: '#a7f3d0' },
}

export default function HighlightedText({ text, claims }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const segments = buildSegments(text, claims)

  return (
    <div style={{
      background: '#090d15', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10,
      }}>
        {t.analyzedText}
      </p>

      <p style={{ fontSize: 14, lineHeight: 1.9, color: '#94a3b8' }}>
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
                color: s.color, borderRadius: '4px 4px 0 0',
                padding: '2px 4px', cursor: 'help', transition: 'all .15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {seg.text}
            </span>
          )
        })}
      </p>

      <div style={{
        display: 'flex', gap: 16, marginTop: 14, paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {[
          { label: t.legendHigh,   color: '#f43f5e' },
          { label: t.legendMedium, color: '#f59e0b' },
          { label: t.legendLow,    color: '#10b981' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 4, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>
          {t.legendHover}
        </span>
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
