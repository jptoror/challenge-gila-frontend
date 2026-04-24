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

  it('renders the form with all its fields', () => {
    render(<MessageForm />)
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('submit button starts disabled', () => {
    render(<MessageForm />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('enables the button when category and message are provided', async () => {
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'sports')
    await userEvent.type(screen.getByLabelText(/message/i), 'Hello')
    expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled()
  })

  it('shows the three available categories', () => {
    render(<MessageForm />)
    const select = screen.getByLabelText(/category/i)
    expect(select).toContainElement(screen.getByRole('option', { name: /sports/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /finance/i }))
    expect(select).toContainElement(screen.getByRole('option', { name: /movies/i }))
  })

  it('shows success message after sending', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', 'users-reached': 2, results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'sports')
    await userEvent.type(screen.getByLabelText(/message/i), 'Goal!')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('2 users')
    })
  })

  it('shows error when the API fails', async () => {
    sendMessage.mockRejectedValue(new Error('Connection error'))
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'finance')
    await userEvent.type(screen.getByLabelText(/message/i), 'Test')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Connection error')
    })
  })

  it('shows the count with a Spring Boot camelCase response', async () => {
    sendMessage.mockResolvedValue({ category: 'finance', usersReached: 3, results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'finance')
    await userEvent.type(screen.getByLabelText(/message/i), 'Dollar rising')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('3 users')
    })
  })

  it('shows 0 users when the response has no count field', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', results: [] })
    render(<MessageForm />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'sports')
    await userEvent.type(screen.getByLabelText(/message/i), 'Test')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('0 users')
    })
  })

  it('calls onSuccess after a successful send', async () => {
    sendMessage.mockResolvedValue({ category: 'sports', 'users-reached': 1, results: [] })
    const onSuccess = vi.fn()
    render(<MessageForm onSuccess={onSuccess} />)
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'movies')
    await userEvent.type(screen.getByLabelText(/message/i), 'New movie')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })
})