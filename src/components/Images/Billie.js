import { useAspect, OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import { BillieShaderMaterial } from '../ExtendableShaders/BillieShader'
import { DataTexture, RGBAFormat, TextureLoader } from 'three'
import img from '../../resources/img/billie.jpg'

extend({ BillieShaderMaterial })

const Billie = () => {
  const [texture] = useLoader(TextureLoader, [img])
  const size = useAspect(1920, 1080)
  const { camera } = useThree()

  const dataTexture = useMemo(() => getDataTexture(), [])
  const materialRef = useRef()
  const sizeRef = useRef(32)
  const mouseRef = useRef({
    posX: 0,
    posY: 0,
    vX: 0,
    vY: 0
  })

  const onMouseMove = (e) => {
    const velocityX = Math.abs(e.nativeEvent.movementX / 10)
    const velocityY = Math.abs(e.nativeEvent.movementY / 10)

    const clampedVX = gsap.utils.clamp(0, 1, velocityX)
    const clampedVY = gsap.utils.clamp(0, 1, velocityY)

    const normalizedX = gsap.utils.normalize(-1, 1, e.pointer.x)
    const normalizedY = gsap.utils.normalize(-1, 1, e.pointer.y)

    mouseRef.current = {
      posX: normalizedX,
      posY: normalizedY,
      vX: clampedVX,
      vY: clampedVY
    }
  }

  function getDataTexture() {
    const width = 32
    const height = 32

    const size = width * height
    const data = new Uint8Array(size * 4)

    for (let i = 0; i < size; i++) {
      const stride = i * 4
      const r = Math.random() * 255

      data[stride] = r
      data[stride + 1] = r
      data[stride + 2] = r
      data[stride + 3] = 1
    }

    const texture = new DataTexture(data, width, height, RGBAFormat)
    texture.needsUpdate = true
    return texture
  }

  function updateDataTexture() {
    const data = dataTexture?.source.data.data
    const maxDistance = 8
    const gridMouseX = sizeRef.current * mouseRef.current.posX
    const gridMouseY = sizeRef.current * mouseRef.current.posY

    for (let i = 0; i < data.length; i += 4) {
      data[i] *= 0.9
      data[i + 1] *= 0.9
    }

    for (let i = 0; i < sizeRef.current; i++) {
      for (let j = 0; j < sizeRef.current; j++) {
        const distance = (gridMouseX - i) ** 2 + (gridMouseY - j) ** 2
        const maxDistanceSq = maxDistance ** 2

        if (distance < maxDistanceSq) {
          const index = 4 * (i + sizeRef.current * j)
          const power = maxDistance / Math.sqrt(distance)

          data[index] += 20 * mouseRef.current.vX * power
          data[index + 1] += 20 * mouseRef.current.vY * power
        }
      }
    }

    mouseRef.current.vX *= 0.9
    mouseRef.current.vY *= 0.9

    dataTexture.needsUpdate = true
  }

  useFrame(({ clock }) => {
    updateDataTexture()
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh scale={size} onPointerMove={onMouseMove}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <billieShaderMaterial
          ref={materialRef}
          uTexture={texture}
          uDataTexture={dataTexture}
        />
      </mesh>
    </>
  )
}

export default Billie
