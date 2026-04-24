import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLogs } from '../../src/hooks/useLogs.js'

vi.mock('../../src/services/api.js', () => ({
  fetchLogs: vi.fn(),
}))

import { fetchLogs } from '../../src/services/api.js'

describe('useLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carga los logs en el primer render', async () => {
    const mockLogs = [{ id: 1, channel: 'sms' }]
    fetchLogs.mockResolvedValue(mockLogs)
    const { result } = renderHook(() => useLogs(false))
    await waitFor(() => expect(result.current.logs).toEqual(mockLogs))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('expone el error cuando el fetch falla', async () => {
    fetchLogs.mockRejectedValue(new Error('No hay conexión'))
    const { result } = renderHook(() => useLogs(false))
    await waitFor(() => expect(result.current.error).toBe('No hay conexión'))
    expect(result.current.logs).toEqual([])
  })

  it('reload vuelve a llamar al fetch', async () => {
    fetchLogs.mockResolvedValue([])
    const { result } = renderHook(() => useLogs(false))
    await waitFor(() => expect(fetchLogs).toHaveBeenCalledTimes(1))
    await act(async () => { await result.current.reload() })
    expect(fetchLogs).toHaveBeenCalledTimes(2)
  })

  describe('autoRefresh', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('refresca automáticamente cada 5 segundos cuando está activo', async () => {
      fetchLogs.mockResolvedValue([])
      renderHook(() => useLogs(true))
      await vi.waitFor(() => expect(fetchLogs).toHaveBeenCalledTimes(1))
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      expect(fetchLogs).toHaveBeenCalledTimes(2)
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      expect(fetchLogs).toHaveBeenCalledTimes(3)
    })

    it('no refresca automáticamente cuando autoRefresh es false', async () => {
      fetchLogs.mockResolvedValue([])
      renderHook(() => useLogs(false))
      await vi.waitFor(() => expect(fetchLogs).toHaveBeenCalledTimes(1))
      await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
      expect(fetchLogs).toHaveBeenCalledTimes(1)
    })
  })
})