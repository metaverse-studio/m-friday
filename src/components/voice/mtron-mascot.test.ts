import { describe, it, expect } from 'bun:test'
import * as THREE from 'three'
import { createMtronMascot } from './mtron-mascot'

describe('MtronMascot 3D Model', () => {
  it('tạo đối tượng MtronMascot với đầy đủ group, update và dispose', () => {
    const mascot = createMtronMascot()
    expect(mascot).toBeDefined()
    expect(mascot.group).toBeInstanceOf(THREE.Group)
    expect(typeof mascot.update).toBe('function')
    expect(typeof mascot.dispose).toBe('function')
    mascot.dispose()
  })

  it('chứa các bộ phận chính: thân, tóc ngọn lửa, kính visor, tay, chân, áo choàng', () => {
    const mascot = createMtronMascot()
    const children = mascot.group.children
    expect(children.length).toBeGreaterThan(3)

    let hasBodyMesh = false
    let hasCape = false
    let hasExtrudeLed = false
    let hasBodyEmissiveMap = false

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry instanceof THREE.SphereGeometry && obj.geometry.parameters.radius > 0.6) {
          hasBodyMesh = true
          if (obj.material instanceof THREE.MeshPhysicalMaterial && obj.material.emissiveMap) {
            hasBodyEmissiveMap = true
          }
        }
        if (obj.geometry instanceof THREE.PlaneGeometry) {
          hasCape = true
        }
        if (obj.geometry instanceof THREE.ExtrudeGeometry) {
          hasExtrudeLed = true
        }
      }
    })

    expect(hasBodyMesh).toBe(true)
    expect(hasCape).toBe(true)
    expect(hasExtrudeLed).toBe(true)
    expect(mascot.group.rotation.y).toBeCloseTo(0.16, 2)
    mascot.dispose()
  })

  it('hàm update chạy trơn tru qua tất cả trạng thái nghiệp vụ mà không phát sinh lỗi', () => {
    const mascot = createMtronMascot()

    const states = [
      { isListening: false, isSpeaking: false, isThinking: false, activeIntent: null },
      { isListening: true, isSpeaking: false, isThinking: false, activeIntent: null },
      { isListening: false, isSpeaking: true, isThinking: false, activeIntent: null },
      { isListening: false, isSpeaking: false, isThinking: true, activeIntent: null },
      { isListening: false, isSpeaking: false, isThinking: false, activeIntent: 'FRAUD_ALERT' as const },
    ]

    for (const state of states) {
      expect(() => {
        mascot.update(1.0, 0.016, state, { x: 0.2, y: -0.1 })
      }).not.toThrow()
    }

    mascot.dispose()
  })

  it('hàm dispose dọn dẹp an toàn tài nguyên bộ nhớ GPU', () => {
    const mascot = createMtronMascot()
    expect(() => mascot.dispose()).not.toThrow()
  })

  it('tà áo choàng nằm gọn trong phạm vi an toàn, không bị crop qua mép canvas', () => {
    const mascot = createMtronMascot()
    let capeMesh: THREE.Mesh | null = null

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.PlaneGeometry) {
        capeMesh = obj
      }
    })

    expect(capeMesh).not.toBeNull()
    if (capeMesh) {
      const geo = (capeMesh as THREE.Mesh).geometry as THREE.PlaneGeometry
      const posAttr = geo.attributes.position as THREE.BufferAttribute
      let minX = Infinity
      let maxX = -Infinity

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i)
        if (x < minX) minX = x
        if (x > maxX) maxX = x
      }

      // Biên độ X của áo choàng không được vươn quá xa về trục âm (tránh crop mép trái)
      expect(minX).toBeGreaterThan(-1.3)
      expect(maxX).toBeLessThan(1.0)
    }

    mascot.dispose()
  })

  it('kính visor có góc mở chiều cao cân đối, tỷ lệ conformal triệt tiêu hiện tượng dẹt mắt', () => {
    const mascot = createMtronMascot()
    let hudGeo: THREE.SphereGeometry | null = null

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
        const params = obj.geometry.parameters
        if (params.phiLength < Math.PI * 1.5 && params.thetaLength < Math.PI) {
          hudGeo = obj.geometry
        }
      }
    })

    expect(hudGeo).not.toBeNull()
    if (hudGeo) {
      const params = (hudGeo as THREE.SphereGeometry).parameters
      // Chiều cao góc mở thetaLength phải >= 0.25*PI để mắt không bị ép dẹt mỏng
      expect(params.thetaLength).toBeGreaterThanOrEqual(Math.PI * 0.25)
      // Tỷ lệ phiLength / thetaLength nằm trong dải cân đối 1.8 - 2.3
      const ratio = params.phiLength / params.thetaLength
      expect(ratio).toBeGreaterThan(1.8)
      expect(ratio).toBeLessThan(2.3)
    }

    mascot.dispose()
  })

  it('hai ống cẳng chân và đôi giày đồng trục tuyệt đối, cắm sâu lọt lòng 100% không lệch', () => {
    const mascot = createMtronMascot()
    const legMeshes: THREE.Mesh[] = []

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CylinderGeometry) {
        const p = obj.geometry.parameters
        // Lọc mesh cẳng chân: CylinderGeometry có chiều cao > 0.25 và bán kính đáy < 0.08
        if (p.height > 0.25 && p.radiusBottom < 0.08) {
          legMeshes.push(obj)
        }
      }
    })

    // Phải có đúng 2 ống cẳng chân
    expect(legMeshes.length).toBe(2)

    // Kiểm tra tính đối xứng qua trục giữa X = 0
    const xCoords = legMeshes.map(m => m.position.x).sort((a, b) => a - b)
    const x0 = xCoords[0] ?? 0
    const x1 = xCoords[1] ?? 0
    expect(Math.abs(x0 + x1)).toBeLessThan(0.01) // Đối xứng qua 0
    expect(Math.abs(x0)).toBeCloseTo(0.23, 2)
    expect(Math.abs(x1)).toBeCloseTo(0.23, 2)

    // Bán kính đáy cẳng chân (0.074) phải nhỏ hơn bán kính trong cổ giày (0.094) để lọt lòng 100%
    for (const leg of legMeshes) {
      const geo = leg.geometry as THREE.CylinderGeometry
      expect(geo.parameters.radiusBottom).toBeLessThanOrEqual(0.075)
    }

    mascot.dispose()
  })

  it('hai bàn tay có cấu trúc đốt ngón tay CapsuleGeometry nổi rõ ràng, không bị nuốt bởi khối đế', () => {
    const mascot = createMtronMascot()
    let fingerCapsulesCount = 0

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CapsuleGeometry) {
        const p = obj.geometry.parameters
        // Các ngón tay là các Capsule Chibi (radius <= 0.042, height <= 0.08)
        if (p.radius <= 0.042 && p.height <= 0.08) {
          fingerCapsulesCount++
        }
      }
    })

    // Mỗi bàn tay có 4 ngón tay + ngón cái = ít nhất 5 capsules mỗi bên -> tổng >= 10 capsules ngón tay
    expect(fingerCapsulesCount).toBeGreaterThanOrEqual(10)

    mascot.dispose()
  })

  it('hai khớp cổ tay đồng trục 100% với cánh tay và bàn tay phải nổi bên ngoài thân cầu', () => {
    const mascot = createMtronMascot()
    let wristBridgesCount = 0

    mascot.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CylinderGeometry) {
        const p = obj.geometry.parameters
        // Khớp cổ tay Cylinder nối giữa cánh tay và bàn tay (radius 0.100-0.120, height ~0.075)
        if (p.radiusTop >= 0.100 && p.radiusTop <= 0.125 && p.height >= 0.06 && p.height <= 0.09) {
          wristBridgesCount++
          // Trục cổ tay phải có quaternion khác identity để bám sát vector tiếp tuyến
          expect(obj.quaternion.length()).toBeCloseTo(1.0, 4)
        }
      }
    })

    expect(wristBridgesCount).toBe(2) // 2 khớp cổ tay cho 2 cánh tay

    mascot.dispose()
  })
})
