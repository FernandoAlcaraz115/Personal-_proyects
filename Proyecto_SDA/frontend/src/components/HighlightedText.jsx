import React from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'

const RISK_STYLES = {
  high: {
    bg: 'rgba(239, 68, 68, 0.14)',
    border: '#ef4444',
    color: '#fca5a5',
  },
  medium: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: '#f59e0b',
    color: '#fde68a',
  },
  low: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: '#10b981',
    color: '#a7f3d0',
  },
}

export default function HighlightedText({ text, claims }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es
  const segments = buildSegments(text, claims)

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {t.analyzedText}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {t.legendHover}
        </span>
      </div>

      <p style={{
        fontSize: '13.5px',
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
      }}>
        {segments.map((seg, i) => {
          if (!seg.claim) return <span key={i}>{seg.text}</span>
          const s = RISK_STYLES[seg.claim.risk_level] ?? RISK_STYLES.medium
          const pct = Math.round(seg.claim.confidence * 100)
          return (
            <mark
              key={i}
              title={`${pct}% de fiabilidad — Riesgo: ${seg.claim.risk_level}`}
              style={{
                background: s.bg,
                borderBottom: `2px solid ${s.border}`,
                color: s.color,
                borderRadius: '2px',
                padding: '2px 4px',
                cursor: 'help',
                fontWeight: 500,
              }}
            >
              {seg.text}
            </mark>
          )
        })}
      </p>

      {/* Legend Footer */}
      <div style={{
        display: 'flex',
        gap: 18,
        paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {[
          { label: t.legendHigh, color: '#ef4444' },
          { label: t.legendMedium, color: '#f59e0b' },
          { label: t.legendLow, color: '#10b981' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
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
      if (seg.claim !== null) {
        next.push(seg)
        continue
      }
      const idx = seg.text.toLowerCase().indexOf(claimLower)
      if (idx === -1) {
        next.push(seg)
        continue
      }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx), claim: null })
      next.push({ text: seg.text.slice(idx, idx + claim.text.length), claim })
      const tail = seg.text.slice(idx + claim.text.length)
      if (tail) next.push({ text: tail, claim: null })
    }
    segments = next
  }
  return segments
}
