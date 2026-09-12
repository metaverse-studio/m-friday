import { describe, expect, test } from 'bun:test'
import { Glob } from 'bun'
import { readFileSync } from 'node:fs'

/**
 * Số liệu hiển thị phải chảy ra từ `fixtures`, không được gõ thẳng vào JSX.
 * Số gõ thẳng là thứ đứng im khi fixture đổi — nguồn gốc của việc widget nói
 * một đằng, Friday đọc một nẻo ngay giữa buổi demo.
 *
 * Test chỉ soi phần chữ người dùng nhìn thấy (nằm giữa `>` và `<`), nên
 * class Tailwind và màu `rgba()`/`oklch()` trong thuộc tính không bị tính.
 */
const SHAPES: { name: string; pattern: RegExp }[] = [
  { name: 'số thập phân kiểu Việt (12,5)', pattern: /\d+,\d/ },
  { name: 'số có nhóm nghìn (26.180)', pattern: /\d{1,3}(?:\.\d{3})+/ },
  { name: 'ngày tháng (25/09)', pattern: /\b\d{1,2}\/\d{1,2}\b/ },
  { name: 'số đếm hai chữ số (02)', pattern: /\b0\d\b/ },
]

/** Chữ hiển thị: mọi đoạn nằm giữa `>` và `<`, bỏ qua biểu thức `{...}` */
function jsxTextChunks(source: string): string[] {
  // `=>` không phải thẻ đóng, đổi đi trước khi tách để khỏi bắt nhầm
  const masked = source.replace(/=>/g, '=»')
  return [...masked.matchAll(/>([^<>]*)</g)]
    .map((match) => (match[1] ?? '').replace(/\{[^{}]*\}/g, ' '))
    .filter((text) => text.trim().length > 0)
}

const files = [...new Glob('src/{components,app}/**/*.tsx').scanSync('.')].sort()

describe('Không gõ thẳng số liệu vào giao diện', () => {
  test('quét được đủ file', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  for (const file of files) {
    test(file, () => {
      const offenders = jsxTextChunks(readFileSync(file, 'utf8'))
        .flatMap((text) =>
          SHAPES.filter((shape) => shape.pattern.test(text)).map(
            (shape) => `${shape.name}: "${text.trim()}"`,
          ),
        )
      expect(offenders).toEqual([])
    })
  }
})
