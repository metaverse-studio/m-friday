import { describe, expect, test } from 'bun:test'
import { authenticate, hasPlatformAuthenticator } from './fido'
import {
  getFixedUserIdSync,
  bufferToBase64,
  base64ToBuffer,
  getSavedCredentialId,
  saveCredentialId,
  clearSavedCredentialId,
} from './fingerprint'

describe('fido & fingerprint', () => {
  test('hasPlatformAuthenticator trả boolean không ném lỗi', async () => {
    const available = await hasPlatformAuthenticator()
    expect(typeof available).toBe('boolean')
  })

  test('authenticate trả về real hoặc simulated không ném lỗi', async () => {
    const mode = await authenticate()
    expect(['real', 'simulated']).toContain(mode)
  })

  test('getFixedUserIdSync trả về Uint8Array 32-byte cố định', () => {
    const id1 = getFixedUserIdSync()
    const id2 = getFixedUserIdSync()
    expect(id1 instanceof Uint8Array).toBe(true)
    expect(id1.byteLength).toBe(32)
    // Cùng một phiên phải trả về byte giống hệt nhau
    expect(Array.from(id1)).toEqual(Array.from(id2))
  })

  test('bufferToBase64 và base64ToBuffer mã hóa & giải mã chuẩn xác 100%', () => {
    const original = new Uint8Array([10, 20, 30, 40, 255, 0, 128, 77])
    const b64 = bufferToBase64(original.buffer as ArrayBuffer)
    expect(typeof b64).toBe('string')
    const decoded = base64ToBuffer(b64)
    expect(Array.from(decoded)).toEqual(Array.from(original))
  })

  test('quản lý Credential ID qua save, get, clear', () => {
    clearSavedCredentialId()
    expect(getSavedCredentialId()).toBeNull()

    saveCredentialId('mock_cred_12345')
    expect(getSavedCredentialId()).toBe('mock_cred_12345')

    clearSavedCredentialId()
    expect(getSavedCredentialId()).toBeNull()
  })
})
