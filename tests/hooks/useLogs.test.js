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

  it('loads the logs on first render', async () => {
    const mockLogs = [{ id: 1, channel: 'sms' }]
    fetchLogs.mockResolvedValue(mockLogs)
    const { result } = renderHook(() => useLogs(false))
    await waitFor(() => expect(result.current.logs).toEqual(mockLogs))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('exposes the error when fetch fails', async () => {
    fetchLogs.mockRejectedValue(new Error('No connection'))
    const { result } = renderHook(() => useLogs(false))
    await waitFor(() => expect(result.current.error).toBe('No connection'))
    expect(result.current.logs).toEqual([])
  })

  it('reload calls fetch again', async () => {
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

    it('auto-refreshes every 5 seconds when enabled', async () => {
      fetchLogs.mockResolvedValue([])
      renderHook(() => useLogs(true))
      await vi.waitFor(() => expect(fetchLogs).toHaveBeenCalledTimes(1))
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      expect(fetchLogs).toHaveBeenCalledTimes(2)
      await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
      expect(fetchLogs).toHaveBeenCalledTimes(3)
    })

    it('does not auto-refresh when autoRefresh is false', async () => {
      fetchLogs.mockResolvedValue([])
      renderHook(() => useLogs(false))
      await vi.waitFor(() => expect(fetchLogs).toHaveBeenCalledTimes(1))
      await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
      expect(fetchLogs).toHaveBeenCalledTimes(1)
    })
  })
})