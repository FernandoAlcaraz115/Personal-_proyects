import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'

export default function CompareModal() {
  const {
    history,
    isCompareOpen,
    setIsCompareOpen,
    compareItemA,
    setCompareItemA,
    compareItemB,
    setCompareItemB,
    language,
  } = useAnalysisStore()

  const t = translations[language] ?? translations.es

  if (!isCompareOpen) return null

  const getRiskColor = (risk) => {
    if (risk === 'low') return '#10b981'
    if (risk === 'medium') return '#f59e0b'
    return '#f43f5e'
  }

  const scoreA = compareItemA ? Math.round(compareItemA.overall_score * 100) : null
  const scoreB = compareItemB ? Math.round(compareItemB.overall_score * 100) : null
  const scoreDiff = scoreA !== null && scoreB !== null ? scoreB - scoreA : null

  return (
    <div
      onClick={() => setIsCompareOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 260,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          maxWidth: 1040,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '2px solid #8b5cf6',
          padding: '1.75rem',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>⚖️</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                {t.compareTitle}
              </h2>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              {t.compareSubtitle}
            </p>
          </div>

          <button
            onClick={() => setIsCompareOpen(false)}
            style={{ color: '#64748b', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Delta score banner if both are picked */}
        {scoreDiff !== null && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '10px 16px',
              borderRadius: 8,
              background:
                scoreDiff > 0
                  ? 'rgba(16,185,129,0.08)'
                  : scoreDiff < 0
                  ? 'rgba(244,63,94,0.08)'
                  : 'rgba(56,189,248,0.08)',
              border: `1px solid ${
                scoreDiff > 0
                  ? 'rgba(16,185,129,0.3)'
                  : scoreDiff < 0
                  ? 'rgba(244,63,94,0.3)'
                  : 'rgba(56,189,248,0.3)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{scoreDiff > 0 ? '🚀' : scoreDiff < 0 ? '⚠️' : '⚖️'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                {scoreDiff === 0
                  ? t.compareIdentical
                  : `${scoreDiff > 0 ? 'Modelo B supera a Modelo A en' : 'Modelo A supera a Modelo B en'} ${Math.abs(scoreDiff)} puntos de confianza`}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: scoreDiff >= 0 ? '#10b981' : '#f43f5e',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
            </span>
          </div>
        )}

        {/* Two-column side-by-side selection & analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1, overflowY: 'auto' }}>
          {/* Card A */}
          <CompareCard
            title={t.compareSelectA}
            item={compareItemA}
            setItem={setCompareItemA}
            history={history}
            accentColor="#38bdf8"
            t={t}
            badge="Modelo A"
          />

          {/* Card B */}
          <CompareCard
            title={t.compareSelectB}
            item={compareItemB}
            setItem={setCompareItemB}
            history={history}
            accentColor="#a855f7"
            t={t}
            badge="Modelo B"
          />
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsCompareOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 18px',
              color: '#f8fafc',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.compareClose}
          </button>
        </div>
      </div>
    </div>
  )
}

function CompareCard({ title, item, setItem, history, accentColor, t, badge }) {
  return (
    <div
      style={{
        background: '#090d15',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 10,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: accentColor,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}40`,
            borderRadius: 6,
            padding: '3px 8px',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}
        >
          {badge}
        </span>

        {item && (
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            {item.llm_provider || 'provider'} · {item.model || 'model'}
          </span>
        )}
      </div>

      {/* Select item from history */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {title}
        </label>
        <select
          value={item ? item.id : ''}
          onChange={(e) => {
            const found = history.find((h) => h.id === e.target.value)
            setItem(found || null)
          }}
          style={{
            width: '100%',
            marginTop: 6,
            background: '#06080d',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: '#f8fafc',
            fontSize: 12,
            padding: '6px 10px',
            outline: 'none',
          }}
        >
          <option value="">{t.comparePickPlaceholder}</option>
          {history.map((h) => (
            <option key={h.id} value={h.id}>
              [{h.mode.toUpperCase()}] ({Math.round(h.overall_score * 100)}%) {h.original_text.slice(0, 45)}…
            </option>
          ))}
        </select>
      </div>

      {/* Render Analysis Summary */}
      {item ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: '#06080d',
              borderRadius: 8,
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <ScoreGauge score={item.overall_score} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Riesgo Detectado</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: item.risk_level === 'low' ? '#10b981' : item.risk_level === 'medium' ? '#f59e0b' : '#f43f5e',
                  textTransform: 'uppercase',
                }}
              >
                {item.risk_level}
              </span>

              <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Tiempo</span>
              <span style={{ fontSize: 12, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {item.processing_time_ms} ms
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Texto / Código Auditado:
            </span>
            <div
              style={{
                marginTop: 4,
                background: '#05070a',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 6,
                padding: '8px 10px',
                fontSize: 12,
                color: '#94a3b8',
                maxHeight: 120,
                overflowY: 'auto',
                fontFamily: item.mode === 'code' ? 'var(--font-mono)' : 'inherit',
                whiteSpace: 'pre-wrap',
              }}
            >
              {item.original_text}
            </div>
          </div>

          {/* Details breakdown */}
          {item.mode === 'text' && item.claims && (
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              <strong>{item.claims.length}</strong> afirmaciones evaluadas. Alucinaciones:{' '}
              <strong style={{ color: '#f43f5e' }}>
                {item.claims.filter((c) => c.risk_level === 'high' || c.l4?.is_hallucination).length}
              </strong>
            </div>
          )}

          {item.mode === 'code' && item.code_result && (
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              Sintaxis AST: <strong>{item.code_result.is_valid_syntax ? 'Válida ✅' : 'Inválida ❌'}</strong>
              <br />
              Librerías fantasma: <strong>{item.code_result.hallucinated_packages.length}</strong>
            </div>
          )}

          {item.mode === 'math' && item.math_result && (
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>
              Ecuaciones auditadas: <strong>{item.math_result.total_equations_found}</strong>
              <br />
              Errores detectados: <strong style={{ color: '#f43f5e' }}>{item.math_result.hallucinated_equations}</strong>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '30px 10px',
            textAlign: 'center',
            color: '#475569',
            fontSize: 12,
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 8,
          }}
        >
          Elige un análisis del menú desplegable superior para examinar sus métricas.
        </div>
      )}
    </div>
  )
}

