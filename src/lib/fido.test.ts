import { describe, expect, test } from 'bun:test'
import { authenticate, hasPlatformAuthenticator } from './fido'

describe('fido', () => {
  test('hasPlatformAuthenticator trả boolean không ném lỗi', async () => {
    const available = await hasPlatformAuthenticator()
    expect(typeof available).toBe('boolean')
  })

  test('authenticate trả về real hoặc simulated không ném lỗi', async () => {
    const mode = await authenticate()
    expect(['real', 'simulated']).toContain(mode)
  })
})
