import { NextResponse } from 'next/server'
import { STT_MODEL, LLM_MODEL, getGroqApiKeys } from '@/lib/groq'
import { getVieneuApiKeys, vieneuVoiceId } from '@/lib/audio/providers/vieneu-tts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Che key: chỉ để lại tiền tố và độ dài, đủ đối chiếu mà không lộ gì */
function moTa(key: string) {
  return {
    tienTo: key.slice(0, 7),
    doDai: key.length,
    laPlaceholder: key.includes('thay_bang_key_cua_ban'),
  }
}

/**
 * Endpoint đối chiếu cấu hình phía server. Ra đời vì một lỗi 401 trên Vercel
 * trong khi cùng key đó chạy tốt ở máy local — không có cách nào biết server
 * đang nhận giá trị nào, mà key thì tuyệt đối không được in ra.
 */
export async function GET() {
  const groqKeys = getGroqApiKeys()
  const vieneuKeys = getVieneuApiKeys()

  // Gọi thật Groq bằng một request bé nhất có thể để lấy đúng mã lỗi
  let groqPing = 'không thử (thiếu key)'
  if (groqKeys[0]) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${groqKeys[0]}` },
        signal: AbortSignal.timeout(6000),
      })
      const body = res.ok ? '' : ` ${(await res.text()).slice(0, 120)}`
      groqPing = `${res.status}${res.ok ? ' OK' : body}`
    } catch (error) {
      groqPing = `không gọi được: ${(error as Error)?.message?.slice(0, 80)}`
    }
  }

  return NextResponse.json({
    bienDungCho: {
      groq: process.env.GROQ_API_KEYS ? 'GROQ_API_KEYS' : process.env.GROQ_API_KEY ? 'GROQ_API_KEY' : '(không có)',
      vieneu: process.env.VIENEU_API_KEYS ? 'VIENEU_API_KEYS' : process.env.VIENEU_API_KEY ? 'VIENEU_API_KEY' : '(không có)',
    },
    groq: { soKey: groqKeys.length, keys: groqKeys.map(moTa), ping: groqPing },
    vieneu: {
      soKey: vieneuKeys.length,
      keys: vieneuKeys.map(moTa),
      provider: process.env.TTS_PROVIDER || '(mặc định edge-tts)',
      giong: vieneuVoiceId(),
    },
    model: { stt: STT_MODEL, llm: LLM_MODEL },
    moiTruong: process.env.VERCEL_ENV || 'local',
    build: process.env.NEXT_PUBLIC_BUILD_TIME || '(không rõ)',
  })
}
