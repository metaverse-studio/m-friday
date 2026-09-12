import { NextResponse } from 'next/server'
import { LLM_MODEL, groq } from '@/lib/groq'
import { fixtures } from '@/lib/data/fixtures'
import { isSafeReply } from '@/lib/intents/guard'
import { getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'

const PERSONA = `Bạn là Friday, Trợ lý Quan hệ Khách hàng Doanh nghiệp của ngân hàng MSB Business.

Cách nói:
- Luôn xưng "em", gọi khách hàng là "Mr Stark" hoặc "anh".
- Chuyên nghiệp, nhã nhặn, sắc bén. Câu ngắn, dẫn số liệu trước, khuyến nghị sau.
- Kết câu bằng "ạ" một cách tự nhiên, không lạm dụng.
- Trả lời bằng tiếng Việt có dấu đầy đủ, 2 đến 3 câu.

Ràng buộc tuyệt đối về số liệu:
- CHỈ dùng những con số xuất hiện nguyên văn trong dữ liệu được cấp.
- CẤM cộng, trừ, nhân, chia, ước lượng, làm tròn lại hay quy đổi bất kỳ con số nào.
- Nếu cần một con số không có trong dữ liệu, hãy diễn đạt bằng lời thay vì bịa số.`

function buildUserPrompt(intentId: IntentId): string {
  const intent = getIntent(intentId)
  const slice = intent.fixtureKey ? fixtures[intent.fixtureKey] : {}

  return `Ngữ cảnh: ${intent.description}

Dữ liệu được phép dùng (JSON):
${JSON.stringify(slice, null, 2)}

Các con số được phép xuất hiện trong câu trả lời:
${intent.allowedNumbers.join(', ') || '(không có con số nào)'}

Hãy nói với Mr Stark về nội dung này.`
}

async function generateOnce(intentId: IntentId): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.7,
    max_tokens: 120,
    messages: [
      { role: 'system', content: PERSONA },
      { role: 'user', content: buildUserPrompt(intentId) },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() ?? ''
}

export async function POST(request: Request) {
  let targetIntentId: IntentId = 'UNKNOWN'
  try {
    const body = (await request.json()) as { intentId?: IntentId }
    if (body?.intentId) {
      targetIntentId = body.intentId
    }
  } catch {
    // Body không phải JSON hợp lệ, giữ targetIntentId = 'UNKNOWN'
  }

  const intent = getIntent(targetIntentId)

  // Lời tự giới thiệu không đưa qua LLM: xem chú thích `fixedLine` trong types
  if (intent.fixedLine) {
    return NextResponse.json({ reply: intent.fallbackLine, source: 'fixed' })
  }

  try {
    // Chuỗi rỗng lọt qua numeric guard vì không chứa số nào, phải loại riêng
    const isUsable = (text: string) => text.length > 0 && isSafeReply(text, targetIntentId)

    let reply = await generateOnce(targetIntentId)

    // Numeric guard: sinh lại đúng một lần, sau đó dùng câu mẫu
    if (!isUsable(reply)) {
      reply = await generateOnce(targetIntentId)
    }
    if (!isUsable(reply)) {
      return NextResponse.json({ reply: intent.fallbackLine, source: 'fallback' })
    }

    return NextResponse.json({ reply, source: 'llm' })
  } catch (error) {
    console.error('[reply] thất bại, dùng câu mẫu:', error)
    return NextResponse.json({ reply: intent.fallbackLine, source: 'fallback' })
  }
}
