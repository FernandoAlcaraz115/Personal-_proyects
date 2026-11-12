import React from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'
import { Scale, X, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

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
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: 980,
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-subtle)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={16} color="var(--brand-text)" />
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t.compareTitle}
              </h2>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {t.compareSubtitle}
            </p>
          </div>

          <button
            onClick={() => setIsCompareOpen(false)}
            style={{ color: 'var(--text-tertiary)', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Delta score banner if both are picked */}
        {scoreDiff !== null && (
          <div style={{
            margin: '16px 20px 0 20px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: scoreDiff > 0 ? 'var(--status-success-bg)' : scoreDiff < 0 ? 'var(--status-error-bg)' : 'var(--bg-surface-elevated)',
            border: `1px solid ${scoreDiff > 0 ? 'var(--status-success-border)' : scoreDiff < 0 ? 'var(--status-error-border)' : 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {scoreDiff === 0
                  ? t.compareIdentical
                  : `${scoreDiff > 0 ? 'Análisis B supera al Análisis A en' : 'Análisis A supera al Análisis B en'} ${Math.abs(scoreDiff)} puntos de fiabilidad`}
              </span>
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: scoreDiff >= 0 ? 'var(--status-success-text)' : 'var(--status-error-text)',
              fontFamily: 'var(--font-mono)',
            }}>
              {scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
            </span>
          </div>
        )}

        {/* Two-column side-by-side selection & analysis */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          padding: '16px 20px',
          flex: 1,
          overflowY: 'auto',
        }}>
          {/* Card A */}
          <CompareCard
            title={t.compareSelectA}
            item={compareItemA}
            setItem={setCompareItemA}
            history={history}
            badge="Muestra A (Base)"
            badgeColor="var(--brand-primary)"
            t={t}
          />

          {/* Card B */}
          <CompareCard
            title={t.compareSelectB}
            item={compareItemB}
            setItem={setCompareItemB}
            history={history}
            badge="Muestra B (Comparativa)"
            badgeColor="var(--cyan-text)"
            t={t}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-default)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => setIsCompareOpen(false)}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {t.compareClose}
          </button>
        </div>
      </div>
    </div>
  )
}

function CompareCard({ title, item, setItem, history, badge, badgeColor, t }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: badgeColor,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
          padding: '2px 7px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {badge}
        </span>

        {item && (
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {item.llm_provider || 'provider'} · {item.model || 'model'}
          </span>
        )}
      </div>

      {/* Select item from history */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            padding: '6px 10px',
            outline: 'none',
          }}
        >
          <option value="">{t.comparePickPlaceholder}</option>
          {history.map((h) => (
            <option key={h.id} value={h.id}>
              [{h.mode.toUpperCase()}] ({Math.round(h.overall_score * 100)}%) {h.original_text.slice(0, 42)}…
            </option>
          ))}
        </select>
      </div>

      {/* Render Summary Comparison */}
      {item ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            border: '1px solid var(--border-subtle)',
          }}>
            <ScoreGauge score={item.overall_score} size={80} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Riesgo</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: item.risk_level === 'low' ? 'var(--status-success-text)' : item.risk_level === 'medium' ? 'var(--status-warn-text)' : 'var(--status-error-text)',
                textTransform: 'uppercase',
              }}>
                {item.risk_level}
              </span>

              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Tiempo</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {item.processing_time_ms} ms
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '8px 10px',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            maxHeight: 100,
            overflowY: 'auto',
            fontFamily: item.mode === 'code' ? 'var(--font-mono)' : 'inherit',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.45,
          }}>
            {item.original_text}
          </div>

          {/* Breakdown summary */}
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            {item.mode === 'text' && item.claims && (
              <span>
                <strong>{item.claims.length}</strong> afirmaciones · Alucinaciones:{' '}
                <strong style={{ color: 'var(--status-error-text)' }}>
                  {item.claims.filter((c) => c.risk_level === 'high' || c.l4?.is_hallucination).length}
                </strong>
              </span>
            )}
            {item.mode === 'code' && item.code_result && (
              <span>
                Sintaxis AST: <strong>{item.code_result.is_valid_syntax ? 'Válida' : 'Con errores'}</strong> · Fantasma:{' '}
                <strong style={{ color: 'var(--status-error-text)' }}>
                  {item.code_result.hallucinated_packages.length}
                </strong>
              </span>
            )}
            {item.mode === 'math' && item.math_result && (
              <span>
                Ecuaciones: <strong>{item.math_result.total_equations_found}</strong> · Discrepancias:{' '}
                <strong style={{ color: 'var(--status-error-text)' }}>
                  {item.math_result.hallucinated_equations}
                </strong>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          padding: '30px 10px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '11.5px',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-xs)',
        }}>
          Selecciona una muestra del menú para contrastar.
        </div>
      )}
    </div>
  )
}
