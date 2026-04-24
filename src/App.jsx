import { useState, useCallback } from 'react'
import MessageForm from './components/MessageForm/MessageForm.jsx'
import NotificationLog from './components/NotificationLog/NotificationLog.jsx'
import BackendSelector from './components/BackendSelector/BackendSelector.jsx'

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const bumpRefresh = useCallback(() => {
    setRefreshTrigger(n => n + 1)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '0.5px solid var(--color-border)',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '500' }}>Notification System</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Multichannel notification system
          </p>
        </div>
        <BackendSelector onChange={bumpRefresh} />
      </header>

      <main style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>
        <MessageForm onSuccess={bumpRefresh} />
        <NotificationLog refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}
