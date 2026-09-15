import { mkdir, writeFile } from 'node:fs/promises'
import { normalizePronunciation } from '../src/lib/audio/pronunciation'
import { edgeTts } from '../src/lib/audio/providers/edge-tts'
import { INTENTS } from '../src/lib/intents/registry'

const OUTPUT_DIR = 'public/audio/fallback'

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  for (const intent of Object.values(INTENTS)) {
    if (!intent.fallbackLine) continue

    process.stdout.write(`Đang sinh ${intent.id}… `)
    try {
      const spokenText = normalizePronunciation(intent.fallbackLine)
      const res = await edgeTts.synthesize(spokenText)
      if (res?.audio) {
        await writeFile(`${OUTPUT_DIR}/${intent.id}.mp3`, res.audio)
        console.log(`xong (${(res.audio.length / 1024).toFixed(0)} KB)`)
      } else {
        console.log('không thể sinh âm thanh')
      }
    } catch (error) {
      console.error('thất bại:', error)
    }
  }
}

void main()
