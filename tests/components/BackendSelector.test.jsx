import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackendSelector from '../../src/components/BackendSelector/BackendSelector.jsx'
import { getBackend, setBackend } from '../../src/services/api.js'

describe('BackendSelector', () => {
  beforeEach(() => {
    setBackend('clojure')
  })

  it('renders both backend options', () => {
    render(<BackendSelector />)
    expect(screen.getByRole('button', { name: /clojure/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spring boot/i })).toBeInTheDocument()
  })

  it('marks the current backend as active', () => {
    render(<BackendSelector />)
    expect(screen.getByRole('button', { name: /clojure/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /spring boot/i })).not.toHaveClass('active')
  })

  it('clicking updates the active backend in the api module', async () => {
    render(<BackendSelector />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(getBackend()).toBe('springboot')
  })

  it('clicking fires onChange with the new backend', async () => {
    const onChange = vi.fn()
    render(<BackendSelector onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(onChange).toHaveBeenCalledWith('springboot')
  })

  it('updates the active styling when switching', async () => {
    render(<BackendSelector />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(screen.getByRole('button', { name: /spring boot/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /clojure/i })).not.toHaveClass('active')
  })
})