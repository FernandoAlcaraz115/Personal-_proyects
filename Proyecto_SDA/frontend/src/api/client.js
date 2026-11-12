import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1' })

export async function analyzeText(payload) {
  const { data } = await http.post('/analyze', payload)
  return data
}

export async function analyzeTextStream(payload, onProgress) {
  const response = await fetch('/api/v1/analyze/stream', {
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
        try {
          const parsed = JSON.parse(trimmed.slice(6))
          if (parsed.event === 'layer_progress') {
            onProgress?.(parsed.data)
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
