import { OrbitControls, useAspect } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { MattkaShaderMaterial } from '../ExtendableShaders/MattkaShader'
import { DoubleSide } from 'three'

extend({ MattkaShaderMaterial })

const Mattka = () => {
  const { camera } = useThree()
  const materialRef = useRef()
  const size = useAspect(1920, 1080)

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  function handleMouseMove(e) {
    materialRef.current.uMouse = e.pointer
  }

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh scale={size} onPointerMove={handleMouseMove}>
        <planeGeometry args={[1, 1920 / 1080, 1, 1]} />
        <mattkaShaderMaterial ref={materialRef} side={DoubleSide} />
      </mesh>
    </>
  )
}

export default Mattka
