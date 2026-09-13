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
 * Sinh Texture vi mạch điện tử MSB và nụ cười cute cho thân hình cầu M-Tròn
 */
function createBodyTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // 1. Nền cam bóng MSB chuyển sắc (radial/linear gradient)
    const grad = ctx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#ff7010')
    grad.addColorStop(0.5, '#f4600c')
    grad.addColorStop(1, '#d84800')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1024, 512)

    // 2. Vi mạch điện tử màu vàng kim phát sáng ở hai bên hông và lưng
    ctx.strokeStyle = 'rgba(255, 215, 80, 0.75)'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const drawCircuitBranch = (
      startX: number,
      startY: number,
      dx: number,
      dy: number,
      steps: number[]
    ) => {
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      let curX = startX
      let curY = startY
      for (let i = 0; i < steps.length; i += 2) {
        curX += (steps[i] ?? 0) * dx
        curY += (steps[i + 1] ?? 0) * dy
        ctx.lineTo(curX, curY)
      }
      ctx.stroke()

      // Nút tròn kết thúc vi mạch
      ctx.fillStyle = '#fff4cc'
      ctx.beginPath()
      ctx.arc(curX, curY, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#f4a000'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Các nhánh vi mạch phía hông trái (UV x: 100 - 350)
    drawCircuitBranch(120, 320, 1, 1, [60, 0, 40, 40, 80, 0, 30, -30])
    drawCircuitBranch(80, 260, 1, 1, [70, 0, 50, -50, 60, 0])
    drawCircuitBranch(160, 400, 1, 1, [50, 0, 40, -40, 90, 0])

    // Các nhánh vi mạch phía hông phải (UV x: 650 - 920)
    drawCircuitBranch(900, 320, -1, 1, [60, 0, 40, 40, 80, 0, 30, -30])
    drawCircuitBranch(940, 260, -1, 1, [70, 0, 50, -50, 60, 0])
    drawCircuitBranch(860, 400, -1, 1, [50, 0, 40, -40, 90, 0])

    // Các chip vi xử lý mini dạng hình chữ nhật công nghệ cao
    const drawChip = (cx: number, cy: number, w: number, h: number) => {
      ctx.fillStyle = 'rgba(216, 72, 0, 0.85)'
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h)
      ctx.strokeStyle = 'rgba(255, 230, 120, 0.9)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h)

      // Chân chip kim loại
      ctx.fillStyle = '#ffe080'
      for (let ox = -w / 2 + 4; ox <= w / 2 - 4; ox += 8) {
        ctx.fillRect(cx + ox - 1.5, cy - h / 2 - 3, 3, 3)
        ctx.fillRect(cx + ox - 1.5, cy + h / 2, 3, 3)
      }
    }

    drawChip(210, 360, 28, 20)
    drawChip(810, 360, 28, 20)

    // 3. Miệng cười dễ thương (Cute smile `:3`)
    ctx.strokeStyle = '#2b1204'
    ctx.lineWidth = 7
    ctx.lineCap = 'round'

    const mouthY = 320
    const mouthCenterX = 512

    // Múi trái
    ctx.beginPath()
    ctx.arc(mouthCenterX - 22, mouthY, 20, 0.1 * Math.PI, 0.95 * Math.PI, false)
    ctx.stroke()

    // Múi phải
    ctx.beginPath()
    ctx.arc(mouthCenterX + 22, mouthY, 20, 0.05 * Math.PI, 0.9 * Math.PI, false)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Quản lý HUD Canvas động trên kính Visor (Mắt to tròn chibi kawaii + HUD dữ liệu cyber)
 */
class VisorHudRenderer {
  public canvas: HTMLCanvasElement | null = null
  public ctx: CanvasRenderingContext2D | null = null
  public texture: THREE.Texture
  private blinkVal = 1.0 // 1.0 = mở to, 0.0 = nhắm tịt
  private blinkTimer = 0

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.canvas.width = 512
      this.canvas.height = 256
      this.ctx = this.canvas.getContext('2d')
      const canvasTex = new THREE.CanvasTexture(this.canvas)
      canvasTex.colorSpace = THREE.SRGBColorSpace
      this.texture = canvasTex
    } else {
      this.texture = new THREE.Texture()
    }
  }

  public update(
    time: number,
    delta: number,
    state: MascotState,
    pointer: { x: number; y: number }
  ) {
    const { ctx, canvas } = this
    if (!ctx || !canvas) return

    // 1. Quản lý nhịp chớp mắt tự nhiên (Blink logic)
    this.blinkTimer += delta
    if (this.blinkTimer > 3.6) {
      const cycle = this.blinkTimer - 3.6
      if (cycle < 0.14) {
        this.blinkVal = Math.max(0.08, 1 - cycle / 0.07)
      } else if (cycle < 0.28) {
        this.blinkVal = Math.min(1.0, (cycle - 0.14) / 0.14)
      } else {
        this.blinkVal = 1.0
        this.blinkTimer = Math.random() * 0.8
      }
    } else {
      this.blinkVal = 1.0
    }

    // 2. Xóa nền với hiệu ứng kính mờ xanh cyber
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const isAlert = state.activeIntent === 'FRAUD_ALERT'
    const hudColor = isAlert
      ? '#ff4d4f'
      : state.isListening
      ? '#ffd060'
      : state.isSpeaking
      ? '#4de0ff'
      : state.isThinking
      ? '#ffffff'
      : '#3fd0ff'

    // 3. Tính toán vị trí đồng tử liếc theo con trỏ
    const lookOffsetX = Math.max(-18, Math.min(18, pointer.x * 24))
    const lookOffsetY = Math.max(-12, Math.min(12, -pointer.y * 18))

    // Trọng tâm 2 mắt
    const eyeLeftX = 175
    const eyeRightX = 337
    const eyeY = 128
    const eyeRadius = 46

    const drawEye = (cx: number, cy: number, isLeft: boolean) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(1.0, this.blinkVal)

      if (this.blinkVal <= 0.15) {
        // Vẽ mắt cười hình vòng cung kawaii khi chớp mắt hoặc nói vui
        ctx.strokeStyle = hudColor
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(0, 0, eyeRadius * 0.7, 1.1 * Math.PI, 1.9 * Math.PI, false)
        ctx.stroke()
        ctx.restore()
        return
      }

      // Vòng tròn hào quang mắt ngoài
      ctx.fillStyle = isAlert ? 'rgba(255, 60, 60, 0.2)' : 'rgba(20, 50, 90, 0.5)'
      ctx.beginPath()
      ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2)
      ctx.fill()

      // Tròng đen mắt chibi
      const pupilGrad = ctx.createRadialGradient(
        lookOffsetX * 0.4,
        lookOffsetY * 0.4,
        4,
        0,
        0,
        eyeRadius * 0.88
      )
      pupilGrad.addColorStop(0, '#0a1a33')
      pupilGrad.addColorStop(0.7, '#050c18')
      pupilGrad.addColorStop(1, hudColor)

      ctx.fillStyle = pupilGrad
      ctx.beginPath()
      ctx.arc(0, 0, eyeRadius * 0.88, 0, Math.PI * 2)
      ctx.fill()

      // Đốm sáng phản chiếu lớn (Specular highlight góc trên-trái)
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(lookOffsetX * 0.5 - 12, lookOffsetY * 0.5 - 12, 12, 0, Math.PI * 2)
      ctx.fill()

      // Đốm sáng phản chiếu nhỏ (Specular highlight phụ góc dưới-phải)
      ctx.beginPath()
      ctx.arc(lookOffsetX * 0.5 + 11, lookOffsetY * 0.5 + 10, 6, 0, Math.PI * 2)
      ctx.fill()

      // Lớp viền tròng mắt
      ctx.strokeStyle = hudColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(0, 0, eyeRadius * 0.88, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()

      // 4. Lớp giao diện HUD vi tính (Cyber Targeting Brackets & Reticle)
      ctx.save()
      ctx.strokeStyle = hudColor
      ctx.lineWidth = 1.8
      const bracketSize = eyeRadius + 14
      const corner = 10

      // Góc trên trái
      ctx.beginPath()
      ctx.moveTo(cx - bracketSize, cy - bracketSize + corner)
      ctx.lineTo(cx - bracketSize, cy - bracketSize)
      ctx.lineTo(cx - bracketSize + corner, cy - bracketSize)
      ctx.stroke()

      // Góc trên phải
      ctx.beginPath()
      ctx.moveTo(cx + bracketSize - corner, cy - bracketSize)
      ctx.lineTo(cx + bracketSize, cy - bracketSize)
      ctx.lineTo(cx + bracketSize, cy - bracketSize + corner)
      ctx.stroke()

      // Góc dưới trái
      ctx.beginPath()
      ctx.moveTo(cx - bracketSize, cy + bracketSize - corner)
      ctx.lineTo(cx - bracketSize, cy + bracketSize)
      ctx.lineTo(cx - bracketSize + corner, cy + bracketSize)
      ctx.stroke()

      // Góc dưới phải
      ctx.beginPath()
      ctx.moveTo(cx + bracketSize - corner, cy + bracketSize)
      ctx.lineTo(cx + bracketSize, cy + bracketSize)
      ctx.lineTo(cx + bracketSize, cy + bracketSize - corner)
      ctx.stroke()

      ctx.restore()
    }

    drawEye(eyeLeftX, eyeY, true)
    drawEye(eyeRightX, eyeY, false)

    // 5. HUD Animation theo trạng thái
    ctx.save()
    ctx.strokeStyle = hudColor
    ctx.fillStyle = hudColor

    if (state.isThinking) {
      // Vòng tròn radar quay quét dữ liệu khi THINKING
      const scanAngle = time * 3.5
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(256, 128, 26, scanAngle, scanAngle + Math.PI * 0.6)
      ctx.stroke()

      // Vạch quét laser ngang
      const scanY = 60 + ((time * 120) % 136)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(110, scanY)
      ctx.lineTo(402, scanY)
      ctx.stroke()
    } else if (state.isSpeaking) {
      // Sóng âm thanh equalizer nhấp nhô ở giữa 2 mắt
      const barCount = 7
      const barW = 4
      const spacing = 7
      const startX = 256 - ((barCount - 1) * spacing) / 2
      for (let i = 0; i < barCount; i++) {
        const h = 8 + Math.sin(time * 12 + i * 1.3) * 14 + Math.cos(time * 7 + i) * 6
        ctx.fillRect(startX + i * spacing - barW / 2, 128 - h / 2, barW, Math.max(4, h))
      }
    } else if (state.isListening) {
      // Vòng tròn radar mở rộng khi đang nghe
      const radarR = 14 + ((time * 30) % 24)
      const alpha = 1 - (radarR - 14) / 24
      ctx.strokeStyle = `rgba(255, 208, 96, ${alpha})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(256, 128, radarR, 0, Math.PI * 2)
      ctx.stroke()
    } else if (isAlert) {
      // Biểu tượng cảnh báo [!] nhấp nháy
      if (Math.sin(time * 8) > 0) {
        ctx.font = 'bold 22px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('! CAUTION !', 256, 42)
      }
    }

    // Đường lưới HUD vi tính thanh mảnh ở 2 rìa
    ctx.strokeStyle = isAlert ? 'rgba(255, 80, 80, 0.25)' : 'rgba(63, 208, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(50, 128)
    ctx.lineTo(95, 128)
    ctx.moveTo(417, 128)
    ctx.lineTo(462, 128)
    ctx.stroke()

    ctx.restore()
    this.texture.needsUpdate = true
  }

  public dispose() {
    this.texture.dispose()
  }
}

/**
 * Khởi tạo mô hình 3D linh vật M-Tròn đầy đủ bộ phận
 */
export function createMtronMascot(): MtronMascot {
  const rootGroup = new THREE.Group()

  // Danh sách các tài nguyên để giải phóng sau
  const disposables: { dispose: () => void }[] = []

  // Bảng màu vật liệu
  const COLOR_ORANGE = new THREE.Color(0xf4600c)
  const COLOR_SILVER = new THREE.Color(0xdce5ef)
  const COLOR_DARK_METAL = new THREE.Color(0x3a4856)
  const COLOR_RED_CAPE = new THREE.Color(0xd41824)
  const COLOR_GOLD = new THREE.Color(0xffd060)
  const COLOR_CYAN = new THREE.Color(0x3fd0ff)
  const COLOR_WHITE = new THREE.Color(0xffffff)

  // ─────────────────────────────────────────────────────────────
  // 1. THÂN CẦU M-TRÒN (Sphere Body + Circuit Texture)
  // ─────────────────────────────────────────────────────────────
  const bodyRadius = 0.82
  const bodyGeo = new THREE.SphereGeometry(bodyRadius, 48, 48)
  disposables.push(bodyGeo)

  const bodyTexture = createBodyTexture()
  if (bodyTexture) disposables.push(bodyTexture)

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: COLOR_ORANGE,
    map: bodyTexture,
    roughness: 0.22,
    metalness: 0.12,
    clearcoat: 0.95,
    clearcoatRoughness: 0.15,
    emissive: new THREE.Color(0x301000),
    emissiveIntensity: 0.4,
  })
  disposables.push(bodyMat)

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  rootGroup.add(bodyMesh)

  // ─────────────────────────────────────────────────────────────
  // 2. KÍNH VISOR CÔNG NGHỆ CAO (Cyber HUD Visor & Kawaii Eyes)
  // ─────────────────────────────────────────────────────────────
  const visorGroup = new THREE.Group()
  visorGroup.position.set(0, 0.08, 0)
  rootGroup.add(visorGroup)

  // 2.1 Màn hình HUD cong bên trong
  const hudRenderer = new VisorHudRenderer()
  disposables.push(hudRenderer)

  // Mặt trụ cong bao trọn vùng mắt phía trước
  const hudScreenGeo = new THREE.CylinderGeometry(
    bodyRadius + 0.02,
    bodyRadius + 0.02,
    0.48,
    40,
    1,
    true,
    -Math.PI * 0.42,
    Math.PI * 0.84
  )
  disposables.push(hudScreenGeo)

  const hudScreenMat = new THREE.MeshBasicMaterial({
    map: hudRenderer.texture,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  disposables.push(hudScreenMat)

  const hudScreenMesh = new THREE.Mesh(hudScreenGeo, hudScreenMat)
  // Xoay cylinder cho mặt cong quay ra phía trước Z+
  hudScreenMesh.rotation.y = Math.PI
  visorGroup.add(hudScreenMesh)

  // 2.2 Vỏ kính ngoài Visor (Cyan tinted glass)
  const visorGlassGeo = new THREE.CylinderGeometry(
    bodyRadius + 0.038,
    bodyRadius + 0.038,
    0.50,
    40,
    1,
    true,
    -Math.PI * 0.44,
    Math.PI * 0.88
  )
  disposables.push(visorGlassGeo)

  const visorGlassMat = new THREE.MeshPhysicalMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.42,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.55,
    ior: 1.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  disposables.push(visorGlassMat)

  const visorGlassMesh = new THREE.Mesh(visorGlassGeo, visorGlassMat)
  visorGlassMesh.rotation.y = Math.PI
  visorGroup.add(visorGlassMesh)

  // 2.3 Khung viền kim loại bạc bao quanh Visor (Top bar & Bottom bar)
  const visorSilverMat = new THREE.MeshStandardMaterial({
    color: COLOR_SILVER,
    metalness: 0.94,
    roughness: 0.18,
  })
  disposables.push(visorSilverMat)

  // Thanh viền trên
  const topRimGeo = new THREE.TorusGeometry(bodyRadius + 0.045, 0.032, 16, 48, Math.PI * 0.88)
  disposables.push(topRimGeo)
  const topRimMesh = new THREE.Mesh(topRimGeo, visorSilverMat)
  topRimMesh.rotation.x = Math.PI / 2
  topRimMesh.rotation.z = -Math.PI * 0.44
  topRimMesh.position.y = 0.25
  visorGroup.add(topRimMesh)

  // Thanh viền dưới
  const botRimGeo = new THREE.TorusGeometry(bodyRadius + 0.045, 0.032, 16, 48, Math.PI * 0.88)
  disposables.push(botRimGeo)
  const botRimMesh = new THREE.Mesh(botRimGeo, visorSilverMat)
  botRimMesh.rotation.x = Math.PI / 2
  botRimMesh.rotation.z = -Math.PI * 0.44
  botRimMesh.position.y = -0.25
  visorGroup.add(botRimMesh)

  // 2.4 Khớp tai robot 2 bên thái dương (Ear hinge bolts)
  const earGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 24)
  disposables.push(earGeo)

  const earGlowGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16)
  disposables.push(earGlowGeo)

  const earGlowMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.85,
  })
  disposables.push(earGlowMat)

  // Tai trái
  const leftEar = new THREE.Group()
  leftEar.position.set(-0.84, 0, 0.08)
  leftEar.rotation.z = Math.PI / 2
  leftEar.add(new THREE.Mesh(earGeo, visorSilverMat))
  leftEar.add(new THREE.Mesh(earGlowGeo, earGlowMat))
  visorGroup.add(leftEar)

  // Tai phải
  const rightEar = new THREE.Group()
  rightEar.position.set(0.84, 0, 0.08)
  rightEar.rotation.z = Math.PI / 2
  rightEar.add(new THREE.Mesh(earGeo, visorSilverMat))
  rightEar.add(new THREE.Mesh(earGlowGeo, earGlowMat))
  visorGroup.add(rightEar)

  // ─────────────────────────────────────────────────────────────
  // 3. LOGO MSB PHÁT SÁNG TRÊN TRÁN (Forehead Glowing MSB Emblem)
  // ─────────────────────────────────────────────────────────────
  const emblemGroup = new THREE.Group()
  // Đặt trên trán, nghiêng theo độ cong mặt cầu
  emblemGroup.position.set(0, 0.60, 0.62)
  emblemGroup.rotation.x = -0.42
  rootGroup.add(emblemGroup)

  const emblemMat = new THREE.MeshBasicMaterial({
    color: COLOR_WHITE,
    transparent: true,
    opacity: 0.98,
  })
  disposables.push(emblemMat)

  // 3.1 Dấu chấm tròn bên trái của logo MSB
  const emblemDotGeo = new THREE.SphereGeometry(0.055, 16, 16)
  disposables.push(emblemDotGeo)
  const emblemDotMesh = new THREE.Mesh(emblemDotGeo, emblemMat)
  emblemDotMesh.position.set(-0.16, 0, 0)
  emblemGroup.add(emblemDotMesh)

  // 3.2 Cánh hoa / Chữ M cách điệu dạng capsule tròn nghiêng
  const petalLeftGeo = new THREE.CapsuleGeometry(0.048, 0.16, 12, 12)
  disposables.push(petalLeftGeo)
  const petalLeftMesh = new THREE.Mesh(petalLeftGeo, emblemMat)
  petalLeftMesh.position.set(-0.03, 0.01, 0)
  petalLeftMesh.rotation.z = -0.38
  emblemGroup.add(petalLeftMesh)

  const petalRightGeo = new THREE.CapsuleGeometry(0.048, 0.16, 12, 12)
  disposables.push(petalRightGeo)
  const petalRightMesh = new THREE.Mesh(petalRightGeo, emblemMat)
  petalRightMesh.position.set(0.11, 0.03, 0)
  petalRightMesh.rotation.z = -0.38
  emblemGroup.add(petalRightMesh)

  // Hào quang mềm sau logo MSB
  const haloGeo = new THREE.PlaneGeometry(0.5, 0.35)
  disposables.push(haloGeo)
  const haloMat = new THREE.MeshBasicMaterial({
    color: COLOR_GOLD,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  disposables.push(haloMat)
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  haloMesh.position.z = -0.01
  emblemGroup.add(haloMesh)

  // Đèn cục bộ từ logo chiếu ra mặt cầu
  const emblemLight = new THREE.PointLight(0xfff4d0, 1.2, 1.5)
  emblemLight.position.set(0, 0.65, 0.75)
  rootGroup.add(emblemLight)

  // ─────────────────────────────────────────────────────────────
  // 4. ÁO CHOÀNG ĐỎ SIÊU NHÂN (Superhero Red Cape với mô phỏng sóng vải)
  // ─────────────────────────────────────────────────────────────
  const capeGroup = new THREE.Group()
  capeGroup.position.set(0, 0.32, -0.62)
  rootGroup.add(capeGroup)

  // 4.1 Khuy cài kim loại áo choàng trên vai
  const claspGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16)
  disposables.push(claspGeo)
  const claspMat = new THREE.MeshStandardMaterial({
    color: COLOR_GOLD,
    metalness: 0.9,
    roughness: 0.2,
  })
  disposables.push(claspMat)

  const leftClasp = new THREE.Mesh(claspGeo, claspMat)
  leftClasp.position.set(-0.35, 0.02, 0.12)
  leftClasp.rotation.x = Math.PI / 4
  capeGroup.add(leftClasp)

  const rightClasp = new THREE.Mesh(claspGeo, claspMat)
  rightClasp.position.set(0.35, 0.02, 0.12)
  rightClasp.rotation.x = Math.PI / 4
  capeGroup.add(rightClasp)

  // 4.2 Lưới đa giác áo choàng
  const capeWidth = 2.0
  const capeHeight = 1.7
  const capeSegmentsX = 26
  const capeSegmentsY = 26
  const capeGeo = new THREE.PlaneGeometry(
    capeWidth,
    capeHeight,
    capeSegmentsX,
    capeSegmentsY
  )
  disposables.push(capeGeo)

  // Lưu tọa độ cơ sở ban đầu để tính dao động sóng
  const capePosAttr = capeGeo.attributes.position as THREE.BufferAttribute
  const capeBasePositions = new Float32Array(capePosAttr.array.length)
  capeBasePositions.set(capePosAttr.array)

  // Biến dạng dáng áo choàng ban đầu: thu hẹp ở cổ áo, xòe rộng ở vạt dưới, cong rủ ra sau lưng
  for (let i = 0; i < capePosAttr.count; i++) {
    const x = capePosAttr.getX(i)
    const y = capePosAttr.getY(i)
    // v từ 0 (đỉnh cổ) đến 1 (chân áo)
    const v = (capeHeight / 2 - y) / capeHeight
    const u = x / (capeWidth / 2)

    // Xòe rộng dần về đuôi
    const spreadX = x * (0.42 + 0.85 * v)
    // Rủ ra sau theo hình cong tự nhiên
    const drapeZ = -0.12 - v * 0.55 - Math.sin(v * Math.PI * 0.6) * 0.2
    // Nếp gấp sóng vải theo chiều dọc
    const foldZ = Math.sin(u * Math.PI * 3.5) * (0.05 + 0.12 * v)

    capePosAttr.setXYZ(i, spreadX, y - 0.25, drapeZ + foldZ)
    capeBasePositions[i * 3] = spreadX
    capeBasePositions[i * 3 + 1] = y - 0.25
    capeBasePositions[i * 3 + 2] = drapeZ + foldZ
  }
  capeGeo.computeVertexNormals()

  const capeMat = new THREE.MeshPhysicalMaterial({
    color: COLOR_RED_CAPE,
    roughness: 0.38,
    metalness: 0.06,
    clearcoat: 0.45,
    clearcoatRoughness: 0.22,
    side: THREE.DoubleSide,
  })
  disposables.push(capeMat)

  const capeMesh = new THREE.Mesh(capeGeo, capeMat)
  capeGroup.add(capeMesh)

  // ─────────────────────────────────────────────────────────────
  // 5. ĐÔI GĂNG TAY ROBOT KIM LOẠI BẠC (Cyber Hands / Gauntlets)
  // ─────────────────────────────────────────────────────────────
  const handSilverMat = new THREE.MeshStandardMaterial({
    color: COLOR_SILVER,
    metalness: 0.92,
    roughness: 0.18,
  })
  disposables.push(handSilverMat)

  const handDarkMat = new THREE.MeshStandardMaterial({
    color: COLOR_DARK_METAL,
    metalness: 0.85,
    roughness: 0.3,
  })
  disposables.push(handDarkMat)

  const handAccentMat = new THREE.MeshBasicMaterial({
    color: COLOR_ORANGE,
  })
  disposables.push(handAccentMat)

  // Hàm tạo bàn tay robot hoàn chỉnh
  const createHand = (isLeft: boolean) => {
    const hand = new THREE.Group()

    // 5.1 Cổ tay kim loại tròn
    const wristGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.14, 16)
    disposables.push(wristGeo)
    const wrist = new THREE.Mesh(wristGeo, handSilverMat)
    wrist.rotation.x = Math.PI / 2
    hand.add(wrist)

    // Vòng phát sáng cam ở cổ tay
    const cuffBandGeo = new THREE.CylinderGeometry(0.124, 0.104, 0.03, 16)
    disposables.push(cuffBandGeo)
    const cuffBand = new THREE.Mesh(cuffBandGeo, handAccentMat)
    cuffBand.rotation.x = Math.PI / 2
    hand.add(cuffBand)

    // 5.2 Lòng bàn tay robot bo tròn
    const palmGeo = new THREE.SphereGeometry(0.13, 16, 16)
    disposables.push(palmGeo)
    const palm = new THREE.Mesh(palmGeo, handSilverMat)
    palm.scale.set(1.0, 0.75, 0.9)
    palm.position.set(0, 0, 0.12)
    hand.add(palm)

    // 5.3 Ngón tay robot
    if (isLeft) {
      // Tay trái tạo dáng giơ ngón trỏ công nghệ chỉ lên (Pose chỉ số 1 / M-Tròn Tips)
      const indexFingerGeo = new THREE.CapsuleGeometry(0.034, 0.14, 8, 8)
      disposables.push(indexFingerGeo)
      const indexFinger = new THREE.Mesh(indexFingerGeo, handSilverMat)
      indexFinger.position.set(-0.02, 0.15, 0.16)
      indexFinger.rotation.x = -0.2
      indexFinger.rotation.z = -0.1
      hand.add(indexFinger)

      // Các ngón còn lại cuộn tròn thành nắm
      const curledFingersGeo = new THREE.CapsuleGeometry(0.065, 0.12, 8, 8)
      disposables.push(curledFingersGeo)
      const curledFingers = new THREE.Mesh(curledFingersGeo, handDarkMat)
      curledFingers.position.set(0.04, 0.02, 0.17)
      hand.add(curledFingers)
    } else {
      // Tay phải tạo dáng nắm đấm siêu nhân dũng mãnh
      const fistGeo = new THREE.BoxGeometry(0.14, 0.11, 0.13)
      disposables.push(fistGeo)
      const fist = new THREE.Mesh(fistGeo, handSilverMat)
      fist.position.set(0, 0, 0.14)
      hand.add(fist)

      // Khớp ngón mạ bạc
      const knucklesGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.14, 12)
      disposables.push(knucklesGeo)
      const knuckles = new THREE.Mesh(knucklesGeo, handDarkMat)
      knuckles.rotation.z = Math.PI / 2
      knuckles.position.set(0, 0.04, 0.20)
      hand.add(knuckles)
    }

    return hand
  }

  const leftHandGroup = new THREE.Group()
  leftHandGroup.position.set(-0.95, -0.05, 0.22)
  leftHandGroup.rotation.set(0.2, 0.3, -0.2)
  const leftHandMesh = createHand(true)
  leftHandGroup.add(leftHandMesh)
  rootGroup.add(leftHandGroup)

  const rightHandGroup = new THREE.Group()
  rightHandGroup.position.set(0.95, -0.15, 0.18)
  rightHandGroup.rotation.set(-0.1, -0.2, 0.25)
  const rightHandMesh = createHand(false)
  rightHandGroup.add(rightHandMesh)
  rootGroup.add(rightHandGroup)

  // ─────────────────────────────────────────────────────────────
  // 6. ĐÔI CHÂN / GIÀY ROBOT KIM LOẠI BẠC (Cyber Boots / Feet)
  // ─────────────────────────────────────────────────────────────
  const bootSilverMat = new THREE.MeshStandardMaterial({
    color: COLOR_SILVER,
    metalness: 0.92,
    roughness: 0.22,
  })
  disposables.push(bootSilverMat)

  const thrusterMat = new THREE.MeshBasicMaterial({
    color: COLOR_ORANGE,
  })
  disposables.push(thrusterMat)

  const createBoot = (isLeft: boolean) => {
    const boot = new THREE.Group()

    // 6.1 Khớp cổ chân hình cầu
    const ankleGeo = new THREE.SphereGeometry(0.08, 16, 16)
    disposables.push(ankleGeo)
    const ankle = new THREE.Mesh(ankleGeo, handDarkMat)
    ankle.position.y = 0.1
    boot.add(ankle)

    // 6.2 Thân giày mạ bạc khí động học
    const bootBodyGeo = new THREE.CapsuleGeometry(0.11, 0.18, 12, 12)
    disposables.push(bootBodyGeo)
    const bootBody = new THREE.Mesh(bootBodyGeo, bootSilverMat)
    bootBody.rotation.x = Math.PI / 2 - 0.2
    bootBody.position.set(0, -0.02, 0.05)
    boot.add(bootBody)

    // 6.3 Mũi giày bọc thép
    const toeGeo = new THREE.SphereGeometry(0.10, 14, 14)
    disposables.push(toeGeo)
    const toe = new THREE.Mesh(toeGeo, bootSilverMat)
    toe.position.set(0, -0.04, 0.16)
    boot.add(toe)

    // 6.4 Đế giày phản lực phát quang cam MSB
    const soleGeo = new THREE.BoxGeometry(0.18, 0.035, 0.28)
    disposables.push(soleGeo)
    const sole = new THREE.Mesh(soleGeo, handDarkMat)
    sole.position.set(0, -0.12, 0.06)
    boot.add(sole)

    // Dải đèn năng lượng phản lực đáy giày
    const thrusterGeo = new THREE.BoxGeometry(0.14, 0.015, 0.22)
    disposables.push(thrusterGeo)
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat)
    thruster.position.set(0, -0.138, 0.06)
    boot.add(thruster)

    return boot
  }

  const leftFootGroup = new THREE.Group()
  leftFootGroup.position.set(-0.35, -0.82, 0.15)
  leftFootGroup.rotation.set(0.15, 0.1, -0.12)
  const leftFootMesh = createBoot(true)
  leftFootGroup.add(leftFootMesh)
  rootGroup.add(leftFootGroup)

  const rightFootGroup = new THREE.Group()
  rightFootGroup.position.set(0.35, -0.82, 0.15)
  rightFootGroup.rotation.set(0.15, -0.1, 0.12)
  const rightFootMesh = createBoot(false)
  rightFootGroup.add(rightFootMesh)
  rootGroup.add(rightFootGroup)

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

    // 7.1 Cập nhật HUD & Mắt
    hudRenderer.update(time, delta, state, pointer)

    // 7.2 Đổi màu & cường độ phát quang theo trạng thái
    let waveSpeed = 3.6
    let waveAmp = 0.08
    let bounceAmp = 0.06
    let bounceFreq = 2.0

    if (isAlert) {
      targetEmissiveColor.copy(new THREE.Color(0x881100))
      waveSpeed = 7.0
      waveAmp = 0.15
      bounceAmp = 0.10
      bounceFreq = 4.0
    } else if (state.isSpeaking) {
      targetEmissiveColor.copy(new THREE.Color(0x103050))
      waveSpeed = 5.2
      waveAmp = 0.12
      bounceAmp = 0.09
      bounceFreq = 3.5
    } else if (state.isListening) {
      targetEmissiveColor.copy(new THREE.Color(0x402500))
      waveSpeed = 4.0
      waveAmp = 0.09
      bounceAmp = 0.05
      bounceFreq = 2.2
    } else if (state.isThinking) {
      targetEmissiveColor.copy(new THREE.Color(0x202020))
      waveSpeed = 2.8
      waveAmp = 0.06
      bounceAmp = 0.04
      bounceFreq = 1.6
    } else {
      targetEmissiveColor.copy(new THREE.Color(0x250c00))
      waveSpeed = 3.2
      waveAmp = 0.07
      bounceAmp = 0.05
      bounceFreq = 1.8
    }

    bodyMat.emissive.lerp(targetEmissiveColor, 0.08)
    emblemLight.intensity = isAlert
      ? 1.8 + Math.sin(time * 10) * 0.5
      : state.isSpeaking
      ? 1.5 + Math.sin(time * 6) * 0.3
      : 1.2

    // 7.3 Chuyển động lơ lửng nhịp nhàng (Harmonic float/sway)
    const floatY = Math.sin(time * bounceFreq) * bounceAmp
    rootGroup.position.y = floatY

    // Độ nghiêng khi suy nghĩ hoặc chú ý
    if (state.isThinking) {
      rootGroup.rotation.z = Math.sin(time * 1.5) * 0.06
      rootGroup.rotation.x = -0.06
    } else if (state.isListening) {
      rootGroup.rotation.x = 0.08 // Hướng người về phía trước
      rootGroup.rotation.z = 0
    } else {
      rootGroup.rotation.z = Math.sin(time * 1.2) * 0.02
      rootGroup.rotation.x = 0
    }

    // Rung cảnh báo khi alert
    if (isAlert) {
      rootGroup.position.x = (Math.random() - 0.5) * 0.02
    } else {
      rootGroup.position.x = 0
    }

    // 7.4 Cử động tay robot sống động
    leftHandGroup.position.y = -0.05 + Math.sin(time * 2.2 + 0.5) * 0.035
    rightHandGroup.position.y = -0.15 + Math.sin(time * 2.2 + 2.0) * 0.035

    if (state.isSpeaking) {
      // Tay trái nhấc cao diễn thuyết theo nhịp nói
      leftHandGroup.rotation.z = -0.2 + Math.sin(time * 5.0) * 0.15
      leftHandGroup.rotation.x = 0.2 + Math.cos(time * 4.0) * 0.12
    } else if (state.isThinking) {
      // Tay chạm gần cằm/thái dương
      leftHandGroup.position.x = -0.80
      leftHandGroup.position.y = 0.08
    } else {
      leftHandGroup.position.x = -0.95
      leftHandGroup.rotation.z = -0.2
      leftHandGroup.rotation.x = 0.2
    }

    // 7.5 Cử động chân robot (đung đưa nhịp lơ lửng)
    leftFootGroup.rotation.x = 0.15 + Math.sin(time * bounceFreq + 0.3) * 0.08
    rightFootGroup.rotation.x = 0.15 + Math.sin(time * bounceFreq + 1.2) * 0.08

    // 7.6 Mô phỏng sóng vải áo choàng thời gian thực (Cloth wave update)
    const capePositions = capeGeo.attributes.position as THREE.BufferAttribute
    const capePosArr = capePositions.array as Float32Array

    for (let i = 0; i < capePositions.count; i++) {
      const bx = capeBasePositions[i * 3] ?? 0
      const by = capeBasePositions[i * 3 + 1] ?? 0
      const bz = capeBasePositions[i * 3 + 2] ?? 0

      // Trọng số sóng: chân áo vung mạnh hơn gần cổ
      const v = (capeHeight / 2 - by) / capeHeight
      const u = bx / (capeWidth / 2)

      const wave =
        Math.sin(time * waveSpeed + v * 4.2 - u * 1.8) *
        waveAmp *
        (0.25 + 0.85 * v)
      const secondaryWave =
        Math.cos(time * waveSpeed * 0.8 + u * 3.5) *
        (waveAmp * 0.45 * v)

      capePosArr[i * 3] = bx + Math.cos(time * waveSpeed * 0.6 + v * 2.0) * (waveAmp * 0.25 * v)
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
