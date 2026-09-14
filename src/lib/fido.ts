import {
  getFixedUserIdSync,
  getSavedCredentialId,
  saveCredentialId,
  clearSavedCredentialId,
  base64ToBuffer,
  bufferToBase64,
} from './fingerprint'

/**
 * Người thật cần thời gian để đưa mặt vào camera hoặc đặt ngón tay, thường
 * 5–15 giây. Mốc 3 giây cũ hủy hộp thoại Face ID trước khi khách kịp phản
 * ứng, nên nhìn như sinh trắc học không bao giờ hiện lên.
 */
const TIMEOUT_MS = 60_000

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
 *
 * `knownAvailable`: kết quả dò khả năng đã lấy sẵn từ trước. Safari trên iOS
 * chỉ cho gọi WebAuthn trong đúng tác vụ của user gesture; `await` một lệnh
 * bất đồng bộ thật trước đó là tiêu gesture, và credentials ném NotAllowedError.
 * Mọi thao tác lấy user.id cố định và saved credential đều chạy đồng bộ 0ms.
 */
export async function authenticate(
  knownAvailable?: boolean,
): Promise<'real' | 'simulated'> {
  if (knownAvailable === false) return 'simulated'

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null

    try {
      // 1. Kiểm tra xem đã có passkey trên thiết bị này chưa (đồng bộ 0ms)
      const savedCredId = getSavedCredentialId()

      if (savedCredId) {
        // ĐÃ CÓ PASSKEY: Gọi navigator.credentials.get() để xác thực tĩnh lặng (chỉ quét Face ID/Touch ID)
        try {
          const rawCredId = base64ToBuffer(savedCredId)
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge: randomChallenge(),
              allowCredentials: [
                {
                  id: rawCredId.buffer as ArrayBuffer,
                  type: 'public-key',
                  transports: ['internal'],
                },
              ],
              userVerification: 'required',
              timeout: TIMEOUT_MS,
            },
            signal: controller?.signal,
          })
          if (assertion) return 'real'
        } catch (getErr) {
          console.warn('[fido] credentials.get() thất bại hoặc passkey bị gỡ, chuyển sang đăng ký mới:', getErr)
          clearSavedCredentialId()
        }
      }

      // 2. CHƯA CÓ PASSKEY (hoặc passkey bị xóa): Đăng ký passkey mới với user.id cố định từ FingerprintJS
      const fixedUserId = getFixedUserIdSync()
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: 'MSB Business' },
          user: {
            id: fixedUserId.buffer as ArrayBuffer,
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
      })) as (Credential & { rawId?: ArrayBuffer }) | null

      if (credential) {
        if (credential.rawId) {
          saveCredentialId(bufferToBase64(credential.rawId))
        } else if (credential.id) {
          saveCredentialId(credential.id)
        }
        return 'real'
      }

      return 'simulated'
    } finally {
      if (timer) clearTimeout(timer)
    }
  } catch (error) {
    console.warn('[fido] rơi về mô phỏng:', error)
    return 'simulated'
  }
}
