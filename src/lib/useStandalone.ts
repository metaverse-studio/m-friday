'use client'

import { useEffect, useState } from 'react'

/**
 * Đang chạy từ màn hình chính (toàn màn hình) hay trong tab trình duyệt.
 *
 * Trả `false` ở lần render đầu vì server không biết được, rồi cập nhật sau khi
 * mount — mọi thứ phụ thuộc giá trị này phải chịu được một nhịp render sai.
 *
 * `navigator.standalone` là API riêng của Safari iOS; Chrome/Android dùng
 * media query `display-mode`. Phải kiểm cả hai mới phủ hết hai nền tảng.
 */
export function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(display-mode: standalone)')
    const read = () =>
      query.matches ||
      Boolean((navigator as { standalone?: boolean }).standalone) ||
      document.referrer.startsWith('android-app://')

    setStandalone(read())
    const onChange = () => setStandalone(read())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return standalone
}
