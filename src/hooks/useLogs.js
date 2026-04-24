import { useState, useEffect, useCallback } from 'react'
import { fetchLogs } from '../services/api.js'

export function useLogs(autoRefresh = false) {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLogs()
      setLogs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (!autoRefresh) return
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load, autoRefresh])

  return { logs, loading, error, reload: load }
}
