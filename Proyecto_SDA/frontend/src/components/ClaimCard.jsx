const RISK_COLOR = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' }
const RISK_BG    = { low: 'rgba(16,185,129,.1)', medium: 'rgba(245,158,11,.1)', high: 'rgba(239,68,68,.1)' }

export default function ClaimCard({ claim, index }) {
  const color = RISK_COLOR[claim.risk_level]
  const bg    = RISK_BG[claim.risk_level]

  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${color}44`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#f1f5f9', lineHeight: 1.5, flex: 1 }}>
          <span style={{ color: '#94a3b8', fontSize: 12, marginRight: 6 }}>#{index + 1}</span>
          {claim.text}
        </p>
        <span style={{
          background: bg,
          color,
          border: `1px solid ${color}55`,
          borderRadius: 20,
          padding: '3px 10px',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {Math.round(claim.confidence * 100)}%
        </span>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
        {claim.explanation}
      </p>

      {(claim.l1.hedge_phrases.length > 0 || claim.l1.vague_phrases.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {claim.l1.hedge_phrases.map(p => (
            <Tag key={p} label={p} color="#f59e0b" />
          ))}
          {claim.l1.vague_phrases.map(p => (
            <Tag key={p} label={p} color="#94a3b8" />
          ))}
        </div>
      )}

      {claim.l2 && (
        <div style={{ fontSize: 12, color: '#64748b', borderTop: '1px solid #334155', paddingTop: 8 }}>
          <strong style={{ color: '#94a3b8' }}>Wikipedia:</strong>{' '}
          {claim.l2.snippet}
        </div>
      )}
    </div>
  )
}

function Tag({ label, color }) {
  return (
    <span style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 500,
    }}>
      {label}
    </span>
  )
}
