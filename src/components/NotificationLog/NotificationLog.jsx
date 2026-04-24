import { useEffect } from 'react'
import { useLogs } from '../../hooks/useLogs.js'
import { formatLog } from '../../services/logMapper.js'
import StatusBadge from '../StatusBadge/StatusBadge.jsx'
import './NotificationLog.css'

const CATEGORY_COLORS = {
  sports:  { bg: 'var(--color-green-bg)',  text: 'var(--color-green-text)'  },
  finance: { bg: 'var(--color-amber-bg)',  text: 'var(--color-amber-text)'  },
  movies:  { bg: 'var(--color-purple-bg)', text: 'var(--color-purple-text)' },
}

const CHANNEL_LABELS = {
  sms:   'SMS',
  email: 'Email',
  push:  'Push',
}

function formatDate(raw) {
  if (!raw) return '—'
  try {
    return new Intl.DateTimeFormat('en', {
      day:    '2-digit',
      month:  '2-digit',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

function CategoryBadge({ category }) {
  const colors = CATEGORY_COLORS[category] ?? {
    bg: 'var(--color-bg)', text: 'var(--color-text-secondary)'
  }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      background: colors.bg,
      color: colors.text,
      textTransform: 'capitalize',
    }}>
      {category}
    </span>
  )
}

export default function NotificationLog({ refreshTrigger }) {
  const { logs, loading, error, reload } = useLogs(false)

  useEffect(() => {
    if (refreshTrigger === undefined || refreshTrigger === 0) return
    reload()
  }, [refreshTrigger, reload])

  return (
    <div className="log-card">
      <div className="log-header">
        <h2 className="log-title">Notification history</h2>
        <button className="reload-btn" onClick={reload} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="log-error" role="alert">{error}</div>
      )}

      {!error && logs.length === 0 && !loading && (
        <div className="log-empty">No notifications yet. Send a message to get started.</div>
      )}

      {logs.length > 0 && (
        <div className="log-table-wrap">
          <table className="log-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Category</th>
                <th>Channel</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(raw => {
                const log = formatLog(raw)
                return (
                  <tr key={log.id ?? `${log.userId}-${log.sentAt}`}>
                    <td>
                      <span className="user-name">{log.userName}</span>
                    </td>
                    <td>
                      <CategoryBadge category={log.category} />
                    </td>
                    <td>
                      <span className="channel-tag">
                        {CHANNEL_LABELS[log.channel] ?? log.channel}
                      </span>
                    </td>
                    <td>
                      <span className="message-body">{log.body}</span>
                    </td>
                    <td>
                      <StatusBadge success={log.success} />
                    </td>
                    <td>
                      <span className="sent-at">{formatDate(log.sentAt)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="log-footer">
        {logs.length > 0 && (
          <span className="log-count">{logs.length} record{logs.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}
