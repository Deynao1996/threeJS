import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { MathisShaderMaterial } from '../ExtendableShaders/MathisShader'

import image from '../../resources/img/mathis/image.png'
import image1 from '../../resources/img/mathis/image1.png'
import point from '../../resources/img/mathis/mask.jpg'
import { OrbitControls } from '@react-three/drei'

export const mathisCanvasProps = {
  camera: { position: [0, 0, 1000], fov: 45 },
  style: { zIndex: 110 }
}

extend({ MathisShaderMaterial })

const Mathis = () => {
  const [mask, ...textures] = useLoader(THREE.TextureLoader, [
    point,
    image,
    image1
  ])
  const { camera } = useThree()

  const moveRef = useRef(0)
  const mouseRef = useRef([2000, 2000])
  const materialRef = useRef()
  const pointsRef = useRef()
  const bufferGeometryRef = useRef()

  function onMouseMove(e) {
    mouseRef.current = [e.point.x, e.point.y]
  }

  function onMouseInteraction(value) {
    gsap.to(materialRef.current, {
      uMousePressed: value,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    })
  }

  function getRange(a, b) {
    let r = Math.random()
    return a + (b - a) * r
  }

  function setBufferAttribute() {
    const num = 512 * 512
    const positions = new THREE.BufferAttribute(new Float32Array(num * 3), 3)
    const coordinates = new THREE.BufferAttribute(new Float32Array(num * 3), 3)
    const offset = new THREE.BufferAttribute(new Float32Array(num), 1)
    const speed = new THREE.BufferAttribute(new Float32Array(num), 1)
    const direction = new THREE.BufferAttribute(new Float32Array(num), 1)
    const press = new THREE.BufferAttribute(new Float32Array(num), 1)
    let index = 0

    for (let i = 0; i < 512; i++) {
      const posX = i - 256
      for (let j = 0; j < 512; j++) {
        positions.setXYZ(index, posX * 2, (j - 256) * 2, 0)
        coordinates.setXYZ(index, i, j, 0)
        offset.setX(index, getRange(-1000, 1000))
        speed.setX(index, getRange(0.4, 1))
        direction.setX(index, Math.random() > 0.5 ? 1 : -1)
        press.setX(index, getRange(0.4, 1))
        index++
      }
    }
    bufferGeometryRef.current.setAttribute('position', positions)
    bufferGeometryRef.current.setAttribute('aCoordinates', coordinates)
    bufferGeometryRef.current.setAttribute('aOffset', offset)
    bufferGeometryRef.current.setAttribute('aSpeed', speed)
    bufferGeometryRef.current.setAttribute('aDirection', direction)
    bufferGeometryRef.current.setAttribute('aPress', press)
  }

  function mouseEffects(e) {
    moveRef.current += e.wheelDeltaY / 4000
  }

  function setMaterialUniforms(clock) {
    const next = Math.floor(moveRef.current + 40) % 2
    const prev = (Math.floor(moveRef.current) + 40 + 1) % 2

    materialRef.current.uTexture = textures[prev]
    materialRef.current.uTexture1 = textures[next]
    materialRef.current.uTime = clock.getElapsedTime()
    materialRef.current.uMove = moveRef.current
    materialRef.current.uMouse = mouseRef.current
  }

  useFrame(({ clock }) => setMaterialUniforms(clock))

  useEffect(() => {
    setBufferAttribute()
    window.addEventListener('mousewheel', mouseEffects)
    return () => window.removeEventListener('mousewheel', mouseEffects)
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <group>
        <points ref={pointsRef}>
          <bufferGeometry ref={bufferGeometryRef} />
          <mathisShaderMaterial
            ref={materialRef}
            side={THREE.DoubleSide}
            uTexture={textures[0]}
            uTexture1={textures[1]}
            uMask={mask}
            transparent={true}
            depthTest={false}
            depthWrite={false}
          />
        </points>
        <mesh
          visible={false}
          onPointerMove={onMouseMove}
          onPointerDown={() => onMouseInteraction(1)}
          onPointerUp={() => onMouseInteraction(0)}
        >
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </>
  )
}

export default Mathis
