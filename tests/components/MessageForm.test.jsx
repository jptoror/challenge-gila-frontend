import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageForm from '../../src/components/MessageForm/MessageForm.jsx'

vi.mock('../../src/services/api.js', () => ({
  sendMessage: vi.fn(),
}))

import { sendMessage } from '../../src/services/api.js'

describe('MessageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el formulario con todos sus campos', () => {
    render(<MessageForm />)
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument()
  })

  it('el botón de submit empieza deshabilitado', () => {
    render(<MessageForm />)
    expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled()
  })

  it('el botón se habilita cuando hay categoría y mensaje', async () => {
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'sports')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Hola')
    expect(screen.getByRole('button', { name: /enviar/i })).not.toBeDisabled()
  })

  it('muestra las tres categorías disponibles', () => {
    render(<MessageForm />)
    const select = screen.getByLabelText(/categoría/i)
    expect(select).toContainElement(screen.getByRole('option', { name: /sports/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /finance/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /movies/i }))
  })

  it('muestra mensaje de éxito después de enviar', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', 'users-reached': 2, results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'sports')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Gol!')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('2 usuarios')
    })
  })

  it('muestra error cuando el API falla', async () => {
    sendMessage.mockRejectedValue(new Error('Error de conexión'))
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'finance')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Test')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión')
    })
  })

  it('muestra el conteo con respuesta camelCase de Spring Boot', async () => {
    sendMessage.mockResolvedValue({ category: 'finance', usersReached: 3, results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'finance')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Subida del dólar')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('3 usuarios')
    })
  })

  it('muestra 0 usuarios cuando la respuesta no trae el campo', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'sports')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Test')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('0 usuarios')
    })
  })

  it('llama a onSuccess después de enviar con éxito', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', 'users-reached': 1, results: [] })
    const onSuccess = vi.fn()
    render(<MessageForm onSuccess={onSuccess} />)
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'movies')
    await userEvent.type(screen.getByLabelText(/mensaje/i), 'Nueva película')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })
})
