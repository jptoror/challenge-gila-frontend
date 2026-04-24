import { useState } from 'react'
import { sendMessage } from '../services/api.js'

export function useMessages() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [result,  setResult]  = useState(null)

  async function dispatch(category, body) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await sendMessage(category, body)
      setResult(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setError(null)
    setResult(null)
  }

  return { dispatch, loading, error, result, reset }
}
