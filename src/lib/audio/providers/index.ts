import { edgeTts, type TtsProvider } from './edge-tts'
import { vieneuTts } from './vieneu-tts'

export type { TtsProvider }
export { edgeTts, vieneuTts }

export function getTtsProvider(): TtsProvider {
  const provider = (process.env.TTS_PROVIDER || '').trim().toLowerCase()
  if (provider === 'vieneu') {
    return vieneuTts
  }
  return edgeTts
}
