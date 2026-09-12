import { NextResponse } from 'next/server'
import { STT_MODEL, groq } from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const audio = form.get('audio')

    if (!audio || typeof audio === 'string' || !(audio instanceof Blob) || audio.size === 0) {
      return NextResponse.json({ text: '' })
    }

    const blob = audio as Blob
    let filename = (audio as File).name
    const rawMime = blob.type || ''

    const ext = rawMime.includes('mp4') || rawMime.includes('m4a')
      ? 'mp4'
      : rawMime.includes('wav')
      ? 'wav'
      : rawMime.includes('ogg')
      ? 'ogg'
      : rawMime.includes('mp3') || rawMime.includes('mpeg')
      ? 'mp3'
      : 'webm'

    /**
     * MIME là nguồn tin cậy, đuôi file thì không. Whisper chọn bộ giải mã theo
     * đuôi file, nên một blob MP4 mang tên .webm sẽ bị parse sai và trả về
     * chuỗi rỗng. Trước đây đoạn này chấp nhận mọi đuôi hợp lệ, kể cả khi nó
     * mâu thuẫn với MIME — Safari trên iOS gửi lên đúng kiểu mâu thuẫn đó.
     */
    if (rawMime) {
      filename = `speech.${ext}`
    } else if (
      !filename ||
      filename === 'blob' ||
      !/\.(webm|mp4|m4a|wav|ogg|mp3|flac|mpeg|mpga|opus)$/i.test(filename)
    ) {
      filename = `speech.${ext}`
    }
    console.info(`[stt] nhận ${blob.size} bytes · mime=${rawMime || '(trống)'} · gửi Whisper tên ${filename}`)

    const cleanMime = ext === 'mp4'
      ? 'audio/mp4'
      : ext === 'wav'
      ? 'audio/wav'
      : ext === 'mp3'
      ? 'audio/mpeg'
      : ext === 'ogg'
      ? 'audio/ogg'
      : 'audio/webm'

    const buffer = Buffer.from(await blob.arrayBuffer())
    const file = new File([buffer], filename, { type: cleanMime })

    const result = await groq.audio.transcriptions.create({
      file,
      model: STT_MODEL,
      language: 'vi',
      prompt: 'MSB, ngân hàng, dòng tiền, L/C, bảo lãnh, CCTG, tỷ giá, chuyển khoản, phê duyệt, thu chi, tài khoản, doanh nghiệp',
    })

    let text = result.text ? result.text.trim() : ''

    // Lọc bỏ ảo giác phổ biến của Whisper khi nhận audio có khoảng lặng hoặc tiếng ồn
    const HALLUCINATIONS = [
      /hãy subscribe/i,
      /hãy đăng ký kênh/i,
      /ghiền mì gõ/i,
      /cảm ơn các bạn đã theo dõi/i,
      /like và subscribe/i,
      /hẹn gặp lại các bạn/i,
    ]
    if (HALLUCINATIONS.some((p) => p.test(text))) {
      console.info('[stt] phát hiện và lọc ảo giác Whisper:', text)
      text = ''
    }

    return NextResponse.json({ text, detail: `${filename} ${blob.size}B` })
  } catch (error: any) {
    const raw = String(error?.message || error || 'STT failed')
    // Rút gọn lỗi Groq về phần đọc được trên một dòng hẹp của điện thoại
    const code = /"code"\s*:\s*"([^"]+)"/.exec(raw)?.[1]
    const status = /\b(4\d\d|5\d\d)\b/.exec(raw)?.[1]
    console.error('[stt] thất bại:', raw)
    return NextResponse.json({
      text: '',
      error: [status, code].filter(Boolean).join(' ') || raw.slice(0, 80),
    })
  }
}

