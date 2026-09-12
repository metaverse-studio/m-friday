import { NextResponse } from 'next/server'
import { LLM_MODEL, groq } from '@/lib/groq'
import { BUSINESS_INTENT_IDS, INTENTS, getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'

const CATALOG = BUSINESS_INTENT_IDS.map(
  (id) => `${id}: ${getIntent(id).description}`,
).join('\n')

const SYSTEM_PROMPT = `Bạn là bộ phân loại ý định cho trợ lý ngân hàng doanh nghiệp MSB.

Nhiệm vụ duy nhất: đọc câu nói của khách hàng và trả về đúng MỘT mã ý định.

Danh sách ý định:
${CATALOG}

Quy tắc:
- Chỉ trả về mã ý định, viết hoa, không giải thích, không dấu câu.
- Nếu câu nói không thuộc bất kỳ ý định nào ở trên, trả về UNKNOWN.
- Tuyệt đối không suy đoán. Thà trả UNKNOWN còn hơn đoán sai.`

function coerceIntentId(raw: string): IntentId {
  const candidate = raw.trim().toUpperCase().replace(/[^A-Z_]/g, '')
  if (candidate in INTENTS && candidate !== 'FIDO_LOGIN' && candidate !== 'GREETING') {
    return candidate as IntentId
  }
  return 'UNKNOWN'
}

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string }
    if (!text?.trim()) {
      return NextResponse.json({ intentId: 'UNKNOWN' satisfies IntentId })
    }

    const completion = await groq.chat.completions.create({
      model: LLM_MODEL,
      temperature: 0,
      max_tokens: 12,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ intentId: coerceIntentId(raw) })
  } catch (error) {
    console.error('[intent] thất bại:', error)
    return NextResponse.json({ intentId: 'UNKNOWN' satisfies IntentId })
  }
}
