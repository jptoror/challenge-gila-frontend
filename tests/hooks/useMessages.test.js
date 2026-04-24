import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMessages } from '../../src/hooks/useMessages.js'

vi.mock('../../src/services/api.js', () => ({
  sendMessage: vi.fn(),
}))

import { sendMessage } from '../../src/services/api.js'

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('estado inicial correcto', () => {
    const { result } = renderHook(() => useMessages())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it('loading es true durante el dispatch', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useMessages())
    act(() => { result.current.dispatch('sports', 'Test') })
    expect(result.current.loading).toBe(true)
  })

  it('guarda el resultado cuando el dispatch es exitoso', async () => {
    const mockData = { category: 'sports', 'users-reached': 2 }
    sendMessage.mockResolvedValue(mockData)
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    expect(result.current.result).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('guarda el error cuando el dispatch falla', async () => {
    sendMessage.mockRejectedValue(new Error('Fallo de red'))
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    expect(result.current.error).toBe('Fallo de red')
    expect(result.current.result).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('reset limpia error y resultado', async () => {
    sendMessage.mockRejectedValue(new Error('Error'))
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    act(() => { result.current.reset() })
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })
})
