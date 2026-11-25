/**
 * Attestly Audit Exporter
 * Generates formal technical audit reports in Markdown, JSON and Printable HTML formats.
 */

function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getRiskMeta(result) {
  const risk = (result.risk_level || '').toLowerCase()
  const score = typeof result.overall_score === 'number' ? result.overall_score : 1.0

  if (risk === 'high' || (!risk && score < 0.5)) {
    return {
      label: 'ALTO RIESGO / ALUCINACIÓN DETECTADA',
      shortLabel: 'CRÍTICO / ALTO RIESGO',
      color: '#ef4444',
    }
  }
  if (risk === 'medium' || (!risk && score < 0.75)) {
    return {
      label: 'RIESGO MODERADO / INCERTIDUMBRE',
      shortLabel: 'MODERADO / INCERTIDUMBRE',
      color: '#f59e0b',
    }
  }
  return {
    label: 'CONFIABLE / VERIFICADO',
    shortLabel: 'ÓPTIMO / VERIFICADO',
    color: '#10b981',
  }
}

function getDomainLabel(result) {
  if (result.mode === 'sql' || result.code_result?.language === 'sql') {
    return 'Auditoría SQL (Sintaxis, Dialectos y Seguridad)'
  }
  if (result.mode === 'code') {
    const lang = result.code_result?.language === 'javascript'
      ? 'JavaScript / TypeScript (npm + OSV)'
      : 'Python (AST + PyPI + OSV)'
    return `Código Fuente — ${lang}`
  }
  if (result.mode === 'math') {
    return 'Expresiones Matemáticas y Lógica Simbólica (SymPy)'
  }
  return 'Afirmaciones Fácticas y Conocimiento General (NLP + Web Grounding)'
}

export function generateMarkdownReport(result) {
  if (!result) return ''

  const dateStr = new Date().toISOString()
  const domainLabel = getDomainLabel(result)
  const riskMeta = getRiskMeta(result)
  const confidencePct = ((result.overall_score ?? 0) * 100).toFixed(1)
  const codeLang = result.code_result?.language === 'sql'
    ? 'sql'
    : result.code_result?.language === 'javascript'
      ? 'javascript'
      : result.mode === 'code'
        ? 'python'
        : 'text'

  let content = `# INFORME DE AUDITORÍA TÉCNICA — ATTESTLY
**Identificador de Auditoría:** \`${result.id}\`  
**Fecha de Emisión:** ${dateStr}  
**Motor de Análisis:** ${domainLabel}  
**Método Empleado:** ${result.method_used}  
**Latencia de Procesamiento:** ${result.processing_time_ms} ms  
**Índice de Confianza:** ${confidencePct}% — **[${riskMeta.shortLabel}]**

---

## 1. Muestra Auditada
\`\`\`${codeLang}
${result.original_text}
\`\`\`

---

## 2. Hallazgos y Análisis Detallado
`

  if ((result.mode === 'code' || result.mode === 'sql') && result.code_result) {
    const cr = result.code_result
    content += `### Resumen de Seguridad de Código (${(cr.language || 'python').toUpperCase()})
- **Sintaxis Válida:** ${cr.is_valid_syntax ? 'Sí' : 'No'}
- **Librerías Fantasma Detectadas:** ${cr.hallucinated_packages?.length || 0}${cr.hallucinated_packages?.length ? ` (\`${cr.hallucinated_packages.join('`, `')}\`)` : ''}
- **Alertas de Slopsquatting:** ${cr.suspicious_packages?.length || 0}${cr.suspicious_packages?.length ? ` (\`${cr.suspicious_packages.join('`, `')}\`)` : ''}
- **Vulnerabilidades OSV / CVE:** ${cr.vulnerabilities_found?.length || 0}
- **Nivel de Riesgo:** ${(cr.risk_level || result.risk_level || 'low').toUpperCase()}

### Desglose de Anomalías (${cr.issues?.length || 0}):
`
    if (cr.issues && cr.issues.length > 0) {
      cr.issues.forEach((issue, idx) => {
        const lineInfo = issue.line_number ? `Línea ${issue.line_number}` : 'Global'
        content += `${idx + 1}. **[${(issue.severity || 'high').toUpperCase()}]** \`${issue.category}\` (${lineInfo}) — \`${issue.symbol}\`: ${issue.message}\n`
        if (issue.suggestion) {
          content += `   - *Sugerencia:* ${issue.suggestion}\n`
        }
      })
    } else {
      content += `*No se detectaron anomalías de sintaxis, seguridad ni dependencias alucinadas en la muestra.*\n`
    }

    if (cr.corrected_code) {
      content += `\n### Parche Sugerido por IA:
\`\`\`${codeLang}
${cr.corrected_code}
\`\`\`
`
      if (cr.ai_explanation) {
        content += `\n*Explicación:* ${cr.ai_explanation}\n`
      }
    }
  } else if (result.mode === 'math' && result.math_result) {
    const mr = result.math_result
    content += `### Resumen de Verificación Simbólica (SymPy)
- **Ecuaciones Encontradas:** ${mr.total_equations_found ?? 0}
- **Ecuaciones Válidas:** ${mr.valid_equations ?? 0}
- **Ecuaciones Refutadas / Alucinadas:** ${mr.hallucinated_equations ?? 0}
- **Resumen:** ${mr.summary || (mr.has_hallucinations ? 'Se detectaron discrepancias matemáticas.' : 'Cálculos verificados correctamente.')}

### Desglose Paso a Paso:
`
    if (mr.steps && mr.steps.length > 0) {
      mr.steps.forEach((step) => {
        const status = step.is_valid ? 'VÁLIDA' : 'ALUCINACIÓN'
        content += `${step.step_number}. **[${status}]** \`${step.raw_expression}\`\n`
        if (!step.is_valid) {
          content += `   - **Valor esperado:** \`${step.expected_value ?? step.calculated_value ?? 'N/A'}\` (Discrepancia: \`${step.difference ?? 'N/A'}\`)\n`
          if (step.error_message) {
            content += `   - **Detalle:** ${step.error_message}\n`
          }
        }
      })
    } else {
      content += `*No se detectaron igualdades matemáticas verificables en el texto.*\n`
    }

    if (mr.corrected_solution) {
      content += `\n### Derivación Formal y Corrección:\n${mr.corrected_solution}\n`
    }
  } else if (result.claims) {
    content += `### Resumen de Afirmaciones Fácticas (${result.claims.length} evaluadas)
`
    result.claims.forEach((c, idx) => {
      const claimConf = ((c.confidence ?? 0) * 100).toFixed(1)
      const l2Status = c.l2
        ? (c.l2.verified === true
          ? `Verificada (${c.l2.source})`
          : c.l2.verified === false
            ? `Contradecida / Sin respaldo (${c.l2.source})`
            : `No concluyente (${c.l2.source})`)
        : 'Verificación externa desactivada'

      content += `#### ${idx + 1}. "${c.text}"
- **Riesgo:** ${(c.risk_level || 'evaluado').toUpperCase()} (Confianza: ${claimConf}%)
- **Capa 2 (Grounding Externo):** ${l2Status}
- **Explicación del Motor:** ${c.explanation || 'Análisis completado.'}
`
      if (c.l4 && c.l4.corrected_claim) {
        content += `- **Corrección IA:** ${c.l4.corrected_claim} *(${c.l4.explanation})*\n`
      }
    })
  }

  content += `\n---
*Informe generado automáticamente por ATTESTLY Engine v2.5 — Plataforma de Auditoría y Verificación de LLMs.*
`
  return content
}

export function downloadMarkdown(result) {
  const md = generateMarkdownReport(result)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attestly_audit_${(result.id || 'report').slice(0, 8)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadJSON(result) {
  const jsonStr = JSON.stringify(result, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attestly_audit_${(result.id || 'report').slice(0, 8)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printAuditReport(result) {
  if (!result) return

  const domainLabel = getDomainLabel(result)
  const riskMeta = getRiskMeta(result)
  const confidencePct = ((result.overall_score ?? 0) * 100).toFixed(1)

  const printWindow = window.open('', '_blank', 'width=850,height=950')
  if (!printWindow) {
    window.print()
    return
  }

  let detailsHtml = ''
  if ((result.mode === 'code' || result.mode === 'sql') && result.code_result) {
    const cr = result.code_result
    const issuesHtml = cr.issues?.length
      ? cr.issues.map(i => `
        <div class="issue-item">
          <strong>[${escapeHtml((i.severity || 'high').toUpperCase())}] ${escapeHtml(i.category)}</strong>
          (${i.line_number ? `Línea ${i.line_number}` : 'Global'}) — <code>${escapeHtml(i.symbol)}</code><br/>
          ${escapeHtml(i.message)}
          ${i.suggestion ? `<br/><span style="font-size: 11px; color: #047857;">Sugerencia: ${escapeHtml(i.suggestion)}</span>` : ''}
        </div>
      `).join('')
      : '<p>No se encontraron anomalías en el código evaluado.</p>'

    const patchHtml = cr.corrected_code
      ? `<h3 style="font-size: 12px; margin: 12px 0 6px;">Parche Técnico Sugerido:</h3><pre>${escapeHtml(cr.corrected_code)}</pre>`
      : ''

    detailsHtml = `
      <p style="margin-bottom: 10px;">
        <strong>Lenguaje:</strong> ${escapeHtml((cr.language || 'python').toUpperCase())} |
        <strong>Sintaxis:</strong> ${cr.is_valid_syntax ? 'Válida' : 'Error de sintaxis'} |
        <strong>Paquetes fantasma:</strong> ${cr.hallucinated_packages?.length || 0} |
        <strong>Slopsquatting:</strong> ${cr.suspicious_packages?.length || 0} |
        <strong>CVEs (OSV):</strong> ${cr.vulnerabilities_found?.length || 0}
      </p>
      ${issuesHtml}
      ${patchHtml}
    `
  } else if (result.mode === 'math' && result.math_result) {
    const mr = result.math_result
    const stepsHtml = mr.steps?.length
      ? mr.steps.map(s => `
        <div class="issue-item" style="border-left-color: ${s.is_valid ? '#10b981' : '#ef4444'};">
          <strong>Paso ${s.step_number} [${s.is_valid ? 'VÁLIDA' : 'ALUCINACIÓN'}]:</strong>
          <code>${escapeHtml(s.raw_expression)}</code><br/>
          ${s.is_valid
            ? '<span style="font-size: 11px; color: #047857;">Igualdad verificada simbólicamente por SymPy.</span>'
            : `<span style="font-size: 11px; color: #b91c1c;">Esperado: <code>${escapeHtml(s.expected_value ?? s.calculated_value)}</code> | Discrepancia: <code>${escapeHtml(s.difference)}</code></span>`
          }
        </div>
      `).join('')
      : '<p>No se encontraron ecuaciones verificables.</p>'

    const solHtml = mr.corrected_solution
      ? `<h3 style="font-size: 12px; margin: 12px 0 6px;">Derivación Formal:</h3><pre>${escapeHtml(mr.corrected_solution)}</pre>`
      : ''

    detailsHtml = `
      <p style="margin-bottom: 10px;"><strong>Resumen SymPy:</strong> ${escapeHtml(mr.summary)}</p>
      ${stepsHtml}
      ${solHtml}
    `
  } else {
    detailsHtml = result.claims?.length
      ? result.claims.map((c, idx) => `
        <div class="issue-item" style="border-left-color: ${c.risk_level === 'high' ? '#ef4444' : c.risk_level === 'medium' ? '#f59e0b' : '#10b981'};">
          <strong>${idx + 1}. "${escapeHtml(c.text)}"</strong><br/>
          <span style="font-size: 11px; color: #4b5563;">
            Riesgo: ${escapeHtml((c.risk_level || 'low').toUpperCase())} | Confianza: ${((c.confidence ?? 0) * 100).toFixed(1)}%
            ${c.l2 ? ` | Fuente: ${escapeHtml(c.l2.source)}` : ''}
          </span><br/>
          ${escapeHtml(c.explanation)}
          ${c.l4?.corrected_claim ? `<br/><span style="font-size: 11px; color: #047857;"><strong>Corrección IA:</strong> ${escapeHtml(c.l4.corrected_claim)}</span>` : ''}
        </div>
      `).join('')
      : '<p>No se extrajeron afirmaciones específicas.</p>'
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Attestly Audit Certificate - ${escapeHtml((result.id || 'audit').slice(0, 8))}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #111;
      background: #fff;
      padding: 40px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .badge {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: #eee;
      letter-spacing: 0.05em;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 4px; }
    .meta-label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
    .meta-val { font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; word-break: break-all; }
    
    .verdict-box {
      border: 1.5px solid ${riskMeta.color};
      background: ${riskMeta.color}12;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .verdict-text { font-weight: 700; font-size: 14px; color: ${riskMeta.color}; }
    .score-badge { font-size: 18px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${riskMeta.color}; }
    
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    pre {
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      overflow-x: auto;
      white-space: pre-wrap;
      margin-bottom: 16px;
    }
    code {
      font-family: 'JetBrains Mono', monospace;
      background: #f3f4f6;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 11.5px;
    }
    .issue-item {
      border-left: 3px solid #111;
      padding-left: 12px;
      margin-bottom: 12px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e5e7eb;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      color: #9ca3af;
      font-size: 11px;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">ATTESTLY AUDIT CERTIFICATE</div>
      <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">Sistema Formal de Verificación y Detección de Alucinaciones v2.5</div>
    </div>
    <span class="badge">AUDITED REPORT</span>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Audit ID</span>
      <span class="meta-val">${escapeHtml(result.id)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Dominio Auditado</span>
      <span class="meta-val">${escapeHtml(domainLabel)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Fecha y Hora</span>
      <span class="meta-val">${escapeHtml(new Date().toLocaleString())}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Latencia</span>
      <span class="meta-val">${result.processing_time_ms} ms</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Método</span>
      <span class="meta-val">${escapeHtml(result.method_used)}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Nivel de Confianza</span>
      <span class="meta-val">${confidencePct}%</span>
    </div>
  </div>

  <div class="verdict-box">
    <div>
      <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 2px;">Veredicto de Auditoría</div>
      <div class="verdict-text">${escapeHtml(riskMeta.label)}</div>
    </div>
    <div class="score-badge">${confidencePct}% CONFIANZA</div>
  </div>

  <h2>1. Muestra Auditada</h2>
  <pre>${escapeHtml(result.original_text)}</pre>

  <h2>2. Análisis Técnico</h2>
  <div>${detailsHtml}</div>

  <div class="footer">
    <span>Attestly Engine v2.5 — Informe de Auditoría de Alucinaciones</span>
    <span>Multi-Domain AI Verification Studio</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    }
  </script>
</body>
</html>
`
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
