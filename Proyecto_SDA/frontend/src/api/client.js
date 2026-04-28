import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1' })

export async function analyzeText(payload) {
  const { data } = await http.post('/analyze', payload)
  return data
}
