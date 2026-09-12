import { NextResponse } from 'next/server'
import { getTtsProvider } from '@/lib/audio/providers'

// msedge-tts và VieNeu fetch cần Node runtime
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { text, voice } = (await request.json()) as { text?: string; voice?: string }
    if (!text?.trim()) {
      return new NextResponse(null, { status: 204 })
    }

    const provider = getTtsProvider()
    const result = await provider.synthesize(text, voice?.trim() || undefined)
    if (!result || result.audio.length < 500) {
      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse(new Uint8Array(result.audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        // Client khóa giọng của cả lượt theo header này
        'X-Tts-Voice': encodeURIComponent(result.voice),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[tts] thất bại:', error)
    return new NextResponse(null, { status: 204 })
  }
}
