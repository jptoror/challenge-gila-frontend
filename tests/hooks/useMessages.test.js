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

  it('has the correct initial state', () => {
    const { result } = renderHook(() => useMessages())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it('loading is true during dispatch', async () => {
    sendMessage.mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useMessages())
    act(() => { result.current.dispatch('sports', 'Test') })
    expect(result.current.loading).toBe(true)
  })

  it('stores the result when dispatch succeeds', async () => {
    const mockData = { category: 'sports', 'users-reached': 2 }
    sendMessage.mockResolvedValue(mockData)
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    expect(result.current.result).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('stores the error when dispatch fails', async () => {
    sendMessage.mockRejectedValue(new Error('Network failure'))
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    expect(result.current.error).toBe('Network failure')
    expect(result.current.result).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('reset clears error and result', async () => {
    sendMessage.mockRejectedValue(new Error('Error'))
    const { result } = renderHook(() => useMessages())
    await act(async () => { await result.current.dispatch('sports', 'Test') })
    act(() => { result.current.reset() })
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })
})