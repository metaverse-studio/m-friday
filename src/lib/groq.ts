import Groq from 'groq-sdk'

export const STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo'
export const LLM_MODEL = process.env.GROQ_LLM_MODEL || 'groq/compound-mini'

export function getGroqApiKeys(): string[] {
  const raw = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || ''
  return raw
    .split(/[\s,;]+/)
    .map((k) => k.trim())
    .filter(Boolean)
}

export function getRandomGroqApiKey(): string {
  const keys = getGroqApiKeys()
  if (keys.length === 0) return ''
  const index = Math.floor(Math.random() * keys.length)
  return keys[index] ?? ''
}

export const groq = new Groq({
  get apiKey() {
    return getRandomGroqApiKey()
  },
})

