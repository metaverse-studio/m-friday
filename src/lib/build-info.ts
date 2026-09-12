/**
 * Mã phiên bản để đối chiếu bản đang chạy trên điện thoại với bản vừa deploy.
 * Không có nó thì mỗi lần sửa lỗi đều phải đoán xem máy đã nhận bản mới chưa —
 * mà PWA có service worker cache nên chuyện chạy bản cũ là bình thường.
 */
export const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION || '0.0.0'
export const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA || 'local'
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || ''

/** Dạng ngắn hiển thị trên màn hình: `v0.1.0 · 05dd345 · 12/09 18:42` */
export function buildTag(): string {
  const parts = [`v${BUILD_VERSION}`, BUILD_SHA]
  if (BUILD_TIME) {
    const d = new Date(BUILD_TIME)
    if (!Number.isNaN(d.getTime())) {
      const p = (n: number) => String(n).padStart(2, '0')
      parts.push(`${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`)
    }
  }
  return parts.join(' · ')
}
