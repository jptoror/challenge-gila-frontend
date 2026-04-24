const BACKENDS = {
  clojure:    'http://localhost:3010',
  springboot: 'http://localhost:8088',
}

let activeBackend = 'clojure'

export function setBackend(backend) {
  if (!BACKENDS[backend]) throw new Error(`Backend desconocido: ${backend}`)
  activeBackend = backend
}

export function getBackend() {
  return activeBackend
}

function baseUrl() {
  return BACKENDS[activeBackend]
}

export async function sendMessage(category, body) {
  if (!category) throw new Error('La categoría es requerida')
  if (!body || body.trim() === '') throw new Error('El mensaje no puede estar vacío')

  const response = await fetch(`${baseUrl()}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, body: body.trim() }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`)
  }

  return data
}

export async function fetchLogs() {
  const response = await fetch(`${baseUrl()}/api/logs`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`)
  }

  return data.logs ?? []
}
