import { describe, it, expect } from 'vitest'

describe('utils', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const result = 'hello'.toUpperCase()
    expect(result).toBe('HELLO')
  })
}) 