import { NextResponse } from 'next/server'
import { LLM_MODEL, groq } from '@/lib/groq'
import { fixtures } from '@/lib/data/fixtures'
import { isSafeReply } from '@/lib/intents/guard'
import { allowedNumbersFor, fallbackLineFor, getIntent } from '@/lib/intents/registry'
import type { IntentId, SlotValues } from '@/lib/intents/types'

const PERSONA = `Bạn là M-Tròn (phát âm là "em tròn"), Trợ lý Quan hệ Khách hàng Doanh nghiệp của ngân hàng MSB Business.

Cách nói:
- Luôn xưng "em", gọi khách hàng là "Mr Stark" hoặc "anh".
- Chuyên nghiệp, nhã nhặn, sắc bén. Câu ngắn, dẫn số liệu trước, khuyến nghị sau.
- Kết câu bằng "ạ" một cách tự nhiên, không lạm dụng.
- Trả lời bằng tiếng Việt có dấu đầy đủ, 2 đến 3 câu.
- Nếu phiên đã có nội dung báo cáo trước đó, được phép mở đầu bằng một mệnh đề
  nối ngắn ("Tiếp nối phần dòng tiền em vừa trình bày…") rồi vào ngay nội dung.

Ràng buộc tuyệt đối về số liệu:
- CHỈ dùng những con số xuất hiện nguyên văn trong dữ liệu được cấp.
- CẤM cộng, trừ, nhân, chia, ước lượng, làm tròn lại hay quy đổi bất kỳ con số nào.
- Nếu cần một con số không có trong dữ liệu, hãy diễn đạt bằng lời thay vì bịa số.`

/**
 * Lịch sử đi vào prompt dưới dạng NHÃN, tuyệt đối không kèm số.
 *
 * Guard chỉ biết `allowedNumbers` của intent hiện tại, nên mọi con số của
 * lượt trước đều bị tính là vi phạm. Cho M-Tròn thấy tên nội dung là đủ để
 * nối mạch — thấy cả số thì câu nào nhắc lại cũng bị guard loại.
 */
function buildHistoryBlock(history: IntentId[]): string {
  const labels = history
    .filter((id) => id !== 'GREETING' && id !== 'FIDO_LOGIN')
    .slice(-2)
    .map((id) => getIntent(id).label)
  if (labels.length === 0) return ''

  return `
Các nội dung em đã báo cáo ngay trước đó trong phiên: ${labels.join(', ')}.
Được phép nhắc tên những nội dung này một cách ngắn gọn để nối mạch câu chuyện.
CẤM nhắc lại bất kỳ con số nào của chúng.
`
}

function buildSlotBlock(intentId: IntentId, slots: SlotValues): string {
  const specs = getIntent(intentId).slots
  if (!specs || Object.keys(slots).length === 0) return ''

  const lines = specs
    .filter((spec) => slots[spec.id] !== undefined)
    .map((spec) => `- ${spec.id}: ${slots[spec.id]}`)
  if (lines.length === 0) return ''

  return `
Tham số Mr Stark vừa chọn cho lượt này:
${lines.join('\n')}
Hãy bám đúng các tham số này, đừng dùng giá trị mặc định.
`
}

function buildUserPrompt(
  intentId: IntentId,
  slots: SlotValues,
  history: IntentId[],
): string {
  const intent = getIntent(intentId)
  const slice = intent.fixtureKey ? fixtures[intent.fixtureKey] : {}

  return `Ngữ cảnh: ${intent.description}
${buildHistoryBlock(history)}${buildSlotBlock(intentId, slots)}
Dữ liệu được phép dùng (JSON):
${JSON.stringify(slice, null, 2)}

Các con số được phép xuất hiện trong câu trả lời:
${allowedNumbersFor(intentId, slots).join(', ') || '(không có con số nào)'}

Hãy nói với Mr Stark về nội dung này.`
}

async function generateOnce(
  intentId: IntentId,
  slots: SlotValues,
  history: IntentId[],
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.7,
    max_tokens: 120,
    messages: [
      { role: 'system', content: PERSONA },
      { role: 'user', content: buildUserPrompt(intentId, slots, history) },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() ?? ''
}

export async function POST(request: Request) {
  let targetIntentId: IntentId = 'UNKNOWN'
  let slots: SlotValues = {}
  let history: IntentId[] = []
  try {
    const body = (await request.json()) as {
      intentId?: IntentId
      slots?: SlotValues
      history?: IntentId[]
    }
    if (body?.intentId) {
      targetIntentId = body.intentId
    }
    if (body?.slots) slots = body.slots
    if (Array.isArray(body?.history)) history = body.history
  } catch {
    // Body không phải JSON hợp lệ, giữ targetIntentId = 'UNKNOWN'
  }

  const intent = getIntent(targetIntentId)
  const fallback = fallbackLineFor(targetIntentId, slots)

  // Lời tự giới thiệu không đưa qua LLM: xem chú thích `fixedLine` trong types
  if (intent.fixedLine) {
    return NextResponse.json({ reply: fallback, source: 'fixed' })
  }

  try {
    // Chuỗi rỗng lọt qua numeric guard vì không chứa số nào, phải loại riêng
    const isUsable = (text: string) =>
      text.length > 0 && isSafeReply(text, targetIntentId, slots)

    let reply = await generateOnce(targetIntentId, slots, history)

    // Numeric guard: sinh lại đúng một lần, sau đó dùng câu mẫu
    if (!isUsable(reply)) {
      reply = await generateOnce(targetIntentId, slots, history)
    }
    if (!isUsable(reply)) {
      return NextResponse.json({ reply: fallback, source: 'fallback' })
    }

    return NextResponse.json({ reply, source: 'llm' })
  } catch (error) {
    console.error('[reply] thất bại, dùng câu mẫu:', error)
    return NextResponse.json({ reply: fallback, source: 'fallback' })
  }
}
