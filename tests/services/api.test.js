import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendMessage, fetchLogs, setBackend, getBackend } from '../../src/services/api.js'

describe('api.js — setBackend / getBackend', () => {
  it('default backend is clojure', () => {
    expect(getBackend()).toBe('clojure')
  })

  it('setBackend switches the active backend', () => {
    setBackend('springboot')
    expect(getBackend()).toBe('springboot')
    setBackend('clojure')
  })

  it('setBackend throws on an unknown backend', () => {
    expect(() => setBackend('laravel')).toThrow('Unknown backend: laravel')
  })
})

describe('api.js — sendMessage validation', () => {
  it('throws when category is empty', async () => {
    await expect(sendMessage('', 'message')).rejects.toThrow('Category')
  })

  it('throws when body is empty', async () => {
    await expect(sendMessage('sports', '')).rejects.toThrow('empty')
  })

  it('throws when body is only whitespace', async () => {
    await expect(sendMessage('sports', '   ')).rejects.toThrow('empty')
  })
})

describe('api.js — sendMessage fetch', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls the correct endpoint with POST', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ category: 'sports', 'users-reached': 2, results: [] }),
    })

    await sendMessage('sports', 'Goal!')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/messages'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns the data when the response is ok', async () => {
    const mockData = { category: 'sports', 'users-reached': 2, results: [] }
    global.fetch.mockResolvedValue({ ok: true, json: async () => mockData })

    const result = await sendMessage('sports', 'Test')
    expect(result).toEqual(mockData)
  })

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Validation failed' }),
    })

    await expect(sendMessage('sports', 'Test')).rejects.toThrow('Validation failed')
  })
})

describe('api.js — backend routing', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ logs: [] }) })
  })

  afterEach(() => {
    setBackend('clojure')
    vi.restoreAllMocks()
  })

  it('with clojure backend uses port 3010', async () => {
    setBackend('clojure')
    await fetchLogs()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3010/api/logs')
    )
  })

  it('with springboot backend uses port 8088', async () => {
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

  it('returns the logs array when the response is ok', async () => {
    const mockLogs = [{ id: 1, channel: 'sms', category: 'sports' }]
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ logs: mockLogs }),
    })

    const result = await fetchLogs()
    expect(result).toEqual(mockLogs)
  })

  it('returns an empty array when there are no logs', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ logs: [] }),
    })

    const result = await fetchLogs()
    expect(result).toEqual([])
  })

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal error' }),
    })

    await expect(fetchLogs()).rejects.toThrow('Internal error')
  })
})