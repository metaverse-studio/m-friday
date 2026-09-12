import { mkdir, writeFile } from 'node:fs/promises'
import { edgeTts } from '../src/lib/audio/providers/edge-tts'
import { INTENTS } from '../src/lib/intents/registry'

const OUTPUT_DIR = 'public/audio/fallback'

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  for (const intent of Object.values(INTENTS)) {
    if (!intent.fallbackLine) continue

    process.stdout.write(`Đang sinh ${intent.id}… `)
    try {
      const audio = await edgeTts.synthesize(intent.fallbackLine)
      await writeFile(`${OUTPUT_DIR}/${intent.id}.mp3`, audio)
      console.log(`xong (${(audio.length / 1024).toFixed(0)} KB)`)
    } catch (error) {
      console.error('thất bại:', error)
    }
  }
}

void main()
