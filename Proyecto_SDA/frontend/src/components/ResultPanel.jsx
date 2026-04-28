import useAnalysisStore from '../store/useAnalysisStore'
import ScoreGauge from './ScoreGauge'
import ClaimCard from './ClaimCard'

export default function ResultPanel() {
  const { result, error, loading } = useAnalysisStore()

  if (loading) return (
    <div style={centerStyle}>
      <Spinner />
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Running analysis pipeline…</p>
    </div>
  )

  if (error) return (
    <div style={{ ...alertStyle, borderColor: '#ef444455', background: 'rgba(239,68,68,.08)' }}>
      <strong style={{ color: '#ef4444' }}>Error</strong>
      <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>{error}</p>
    </div>
  )

  if (!result) return (
    <div style={centerStyle}>
      <span style={{ fontSize: 40 }}>🔍</span>
      <p style={{ color: '#475569', fontSize: 14 }}>Results will appear here after analysis.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary bar */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <ScoreGauge score={result.overall_score} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>METHOD</p>
          <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{result.method_used}</p>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 10, marginBottom: 4 }}>CLAIMS FOUND</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{result.claims.length}</p>
        </div>
        <div style={{ fontSize: 12, color: '#475569', textAlign: 'right' }}>
          <p>{result.processing_time_ms} ms</p>
          <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 11 }}>{result.id.slice(0, 8)}</p>
        </div>
      </div>

      {/* Claims list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Claim-by-claim breakdown
        </p>
        {result.claims.map((claim, i) => (
          <ClaimCard key={i} claim={claim} index={i} />
        ))}
      </div>
    </div>
  )
}

const centerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', gap: 12, padding: '48px 0', textAlign: 'center',
}

const alertStyle = {
  border: '1px solid', borderRadius: 8, padding: '14px 16px',
}

function Spinner() {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36">
      <circle cx={18} cy={18} r={14} fill="none" stroke="#334155" strokeWidth={4} />
      <circle cx={18} cy={18} r={14} fill="none" stroke="#3b82f6" strokeWidth={4}
        strokeDasharray="60 28" strokeLinecap="round"
        style={{ transformOrigin: '18px 18px', animation: 'spin 0.9s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  )
}
