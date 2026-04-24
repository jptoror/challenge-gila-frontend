import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendMessage, fetchLogs, setBackend, getBackend } from '../../src/services/api.js'

describe('api.js — setBackend / getBackend', () => {
  it('el backend por defecto es clojure', () => {
    expect(getBackend()).toBe('clojure')
  })

  it('setBackend cambia el backend activo', () => {
    setBackend('springboot')
    expect(getBackend()).toBe('springboot')
    setBackend('clojure')
  })

  it('setBackend lanza error con backend desconocido', () => {
    expect(() => setBackend('laravel')).toThrow('Backend desconocido: laravel')
  })
})

describe('api.js — sendMessage validaciones', () => {
  it('lanza error si category está vacío', async () => {
    await expect(sendMessage('', 'mensaje')).rejects.toThrow('categoría')
  })

  it('lanza error si body está vacío', async () => {
    await expect(sendMessage('sports', '')).rejects.toThrow('vacío')
  })

  it('lanza error si body es solo espacios', async () => {
    await expect(sendMessage('sports', '   ')).rejects.toThrow('vacío')
  })
})

describe('api.js — sendMessage fetch', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('llama al endpoint correcto con POST', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ category: 'sports', 'users-reached': 2, results: [] }),
    })

    await sendMessage('sports', 'Gol!')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/messages'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('retorna los datos cuando la respuesta es ok', async () => {
    const mockData = { category: 'sports', 'users-reached': 2, results: [] }
    global.fetch.mockResolvedValue({ ok: true, json: async () => mockData })

    const result = await sendMessage('sports', 'Test')
    expect(result).toEqual(mockData)
  })

  it('lanza error cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Validación fallida' }),
    })

    await expect(sendMessage('sports', 'Test')).rejects.toThrow('Validación fallida')
  })
})

describe('api.js — ruteo por backend', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ logs: [] }) })
  })

  afterEach(() => {
    setBackend('clojure')
    vi.restoreAllMocks()
  })

  it('con backend clojure usa el puerto 3010', async () => {
    setBackend('clojure')
    await fetchLogs()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3010/api/logs')
    )
  })

  it('con backend springboot usa el puerto 8088', async () => {
    setBackend('springboot')
    await fetchLogs()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:8088/api/logs')
    )
  })
})

describe('api.js — fetchLogs', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna array de logs cuando la respuesta es ok', async () => {
    const mockLogs = [{ id: 1, channel: 'sms', category: 'sports' }]
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ logs: mockLogs }),
    })

    const result = await fetchLogs()
    expect(result).toEqual(mockLogs)
  })

  it('retorna array vacío si no hay logs', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ logs: [] }),
    })

    const result = await fetchLogs()
    expect(result).toEqual([])
  })

  it('lanza error cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Error interno' }),
    })

    await expect(fetchLogs()).rejects.toThrow('Error interno')
  })
})
