import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import NotificationLog from '../../src/components/NotificationLog/NotificationLog.jsx'

vi.mock('../../src/services/api.js', () => ({
  fetchLogs: vi.fn(),
}))

import { fetchLogs } from '../../src/services/api.js'

const mockLogs = [
  {
    id: 1,
    'user-name': 'Carlos Ruiz',
    category: 'sports',
    channel: 'sms',
    body: 'Goal for Honduras!',
    success: true,
    'sent-at': '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    'user-name': 'Ana Lopez',
    category: 'finance',
    channel: 'email',
    body: 'Dollar rising',
    success: false,
    'sent-at': '2024-03-15T10:31:00Z',
  },
]

describe('NotificationLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a message when there are no logs', async () => {
    fetchLogs.mockResolvedValue([])
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument()
    })
  })

  it('renders the logs when data is present', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
      expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
    })
  })

  it('shows the channel for each log', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  it('shows success and failure badges correctly', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Sent')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
  })

  it('shows an error when the API fails', async () => {
    fetchLogs.mockRejectedValue(new Error('No connection'))
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No connection')
    })
  })

  it('shows the record count', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/2 records/i)).toBeInTheDocument()
    })
  })

  it('renders logs in Spring Boot camelCase format', async () => {
    fetchLogs.mockResolvedValue([
      {
        id: 99,
        userId: 3,
        userName: 'Laura Gomez',
        channel: 'push',
        category: 'movies',
        body: 'Premiere today',
        success: true,
        sentAt: '2024-03-15T10:30:00Z',
      },
    ])
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Laura Gomez')).toBeInTheDocument()
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Premiere today')).toBeInTheDocument()
    })
  })
})