import FingerprintJS from '@fingerprintjs/fingerprintjs'

const USER_ID_KEY = 'msb_fido_user_id'
const CREDENTIAL_ID_KEY = 'msb_fido_credential_id'

// Cache in-memory để truy xuất 0ms không await trong Safari User Gesture
let cachedUserId: Uint8Array | null = null

/**
 * Chuyển đổi ArrayBuffer sang Base64 chuỗi để lưu LocalStorage
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0)
  }
  return btoa(binary)
}

/**
 * Chuyển đổi Base64 chuỗi sang Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Băm chuỗi bất kỳ thành 32-byte Uint8Array dùng cho WebAuthn user.id
 */
function stringTo32Bytes(str: string): Uint8Array {
  const bytes = new Uint8Array(32)
  for (let i = 0; i < str.length; i++) {
    const byteIndex = i % 32
    bytes[byteIndex] = (bytes[byteIndex]! ^ str.charCodeAt(i)) & 0xff
  }
  // Thêm muối cố định để tránh byte toàn 0
  for (let i = 0; i < 32; i++) {
    bytes[i] = (bytes[i]! + (i * 7 + 13)) & 0xff
  }
  return bytes
}

// In-memory fallback cho môi trường không có localStorage (Bun test/SSR)
const memoryStore: Record<string, string> = {}

function getStorageItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key)
    } catch {}
  }
  return memoryStore[key] ?? null
}

function setStorageItem(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value)
    } catch {}
  }
  memoryStore[key] = value
}

function removeStorageItem(key: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key)
    } catch {}
  }
  delete memoryStore[key]
}

/**
 * Khởi tạo FingerprintJS ngầm khi mở màn hình, tính toán visitorId
 * và cache sẵn để khi người dùng chạm nút là có ngay lập tức (không await).
 */
export async function initFingerprint(): Promise<Uint8Array> {
  if (cachedUserId) return cachedUserId

  // 1. Kiểm tra LocalStorage/Store trước
  const stored = getStorageItem(USER_ID_KEY)
  if (stored) {
    try {
      cachedUserId = base64ToBuffer(stored)
      return cachedUserId
    } catch {
      // Fallback nếu format cũ hỏng
    }
  }

  if (typeof window === 'undefined') {
    cachedUserId = stringTo32Bytes('msb-stark-mock-agent-fallback')
    setStorageItem(USER_ID_KEY, bufferToBase64(cachedUserId.buffer as ArrayBuffer))
    return cachedUserId
  }

  // 2. Chạy FingerprintJS trích xuất visitorId duy nhất của thiết bị
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    const visitorId = result.visitorId

    // Sinh 32-byte hash từ visitorId
    let rawBuffer: Uint8Array
    if (window.crypto?.subtle) {
      const digest = await window.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`msb-user-${visitorId}`),
      )
      rawBuffer = new Uint8Array(digest)
    } else {
      rawBuffer = stringTo32Bytes(`msb-user-${visitorId}`)
    }

    cachedUserId = rawBuffer
    setStorageItem(USER_ID_KEY, bufferToBase64(rawBuffer.buffer as ArrayBuffer))
    return rawBuffer
  } catch (err) {
    console.warn('[fingerprint] Lỗi khởi tạo FingerprintJS, dùng fallback:', err)
    const fallbackId = stringTo32Bytes(
      `${navigator.userAgent}-${navigator.language}-${window.screen?.width || 0}`,
    )
    cachedUserId = fallbackId
    setStorageItem(USER_ID_KEY, bufferToBase64(fallbackId.buffer as ArrayBuffer))
    return fallbackId
  }
}

/**
 * Lấy User ID cố định dạng đồng bộ (KHÔNG AWAIT) để giữ nguyên Safari User Gesture
 */
export function getFixedUserIdSync(): Uint8Array {
  if (cachedUserId) return cachedUserId

  const stored = getStorageItem(USER_ID_KEY)
  if (stored) {
    try {
      cachedUserId = base64ToBuffer(stored)
      return cachedUserId
    } catch {
      // Ignored
    }
  }

  if (typeof window !== 'undefined') {
    // Fallback tức thì nếu khách bấm quá nhanh trước khi FingerprintJS load xong
    const fastId = stringTo32Bytes(
      `${navigator.userAgent}-${navigator.language}-${window.screen?.width || 0}`,
    )
    cachedUserId = fastId
    setStorageItem(USER_ID_KEY, bufferToBase64(fastId.buffer as ArrayBuffer))
    return fastId
  }

  const defaultId = stringTo32Bytes('msb-stark-default-fallback')
  cachedUserId = defaultId
  setStorageItem(USER_ID_KEY, bufferToBase64(defaultId.buffer as ArrayBuffer))
  return defaultId
}

/**
 * Lấy Credential ID đã lưu (nếu đã từng đăng ký passkey trên thiết bị này)
 */
export function getSavedCredentialId(): string | null {
  return getStorageItem(CREDENTIAL_ID_KEY)
}

/**
 * Lưu Credential ID sau khi đăng ký thành công
 */
export function saveCredentialId(credentialIdBase64: string): void {
  setStorageItem(CREDENTIAL_ID_KEY, credentialIdBase64)
}

/**
 * Xóa Credential ID (khi passkey bị thu hồi hoặc lỗi)
 */
export function clearSavedCredentialId(): void {
  removeStorageItem(CREDENTIAL_ID_KEY)
}
