import * as THREE from 'three'
import type { IntentId } from '@/lib/intents/types'
import { createMtronMascot } from './mtron-mascot'

export interface HologramSceneOptions {
  size: number | string
  interactive: boolean
  getState: () => {
    isListening: boolean
    isSpeaking: boolean
    isThinking: boolean
    activeIntent: IntentId | null
  }
}

export function initHologramScene(
  container: HTMLDivElement,
  options: HologramSceneOptions
): () => void {
  const { size, interactive, getState } = options

  const width = container.clientWidth || (typeof size === 'number' ? size : 220)
  const height = container.clientHeight || (typeof size === 'number' ? size : 220)

  // 1. Scene & Camera Setup - Căn chỉnh góc nhìn bao quát, to rõ toàn thân linh vật không bị cắt xén
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(43, width / height, 0.1, 50)
  camera.position.set(0, 0.02, 3.82)

  // 2. WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  container.appendChild(renderer.domElement)

  // 3. Hệ thống Chiếu sáng 4 chiều Sci-Fi (Studio Lighting Rig)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.25)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xfffaee, 2.8)
  keyLight.position.set(2.2, 2.6, 3.2)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x4de0ff, 1.8)
  fillLight.position.set(-2.8, 1.2, 2.2)
  scene.add(fillLight)

  const topLight = new THREE.DirectionalLight(0xffb830, 2.4)
  topLight.position.set(0, 3.4, 0.4)
  scene.add(topLight)

  const rimLight = new THREE.DirectionalLight(0xff4400, 2.2)
  rimLight.position.set(0, 1.0, -3.0)
  scene.add(rimLight)

  // 4. Root & Tilt groups
  const rootGroup = new THREE.Group()
  scene.add(rootGroup)

  const tiltGroup = new THREE.Group()
  rootGroup.add(tiltGroup)

  // 5. Khởi tạo Linh vật M-Tròn Superhero 3D
  const mtron = createMtronMascot()
  tiltGroup.add(mtron.group)

  // 6. Holographic Environment (Bệ chiếu Hologram & Hạt photon cyber)
  const COLOR_CYAN = new THREE.Color(0x00f0ff)
  const COLOR_GOLD = new THREE.Color(0xffd700)

  // 6.1 Bệ phát quang Hologram ở chân (nằm sát ngay dưới đế giày bốt)
  const baseGroup = new THREE.Group()
  baseGroup.position.y = -1.10

  const baseRingOuterGeo = new THREE.RingGeometry(0.70, 0.82, 48)
  const baseRingOuterMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const baseRingOuter = new THREE.Mesh(baseRingOuterGeo, baseRingOuterMat)
  baseRingOuter.rotation.x = Math.PI / 2
  baseGroup.add(baseRingOuter)

  const baseRingInnerGeo = new THREE.RingGeometry(0.40, 0.47, 36)
  const baseRingInnerMat = new THREE.MeshBasicMaterial({
    color: COLOR_GOLD,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const baseRingInner = new THREE.Mesh(baseRingInnerGeo, baseRingInnerMat)
  baseRingInner.rotation.x = Math.PI / 2
  baseGroup.add(baseRingInner)

  const baseDiscGeo = new THREE.CircleGeometry(0.36, 36)
  const baseDiscMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.20,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat)
  baseDisc.rotation.x = Math.PI / 2
  baseGroup.add(baseDisc)

  const beamGeo = new THREE.CylinderGeometry(0.80, 0.36, 0.45, 32, 1, true)
  const beamMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  beam.position.y = 0.225
  baseGroup.add(beam)

  rootGroup.add(baseGroup)

  // 6.2 Vòng sóng quét Hologram dưới chân (quét ở tầng bệ chân, không cắt ngang mặt)
  const scanGeo = new THREE.TorusGeometry(0.85, 0.006, 8, 48)
  const scanMat = new THREE.MeshBasicMaterial({
    color: COLOR_CYAN,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const scanRing = new THREE.Mesh(scanGeo, scanMat)
  scanRing.rotation.x = Math.PI / 2
  scanRing.position.y = -0.90
  baseGroup.add(scanRing)

  // 6.3 Đám mây hạt Photon Cyber lơ lửng quanh M-Tròn
  const particleCount = 70
  const particleGeo = new THREE.BufferGeometry()
  const particlePositions = new Float32Array(particleCount * 3)
  const baseRadii = new Float32Array(particleCount)
  const anglesPhi = new Float32Array(particleCount)
  const anglesTheta = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    const radius = 1.05 + Math.random() * 0.45
    const phi = Math.acos(-1 + (2 * i) / particleCount)
    const theta = Math.sqrt(particleCount * Math.PI) * phi

    baseRadii[i] = radius
    anglesPhi[i] = phi
    anglesTheta[i] = theta

    particlePositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
    particlePositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi) - 0.1
    particlePositions[i * 3 + 2] = radius * Math.cos(phi)
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

  const particleMat = new THREE.PointsMaterial({
    color: COLOR_CYAN,
    size: 0.028,
    transparent: true,
    opacity: 0.70,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const particles = new THREE.Points(particleGeo, particleMat)
  tiltGroup.add(particles)

  // 7. Tương tác Pointer Drag & Gyroscope (360 độ xoay tự do)
  let targetRotX = 0
  let targetRotY = 0
  let isDragging = false
  let prevX = 0
  let prevY = 0
  let dragRotX = 0
  let dragRotY = 0

  const handlePointerDown = (e: PointerEvent) => {
    if (!interactive) return
    isDragging = true
    prevX = e.clientX
    prevY = e.clientY
    try {
      container.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!interactive) return
    if (isDragging) {
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      dragRotY += dx * 0.015
      dragRotX += dy * 0.015
      dragRotX = Math.max(-1.1, Math.min(1.1, dragRotX))
      prevX = e.clientX
      prevY = e.clientY
    } else {
      const rect = container.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotY = nx * 0.40
      targetRotX = -ny * 0.30
    }
  }

  const handlePointerUp = (e: PointerEvent) => {
    isDragging = false
    try {
      container.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerLeave = () => {
    isDragging = false
    targetRotX = 0
    targetRotY = 0
  }

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!interactive || isDragging) return
    if (e.gamma !== null && e.beta !== null) {
      const g = Math.max(-45, Math.min(45, e.gamma))
      const b = Math.max(0, Math.min(90, e.beta)) - 45
      targetRotY = (g / 45) * 0.40
      targetRotX = (b / 45) * 0.30
    }
  }

  container.addEventListener('pointerdown', handlePointerDown)
  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerup', handlePointerUp)
  container.addEventListener('pointercancel', handlePointerUp)
  container.addEventListener('pointerleave', handlePointerLeave)

  if (typeof window !== 'undefined') {
    window.addEventListener('deviceorientation', handleOrientation)
  }

  // 8. Resize Handling
  const handleResize = () => {
    if (!container) return
    const w = container.clientWidth || (typeof size === 'number' ? size : 220)
    const h = container.clientHeight || (typeof size === 'number' ? size : 220)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  const resizeObserver = new ResizeObserver(() => handleResize())
  resizeObserver.observe(container)

  // 9. Vòng lặp Render & Animation
  let animationFrameId: number
  const clock = new THREE.Clock()
  const targetHoloColor = new THREE.Color()

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    if (container.offsetParent === null && container.clientWidth === 0) {
      return
    }

    const t = clock.getElapsedTime()
    const delta = Math.min(clock.getDelta(), 0.1)
    const state = getState()
    const isAlert = state.activeIntent === 'FRAUD_ALERT'

    // 9.1 Cập nhật M-Tròn Mascot
    mtron.update(t, delta, state, { x: targetRotY, y: targetRotX })

    // 9.2 Màu sắc hiệu ứng hologram theo trạng thái
    if (isAlert) {
      targetHoloColor.set(0xff3b30)
    } else if (state.isListening) {
      targetHoloColor.set(0xffd700)
    } else if (state.isSpeaking) {
      targetHoloColor.set(0x00e5ff)
    } else if (state.isThinking) {
      targetHoloColor.set(0xffffff)
    } else {
      targetHoloColor.set(0x00f0ff)
    }

    baseRingOuterMat.color.lerp(targetHoloColor, 0.08)
    scanMat.color.lerp(targetHoloColor, 0.08)
    particleMat.color.lerp(targetHoloColor, 0.08)
    beamMat.color.lerp(targetHoloColor, 0.08)

    // 9.3 Xoay bệ phát quang
    baseRingOuter.rotation.z = t * 0.35
    baseRingInner.rotation.z = -t * 0.55

    // 9.4 Quét sóng hologram dưới chân
    const scanSpeed = isAlert ? 3.0 : state.isThinking ? 2.5 : 1.4
    const scanScale = 0.8 + Math.sin(t * scanSpeed) * 0.2
    scanRing.scale.set(scanScale, scanScale, 1)
    scanMat.opacity = 0.2 + (1 - scanScale) * 0.4

    // 9.5 Chuyển động hạt photon
    const posAttr = particleGeo.attributes.position as THREE.BufferAttribute
    const positions = posAttr.array as Float32Array
    const swirlSpeed = state.isThinking ? 0.6 : 0.25

    for (let i = 0; i < particleCount; i++) {
      const baseR = baseRadii[i] ?? 1.2
      const phi = anglesPhi[i] ?? 0
      const theta = (anglesTheta[i] ?? 0) + t * swirlSpeed

      const curR = baseR + Math.sin(t * 2.0 + i) * 0.04
      positions[i * 3] = curR * Math.cos(theta) * Math.sin(phi)
      positions[i * 3 + 1] = curR * Math.sin(theta) * Math.sin(phi) - 0.1
      positions[i * 3 + 2] = curR * Math.cos(phi)
    }
    posAttr.needsUpdate = true

    // 9.6 Làm mượt chuyển động xoay kéo chuột / di chuyển chuột
    if (isDragging) {
      tiltGroup.rotation.y += (dragRotY - tiltGroup.rotation.y) * 0.25
      tiltGroup.rotation.x += (dragRotX - tiltGroup.rotation.x) * 0.25
    } else {
      dragRotY += (targetRotY - dragRotY) * 0.06
      dragRotX += (targetRotX - dragRotX) * 0.06
      tiltGroup.rotation.y += (dragRotY - tiltGroup.rotation.y) * 0.06
      tiltGroup.rotation.x += (dragRotX - tiltGroup.rotation.x) * 0.06
    }

    renderer.render(scene, camera)
  }

  animate()

  // 10. Dọn dẹp tài nguyên khi unmount
  return () => {
    cancelAnimationFrame(animationFrameId)
    resizeObserver.disconnect()
    container.removeEventListener('pointerdown', handlePointerDown)
    container.removeEventListener('pointermove', handlePointerMove)
    container.removeEventListener('pointerup', handlePointerUp)
    container.removeEventListener('pointercancel', handlePointerUp)
    container.removeEventListener('pointerleave', handlePointerLeave)

    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', handleOrientation)
    }

    mtron.dispose()

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })

    renderer.dispose()
    if (renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }
}
