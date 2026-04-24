import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackendSelector from '../../src/components/BackendSelector/BackendSelector.jsx'
import { getBackend, setBackend } from '../../src/services/api.js'

describe('BackendSelector', () => {
  beforeEach(() => {
    setBackend('clojure')
  })

  it('renderiza ambas opciones de backend', () => {
    render(<BackendSelector />)
    expect(screen.getByRole('button', { name: /clojure/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spring boot/i })).toBeInTheDocument()
  })

  it('marca como activo el backend actual', () => {
    render(<BackendSelector />)
    expect(screen.getByRole('button', { name: /clojure/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /spring boot/i })).not.toHaveClass('active')
  })

  it('al hacer click cambia el backend activo en el módulo api', async () => {
    render(<BackendSelector />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(getBackend()).toBe('springboot')
  })

  it('al hacer click dispara onChange con el nuevo backend', async () => {
    const onChange = vi.fn()
    render(<BackendSelector onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(onChange).toHaveBeenCalledWith('springboot')
  })

  it('actualiza el estilo activo al cambiar', async () => {
    render(<BackendSelector />)
    await userEvent.click(screen.getByRole('button', { name: /spring boot/i }))
    expect(screen.getByRole('button', { name: /spring boot/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /clojure/i })).not.toHaveClass('active')
  })
})