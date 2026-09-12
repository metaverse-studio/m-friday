import { NextResponse } from 'next/server'
import { getTtsProvider } from '@/lib/audio/providers'

// msedge-tts và VieNeu fetch cần Node runtime
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string }
    if (!text?.trim()) {
      return new NextResponse(null, { status: 204 })
    }

    const provider = getTtsProvider()
    const audio = await provider.synthesize(text)
    if (!audio || audio.length < 500) {
      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[tts] thất bại:', error)
    return new NextResponse(null, { status: 204 })
  }
}
