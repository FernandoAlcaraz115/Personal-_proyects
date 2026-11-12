import React, { useState } from 'react'
import { 
  X, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Gauge, 
  FileCheck, 
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { analyzeText } from '../api/client'

const BENCHMARK_DATASET = [
  {
    id: 'BENCH-01',
    mode: 'text',
    title: 'Geografía y Factualidad (Falso)',
    sample: 'La capital de Francia es Berlín, una ciudad famosa por la Torre Eiffel y sus museos de arte.',
    expectedHallucination: true,
  },
  {
    id: 'BENCH-02',
    mode: 'text',
    title: 'Química Fundamental (Verídico)',
    sample: 'El agua es una molécula compuesta por dos átomos de hidrógeno y uno de oxígeno. Es esencial para la vida.',
    expectedHallucination: false,
  },
  {
    id: 'BENCH-03',
    mode: 'code',
    title: 'Librería Fantasma Python (PyPI)',
    sample: 'import package_totalmente_fantasma_xyz123\ndata = package_totalmente_fantasma_xyz123.load()',
    expectedHallucination: true,
  },
  {
    id: 'BENCH-04',
    mode: 'code',
    title: 'Slopsquatting npm & API JS',
    sample: "import { cryptoUtil } from 'nonexistent-slopsquat-lib-998877'; const flat = [].flatDeep();",
    expectedHallucination: true,
  },
  {
    id: 'BENCH-05',
    mode: 'math',
    title: 'Aritmética Errónea LLM',
    sample: 'Calculando el producto de dos números primos: 23 * 47 = 1181.',
    expectedHallucination: true,
  },
  {
    id: 'BENCH-06',
    mode: 'math',
    title: 'Identidad Aritmética Válida',
    sample: 'Paso 1: 15 + 27 = 42\nPaso 2: 42 * 2 = 84',
    expectedHallucination: false,
  },
]

export default function BenchmarkModal({ isOpen, onClose }) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [currentProgress, setCurrentProgress] = useState(0)

  if (!isOpen) return null

  async function runBenchmarkSuite() {
    setIsRunning(true)
    setCurrentProgress(0)
    const evaluated = []

    for (let i = 0; i < BENCHMARK_DATASET.length; i++) {
      const item = BENCHMARK_DATASET[i]
      setCurrentProgress(i + 1)
      try {
        const res = await analyzeText({
          text: item.sample,
          mode: item.mode,
          use_external_verification: true,
          use_ai_correction: false,
          self_consistency_samples: 1,
        })

        const detectedHallucination = res.overall_score >= 0.50 || res.risk_level === 'high'
        const isMatch = detectedHallucination === item.expectedHallucination

        evaluated.push({
          ...item,
          detectedHallucination,
          overallScore: res.overall_score,
          latency: res.processing_time_ms,
          isMatch,
        })
      } catch (err) {
        evaluated.push({
          ...item,
          detectedHallucination: false,
          overallScore: 0,
          latency: 0,
          isMatch: false,
          error: true,
        })
      }
    }

    // Compute Quantitative Metrics
    let tp = 0, tn = 0, fp = 0, fn = 0
    let totalLatency = 0

    evaluated.forEach(r => {
      totalLatency += r.latency || 0
      if (r.expectedHallucination && r.detectedHallucination) tp++
      else if (!r.expectedHallucination && !r.detectedHallucination) tn++
      else if (!r.expectedHallucination && r.detectedHallucination) fp++
      else if (r.expectedHallucination && !r.detectedHallucination) fn++
    })

    const total = evaluated.length
    const accuracy = total > 0 ? (tp + tn) / total : 0
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0
    const avgLatency = total > 0 ? Math.round(totalLatency / total) : 0

    setResults({
      evaluated,
      metrics: {
        total,
        accuracy,
        precision,
        recall,
        f1,
        avgLatency,
        tp,
        tn,
        fp,
        fn,
      }
    })
    setIsRunning(false)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        background: '#0d0d0e',
        border: '1px solid var(--border-hairline)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-hairline)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="#fff" />
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                Benchmark & Métricas Cuantitativas
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Evaluación empírica formal de precisión, recall y F1 sobre dataset de referencia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {/* Action Callout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-hairline)',
            borderRadius: '8px',
          }}>
            <div>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                Batería de Validación Automatizada
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
                Evalúa {BENCHMARK_DATASET.length} muestras de control calibradas (texto fáctico, PyPI, npm y SymPy).
              </p>
            </div>
            <button
              onClick={runBenchmarkSuite}
              disabled={isRunning}
              style={{
                background: isRunning ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: isRunning ? 'var(--text-tertiary)' : '#080808',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: isRunning ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isRunning ? <RotateCcw size={13} className="spin" /> : <Play size={13} fill="#080808" />}
              {isRunning ? `Evaluando (${currentProgress}/${BENCHMARK_DATASET.length})…` : 'Ejecutar Benchmark'}
            </button>
          </div>

          {/* Metrics Overview Cards */}
          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Precisión (Precision)
                  </span>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-success)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {(results.metrics.precision * 100).toFixed(1)}%
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Recall (Sensibilidad)
                  </span>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {(results.metrics.recall * 100).toFixed(1)}%
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    F1-Score
                  </span>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#a855f7', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {(results.metrics.f1 * 100).toFixed(1)}%
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Exactitud (Accuracy)
                  </span>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {(results.metrics.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '8px',
                padding: '14px 16px',
              }}>
                <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Matriz de Confusión Cuantitativa
                </span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  marginTop: 10,
                }}>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Verdaderos Positivos (TP)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>{results.metrics.tp}</strong>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Falsos Positivos (FP)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-error)' }}>{results.metrics.fp}</strong>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Falsos Negativos (FN)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-error)' }}>{results.metrics.fn}</strong>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Verdaderos Negativos (TN)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>{results.metrics.tn}</strong>
                  </div>
                </div>
              </div>

              {/* Sample Breakdown Table */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid var(--border-hairline)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>Casos Evaluados</span>
                  <span>Latencia Promedio: {results.metrics.avgLatency} ms</span>
                </div>
                <div>
                  {results.evaluated.map((item, idx) => (
                    <div key={idx} style={{
                      padding: '10px 14px',
                      borderBottom: idx < results.evaluated.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11.5px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.isMatch ? (
                          <CheckCircle2 size={15} color="var(--status-success)" />
                        ) : (
                          <AlertCircle size={15} color="var(--status-error)" />
                        )}
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item.title}</p>
                          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                            {item.id} · Motor: {item.mode} · Latencia: {item.latency} ms
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          background: item.isMatch ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: item.isMatch ? 'var(--status-success)' : 'var(--status-error)',
                        }}>
                          {item.isMatch ? 'CALIBRADO ✓' : 'DISCREPANCIA'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

