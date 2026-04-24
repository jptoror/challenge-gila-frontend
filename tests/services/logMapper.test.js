import { describe, it, expect } from 'vitest'
import { formatLog } from '../../src/services/logMapper.js'

describe('formatLog', () => {
  it('normalizes the Clojure kebab-case format', () => {
    const raw = {
      id: 1,
      'user-id': 42,
      'user-name': 'Carlos Ruiz',
      channel: 'sms',
      category: 'sports',
      body: 'Goal!',
      success: true,
      'sent-at': '2024-03-15T10:30:00Z',
    }
    expect(formatLog(raw)).toEqual({
      id: 1,
      userId: 42,
      userName: 'Carlos Ruiz',
      channel: 'sms',
      category: 'sports',
      body: 'Goal!',
      success: true,
      sentAt: '2024-03-15T10:30:00Z',
    })
  })

  it('normalizes the Spring Boot camelCase format', () => {
    const raw = {
      id: 2,
      userId: 7,
      userName: 'Ana Lopez',
      channel: 'email',
      category: 'finance',
      body: 'Dollar rising',
      success: false,
      sentAt: '2024-03-15T10:31:00Z',
    }
    expect(formatLog(raw)).toEqual({
      id: 2,
      userId: 7,
      userName: 'Ana Lopez',
      channel: 'email',
      category: 'finance',
      body: 'Dollar rising',
      success: false,
      sentAt: '2024-03-15T10:31:00Z',
    })
  })

  it('normalizes the snake_case format', () => {
    const raw = {
      id: 3,
      user_id: 9,
      user_name: 'Maria',
      channel: 'push',
      category: 'movies',
      body: 'New movie',
      success: true,
      sent_at: '2024-03-15T10:32:00Z',
    }
    const out = formatLog(raw)
    expect(out.userId).toBe(9)
    expect(out.userName).toBe('Maria')
    expect(out.sentAt).toBe('2024-03-15T10:32:00Z')
  })

  it('kebab-case takes precedence over camelCase when both are present', () => {
    const raw = {
      id: 4,
      'user-name': 'kebab-wins',
      userName: 'camel-loses',
      'sent-at': 'kebab-date',
      sentAt: 'camel-date',
    }
    const out = formatLog(raw)
    expect(out.userName).toBe('kebab-wins')
    expect(out.sentAt).toBe('kebab-date')
  })

  it('returns undefined for missing fields without breaking', () => {
    const out = formatLog({ id: 5, channel: 'sms' })
    expect(out.userId).toBeUndefined()
    expect(out.userName).toBeUndefined()
    expect(out.sentAt).toBeUndefined()
    expect(out.channel).toBe('sms')
  })
})