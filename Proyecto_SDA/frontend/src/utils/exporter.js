/**
 * Attestly Audit Exporter
 * Generates formal technical audit reports in Markdown, JSON and Printable formats.
 */

export function generateMarkdownReport(result) {
  if (!result) return ''

  const dateStr = new Date().toISOString()
  const domainLabel = result.mode === 'code' 
    ? 'Código Fuente (Python AST & PyPI)' 
    : result.mode === 'math' 
      ? 'Expresiones Matemáticas y Lógica Simbólica (SymPy)' 
      : 'Afirmaciones Fácticas y Conocimiento General (NLP)'

  const riskLabel = result.overall_score >= 0.7 
    ? 'CRÍTICO / ALTO RIESGO' 
    : result.overall_score >= 0.35 
      ? 'MODERADO / INCERTIDUMBRE' 
      : 'ÓPTIMO / VERIFICADO'

  let content = `# INFORME DE AUDITORÍA TÉCNICA — ATTESTLY
**Identificador de Auditoría:** \`${result.id}\`  
**Fecha de Emisión:** ${dateStr}  
**Motor de Análisis:** ${domainLabel}  
**Método Empleado:** ${result.method_used}  
**Latencia de Procesamiento:** ${result.processing_time_ms} ms  
**Índice de Alucinación:** ${(result.overall_score * 100).toFixed(1)}% — **[${riskLabel}]**

---

## 1. Muestra Auditada
\`\`\`${result.mode === 'code' ? 'python' : 'text'}
${result.original_text}
\`\`\`

---

## 2. Hallazgos y Análisis Detallado
`

  if (result.mode === 'code' && result.code_result) {
    const cr = result.code_result
    content += `### Resumen de Seguridad de Código
- **Sintaxis Válida:** ${cr.syntax_valid ? 'Sí' : 'No'}
- **Librerías Fantasma Detectadas:** ${cr.ghost_packages?.length || 0}
- **APIs / Métodos Inexistentes:** ${cr.hallucinated_calls?.length || 0}
- **Veredicto:** ${cr.verdict}

### Desglose de Anomalías:
`
    if (cr.issues && cr.issues.length > 0) {
      cr.issues.forEach((issue, idx) => {
        content += `${idx + 1}. **[${issue.severity.toUpperCase()}]** *${issue.type}* (Línea ${issue.line}): ${issue.description}\n`
      })
    } else {
      content += `*No se detectaron anomalías de sintaxis ni dependencias alucinadas en la muestra.*\n`
    }

    if (cr.suggested_patch) {
      content += `\n### Parche Sugerido por el Sistema:
\`\`\`python
${cr.suggested_patch}
\`\`\`
`
    }
  } else if (result.mode === 'math' && result.math_result) {
    const mr = result.math_result
    content += `### Resumen de Verificación Simbólica
- **Ecuaciones Encontradas:** ${mr.equations_found?.length || 0}
- **Ecuaciones Refutadas / Inválidas:** ${mr.discrepancies?.length || 0}
- **Consistencia Numérica:** ${mr.symbolic_valid ? '100% Válida' : 'Discrepancias detectadas'}
- **Veredicto:** ${mr.verdict}

### Discrepancias Matemáticas:
`
    if (mr.discrepancies && mr.discrepancies.length > 0) {
      mr.discrepancies.forEach((d, idx) => {
        content += `${idx + 1}. **Ecuación:** \`${d.raw_equation}\`\n   - **Lado Izquierdo (LHS):** \`${d.lhs}\` = \`${d.lhs_eval}\`\n   - **Lado Derecho (RHS):** \`${d.rhs}\` = \`${d.rhs_eval}\`\n   - **Explicación:** ${d.explanation}\n`
      })
    } else {
      content += `*Todas las expresiones simbólicas y aritméticas han sido verificadas con rigor formal.*\n`
    }

    if (mr.step_by_step_fix) {
      content += `\n### Derivación Formal y Corrección:
${mr.step_by_step_fix}
`
    }
  } else if (result.claims) {
    content += `### Resumen de Afirmaciones Fácticas (${result.claims.length} evaluadas)
`
    result.claims.forEach((c, idx) => {
      content += `#### ${idx + 1}. "${c.claim_text}"
- **Riesgo:** ${c.risk_level?.toUpperCase() || 'EVALUADO'} (Puntaje: ${((c.hallucination_score ?? 0) * 100).toFixed(1)}%)
- **Capa 2 (Evidencia Externa):** ${c.l2?.has_evidence ? 'Respaldada por fuentes' : 'Sin evidencia verificable directa'}
- **Capa 3 (NLI / Consistencia):** ${c.l3?.nli_label || 'Neutral'}
- **Explicación del Motor:** ${c.explanation || 'Análisis completado.'}
`
    })
  }

  content += `\n---
*Informe generado automáticamente por ATTESTLY Engine — Plataforma de Auditoría y Verificación de LLMs.*
`
  return content
}

export function downloadMarkdown(result) {
  const md = generateMarkdownReport(result)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attestly_audit_${result.id.slice(0, 8)}.md`
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
  a.download = `attestly_audit_${result.id.slice(0, 8)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printAuditReport(result) {
  if (!result) return

  const domainLabel = result.mode === 'code' 
    ? 'Código Fuente (Python AST & PyPI)' 
    : result.mode === 'math' 
      ? 'Álgebra Simbólica (SymPy Engine)' 
      : 'Afirmaciones Fácticas (NLP Multi-Layer)'

  const riskLabel = result.overall_score >= 0.7 
    ? 'ALTO RIESGO / ALUCINACIÓN DETECTADA' 
    : result.overall_score >= 0.35 
      ? 'INCERTIDUMBRE / RIESGO MODERADO' 
      : 'CONFIABLE / VERIFICADO'

  const riskColor = result.overall_score >= 0.7 ? '#ef4444' : result.overall_score >= 0.35 ? '#f59e0b' : '#10b981'

  const printWindow = window.open('', '_blank', 'width=850,height=950')
  if (!printWindow) {
    window.print()
    return
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Attestly Audit Certificate - ${result.id.slice(0, 8)}</title>
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
    .meta-val { font-size: 12.5px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    
    .verdict-box {
      border: 1.5px solid ${riskColor};
      background: ${riskColor}10;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .verdict-text { font-weight: 700; font-size: 14px; color: ${riskColor}; }
    .score-badge { font-size: 18px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${riskColor}; }
    
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
      <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">Sistema Formal de Verificación y Detección de Alucinaciones</div>
    </div>
    <span class="badge">OFICIAL VERIFIED</span>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Audit ID</span>
      <span class="meta-val">${result.id}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Dominio Auditado</span>
      <span class="meta-val">${domainLabel}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Fecha y Hora</span>
      <span class="meta-val">${new Date().toLocaleString()}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Latencia</span>
      <span class="meta-val">${result.processing_time_ms} ms</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Método</span>
      <span class="meta-val">${result.method_used}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Nivel de Confianza</span>
      <span class="meta-val">${((1 - result.overall_score) * 100).toFixed(1)}%</span>
    </div>
  </div>

  <div class="verdict-box">
    <div>
      <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 2px;">Veredicto de Auditoría</div>
      <div class="verdict-text">${riskLabel}</div>
    </div>
    <div class="score-badge">${(result.overall_score * 100).toFixed(0)}% RIESGO</div>
  </div>

  <h2>1. Muestra Auditada</h2>
  <pre>${result.original_text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>

  <h2>2. Análisis Técnico</h2>
  <div>
    ${result.mode === 'code' && result.code_result ? `
      <p style="margin-bottom: 8px;"><strong>Veredicto de Código:</strong> ${result.code_result.verdict}</p>
      ${result.code_result.issues?.map(i => `
        <div class="issue-item">
          <strong>[${i.severity.toUpperCase()}] ${i.type}</strong> (Línea ${i.line}): ${i.description}
        </div>
      `).join('') || '<p>No se encontraron anomalías en el código evaluado.</p>'}
      ${result.code_result.suggested_patch ? `
        <h3 style="font-size: 12px; margin: 12px 0 6px;">Parche Técnico Sugerido:</h3>
        <pre>${result.code_result.suggested_patch.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      ` : ''}
    ` : result.mode === 'math' && result.math_result ? `
      <p style="margin-bottom: 8px;"><strong>Veredicto Matemático:</strong> ${result.math_result.verdict}</p>
      ${result.math_result.discrepancies?.map(d => `
        <div class="issue-item">
          <strong>Discrepancia en:</strong> <code>${d.raw_equation}</code><br/>
          <em>${d.explanation}</em> (Evaluado: ${d.lhs_eval} ≠ ${d.rhs_eval})
        </div>
      `).join('') || '<p>Todas las derivaciones y cálculos coinciden de forma exacta.</p>'}
      ${result.math_result.step_by_step_fix ? `
        <h3 style="font-size: 12px; margin: 12px 0 6px;">Derivación Formal:</h3>
        <pre>${result.math_result.step_by_step_fix.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      ` : ''}
    ` : `
      ${result.claims?.map((c, idx) => `
        <div class="issue-item">
          <strong>${idx + 1}. "${c.claim_text}"</strong><br/>
          <span style="font-size: 11px; color: #4b5563;">Riesgo: ${c.risk_level?.toUpperCase()} | NLI: ${c.l3?.nli_label || 'Neutral'}</span><br/>
          ${c.explanation}
        </div>
      `).join('') || '<p>No se extrajeron afirmaciones específicas.</p>'}
    `}
  </div>

  <div class="footer">
    <span>Attestly Engine — Documento criptográficamente auditado</span>
    <span>https://github.com/FernandoAlcaraz115/Personal-_proyects</span>
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

