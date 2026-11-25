import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1' })

export async function analyzeText(payload) {
  const { data } = await http.post('/analyze', payload)
  return data
}

export async function liveAudit(payload) {
  const { data } = await http.post('/live-audit', payload)
  return data
}

async function _consumeSSE(url, payload, onProgress, onGenerated) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errText = await response.text()
    let msg = 'Error en el servidor de análisis.'
    try {
      const parsed = JSON.parse(errText)
      msg = parsed.detail || msg
    } catch {}
    throw new Error(msg)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResult = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop()

    for (const chunk of chunks) {
      const trimmed = chunk.trim()
      if (trimmed.startsWith('data: ')) {
        let parsed = null
        try {
          parsed = JSON.parse(trimmed.slice(6))
          if (parsed.event === 'layer_progress') {
            onProgress?.(parsed.data)
          } else if (parsed.event === 'llm_response') {
            onGenerated?.(parsed.data)
          } else if (parsed.event === 'final_result') {
            finalResult = parsed.data
          } else if (parsed.event === 'error') {
            throw new Error(parsed.data)
          }
        } catch (e) {
          if (e.message && parsed?.event === 'error') throw e
        }
      }
    }
  }

  if (!finalResult) {
    throw new Error('El servidor cerró la conexión sin emitir un veredicto final.')
  }
  return finalResult
}

export async function analyzeTextStream(payload, onProgress) {
  return _consumeSSE('/api/v1/analyze/stream', payload, onProgress, null)
}

export async function liveAuditStream(payload, onProgress, onGenerated) {
  return _consumeSSE('/api/v1/live-audit/stream', payload, onProgress, onGenerated)
}
