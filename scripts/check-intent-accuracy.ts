import { TEST_PHRASES } from '../src/lib/intents/phrases.fixture'
import { matchKeyword } from '../src/lib/intents/resolve'
import type { IntentId } from '../src/lib/intents/types'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

let serverReachable: boolean | null = null

async function classifyViaApi(text: string): Promise<IntentId> {
  try {
    const response = await fetch(`${BASE_URL}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) return 'UNKNOWN'
    const data = (await response.json()) as { intentId: IntentId }
    return data.intentId
  } catch {
    if (serverReachable === null) {
      serverReachable = false
      console.warn(`[Lưu ý] Server ${BASE_URL} không phản hồi, tầng 3 rơi về UNKNOWN qua fallback.`)
    }
    return 'UNKNOWN'
  }
}

async function main() {
  let correct = 0
  let viaKeyword = 0
  const failures: string[] = []

  for (const phrase of TEST_PHRASES) {
    const byKeyword = matchKeyword(phrase.text)
    const actual = byKeyword ?? (await classifyViaApi(phrase.text))
    if (byKeyword) viaKeyword++

    if (actual === phrase.expected) {
      correct++
    } else {
      failures.push(`"${phrase.text}" → ${actual} (mong đợi ${phrase.expected})`)
    }
  }

  const accuracy = (correct / TEST_PHRASES.length) * 100
  console.log(`\nĐộ chính xác: ${accuracy.toFixed(1)}% (${correct}/${TEST_PHRASES.length})`)
  console.log(`Xử lý ở tầng keyword: ${viaKeyword}/${TEST_PHRASES.length}`)

  if (failures.length > 0) {
    console.log('\nCác câu sai:')
    failures.forEach((line) => console.log(`  ${line}`))
  }

  // Khi server chết, mọi câu tầng 3 đều rơi về UNKNOWN và trùng khớp với các
  // câu ngoài phạm vi — con số đẹp đó là giả, phải báo hỏng thay vì báo đạt.
  if (serverReachable === false) {
    console.error(
      `\nKhông đo được tầng 3: ${BASE_URL} không phản hồi. Hãy chạy "bun dev" rồi đo lại.`,
    )
    process.exit(1)
  }

  process.exit(accuracy >= 95 ? 0 : 1)
}

void main()
