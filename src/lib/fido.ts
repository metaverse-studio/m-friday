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
 * bất đồng bộ thật (như isUserVerifyingPlatformAuthenticatorAvailable) trước
 * đó là tiêu gesture, và credentials.create() ném NotAllowedError — hộp thoại
 * Face ID không bao giờ hiện. Vì vậy phải dò từ lúc mở màn hình khóa, còn
 * trong handler thì gọi thẳng, không await gì.
 */
export async function authenticate(
  knownAvailable?: boolean,
): Promise<'real' | 'simulated'> {
  if (knownAvailable === false) return 'simulated'
  // knownAvailable === undefined: khách chạm trước khi dò xong. Không await
  // gì ở đây cả — gọi thẳng create(), máy không hỗ trợ thì nó tự reject nhanh.
  // Await chỗ này là tiêu user gesture của Safari, đúng lỗi đang sửa.

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
