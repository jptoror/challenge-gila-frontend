import { useState } from 'react'
import { useMessages } from '../../hooks/useMessages.js'
import './MessageForm.css'

const CATEGORIES = [
  { value: 'sports',  label: 'Sports'  },
  { value: 'finance', label: 'Finance' },
  { value: 'movies',  label: 'Movies'  },
]

export default function MessageForm({ onSuccess }) {
  const [category, setCategory] = useState('')
  const [body,     setBody]     = useState('')
  const { dispatch, loading, error, result, reset } = useMessages()

  async function handleSubmit(e) {
    e.preventDefault()
    const data = await dispatch(category, body)
    if (data) {
      setCategory('')
      setBody('')
      onSuccess?.()
    }
  }

  function handleChange() {
    if (error || result) reset()
  }

  return (
    <div className="form-card">
      <h2 className="form-title">Send message</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label className="field-label" htmlFor="category">Category</label>
          <select
            id="category"
            className="field-input"
            value={category}
            onChange={e => { setCategory(e.target.value); handleChange() }}
            required
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="body">Message</label>
          <textarea
            id="body"
            className="field-input field-textarea"
            placeholder="Write your message here..."
            value={body}
            onChange={e => { setBody(e.target.value); handleChange() }}
            rows={4}
            required
          />
          <span className="field-hint">{body.trim().length} characters</span>
        </div>

        {error && (
          <div className="form-error" role="alert">{error}</div>
        )}

        {result && (
          <div className="form-success" role="status">
            Message sent to {result['users-reached'] ?? result.usersReached ?? 0} user{(result['users-reached'] ?? result.usersReached ?? 0) !== 1 ? 's' : ''}.
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !category || !body.trim()}
        >
          {loading ? 'Sending...' : 'Send notification'}
        </button>
      </form>
    </div>
  )
}
