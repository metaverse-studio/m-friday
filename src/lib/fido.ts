const TIMEOUT_MS = 3_000

/**
 * Dò khả năng thay vì dò hệ điều hành. Cách này xử lý luôn
 * iPhone chưa bật Face ID, Android thiếu Play Services,
 * và máy chưa đăng ký vân tay.
 */
export async function hasPlatformAuthenticator(): Promise<boolean> {
  try {
    if (typeof PublicKeyCredential === 'undefined') return false
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

function randomChallenge(): BufferSource {
  const buf = new ArrayBuffer(32)
  const view = new Uint8Array(buf)
  crypto.getRandomValues(view)
  return view
}

/**
 * Trả về 'real' nếu sinh trắc học thật đã xác thực thành công,
 * 'simulated' trong mọi trường hợp còn lại. Không bao giờ ném lỗi —
 * màn hình khóa phải mở được kể cả khi mọi thứ hỏng.
 */
export async function authenticate(): Promise<'real' | 'simulated'> {
  if (!(await hasPlatformAuthenticator())) return 'simulated'

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: 'MSB Business' },
          user: {
            id: randomChallenge(),
            name: 'stark@starkindustry.com',
            displayName: 'Mr Stark',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: TIMEOUT_MS,
        },
        signal: controller?.signal,
      })
      return credential ? 'real' : 'simulated'
    } finally {
      if (timer) clearTimeout(timer)
    }
  } catch (error) {
    console.warn('[fido] rơi về mô phỏng:', error)
    return 'simulated'
  }
}
