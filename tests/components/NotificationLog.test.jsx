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
    body: 'Gol de Honduras!',
    success: true,
    'sent-at': '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    'user-name': 'Ana López',
    category: 'finance',
    channel: 'email',
    body: 'Dólar sube',
    success: false,
    'sent-at': '2024-03-15T10:31:00Z',
  },
]

describe('NotificationLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra mensaje cuando no hay logs', async () => {
    fetchLogs.mockResolvedValue([])
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/no hay notificaciones/i)).toBeInTheDocument()
    })
  })

  it('renderiza los logs cuando hay datos', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
      expect(screen.getByText('Ana López')).toBeInTheDocument()
    })
  })

  it('muestra el canal de cada log', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  it('muestra badge de éxito y fallido correctamente', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Enviado')).toBeInTheDocument()
      expect(screen.getByText('Fallido')).toBeInTheDocument()
    })
  })

  it('muestra error cuando el API falla', async () => {
    fetchLogs.mockRejectedValue(new Error('Sin conexión'))
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión')
    })
  })

  it('muestra el conteo de registros', async () => {
    fetchLogs.mockResolvedValue(mockLogs)
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/2 registros/i)).toBeInTheDocument()
    })
  })

  it('renderiza logs en formato camelCase de Spring Boot', async () => {
    fetchLogs.mockResolvedValue([
      {
        id: 99,
        userId: 3,
        userName: 'Laura Gómez',
        channel: 'push',
        category: 'movies',
        body: 'Estreno hoy',
        success: true,
        sentAt: '2024-03-15T10:30:00Z',
      },
    ])
    render(<NotificationLog refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('Laura Gómez')).toBeInTheDocument()
      expect(screen.getByText('Push')).toBeInTheDocument()
      expect(screen.getByText('Estreno hoy')).toBeInTheDocument()
    })
  })
})
