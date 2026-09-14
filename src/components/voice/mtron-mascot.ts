import * as THREE from 'three'
import type { IntentId } from '@/lib/intents/types'

export interface MascotState {
  isListening: boolean
  isSpeaking: boolean
  isThinking: boolean
  activeIntent: IntentId | null
}

export interface MtronMascot {
  group: THREE.Group
  update: (
    time: number,
    delta: number,
    state: MascotState,
    pointer: { x: number; y: number }
  ) => void
  dispose: () => void
}

/**
 * Sinh Texture bề mặt (Diffuse) và Texture phát quang (Emissive) cho thân hình cầu M-Tròn.
 * Với bodyMesh.rotation.y = -Math.PI / 2:
 * - u = 0.50 (X: 512) nằm trực diện phía trước (+Z), đối diện camera!
 * - Nụ cười mèo Chibi `:3` nhỏ nhắn, dễ thương tại X: 512, Y: 296 (ngay dưới vòm khấc visor).
 * - Má hồng Kawaii mềm mại 2 bên má.
 * - Vi mạch vàng neon và lõi laser trắng tinh trên ngực và bụng.
 * - Emissive Map riêng biệt giúp vi mạch phát quang rực rỡ độc lập trong không gian 3D.
 */
function createBodyTextures(): {
  map: THREE.CanvasTexture | null
  emissiveMap: THREE.CanvasTexture | null
} {
  if (typeof document === 'undefined') {
    return { map: null, emissiveMap: null }
  }

  // 1. Diffuse Map (Nền cam MSB, miệng cười mèo :3, má hồng, đường mạch vàng)
  const diffCanvas = document.createElement('canvas')
  diffCanvas.width = 1024
  diffCanvas.height = 512
  const diffCtx = diffCanvas.getContext('2d')

  // 2. Emissive Map (Nền đen tuyệt đối, chỉ có vi mạch và pad PCB phát quang)
  const emCanvas = document.createElement('canvas')
  emCanvas.width = 1024
  emCanvas.height = 512
  const emCtx = emCanvas.getContext('2d')

  if (diffCtx && emCtx) {
    // 1.1 Nền cam MSB rực rỡ với chuyển sắc chiều sâu trên diffCanvas
    const grad = diffCtx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#ff7a00')
    grad.addColorStop(0.20, '#ff4700')
    grad.addColorStop(0.65, '#f03000')
    grad.addColorStop(1, '#c41d00')
    diffCtx.fillStyle = grad
    diffCtx.fillRect(0, 0, 1024, 512)

    // 1.2 Nền đen tuyệt đối trên emCanvas
    emCtx.fillStyle = '#000000'
    emCtx.fillRect(0, 0, 1024, 512)

    // 1.3 Vẽ hệ thống vi mạch Sci-Fi lên cả hai canvas
    const drawCircuit = (
      startX: number,
      startY: number,
      segments: [number, number][],
      endPadRadius: number
    ) => {
      // --- Trên Diffuse Map ---
      diffCtx.save()
      diffCtx.strokeStyle = 'rgba(255, 215, 40, 0.98)'
      diffCtx.lineWidth = 6.0
      diffCtx.lineCap = 'round'
      diffCtx.lineJoin = 'round'
      diffCtx.shadowColor = 'rgba(255, 180, 20, 0.9)'
      diffCtx.shadowBlur = 10

      diffCtx.beginPath()
      diffCtx.moveTo(startX, startY)
      let curX = startX
      let curY = startY
      for (const [dx, dy] of segments) {
        curX += dx
        curY += dy
        diffCtx.lineTo(curX, curY)
      }
      diffCtx.stroke()

      // Lõi laser trắng tinh trên diffuse
      diffCtx.strokeStyle = '#ffffff'
      diffCtx.lineWidth = 2.8
      diffCtx.shadowBlur = 0
      diffCtx.stroke()

      // Pad tròn vi mạch PCB (Vành vàng + lỗ tâm)
      diffCtx.fillStyle = '#ffd700'
      diffCtx.beginPath()
      diffCtx.arc(curX, curY, endPadRadius + 2, 0, Math.PI * 2)
      diffCtx.fill()
      diffCtx.fillStyle = '#c42000'
      diffCtx.beginPath()
      diffCtx.arc(curX, curY, endPadRadius * 0.45, 0, Math.PI * 2)
      diffCtx.fill()
      diffCtx.restore()

      // --- Trên Emissive Map (Đặc biệt phát quang siêu sáng) ---
      emCtx.save()
      // Hào quang vàng neon
      emCtx.strokeStyle = '#ffcc00'
      emCtx.lineWidth = 7.0
      emCtx.lineCap = 'round'
      emCtx.lineJoin = 'round'
      emCtx.shadowColor = '#ffbb00'
      emCtx.shadowBlur = 12

      emCtx.beginPath()
      emCtx.moveTo(startX, startY)
      let eX = startX
      let eY = startY
      for (const [dx, dy] of segments) {
        eX += dx
        eY += dy
        emCtx.lineTo(eX, eY)
      }
      emCtx.stroke()

      // Lõi laser trắng tinh
      emCtx.strokeStyle = '#ffffff'
      emCtx.lineWidth = 3.2
      emCtx.stroke()

      // Pad phát quang
      emCtx.fillStyle = '#ffea55'
      emCtx.beginPath()
      emCtx.arc(eX, eY, endPadRadius + 2.5, 0, Math.PI * 2)
      emCtx.fill()
      emCtx.fillStyle = '#000000'
      emCtx.beginPath()
      emCtx.arc(eX, eY, endPadRadius * 0.45, 0, Math.PI * 2)
      emCtx.fill()
      emCtx.restore()
    }

    // Vi mạch ngực phải nhân vật (viewer nhìn bên trái):
    // Nhánh chính 1: Chạy từ ngực sang sườn xuống bụng
    drawCircuit(385, 290, [[40, 0], [30, 30], [0, 50], [-25, 25]], 6.0)
    // Nhánh phụ 2: Rẽ ngang vào giữa ngực
    drawCircuit(425, 290, [[25, 25], [35, 0]], 5.0)
    // Nhánh phụ 3: Chạy ngang sườn dưới
    drawCircuit(365, 340, [[35, 0], [20, 25], [0, 30]], 4.5)

    // Vi mạch ngực trái nhân vật (viewer nhìn bên phải):
    // Nhánh chính 1
    drawCircuit(639, 290, [[-40, 0], [-30, 30], [0, 50], [25, 25]], 6.0)
    // Nhánh phụ 2
    drawCircuit(599, 290, [[-25, 25], [-35, 0]], 5.0)
    // Nhánh phụ 3
    drawCircuit(659, 340, [[-35, 0], [-20, 25], [0, 30]], 4.5)

    // 1.4 Nụ cười mèo Chibi `:3` (ω) - Nhỏ gọn, tinh tế, cực dễ thương
    diffCtx.save()
    diffCtx.strokeStyle = '#260902'
    diffCtx.lineWidth = 4.5
    diffCtx.lineCap = 'round'
    diffCtx.lineJoin = 'round'

    const mouthCenterX = 512
    const mouthCenterY = 286
    const mouthRadius = 8.5

    // Múi trái nụ cười
    diffCtx.beginPath()
    diffCtx.arc(mouthCenterX - mouthRadius + 0.5, mouthCenterY, mouthRadius, 0.12 * Math.PI, 0.94 * Math.PI, false)
    diffCtx.stroke()

    // Múi phải nụ cười
    diffCtx.beginPath()
    diffCtx.arc(mouthCenterX + mouthRadius - 0.5, mouthCenterY, mouthRadius, 0.06 * Math.PI, 0.88 * Math.PI, false)
    diffCtx.stroke()

    // 1.5 Đốm má hồng Kawaii mềm mại 2 bên nụ cười
    const drawBlush = (bx: number, by: number) => {
      const bGrad = diffCtx.createRadialGradient(bx, by, 2, bx, by, 22)
      bGrad.addColorStop(0, 'rgba(255, 115, 80, 0.45)')
      bGrad.addColorStop(1, 'rgba(255, 60, 0, 0)')
      diffCtx.fillStyle = bGrad
      diffCtx.beginPath()
      diffCtx.arc(bx, by, 22, 0, Math.PI * 2)
      diffCtx.fill()
    }
    drawBlush(mouthCenterX - 56, mouthCenterY + 12)
    drawBlush(mouthCenterX + 56, mouthCenterY + 12)

    diffCtx.restore()
  }

  const map = new THREE.CanvasTexture(diffCanvas)
  map.colorSpace = THREE.SRGBColorSpace

  const emissiveMap = new THREE.CanvasTexture(emCanvas)
  emissiveMap.colorSpace = THREE.SRGBColorSpace

  return { map, emissiveMap }
}

/**
 * Sinh Texture chuyển sắc vũ trụ Hologram (Cosmic Nebula Gradient) và Emissive Map cho áo choàng siêu nhân.
 * Chuyển sắc từ đỏ cam MSB rực lửa ở phần vai xuống tím hồng vũ trụ (Cosmic Magenta)
 * và phát quang viền cyan lấp lánh (Electric Cyan) cùng các đốm sao li ti như ảnh mẫu.
 */
function createCapeTextures(): {
  map: THREE.CanvasTexture | null
  emissiveMap: THREE.CanvasTexture | null
} {
  if (typeof document === 'undefined') {
    return { map: null, emissiveMap: null }
  }

  const width = 512
  const height = 512

  // 1. Diffuse Canvas (Màu vải áo choàng Hologram vũ trụ)
  const diffCanvas = document.createElement('canvas')
  diffCanvas.width = width
  diffCanvas.height = height
  const diffCtx = diffCanvas.getContext('2d')

  // 2. Emissive Canvas (Phát quang viền và các đốm sao tinh tú)
  const emCanvas = document.createElement('canvas')
  emCanvas.width = width
  emCanvas.height = height
  const emCtx = emCanvas.getContext('2d')
  if (diffCtx && emCtx) {
    // Chuyển sắc đỏ siêu anh hùng rực rỡ từ cổ vai xuống gấu áo kèm viền cyan
    const diffGrad = diffCtx.createLinearGradient(width * 0.8, 0, 0, height)
    diffGrad.addColorStop(0.0, '#ff3820')  // Đỏ cam MSB rực rỡ ở cổ áo
    diffGrad.addColorStop(0.30, '#ee182c') // Đỏ tươi siêu anh hùng
    diffGrad.addColorStop(0.70, '#b80c20') // Đỏ ruby chiều sâu vải
    diffGrad.addColorStop(0.92, '#7c0818') // Đỏ tím thẫm bóng đổ
    diffGrad.addColorStop(1.0, '#00e5ff')  // Viền xanh ngọc cyan phát sáng
    diffCtx.fillStyle = diffGrad
    diffCtx.fillRect(0, 0, width, height)

    // Đốm sáng tinh tú lấp lánh trên bề mặt vải áo choàng
    diffCtx.fillStyle = '#ffffff'
    const starCoords: [number, number, number, number][] = [
      [120, 180, 2.2, 0.9], [220, 260, 1.8, 0.8], [90, 320, 2.5, 0.95],
      [180, 380, 2.0, 0.85], [310, 190, 1.6, 0.75], [260, 420, 2.2, 0.9],
      [80, 440, 2.8, 1.0], [150, 470, 2.0, 0.85], [380, 280, 1.8, 0.8],
      [340, 360, 2.2, 0.9], [420, 160, 1.5, 0.7], [290, 120, 1.8, 0.75],
      [160, 110, 2.0, 0.8], [60, 230, 2.4, 0.9], [110, 280, 1.8, 0.8]
    ]
    for (const [sx, sy, sr, sa] of starCoords) {
      diffCtx.save()
      diffCtx.globalAlpha = sa
      diffCtx.beginPath()
      diffCtx.arc(sx, sy, sr, 0, Math.PI * 2)
      diffCtx.fill()
      diffCtx.restore()
    }

    // Emissive Map (Nền đen, phát sáng viền tà áo và các hạt sao)
    emCtx.fillStyle = '#000000'
    emCtx.fillRect(0, 0, width, height)

    const emGrad = emCtx.createLinearGradient(width * 0.65, 0, 0, height)
    emGrad.addColorStop(0.0, 'rgba(120, 10, 30, 0.3)')
    emGrad.addColorStop(0.6, 'rgba(180, 20, 160, 0.5)')
    emGrad.addColorStop(0.9, 'rgba(0, 220, 255, 0.85)')
    emGrad.addColorStop(1.0, 'rgba(0, 245, 255, 1.0)')
    emCtx.fillStyle = emGrad
    emCtx.fillRect(0, 0, width, height)

    emCtx.fillStyle = '#ffffff'
    for (const [sx, sy, sr] of starCoords) {
      emCtx.beginPath()
      emCtx.arc(sx, sy, sr + 0.8, 0, Math.PI * 2)
      emCtx.fill()
    }
  }

  const map = new THREE.CanvasTexture(diffCanvas)
  map.colorSpace = THREE.SRGBColorSpace

  const emissiveMap = new THREE.CanvasTexture(emCanvas)
  emissiveMap.colorSpace = THREE.SRGBColorSpace

  return { map, emissiveMap }
}

/**
/**
 * Quản lý đôi mắt Anime Chibi tròn xoe long lanh và má hồng Kawaii.
 * Vẽ trực tiếp lên Canvas độ phân giải cao 1024x512 với NỀN TRONG SUỐT 100% (alpha = 0).
 * Nằm trên bề mặt khuôn mặt màu cam của nhân vật, PHÍA SAU lớp kính bảo hộ trong suốt.
 */
class AnimeEyesRenderer {
  public canvas: HTMLCanvasElement | null = null
  public ctx: CanvasRenderingContext2D | null = null
  public texture: THREE.Texture
  private blinkVal = 1.0
  private blinkTimer = 0

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.canvas.width = 1024
      this.canvas.height = 512
      this.ctx = this.canvas.getContext('2d')
      const canvasTex = new THREE.CanvasTexture(this.canvas)
      canvasTex.colorSpace = THREE.SRGBColorSpace
      this.texture = canvasTex
    } else {
      this.texture = new THREE.Texture()
    }
  }

  public update(
    delta: number,
    state: MascotState,
    pointer: { x: number; y: number }
  ) {
    const { ctx, canvas } = this
    if (!ctx || !canvas) return

    // 1. Quản lý nhịp chớp mắt tự nhiên (Blink cycle ~3.4s)
    this.blinkTimer += delta
    if (this.blinkTimer > 3.4) {
      const cycle = this.blinkTimer - 3.4
      if (cycle < 0.12) {
        this.blinkVal = Math.max(0.04, 1 - cycle / 0.06)
      } else if (cycle < 0.24) {
        this.blinkVal = Math.min(1.0, (cycle - 0.12) / 0.12)
      } else {
        this.blinkVal = 1.0
        this.blinkTimer = Math.random() * 0.8
      }
    } else {
      this.blinkVal = 1.0
    }

    // 2. XÓA SẠCH NỀN HOÀN TOÀN: Nền da cam của bodyMesh sẽ hiện trọn vẹn bên dưới mắt!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isAlert = state.activeIntent === 'FRAUD_ALERT'

    // 3. Cử động liếc mắt theo con trỏ chuột
    const lookOffsetX = Math.max(-10, Math.min(10, pointer.x * 14))
    const lookOffsetY = Math.max(-6, Math.min(6, -pointer.y * 10))

    // Tọa độ 2 mắt anime Chibi (To tròn long lanh, lấp đầy 2 ô kính Mecha chuẩn ảnh mẫu)
    const eyeLeftX = 325
    const eyeRightX = 705
    const eyeY = 236
    const eyeRadiusX = 88
    const eyeRadiusY = 105

    const drawAnimeEye = (cx: number, cy: number, isLeftEye: boolean) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(1.0, this.blinkVal)

      if (this.blinkVal <= 0.16) {
        // Mi mắt mỉm cười hình vòng cung Chibi hạnh phúc ^^
        ctx.strokeStyle = isAlert ? '#880000' : '#220802'
        ctx.lineWidth = 9
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.ellipse(0, 0, eyeRadiusX * 0.74, eyeRadiusY * 0.62, 0, 1.15 * Math.PI, 1.85 * Math.PI, false)
        ctx.stroke()
        ctx.restore()
        return
      }

      // Tròng mắt dịch nhẹ theo ánh nhìn
      const px = lookOffsetX * 0.35
      const py = lookOffsetY * 0.35

      // Mống mắt Anime: Gradient thẳng đứng từ đen xanh navy thẫm xuống sapphire và cyan đáy
      const pupilGrad = ctx.createLinearGradient(px, py - eyeRadiusY, px, py + eyeRadiusY)
      pupilGrad.addColorStop(0, '#040e1e')
      pupilGrad.addColorStop(0.46, '#082244')
      pupilGrad.addColorStop(0.78, isAlert ? '#880000' : '#06447e')
      pupilGrad.addColorStop(1.0, isAlert ? '#ff3b30' : '#00a4ea')

      ctx.fillStyle = pupilGrad
      ctx.beginPath()
      ctx.ellipse(px, py, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2)
      ctx.fill()

      // Viền mí mắt trên Chibi nét dày mềm mại
      ctx.strokeStyle = '#02060e'
      ctx.lineWidth = 4.5
      ctx.beginPath()
      ctx.ellipse(px, py, eyeRadiusX + 1, eyeRadiusY + 1, 0, 1.2 * Math.PI, 1.8 * Math.PI, false)
      ctx.stroke()

      // Vành trăng khuyết phản quang cyan phát sáng ở đáy tròng mắt
      const irisGlow = ctx.createLinearGradient(px, py + eyeRadiusY * 0.25, px, py + eyeRadiusY)
      irisGlow.addColorStop(0, 'rgba(0, 200, 255, 0)')
      irisGlow.addColorStop(0.55, 'rgba(0, 220, 255, 0.40)')
      irisGlow.addColorStop(1.0, isAlert ? 'rgba(255, 60, 40, 0.92)' : 'rgba(0, 240, 255, 0.88)')
      ctx.fillStyle = irisGlow
      ctx.beginPath()
      ctx.ellipse(px, py, eyeRadiusX * 0.96, eyeRadiusY * 0.96, 0, 0, Math.PI * 2)
      ctx.fill()

      // ĐỐM SÁNG PHẢN CHIẾU CHUẨN 100% THEO ẢNH CHỤP
      // 1. Đốm sáng chính (Primary Highlight) hình tròn trắng tinh to tròn góc trên-ngoài
      const hl1X = (isLeftEye ? -25 : 25) + px * 0.5
      const hl1Y = -30 + py * 0.5
      ctx.shadowBlur = 8
      ctx.shadowColor = '#ffffff'
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(hl1X, hl1Y, 25, 0, Math.PI * 2)
      ctx.fill()

      // 2. Đốm sáng phụ (Secondary Highlight) hình tròn nhỏ góc dưới-trong
      const hl2X = (isLeftEye ? 26 : -26) + px * 0.5
      const hl2Y = 26 + py * 0.5
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.arc(hl2X, hl2Y, 13, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    drawAnimeEye(eyeLeftX, eyeY, true)
    drawAnimeEye(eyeRightX, eyeY, false)

    // 4. Hai đốm má hồng Kawaii mềm mại ngay dưới 2 bên mắt
    const drawBlush = (bx: number, by: number) => {
      const bGrad = ctx.createRadialGradient(bx, by, 2, bx, by, 30)
      bGrad.addColorStop(0, 'rgba(255, 110, 70, 0.48)')
      bGrad.addColorStop(0.7, 'rgba(255, 80, 40, 0.20)')
      bGrad.addColorStop(1, 'rgba(255, 60, 20, 0)')
      ctx.fillStyle = bGrad
      ctx.beginPath()
      ctx.arc(bx, by, 30, 0, Math.PI * 2)
      ctx.fill()
    }
    drawBlush(eyeLeftX - 10, eyeY + eyeRadiusY + 12)
    drawBlush(eyeRightX + 10, eyeY + eyeRadiusY + 12)

    this.texture.needsUpdate = true
  }

  public dispose() {
    this.texture.dispose()
  }
}

/**
 * Quản lý HUD Hologram Sci-Fi phát quang chiếu nổi trên bề mặt kính Visor.
 * Vẽ trên Canvas 1024x512 với NỀN TRONG SUỐT 100% (alpha = 0).
 * TUYỆT ĐỐI KHÔNG TÔ NỀN ĐEN.
 * Chỉ có các đường nét neon Cyan phát quang (Additive Blending) chuẩn 100% theo ảnh chụp:
 * - Hộp vát góc bên mắt trái: [ GOOD..MAX ], biểu đồ cột Equalizer sóng âm 10 cột, vạch telemetry, radar tròn.
 * - Thanh quét ngang bên mắt phải: [ SYS.DATA // 98.4% ].
 * - Hiệu ứng âm thanh động ở chính giữa sống mũi khi nói / nghe / suy nghĩ.
 */
class HoloHudRenderer {
  public canvas: HTMLCanvasElement | null = null
  public ctx: CanvasRenderingContext2D | null = null
  public texture: THREE.Texture

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.canvas.width = 1024
      this.canvas.height = 512
      this.ctx = this.canvas.getContext('2d')
      const canvasTex = new THREE.CanvasTexture(this.canvas)
      canvasTex.colorSpace = THREE.SRGBColorSpace
      this.texture = canvasTex
    } else {
      this.texture = new THREE.Texture()
    }
  }

  public update(time: number, delta: number, state: MascotState) {
    const { ctx, canvas } = this
    if (!ctx || !canvas) return

    // 1. NỀN HOÀN TOÀN TRONG SUỐT 100% - TUYỆT ĐỐI KHÔNG TÔ NỀN ĐEN!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isAlert = state.activeIntent === 'FRAUD_ALERT'
    const hudColor = isAlert
      ? '#ff3322'
      : state.isListening
      ? '#ffd700'
      : state.isSpeaking
      ? '#00f5ff'
      : state.isThinking
      ? '#ffffff'
      : '#00f0ff'

    ctx.save()
    ctx.strokeStyle = hudColor
    ctx.fillStyle = hudColor
    ctx.shadowColor = hudColor
    ctx.shadowBlur = 10

    // 2.1 HUD BOX BÊN MẮT TRÁI (Viewer nhìn bên trái): Hộp [ GOOD..MAX ] & Biểu đồ Equalizer chuẩn ảnh
    const boxX = 110
    const boxY = 85
    const boxW = 230
    const boxH = 115
    const chamfer = 12

    // Vẽ khung chữ nhật vát 4 góc công nghệ cao phát sáng
    ctx.lineWidth = 2.0
    ctx.beginPath()
    ctx.moveTo(boxX + chamfer, boxY)
    ctx.lineTo(boxX + boxW - chamfer, boxY)
    ctx.lineTo(boxX + boxW, boxY + chamfer)
    ctx.lineTo(boxX + boxW, boxY + boxH - chamfer)
    ctx.lineTo(boxX + boxW - chamfer, boxY + boxH)
    ctx.lineTo(boxX + chamfer, boxY + boxH)
    ctx.lineTo(boxX, boxY + boxH - chamfer)
    ctx.lineTo(boxX, boxY + chamfer)
    ctx.closePath()
    ctx.stroke()

    // Góc vạch tăng cường ở 4 góc mecha
    ctx.lineWidth = 3.0
    ctx.beginPath()
    ctx.moveTo(boxX, boxY + 24)
    ctx.lineTo(boxX, boxY + chamfer)
    ctx.lineTo(boxX + chamfer, boxY)
    ctx.lineTo(boxX + 24, boxY)
    ctx.stroke()

    // Dòng chữ công nghệ GOOD..MAX phát sáng cyan nổi bật
    ctx.font = 'bold 18px monospace'
    ctx.fillText('GOOD..MAX', boxX + 16, boxY + 28)

    // Biểu đồ cột Equalizer sóng âm (10 cột tăng dần từ trái sang phải chuẩn ảnh)
    const eqBars = 10
    const barW = 6.5
    const barGap = 4.0
    const startEqX = boxX + 86
    for (let i = 0; i < eqBars; i++) {
      const baseHeight = 10 + i * 3.4
      const dynamicWave = Math.sin(time * 6.5 + i * 0.85) * 3.5
      const barH = Math.max(5, baseHeight + dynamicWave)
      ctx.fillRect(startEqX + i * (barW + barGap), boxY + 90 - barH, barW, barH)
    }

    // 3 dải vạch dữ liệu Telemetry mini bên trái biểu đồ cột
    ctx.lineWidth = 1.4
    ctx.fillRect(boxX + 16, boxY + 48, 56, 3.0)
    ctx.fillRect(boxX + 16, boxY + 62, 44, 3.0)
    ctx.fillRect(boxX + 16, boxY + 76, 50, 3.0)

    // Vòng tròn radar HUD mini ở góc dưới bên trái mắt
    const radarCx = boxX + 36
    const radarCy = boxY + 160
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.arc(radarCx, radarCy, 18, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(radarCx, radarCy, 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillRect(radarCx - 2, radarCy - 22, 4, 7)
    ctx.fillRect(radarCx - 2, radarCy + 15, 4, 7)

    // 2.2 HUD BÊN MẮT PHẢI (Viewer nhìn bên phải): Thanh quét ngang telemetry chuẩn ảnh
    const rightHudX = 660
    const rightHudY = 280
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(rightHudX, rightHudY)
    ctx.lineTo(rightHudX + 190, rightHudY)
    ctx.stroke()
    // Các vạch đánh dấu mini trên dải
    ctx.fillRect(rightHudX + 24, rightHudY - 6, 2.5, 6)
    ctx.fillRect(rightHudX + 65, rightHudY - 8, 3.5, 8)
    ctx.fillRect(rightHudX + 110, rightHudY - 6, 2.5, 6)
    ctx.fillRect(rightHudX + 156, rightHudY - 9, 3.5, 9)
    ctx.font = 'bold 12px monospace'
    ctx.fillText('SYS.DATA // 98.4%', rightHudX + 30, rightHudY + 22)

    // 2.3 Biểu đồ cột sóng âm thanh động ở chính giữa 2 mắt
    const eyeY = 255
    if (state.isSpeaking) {
      const barCount = 11
      const sBarW = 5.5
      const spacing = 11
      const startX = 512 - ((barCount - 1) * spacing) / 2
      for (let i = 0; i < barCount; i++) {
        const h = 16 + Math.sin(time * 16 + i * 1.3) * 36 + Math.cos(time * 9 + i) * 16
        ctx.fillRect(startX + i * spacing - sBarW / 2, eyeY - h / 2, sBarW, Math.max(6, h))
      }
    } else if (state.isThinking) {
      const scanAngle = time * 4.2
      ctx.lineWidth = 3.5
      ctx.beginPath()
      ctx.arc(512, eyeY, 34, scanAngle, scanAngle + Math.PI * 0.75)
      ctx.stroke()
    } else if (state.isListening) {
      const r = 18 + ((time * 50) % 50)
      const alpha = 1 - (r - 18) / 50
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(512, eyeY, r, 0, Math.PI * 2)
      ctx.stroke()
    } else if (isAlert) {
      if (Math.sin(time * 12) > 0) {
        ctx.font = 'bold 22px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('! WARNING !', 512, 56)
      }
    }

    ctx.restore()
    this.texture.needsUpdate = true
  }

  public dispose() {
    this.texture.dispose()
  }
}

/**
 * Tạo Texture phản quang cho tấm kính Visor:
 * - Nền kính xanh ngọc sapphire - cyan công nghệ trong suốt rõ nét.
 * - Hai vệt sáng phản quang ánh sáng môi trường màu trắng chạy chéo qua mặt kính (Specular Glare Streaks) chuẩn 100% ảnh mẫu.
 * - Viền laser cyan phát sáng rực rỡ tạo cảm giác kính dày mecha vát cạnh cao cấp.
 */
function createVisorGlassTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 1. Nền kính xanh ngọc sapphire - cyan công nghệ trong suốt rõ nét
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 512)
  bgGrad.addColorStop(0.0, 'rgba(12, 130, 240, 0.52)')
  bgGrad.addColorStop(0.45, 'rgba(0, 215, 255, 0.62)')
  bgGrad.addColorStop(1.0, 'rgba(15, 150, 255, 0.52)')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 512)

  // 2. Vệt phản quang ánh sáng môi trường chéo qua mặt kính (Specular Glare Streaks) chuẩn 100% ảnh mẫu
  ctx.save()
  // Vệt phản quang chính (Primary Streak)
  const streakGrad = ctx.createLinearGradient(300, 0, 750, 512)
  streakGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)')
  streakGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)')
  streakGrad.addColorStop(0.44, 'rgba(180, 245, 255, 0.60)')
  streakGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.96)')
  streakGrad.addColorStop(0.56, 'rgba(180, 245, 255, 0.60)')
  streakGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)')
  streakGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = streakGrad
  ctx.fillRect(0, 0, 1024, 512)

  // Vệt phản quang phụ song song (Secondary Accent Streak)
  const streak2Grad = ctx.createLinearGradient(160, 0, 600, 512)
  streak2Grad.addColorStop(0.0, 'rgba(255, 255, 255, 0)')
  streak2Grad.addColorStop(0.43, 'rgba(255, 255, 255, 0)')
  streak2Grad.addColorStop(0.48, 'rgba(255, 255, 255, 0.50)')
  streak2Grad.addColorStop(0.52, 'rgba(255, 255, 255, 0.55)')
  streak2Grad.addColorStop(0.57, 'rgba(255, 255, 255, 0)')
  streak2Grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = streak2Grad
  ctx.fillRect(0, 0, 1024, 512)

  // 3. Viền laser cyan phát sáng sắc nét mép kính (Beveled Glass Edge Glow)
  ctx.strokeStyle = '#00f5ff'
  ctx.lineWidth = 12
  ctx.shadowColor = '#00f5ff'
  ctx.shadowBlur = 16
  ctx.strokeRect(6, 6, 1012, 500)

  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Sinh hình học 3D cho Khung gọng Mecha Liền Khối (Monolithic Mecha Visor Frame):
 * - Thiết kế khối viền liền mạch 100%, vát cạnh chamfer sắc sảo (faceted mecha).
 * - Vòm trán trên dày dặn, góc cạnh dập nổi công nghệ cao.
 * - Hai bên thái dương vát chéo kết nối mượt mà vào hai tai nghe tròn lớn.
 * - Khung viền dưới ôm trọn mắt, ở chính giữa có khấc chữ V ngược sắc nét dứt khoát ngay trên nụ cười :3.
 * - Cửa sổ khoét lỗ lọt lòng tấm kính Visor xanh sapphire và đôi mắt Anime Chibi phía sau.
 */
/**
 * Sinh hình học 3D cho Khung gọng Mecha Liền Khối (Monolithic Mecha Visor Frame):
 * - Thiết kế khối viền liền mạch 100%, vát cạnh chamfer sắc sảo (faceted mecha).
 * - Vòm trán trên dày dặn, góc cạnh dập nổi công nghệ cao.
 * - Hai bên thái dương vát chéo kết nối mượt mà vào hai tai nghe tròn lớn.
 * - Khung viền dưới ôm trọn mắt, ở chính giữa có khấc chữ V ngược sắc nét dứt khoát ngay trên nụ cười :3.
 * - Cửa sổ khoét lỗ lọt lòng tấm kính Visor xanh sapphire và đôi mắt Anime Chibi phía sau.
 */
function createMonolithicVisorFrameGeometry(radius: number): THREE.BufferGeometry {
  const frameShape = new THREE.Shape()
  // 1. Đường bao ngoài gọng kính Mecha (Khung dập nổi góc cạnh Mecha Sci-Fi)
  frameShape.moveTo(0, 0.46)
  frameShape.lineTo(0.28, 0.46)
  frameShape.lineTo(0.58, 0.35)
  frameShape.lineTo(0.68, 0.18)
  frameShape.lineTo(0.68, 0.06)
  frameShape.lineTo(0.54, -0.05)
  frameShape.lineTo(0.26, -0.05)
  frameShape.lineTo(0.00, 0.05) // Khấc chữ V ngược ngoài ở cằm trên nụ cười :3
  // Nửa bên trái đối xứng
  frameShape.lineTo(-0.26, -0.05)
  frameShape.lineTo(-0.54, -0.05)
  frameShape.lineTo(-0.68, 0.06)
  frameShape.lineTo(-0.68, 0.18)
  frameShape.lineTo(-0.58, 0.35)
  frameShape.lineTo(-0.28, 0.46)
  frameShape.closePath()

  // 2. Cửa sổ kính lọt lòng (Hole khoét rộng mở trọn vẹn tầm nhìn cho đôi mắt Anime Chibi)
  const innerHole = new THREE.Path()
  innerHole.moveTo(0, 0.38)
  innerHole.lineTo(0.24, 0.38)
  innerHole.lineTo(0.50, 0.29)
  innerHole.lineTo(0.58, 0.16)
  innerHole.lineTo(0.56, 0.07)
  innerHole.lineTo(0.44, 0.00)
  innerHole.lineTo(0.20, 0.02)
  innerHole.lineTo(0.00, 0.12) // Khấc chữ V ngược trong ở giữa
  // Nửa bên trái đối xứng
  innerHole.lineTo(-0.20, 0.02)
  innerHole.lineTo(-0.44, 0.00)
  innerHole.lineTo(-0.56, 0.07)
  innerHole.lineTo(-0.58, 0.16)
  innerHole.lineTo(-0.50, 0.29)
  innerHole.lineTo(-0.24, 0.38)
  innerHole.closePath()

  frameShape.holes.push(innerHole)

  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    steps: 1,
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.012,
    bevelSegments: 2,
  })
  // KHÔNG geo.center() để giữ nguyên hệ tọa độ tuyệt đối đồng bộ với kính và mặt cầu

  // Uốn cong (Warp) ôm khít mặt cầu bán kính radius
  const pos = frameGeo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r2 = x * x + y * y
    const sz = Math.sqrt(Math.max(0.04, radius * radius - r2))
    pos.setXYZ(i, x, y, sz + z)
  }
  pos.needsUpdate = true
  frameGeo.computeVertexNormals()
  return frameGeo
}

/**
 * Sinh hình học 3D cho Tấm kính Visor Lens lọt lòng khớp khít cửa sổ:
 * - Kích thước lớn hơn cửa sổ kính 0.018 đơn vị để mép kính ngậm sâu vào bên trong rãnh gọng Mecha.
 * - Triệt tiêu 100% hiện tượng kính bị thò ra ngoài mép gọng ở cằm hoặc trán!
 * - Tạo UV mapping trải phẳng chuẩn xác theo Bounding Box để Texture phản quang hiển thị sắc sảo.
 */
function createVisorLensGeometry(radius: number): THREE.BufferGeometry {
  const glassShape = new THREE.Shape()
  // Lớn hơn innerHole 0.018 đơn vị để mép kính ngậm sâu vào rãnh gọng Mecha
  glassShape.moveTo(0, 0.395)
  glassShape.lineTo(0.255, 0.395)
  glassShape.lineTo(0.52, 0.305)
  glassShape.lineTo(0.60, 0.17)
  glassShape.lineTo(0.58, 0.06)
  glassShape.lineTo(0.455, -0.015)
  glassShape.lineTo(0.21, 0.005)
  glassShape.lineTo(0.00, 0.105) // Khấc chữ V lọt lòng
  // Nửa bên trái đối xứng
  glassShape.lineTo(-0.21, 0.005)
  glassShape.lineTo(-0.455, -0.015)
  glassShape.lineTo(-0.58, 0.06)
  glassShape.lineTo(-0.60, 0.17)
  glassShape.lineTo(-0.52, 0.305)
  glassShape.lineTo(-0.255, 0.395)
  glassShape.closePath()

  const geo = new THREE.ExtrudeGeometry(glassShape, {
    steps: 1,
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  })
  // KHÔNG geo.center() để khớp chính xác với gọng Mecha!

  // Gán UV mapping chuẩn theo Bounding Box 2D để texture không bị co kéo méo mó
  geo.computeBoundingBox()
  const bb = geo.boundingBox!
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const pos = geo.attributes.position as THREE.BufferAttribute

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)

    const u = (x - bb.min.x) / (bb.max.x - bb.min.x)
    const v = (y - bb.min.y) / (bb.max.y - bb.min.y)
    uv.setXY(i, u, v)

    // Uốn cong (Warp) ôm mặt cầu bán kính radius
    const r2 = x * x + y * y
    const sz = Math.sqrt(Math.max(0.04, radius * radius - r2))
    pos.setXYZ(i, x, y, sz + z)
  }
  uv.needsUpdate = true
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/**
 * Khởi tạo mô hình 3D linh vật M-Tròn Superhero đầy đủ chi tiết theo ảnh mẫu mascot-superhero.webp:
 * 1. Thân cầu cam MSB với nụ cười mèo Chibi `:3` nhỏ xinh và vi mạch Cyber phát sáng rực rỡ (Emissive Map).
 * 2. Tóc ngọn lửa 3 múi căng tròn phát sáng vàng ấm trên đỉnh đầu.
 * 3. Kính bảo hộ Cyber Visor công nghệ cao với màn hình HUD mắt Kawaii và khung titanium ôm sát mặt cầu.
 * 4. Tay phải chống hông dũng mãnh (Akimbo), tay trái giơ cao nắm đấm chiến thắng siêu anh hùng (Victory Fist ✊).
 * 5. Hai chân choãi vững vàng với đôi giày bốt mecha xanh đá, huy hiệu tam giác LED cyan hướng lên (▲), mắt cá phát sáng và rãnh đế bám chắc.
 * 6. Cặp phản lực Jetpack với lửa cam và áo choàng hologram uyển chuyển phấp phới sóng vải.
 */
export function createMtronMascot(): MtronMascot {
  const rootGroup = new THREE.Group()
  // Xoay nhẹ ~9 độ để tư thế siêu nhân ở góc nhìn 3/4 sinh động chuẩn ảnh mẫu
  rootGroup.rotation.y = 0.16

  const disposables: { dispose: () => void }[] = []

  // Bảng màu chuẩn thương hiệu MSB và phong cách Mecha Sci-Fi
  const COLOR_FLAME = new THREE.Color(0xffaa00)
  const COLOR_FRAME = new THREE.Color(0x4879a6) // Xanh titan mecha sáng bóng chuẩn ảnh mẫu
  const COLOR_DARK_STEEL = new THREE.Color(0x202b38)
  const COLOR_BOOT_MECHA = new THREE.Color(0x286bb8)
  const COLOR_BOOT_SOLE = new THREE.Color(0x16202c)
  const COLOR_CYAN = new THREE.Color(0x00f0ff)
  const COLOR_CAPE = new THREE.Color(0xe61a2b)

  // ─────────────────────────────────────────────────────────────
  // 1. THÂN CẦU M-TRÒN (Sphere Body + Circuit & Smile Texture)
  // ─────────────────────────────────────────────────────────────
  const bodyRadius = 0.74
  const bodyGeo = new THREE.SphereGeometry(bodyRadius, 48, 48)
  disposables.push(bodyGeo)

  const { map: bodyTexture, emissiveMap: circuitEmissiveTexture } = createBodyTextures()
  if (bodyTexture) disposables.push(bodyTexture)
  if (circuitEmissiveTexture) disposables.push(circuitEmissiveTexture)

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff), // Giữ trắng để texture cam MSB hiển thị nguyên bản sắc nét
    map: bodyTexture,
    emissiveMap: circuitEmissiveTexture,
    emissive: new THREE.Color(0xffb000),
    emissiveIntensity: 1.6,
    roughness: 0.18,
    metalness: 0.05,
    clearcoat: 0.92,
    clearcoatRoughness: 0.08,
  })
  disposables.push(bodyMat)

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  // Xoay -PI/2 để u = 0.50 (tâm texture mặt trước) quay thẳng ra phía trước +Z
  bodyMesh.rotation.y = -Math.PI / 2
  rootGroup.add(bodyMesh)

  // ─────────────────────────────────────────────────────────────
  // 2. TÓC NGỌN LỬA 3 MÚI PHÁT SÁNG TRÊN ĐỈNH ĐẦU (Flame Crest)
  // ─────────────────────────────────────────────────────────────
  const crestGroup = new THREE.Group()
  crestGroup.position.set(0, 0.67, 0.04)
  crestGroup.rotation.x = -0.08
  rootGroup.add(crestGroup)

  const flameMat = new THREE.MeshPhysicalMaterial({
    color: COLOR_FLAME,
    emissive: new THREE.Color(0xff8800),
    emissiveIntensity: 1.35,
    roughness: 0.10,
    metalness: 0.04,
    clearcoat: 0.95,
  })
  disposables.push(flameMat)

  const flameCoreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
  })
  disposables.push(flameCoreMat)

  // Múi giữa cao nhất và căng mọng nhất
  const centerLobeGeo = new THREE.CapsuleGeometry(0.15, 0.24, 16, 16)
  disposables.push(centerLobeGeo)
  const centerLobe = new THREE.Mesh(centerLobeGeo, flameMat)
  centerLobe.position.set(0, 0.22, 0)
  centerLobe.scale.set(1.18, 1.20, 0.88)
  crestGroup.add(centerLobe)

  const centerCoreGeo = new THREE.CapsuleGeometry(0.09, 0.16, 12, 12)
  disposables.push(centerCoreGeo)
  const centerCore = new THREE.Mesh(centerCoreGeo, flameCoreMat)
  centerCore.position.set(0, 0.21, 0.02)
  centerCore.scale.set(1.0, 1.12, 0.80)
  crestGroup.add(centerCore)

  // Múi trái nghiêng sang bên
  const leftLobeGeo = new THREE.CapsuleGeometry(0.12, 0.19, 14, 14)
  disposables.push(leftLobeGeo)
  const leftLobe = new THREE.Mesh(leftLobeGeo, flameMat)
  leftLobe.position.set(-0.16, 0.14, -0.02)
  leftLobe.rotation.z = 0.46
  leftLobe.scale.set(1.10, 1.15, 0.85)
  crestGroup.add(leftLobe)

  // Múi phải nghiêng sang bên
  const rightLobeGeo = new THREE.CapsuleGeometry(0.12, 0.19, 14, 14)
  disposables.push(rightLobeGeo)
  const rightLobe = new THREE.Mesh(rightLobeGeo, flameMat)
  rightLobe.position.set(0.16, 0.14, -0.02)
  rightLobe.rotation.z = -0.46
  rightLobe.scale.set(1.10, 1.15, 0.85)
  crestGroup.add(rightLobe)

  // Đế ngọn lửa kết nối mượt mà vào đầu
  const crestBaseGeo = new THREE.SphereGeometry(0.22, 16, 16)
  disposables.push(crestBaseGeo)
  const crestBase = new THREE.Mesh(crestBaseGeo, flameMat)
  crestBase.scale.set(1.30, 0.65, 0.90)
  crestBase.position.set(0, 0.06, 0)
  crestGroup.add(crestBase)

  // Đèn ánh sáng ấm tỏa ra từ ngọn lửa
  const flameLight = new THREE.PointLight(0xffb830, 2.0, 2.5)
  flameLight.position.set(0, 0.95, 0.20)
  rootGroup.add(flameLight)

  // ─────────────────────────────────────────────────────────────
  // 3. ĐÔI MẮT ANIME CHIBI & KÍNH BẢO HỘ CYBER VISOR TRONG SUỐT
  // ─────────────────────────────────────────────────────────────
  const visorGroup = new THREE.Group()
  rootGroup.add(visorGroup)

  // 3.1 TẦNG 1: Đôi mắt Anime Chibi nằm trực tiếp trên mặt nhân vật (phía sau kính)
  const eyesRenderer = new AnimeEyesRenderer()
  disposables.push(eyesRenderer)

  const eyesGeo = new THREE.SphereGeometry(
    bodyRadius + 0.003,
    48,
    32,
    Math.PI * 0.23,
    Math.PI * 0.54,
    Math.PI * 0.28,
    Math.PI * 0.26
  )
  disposables.push(eyesGeo)

  const eyesMat = new THREE.MeshBasicMaterial({
    map: eyesRenderer.texture,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  })
  disposables.push(eyesMat)

  const eyesMesh = new THREE.Mesh(eyesGeo, eyesMat)
  eyesMesh.renderOrder = 1
  visorGroup.add(eyesMesh)

  // 3.2 TẦNG 2: Tấm kính Visor Mecha xanh ngọc Sapphire điện tử lọt lòng khít rãnh gọng, có vệt phản quang ánh sáng môi trường
  const glassTex = createVisorGlassTexture()
  if (glassTex) disposables.push(glassTex)

  const visorGlassGeo = createVisorLensGeometry(bodyRadius + 0.022)
  disposables.push(visorGlassGeo)

  const visorGlassMat = new THREE.MeshPhysicalMaterial({
    map: glassTex,
    color: new THREE.Color(0x20b0ff), // Xanh sapphire cyan điện tử công nghệ cao
    emissive: new THREE.Color(0x064068),
    emissiveIntensity: 0.52,
    transparent: true,
    opacity: 0.76, // Hiển thị rõ mồn một mặt kính thủy tinh với vệt sáng phản quang lấp lánh, đồng thời nhìn xuyên thấu vào mắt và khuôn mặt cam!
    roughness: 0.03,
    metalness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  disposables.push(visorGlassMat)

  const visorGlassMesh = new THREE.Mesh(visorGlassGeo, visorGlassMat)
  visorGlassMesh.renderOrder = 2
  visorGroup.add(visorGlassMesh)

  // 3.3 TẦNG 3: Màn hình HUD Hologram phát quang chiếu nổi trực tiếp trên bề mặt kính Visor (Holo HUD Overlay)
  const holoRenderer = new HoloHudRenderer()
  disposables.push(holoRenderer)

  const holoHudGeo = visorGlassGeo.clone()
  const hPos = holoHudGeo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < hPos.count; i++) {
    hPos.setZ(i, hPos.getZ(i) + 0.003)
  }
  hPos.needsUpdate = true
  disposables.push(holoHudGeo)

  const holoHudMat = new THREE.MeshBasicMaterial({
    map: holoRenderer.texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  })
  disposables.push(holoHudMat)

  const holoHudMesh = new THREE.Mesh(holoHudGeo, holoHudMat)
  holoHudMesh.renderOrder = 3
  visorGroup.add(holoHudMesh)

  // 3.4 Khung viền kim loại Titanium Mecha liền khối vát cạnh dập nổi ôm trọn kính Visor
  const frameMat = new THREE.MeshStandardMaterial({
    color: COLOR_FRAME,
    metalness: 0.68,
    roughness: 0.20,
  })
  disposables.push(frameMat)

  const cyanLedMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    side: THREE.DoubleSide,
  })
  disposables.push(cyanLedMat)

  // Khung gọng kính Mecha liền khối (Monolithic Visor Frame) dập nổi góc cạnh
  const frameGeo = createMonolithicVisorFrameGeometry(bodyRadius + 0.036)
  disposables.push(frameGeo)
  const frameMesh = new THREE.Mesh(frameGeo, frameMat)
  frameMesh.renderOrder = 4
  visorGroup.add(frameMesh)

  // Tấm khiên trung tâm trên trán (Brow Shield Plate) có dải đèn LED cyan
  const browShieldGroup = new THREE.Group()
  browShieldGroup.position.set(0, 0.46, 0.63)
  browShieldGroup.rotation.x = -0.42

  const browShieldGeo = new THREE.BoxGeometry(0.26, 0.060, 0.055)
  disposables.push(browShieldGeo)
  browShieldGroup.add(new THREE.Mesh(browShieldGeo, frameMat))

  const browLedGeo = new THREE.BoxGeometry(0.18, 0.016, 0.060)
  disposables.push(browLedGeo)
  browShieldGroup.add(new THREE.Mesh(browLedGeo, cyanLedMat))
  visorGroup.add(browShieldGroup)



  // 3.4 Tai nghe tròn lớn 2 bên thái dương (Ear Pucks) gắn chặt vào 2 bên đầu
  const earPuckGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.14, 24)
  disposables.push(earPuckGeo)

  const earBevelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.15, 20)
  disposables.push(earBevelGeo)

  const earLedGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.16, 16)
  disposables.push(earLedGeo)

  const silverAccentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdce5ef),
    metalness: 0.90,
    roughness: 0.18,
  })
  disposables.push(silverAccentMat)

  // Tai nghe bên trái
  const leftEar = new THREE.Group()
  leftEar.position.set(-0.68, 0.15, 0.32)
  leftEar.rotation.z = Math.PI / 2
  leftEar.rotation.y = 0.25
  leftEar.add(new THREE.Mesh(earPuckGeo, frameMat))
  leftEar.add(new THREE.Mesh(earBevelGeo, silverAccentMat))
  leftEar.add(new THREE.Mesh(earLedGeo, cyanLedMat))
  visorGroup.add(leftEar)

  // Tai nghe bên phải
  const rightEar = new THREE.Group()
  rightEar.position.set(0.68, 0.15, 0.32)
  rightEar.rotation.z = Math.PI / 2
  rightEar.rotation.y = -0.25
  rightEar.add(new THREE.Mesh(earPuckGeo, frameMat))
  rightEar.add(new THREE.Mesh(earBevelGeo, silverAccentMat))
  rightEar.add(new THREE.Mesh(earLedGeo, cyanLedMat))
  visorGroup.add(rightEar)

  // ─────────────────────────────────────────────────────────────
  // 4. ĐÔI TAY TƯ THẾ SIÊU ANH HÙNG (Heroic Stance Arms)
  // ─────────────────────────────────────────────────────────────
  const armMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xff4600),
    roughness: 0.20,
    metalness: 0.08,
    clearcoat: 0.92,
  })
  disposables.push(armMat)

  // 4.1 Tay phải nhân vật (viewer nhìn bên trái): Chống hông dũng mãnh (Akimbo Pose)
  const rightArmGroup = new THREE.Group()
  rootGroup.add(rightArmGroup)

  const armTubeRadius = 0.105 // Bán kính cánh tay đầy đặn Chibi siêu nhân chuẩn ảnh mẫu
  const rightArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.58, 0.12, 0.16),
    new THREE.Vector3(-0.86, -0.02, 0.26),
    new THREE.Vector3(-0.46, -0.12, 0.56),
  ])
  const rightArmGeo = new THREE.TubeGeometry(rightArmCurve, 24, armTubeRadius, 18, false)
  disposables.push(rightArmGeo)
  rightArmGroup.add(new THREE.Mesh(rightArmGeo, armMat))

  // Điểm cuối và vector tiếp tuyến của cánh tay phải
  const rightEndPoint = rightArmCurve.getPoint(1.0)
  const rightEndTangent = rightArmCurve.getTangent(1.0).normalize()

  // 1. Khớp cổ tay phải liền khối (Wrist Bridge): Đồng trục 100% với vector tiếp tuyến cẳng tay
  const rightWristBridgeGeo = new THREE.CylinderGeometry(armTubeRadius, armTubeRadius + 0.008, 0.075, 18)
  disposables.push(rightWristBridgeGeo)
  const rightWristBridge = new THREE.Mesh(rightWristBridgeGeo, armMat)
  rightWristBridge.position.copy(rightEndPoint).addScaledVector(rightEndTangent, 0.015)
  rightWristBridge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rightEndTangent)
  rightArmGroup.add(rightWristBridge)

  // 2. Bàn tay phải chống nạnh (Akimbo Fist) đặt tiếp nối cổ tay tại mặt trước eo, nổi bật trên sườn
  const rightHandGroup = new THREE.Group()
  rightHandGroup.position.copy(rightEndPoint).addScaledVector(rightEndTangent, 0.060)
  // Xoay cụm bàn tay để ngón tay hướng ra phía trước camera theo góc nghiêng tự nhiên
  rightHandGroup.rotation.set(-0.15, 0.35, -0.15)

  // Khối mu bàn tay to tròn tỳ sát mặt trước eo
  const rightPalmGeo = new THREE.SphereGeometry(0.102, 18, 18)
  disposables.push(rightPalmGeo)
  const rightPalmMesh = new THREE.Mesh(rightPalmGeo, armMat)
  rightPalmMesh.scale.set(1.08, 0.95, 0.80)
  rightHandGroup.add(rightPalmMesh)

  // 4 Đốt ngón tay gập cuộn (Knuckles) Chibi xếp dọc hướng ra phía trước camera
  const rightFingers = [
    { x: 0.028, y: 0.036, z: 0.052, r: 0.035, len: 0.052, rotZ: 0.16, kX: 0.044, kY: 0.038, kZ: 0.064, kR: 0.036 }, // Ngón trỏ
    { x: 0.038, y: 0.006, z: 0.058, r: 0.038, len: 0.056, rotZ: 0.08, kX: 0.058, kY: 0.006, kZ: 0.070, kR: 0.040 }, // Ngón giữa
    { x: 0.032, y: -0.026, z: 0.052, r: 0.035, len: 0.052, rotZ: 0.02, kX: 0.050, kY: -0.028, kZ: 0.064, kR: 0.036 }, // Ngón áp út
    { x: 0.022, y: -0.056, z: 0.044, r: 0.030, len: 0.044, rotZ: -0.04, kX: 0.038, kY: -0.060, kZ: 0.054, kR: 0.032 }, // Ngón út
  ]
  rightFingers.forEach((rf) => {
    const rfGeo = new THREE.CapsuleGeometry(rf.r, rf.len, 12, 12)
    disposables.push(rfGeo)
    const rfMesh = new THREE.Mesh(rfGeo, armMat)
    rfMesh.position.set(rf.x, rf.y, rf.z)
    rfMesh.rotation.set(0.18, 0.20, rf.rotZ)
    rightHandGroup.add(rfMesh)

    // Khớp gập nổi (Knuckle) tạo vòm khối và vệt sáng highlight riêng biệt từng ngón
    const kGeo = new THREE.SphereGeometry(rf.kR, 12, 12)
    disposables.push(kGeo)
    const kMesh = new THREE.Mesh(kGeo, armMat)
    kMesh.position.set(rf.kX, rf.kY, rf.kZ)
    rightHandGroup.add(kMesh)
  })

  // Ngón tay cái Chibi vắt lên phía trên eo
  const rightThumbBaseGeo = new THREE.SphereGeometry(0.042, 12, 12)
  disposables.push(rightThumbBaseGeo)
  const rightThumbBase = new THREE.Mesh(rightThumbBaseGeo, armMat)
  rightThumbBase.position.set(0.006, 0.044, 0.042)
  rightHandGroup.add(rightThumbBase)

  const rightThumbGeo = new THREE.CapsuleGeometry(0.034, 0.058, 12, 12)
  disposables.push(rightThumbGeo)
  const rightThumbMesh = new THREE.Mesh(rightThumbGeo, armMat)
  rightThumbMesh.position.set(0.016, 0.064, 0.048)
  rightThumbMesh.rotation.set(0.30, -0.15, 1.0)
  rightHandGroup.add(rightThumbMesh)

  const rightThumbTipGeo = new THREE.SphereGeometry(0.032, 10, 10)
  disposables.push(rightThumbTipGeo)
  const rightThumbTip = new THREE.Mesh(rightThumbTipGeo, armMat)
  rightThumbTip.position.set(0.034, 0.084, 0.048)
  rightHandGroup.add(rightThumbTip)

  rightArmGroup.add(rightHandGroup)

  // 4.2 Tay trái nhân vật (viewer nhìn bên phải): Giơ nắm đấm chiến thắng siêu nhân lên cao (Victory Fist ✊)
  const leftArmGroup = new THREE.Group()
  rootGroup.add(leftArmGroup)

  const leftArmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.56, 0.10, 0.10),
    new THREE.Vector3(0.70, 0.28, 0.18),
    new THREE.Vector3(0.80, 0.46, 0.24),
  ])
  const leftArmGeo = new THREE.TubeGeometry(leftArmCurve, 24, armTubeRadius, 18, false)
  disposables.push(leftArmGeo)
  leftArmGroup.add(new THREE.Mesh(leftArmGeo, armMat))

  // Điểm cuối và vector tiếp tuyến của cánh tay trái
  const leftEndPoint = leftArmCurve.getPoint(1.0)
  const leftEndTangent = leftArmCurve.getTangent(1.0).normalize()

  // 1. Khớp cổ tay trái liền khối: Đồng trục 100% với vector tiếp tuyến cẳng tay
  const leftWristBridgeGeo = new THREE.CylinderGeometry(armTubeRadius, armTubeRadius + 0.009, 0.075, 18)
  disposables.push(leftWristBridgeGeo)
  const leftWristBridge = new THREE.Mesh(leftWristBridgeGeo, armMat)
  leftWristBridge.position.copy(leftEndPoint).addScaledVector(leftEndTangent, 0.015)
  leftWristBridge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), leftEndTangent)
  leftArmGroup.add(leftWristBridge)

  // 2. Cụm nắm đấm siêu nhân Chibi đặt tiếp nối cổ tay tại điểm cuối cẳng tay + offset tiếp tuyến
  const leftFistGroup = new THREE.Group()
  leftFistGroup.position.copy(leftEndPoint).addScaledVector(leftEndTangent, 0.065)
  // Xoay nắm đấm hướng trực diện mặt các múi ngón tay ra camera và nghiêng theo trục vươn cánh tay
  leftFistGroup.rotation.set(0.08, -0.22, -0.15)

  // Khối đế mu bàn tay làm bệ tựa, to tròn đầy đặn liền mạch với cổ tay
  const fistBaseGeo = new THREE.SphereGeometry(0.104, 20, 20)
  disposables.push(fistBaseGeo)
  const fistBase = new THREE.Mesh(fistBaseGeo, armMat)
  fistBase.scale.set(1.12, 0.98, 0.78)
  fistBase.position.set(0, 0, 0)
  leftFistGroup.add(fistBase)

  // 3. 4 Múi ngón tay gập nổi vòm cung múp míp rõ rệt (The 4 Visible Fingers)
  const fingers = [
    { x: -0.052, y: 0.048, z: 0.042, r: 0.036, len: 0.058, rotZ: -0.10, kY: 0.082, kR: 0.038 }, // Ngón trỏ
    { x: -0.018, y: 0.064, z: 0.048, r: 0.040, len: 0.064, rotZ: 0.00, kY: 0.102, kR: 0.042 },  // Ngón giữa (đỉnh cao nhất)
    { x: 0.020, y: 0.056, z: 0.042, r: 0.037, len: 0.058, rotZ: 0.08, kY: 0.090, kR: 0.039 },   // Ngón áp út
    { x: 0.052, y: 0.038, z: 0.035, r: 0.032, len: 0.048, rotZ: 0.16, kY: 0.066, kR: 0.034 },   // Ngón út
  ]
  fingers.forEach((f) => {
    const fGeo = new THREE.CapsuleGeometry(f.r, f.len, 12, 12)
    disposables.push(fGeo)
    const fMesh = new THREE.Mesh(fGeo, armMat)
    fMesh.position.set(f.x, f.y, f.z)
    fMesh.rotation.set(0.35, 0, f.rotZ)
    leftFistGroup.add(fMesh)

    // Khớp đỉnh ngón tay tạo vòm cong tròn tự nhiên và đốm sáng riêng biệt cho từng ngón
    const kGeo = new THREE.SphereGeometry(f.kR, 12, 12)
    disposables.push(kGeo)
    const kMesh = new THREE.Mesh(kGeo, armMat)
    kMesh.position.set(f.x, f.kY, f.z - 0.008)
    leftFistGroup.add(kMesh)
  })

  // 4. Ngón tay cái Chibi to tròn (Chubby Thumb) gập ngang khóa chặt phía trước
  const thumbBaseGeo = new THREE.SphereGeometry(0.044, 12, 12)
  disposables.push(thumbBaseGeo)
  const thumbBase = new THREE.Mesh(thumbBaseGeo, armMat)
  thumbBase.position.set(-0.065, -0.008, 0.042)
  leftFistGroup.add(thumbBase)

  const thumbBodyGeo = new THREE.CapsuleGeometry(0.036, 0.070, 12, 12)
  disposables.push(thumbBodyGeo)
  const thumbBody = new THREE.Mesh(thumbBodyGeo, armMat)
  thumbBody.position.set(-0.020, 0.004, 0.072)
  thumbBody.rotation.set(-0.05, 0.08, 1.40)
  leftFistGroup.add(thumbBody)

  const thumbTipGeo = new THREE.SphereGeometry(0.036, 10, 10)
  disposables.push(thumbTipGeo)
  const thumbTip = new THREE.Mesh(thumbTipGeo, armMat)
  thumbTip.position.set(0.022, 0.010, 0.072)
  leftFistGroup.add(thumbTip)

  leftArmGroup.add(leftFistGroup)

  // ─────────────────────────────────────────────────────────────
  // 5. ĐÔI CHÂN & ĐÔI GIÀY MECHA SCI-FI (Chunky High-Top Cyber Boots)
  // ─────────────────────────────────────────────────────────────
  const bootMat = new THREE.MeshPhysicalMaterial({
    color: COLOR_BOOT_MECHA,
    metalness: 0.35,
    roughness: 0.25,
    clearcoat: 0.60,
    clearcoatRoughness: 0.12,
  })
  disposables.push(bootMat)

  const soleMat = new THREE.MeshStandardMaterial({
    color: COLOR_BOOT_SOLE,
    metalness: 0.25,
    roughness: 0.70,
  })
  disposables.push(soleMat)

  // Huy hiệu LED hình thang trên lưỡi gà giày Mecha (Trapezoid Cyber Badge)
  const badgeShape = new THREE.Shape()
  badgeShape.moveTo(-0.038, 0.034)  // Góc trên trái
  badgeShape.lineTo(0.038, 0.034)   // Góc trên phải
  badgeShape.lineTo(0.022, -0.034)  // Góc dưới phải
  badgeShape.lineTo(-0.022, -0.034) // Góc dưới trái
  badgeShape.closePath()
  const ledBadgeGeo = new THREE.ExtrudeGeometry(badgeShape, { depth: 0.018, bevelEnabled: false })
  disposables.push(ledBadgeGeo)

  // Hàm tạo cấu trúc 1 chiếc giày Mecha hoàn chỉnh, với gốc tọa độ tại CỔ CHÂN (0, 0, 0)
  const createCyberBoot = (isRightFootOfViewer: boolean) => {
    const boot = new THREE.Group()
    // Má ngoài: nếu là chân trái của nhân vật (viewer bên phải) thì má ngoài ở +X, ngược lại -X
    const outerSign = isRightFootOfViewer ? 1 : -1

    // 5.1 Đai đệm cổ giày ôm khít cổ chân (Padded Collar Ring) - Bo tròn mềm mại 360 độ, không có nắp phẳng che cụt
    const collarRingGeo = new THREE.TorusGeometry(0.120, 0.026, 14, 28)
    disposables.push(collarRingGeo)
    const collarRing = new THREE.Mesh(collarRingGeo, frameMat)
    collarRing.rotation.x = Math.PI / 2
    collarRing.position.set(0, 0.035, 0)
    boot.add(collarRing)

    // Thân ống cổ giày cao cổ mở rỗng ôm lấy chân (Open-ended Collar Sleeve)
    const collarSleeveGeo = new THREE.CylinderGeometry(0.124, 0.138, 0.11, 24, 1, true)
    disposables.push(collarSleeveGeo)
    const collarSleeve = new THREE.Mesh(collarSleeveGeo, frameMat)
    collarSleeve.position.set(0, -0.015, 0)
    boot.add(collarSleeve)

    // 5.2 Lưỡi gà bảo vệ cổ chân vươn cao có đèn LED hình thang (Front Armor Tongue)
    const tonguePlateGeo = new THREE.BoxGeometry(0.125, 0.12, 0.020)
    disposables.push(tonguePlateGeo)
    const tonguePlate = new THREE.Mesh(tonguePlateGeo, frameMat)
    tonguePlate.position.set(0, 0.075, 0.080)
    tonguePlate.rotation.x = -0.20
    boot.add(tonguePlate)

    const ledBadge = new THREE.Mesh(ledBadgeGeo, cyanLedMat)
    ledBadge.position.set(0, 0.075, 0.093)
    ledBadge.rotation.x = -0.20
    boot.add(ledBadge)

    // 5.3 Thân giày Mecha to bản, hầm hố chuẩn Chibi (Boot Body & Toe Box)
    // Gót giày bo tròn đầy đặn bọc kín hoàn toàn mặt sau cổ chân
    const heelGeo = new THREE.SphereGeometry(0.140, 20, 20)
    disposables.push(heelGeo)
    const heel = new THREE.Mesh(heelGeo, bootMat)
    heel.position.set(0, -0.038, -0.035)
    boot.add(heel)

    // Mu bàn chân khí động học
    const bridgeGeo = new THREE.CapsuleGeometry(0.128, 0.14, 14, 14)
    disposables.push(bridgeGeo)
    const bridge = new THREE.Mesh(bridgeGeo, bootMat)
    bridge.rotation.x = Math.PI / 2 - 0.20
    bridge.position.set(0, -0.048, 0.065)
    boot.add(bridge)

    // Mũi giày Mecha vòm thép tròn trịa căng mọng
    const toeGeo = new THREE.SphereGeometry(0.132, 18, 18)
    disposables.push(toeGeo)
    const toe = new THREE.Mesh(toeGeo, bootMat)
    toe.position.set(0, -0.058, 0.165)
    boot.add(toe)

    // Vành gân nổi quanh mũi giày (Welt Piping)
    const weltGeo = new THREE.TorusGeometry(0.126, 0.015, 8, 24, Math.PI)
    disposables.push(weltGeo)
    const welt = new THREE.Mesh(weltGeo, frameMat)
    welt.rotation.x = -Math.PI / 2 + 0.15
    welt.position.set(0, -0.080, 0.135)
    boot.add(welt)

    // 5.4 Núm tròn mắt cá ngoài công nghệ cao (Lateral Ankle Pod)
    const anklePodGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.030, 18)
    disposables.push(anklePodGeo)
    const anklePod = new THREE.Mesh(anklePodGeo, frameMat)
    anklePod.position.set(outerSign * 0.142, -0.015, 0.015)
    anklePod.rotation.z = Math.PI / 2
    boot.add(anklePod)

    const ankleDiscGeo = new THREE.CircleGeometry(0.034, 18)
    disposables.push(ankleDiscGeo)
    const ankleDisc = new THREE.Mesh(ankleDiscGeo, cyanLedMat)
    ankleDisc.position.set(outerSign * 0.158, -0.015, 0.015)
    ankleDisc.rotation.y = outerSign * (Math.PI / 2)
    boot.add(ankleDisc)

    // 5.5 Đế giày Mecha dày có rãnh bám sàn (Treaded Lug Sole)
    const soleGeo = new THREE.BoxGeometry(0.24, 0.055, 0.36)
    disposables.push(soleGeo)
    const sole = new THREE.Mesh(soleGeo, soleMat)
    sole.position.set(0, -0.120, 0.065)
    boot.add(sole)

    // Các rãnh răng cưa đế bám sàn (Tread Grips)
    for (let g = 0; g < 4; g++) {
      const gripGeo = new THREE.BoxGeometry(0.246, 0.020, 0.032)
      disposables.push(gripGeo)
      const grip = new THREE.Mesh(gripGeo, frameMat)
      grip.position.set(0, -0.142, -0.06 + g * 0.08)
      boot.add(grip)
    }

    // Dải phát quang năng lượng cyan dưới đế giày
    const soleGlowGeo = new THREE.BoxGeometry(0.16, 0.018, 0.25)
    disposables.push(soleGlowGeo)
    const soleGlow = new THREE.Mesh(soleGlowGeo, cyanLedMat)
    soleGlow.position.set(0, -0.146, 0.065)
    boot.add(soleGlow)

    return boot
  }

  // 5.6 Chân phải nhân vật (viewer nhìn BÊN TRÁI): Đồng trục 100% từ háng cắm sâu lọt lòng cổ giày
  const rightLegGroup = new THREE.Group()
  rootGroup.add(rightLegGroup)

  const rightLegGeo = new THREE.CylinderGeometry(0.108, 0.074, 0.268, 20)
  disposables.push(rightLegGeo)
  const rightLegMesh = new THREE.Mesh(rightLegGeo, armMat)
  rightLegMesh.position.set(-0.23, -0.75, 0.05)
  rightLegMesh.rotation.set(0, -0.16, 0.226) // Trục nghiêng nối chuẩn xác từ háng (-0.20, -0.62) đến cổ chân (-0.26, -0.88)
  rightLegGroup.add(rightLegMesh)

  const rightBoot = createCyberBoot(false)
  // Gắn chính xác tại tâm cổ chân đồng trục
  rightBoot.position.set(-0.26, -0.85, 0.05)
  rightBoot.rotation.set(0, -0.16, 0) // Đế phẳng hoàn toàn, hơi mở mũi sang trái tự nhiên
  rightLegGroup.add(rightBoot)

  // 5.7 Chân trái nhân vật (viewer nhìn BÊN PHẢI): Đồng trục 100% từ háng cắm sâu lọt lòng cổ giày
  const leftLegGroup = new THREE.Group()
  rootGroup.add(leftLegGroup)

  const leftLegGeo = new THREE.CylinderGeometry(0.108, 0.074, 0.268, 20)
  disposables.push(leftLegGeo)
  const leftLegMesh = new THREE.Mesh(leftLegGeo, armMat)
  leftLegMesh.position.set(0.23, -0.75, 0.05)
  leftLegMesh.rotation.set(0, 0.20, -0.226) // Trục nghiêng nối chuẩn xác từ háng (0.20, -0.62) đến cổ chân (0.26, -0.88)
  leftLegGroup.add(leftLegMesh)

  const leftBoot = createCyberBoot(true)
  // Gắn chính xác tại tâm cổ chân đồng trục
  leftBoot.position.set(0.26, -0.85, 0.05)
  // Xoay góc mở tự nhiên theo ảnh mẫu, đế phẳng hoàn toàn trên sàn
  leftBoot.rotation.set(0, 0.20, 0)
  leftLegGroup.add(leftBoot)

  // ─────────────────────────────────────────────────────────────
  // 6. ÁO CHOÀNG SIÊU NHÂN HOLOGRAM (Heroic Cape)
  // ─────────────────────────────────────────────────────────────

  // Áo choàng siêu nhân Hologram phấp phới sóng vải (GẮN KHÍT 100% VÀO THÂN VÀ VAI NHÂN VẬT)
  // Gốc capeGroup đặt tại (0, 0, 0) để tọa độ đỉnh tính trực tiếp theo mặt cầu thân M-Tròn
  const capeGroup = new THREE.Group()
  capeGroup.position.set(0, 0, 0)
  rootGroup.add(capeGroup)

  const capeWidth = 1.30
  const capeHeight = 1.30
  const capeSegmentsX = 32
  const capeSegmentsY = 32
  const capeGeo = new THREE.PlaneGeometry(
    capeWidth,
    capeHeight,
    capeSegmentsX,
    capeSegmentsY
  )
  disposables.push(capeGeo)

  const capePosAttr = capeGeo.attributes.position as THREE.BufferAttribute
  const capeBasePositions = new Float32Array(capePosAttr.array.length)
  capeBasePositions.set(capePosAttr.array)

  // Bán kính thân cầu M-Tròn để tính bề mặt dính chặt
  const rBody = bodyRadius

  for (let i = 0; i < capePosAttr.count; i++) {
    const rawX = capePosAttr.getX(i)
    const rawY = capePosAttr.getY(i)
    // v: 0 ở cổ áo/vai (trên cùng), 1 ở gấu áo (dưới cùng)
    const v = (capeHeight / 2 - rawY) / capeHeight
    // u: -1 ở mép trái, +1 ở mép phải
    const u = rawX / (capeWidth / 2)

    // Y: Bắt đầu từ bờ vai trên (y = 0.44) buông xuống dưới chân (y = -0.95)
    const curY = 0.44 * (1 - v) - 0.95 * v

    // X: Ở vai ôm theo chiều rộng vai ([-0.35, 0.35]), ở gấu áo xòe rộng sang trái sau tay giơ
    const topX = u * 0.35
    const botX = u * 0.52 - 0.40
    const curX = topX * (1 - v) + botX * v

    // Mép trên (v=0) gắn chính xác vào 2 bờ vai và sau gáy của M-Tròn
    const topSphereZ = -Math.sqrt(Math.max(0.01, rBody * rBody - topX * topX - 0.44 * 0.44)) - 0.016

    // Tà phía dưới (v > 0) tách hoàn toàn khỏi body, vồng ra sau lượn sóng tự do không dính mép dưới
    const billowZ = -v * 0.28 - Math.sin(v * Math.PI * 0.85) * 0.22
    const foldZ = Math.sin(u * Math.PI * 3.2 + v * 2.4) * (0.012 + 0.045 * v)
    const totalZ = topSphereZ + billowZ + foldZ

    capePosAttr.setXYZ(i, curX, curY, totalZ)
    capeBasePositions[i * 3] = curX
    capeBasePositions[i * 3 + 1] = curY
    capeBasePositions[i * 3 + 2] = totalZ
  }
  capeGeo.computeVertexNormals()

  // Khóa cài áo choàng trên vai (Shoulder Clasps) ghim chặt áo choàng vào đúng 2 mỏm vai
  const claspGeo = new THREE.SphereGeometry(0.046, 14, 14)
  disposables.push(claspGeo)

  // Tọa độ vai trái và phải trên mặt cầu (y = 0.44, x = ±0.32)
  const claspZ = -Math.sqrt(rBody * rBody - 0.32 * 0.32 - 0.44 * 0.44) - 0.018

  const claspLeft = new THREE.Mesh(claspGeo, silverAccentMat)
  claspLeft.position.set(-0.32, 0.44, claspZ)
  claspLeft.scale.set(1.0, 0.7, 1.1)
  capeGroup.add(claspLeft)

  const claspRight = new THREE.Mesh(claspGeo, silverAccentMat)
  claspRight.position.set(0.32, 0.44, claspZ)
  claspRight.scale.set(1.0, 0.7, 1.1)
  capeGroup.add(claspRight)

  // Vòng đai cổ áo kim loại (Collar Hem Band) ôm khít vòng qua sau gáy kết nối 2 khóa vai
  const collarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.32, 0.44, claspZ),
    new THREE.Vector3(-0.18, 0.45, -Math.sqrt(rBody * rBody - 0.18 * 0.18 - 0.45 * 0.45) - 0.018),
    new THREE.Vector3(0, 0.455, -Math.sqrt(rBody * rBody - 0.455 * 0.455) - 0.018),
    new THREE.Vector3(0.18, 0.45, -Math.sqrt(rBody * rBody - 0.18 * 0.18 - 0.45 * 0.45) - 0.018),
    new THREE.Vector3(0.32, 0.44, claspZ),
  ])
  const collarGeo = new THREE.TubeGeometry(collarCurve, 20, 0.016, 8, false)
  disposables.push(collarGeo)
  const collarMesh = new THREE.Mesh(collarGeo, frameMat)
  capeGroup.add(collarMesh)

  const { map: capeTexture, emissiveMap: capeEmissiveTexture } = createCapeTextures()
  if (capeTexture) disposables.push(capeTexture)
  if (capeEmissiveTexture) disposables.push(capeEmissiveTexture)

  const capeMat = new THREE.MeshPhysicalMaterial({
    map: capeTexture,
    emissiveMap: capeEmissiveTexture,
    emissive: new THREE.Color(0x351040),
    emissiveIntensity: 0.65,
    roughness: 0.25,
    metalness: 0.12,
    clearcoat: 0.90,
    clearcoatRoughness: 0.15,
    transmission: 0.25,
    ior: 1.35,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: true,
  })
  disposables.push(capeMat)

  const capeMesh = new THREE.Mesh(capeGeo, capeMat)
  capeGroup.add(capeMesh)

  // ─────────────────────────────────────────────────────────────
  // 7. ANIMATION CONTROLLER (Update Loop)
  // ─────────────────────────────────────────────────────────────
  const targetEmissiveColor = new THREE.Color()

  const update = (
    time: number,
    delta: number,
    state: MascotState,
    pointer: { x: number; y: number }
  ) => {
    const isAlert = state.activeIntent === 'FRAUD_ALERT'

    // 7.1 Cập nhật Đôi mắt Anime Chibi & Màn hình Hologram trên kính
    eyesRenderer.update(delta, state, pointer)
    holoRenderer.update(time, delta, state)

    // 7.2 Đổi màu & cường độ phát quang vi mạch theo trạng thái
    let waveSpeed = 3.8
    let waveAmp = 0.08
    let bounceAmp = 0.04
    let bounceFreq = 2.1

    if (isAlert) {
      targetEmissiveColor.copy(new THREE.Color(0xff2200))
      waveSpeed = 7.0
      waveAmp = 0.14
      bounceAmp = 0.07
      bounceFreq = 4.0
    } else if (state.isSpeaking) {
      targetEmissiveColor.copy(new THREE.Color(0x00e5ff))
      waveSpeed = 5.2
      waveAmp = 0.11
      bounceAmp = 0.06
      bounceFreq = 3.6
    } else if (state.isListening) {
      targetEmissiveColor.copy(new THREE.Color(0xffd700))
      waveSpeed = 4.0
      waveAmp = 0.09
      bounceAmp = 0.04
      bounceFreq = 2.2
    } else if (state.isThinking) {
      targetEmissiveColor.copy(new THREE.Color(0x88ccff))
      waveSpeed = 2.8
      waveAmp = 0.06
      bounceAmp = 0.035
      bounceFreq = 1.8
    } else {
      targetEmissiveColor.copy(new THREE.Color(0xffb000))
      waveSpeed = 3.2
      waveAmp = 0.07
      bounceAmp = 0.04
      bounceFreq = 2.0
    }

    bodyMat.emissive.lerp(targetEmissiveColor, 0.08)
    flameLight.intensity = isAlert
      ? 2.2 + Math.sin(time * 12) * 0.6
      : state.isSpeaking
      ? 1.9 + Math.sin(time * 6) * 0.4
      : 1.6

    // 7.3 Chuyển động lơ lửng bồng bềnh (Harmonic Float)
    const floatY = Math.sin(time * bounceFreq) * bounceAmp
    rootGroup.position.y = floatY

    // Nghiêng nhẹ cơ thể theo trạng thái
    if (state.isThinking) {
      rootGroup.rotation.z = Math.sin(time * 1.6) * 0.05
      rootGroup.rotation.x = -0.04
    } else if (state.isListening) {
      rootGroup.rotation.x = 0.06
      rootGroup.rotation.z = 0
    } else {
      rootGroup.rotation.z = Math.sin(time * 1.2) * 0.02
      rootGroup.rotation.x = 0
    }

    // 7.4 Cử động nắm đấm chiến thắng nhịp nhàng
    leftArmGroup.position.y = Math.sin(time * bounceFreq + 0.4) * 0.025
    if (state.isSpeaking) {
      leftArmGroup.rotation.z = Math.sin(time * 4.5) * 0.10
      leftArmGroup.rotation.x = Math.cos(time * 3.5) * 0.08
    } else {
      leftArmGroup.rotation.set(0, 0, 0)
    }

    // 7.5 Mô phỏng sóng vải áo choàng thời gian thực
    const capePositions = capeGeo.attributes.position as THREE.BufferAttribute
    const capePosArr = capePositions.array as Float32Array

    for (let i = 0; i < capePositions.count; i++) {
      const bx = capeBasePositions[i * 3] ?? 0
      const by = capeBasePositions[i * 3 + 1] ?? 0
      const bz = capeBasePositions[i * 3 + 2] ?? 0

      // v: 0 ở cổ áo/vai (0.44), 1 ở gấu áo (-0.95)
      const v = Math.min(1.0, Math.max(0.0, (0.44 - by) / 1.39))
      const u = (bx + 0.19) / 0.55

      // Mép trên (v=0) cố định 100% vào vai; tà dưới (v > 0.08) tung bay tự do bồng bềnh trong gió
      const flutterFactor = Math.min(1.0, Math.max(0, (v - 0.06) / 0.32)) * Math.pow(v, 0.65)

      const wave =
        Math.sin(time * waveSpeed + v * 4.2 - u * 1.8) *
        (waveAmp * 1.4 * flutterFactor)
      const secondaryWave =
        Math.cos(time * waveSpeed * 0.9 + u * 2.8) *
        (waveAmp * 0.45 * flutterFactor)

      capePosArr[i * 3] = bx + Math.cos(time * waveSpeed * 0.6 + v * 2.0) * (waveAmp * 0.12 * flutterFactor)
      capePosArr[i * 3 + 1] = by
      capePosArr[i * 3 + 2] = bz + wave + secondaryWave
    }
    capePositions.needsUpdate = true
    capeGeo.computeVertexNormals()
  }

  const dispose = () => {
    disposables.forEach((d) => d.dispose())
  }

  return {
    group: rootGroup,
    update,
    dispose,
  }
}
