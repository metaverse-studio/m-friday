/**
 * Chuẩn hóa phát âm trước khi đưa vào bộ tổng hợp giọng nói (TTS).
 * Tên trợ lý "M-Tròn" được phát âm tự nhiên trong tiếng Việt là "em tròn" hoặc "Em Tròn".
 */
export function normalizePronunciation(text: string): string {
  if (!text) return text
  return text
    .replace(/M-Tròn/g, 'Em Tròn')
    .replace(/M-tròn/g, 'em tròn')
    .replace(/m-tròn/g, 'em tròn')
    .replace(/M-TRÒN/g, 'EM TRÒN')
}
