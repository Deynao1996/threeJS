import { OrbitControls, useAspect } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useRef } from 'react'
import { WhateverShaderMaterial } from '../ExtendableShaders/WhateverShader'
import logo from '../../resources/img/portfolio.jpg'
import { DoubleSide, TextureLoader } from 'three'

extend({ WhateverShaderMaterial })

const Whatever = () => {
  const materialRef = useRef()
  const [image] = useLoader(TextureLoader, [logo])
  const { camera } = useThree()
  const size = useAspect(1920, 1080)

  const onMouseMove = (e) => {
    const speed = Math.sqrt(
      e.nativeEvent.movementX ** 2 + e.nativeEvent.movementY ** 2
    )

    const normalizedSpeed = gsap.utils.clamp(0, 1, Math.floor(speed / 10))
    const normalizedX = gsap.utils.normalize(-1, 1, e.pointer.x)
    const normalizedY = gsap.utils.normalize(-1, 1, e.pointer.y)
    materialRef.current.uMouse = [normalizedX, normalizedY]

    gsap.to(materialRef.current, {
      uSpeed: normalizedSpeed,
      duration: 2
    })
    // materialRef.current.uSpeed = gsap.utils.clamp(0, 1, Math.floor(mouseSpeed/10))
  }

  const onAnimate = (progress, direction) => {
    materialRef.current.uDirection = direction
    gsap.to(materialRef.current, {
      uProgress: progress,
      duration: 0.5
    })
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh
        scale={size}
        onPointerUp={() => onAnimate(0, 1)}
        onPointerDown={() => onAnimate(1, 0)}
        onPointerMove={onMouseMove}
      >
        <planeGeometry args={[1, 1, 64, 64]} />
        <whateverShaderMaterial
          side={DoubleSide}
          ref={materialRef}
          uImage={image}
        />
      </mesh>
    </>
  )
}

export default Whatever
