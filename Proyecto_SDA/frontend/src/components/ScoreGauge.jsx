import React from 'react'
import useAnalysisStore from '../store/useAnalysisStore'
import { translations } from '../i18n'
import ScoreGauge from './ScoreGauge'

export default function ScoreGaugeView({ score, size = 95 }) {
  const language = useAnalysisStore(s => s.language)
  const t = translations[language] ?? translations.es

  const pct = Math.round(score * 100)
  
  // Refined monochrome / semantic status
  let strokeColor, labelColor, labelBg, labelText
  if (score >= 0.80) {
    strokeColor = 'var(--status-success)'
    labelColor = 'var(--status-success)'
    labelBg = 'var(--status-success-subtle)'
    labelText = t.riskLow
  } else if (score >= 0.50) {
    strokeColor = 'var(--status-warn)'
    labelColor = 'var(--status-warn)'
    labelBg = 'var(--status-warn-subtle)'
    labelText = t.riskMedium
  } else {
    strokeColor = 'var(--status-error)'
    labelColor = 'var(--status-error)'
    labelBg = 'var(--status-error-subtle)'
    labelText = t.riskHigh
  }

  const strokeWidth = 7
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background hairline circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Active indicator arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: size >= 95 ? '22px' : '16px',
            fontWeight: 600,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {pct}%
          </span>
          <span style={{
            fontSize: '8.5px',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
            marginTop: 3,
          }}>
            Fiabilidad
          </span>
        </div>
      </div>

      <span style={{
        fontSize: '10.5px',
        fontWeight: 600,
        color: labelColor,
        background: labelBg,
        border: `1px solid ${labelColor}30`,
        padding: '2px 8px',
        borderRadius: '4px',
        letterSpacing: '0.02em',
      }}>
        {labelText}
      </span>
    </div>
  )
}
