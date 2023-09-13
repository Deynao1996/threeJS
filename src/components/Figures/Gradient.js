import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { GradientShaderMaterial } from '../ExtendableShaders/GradientShader'
import { DoubleSide } from 'three'
import { OrbitControls } from '@react-three/drei'

export const gradientCanvasProps = {
  camera: { position: [0, 0, 0.4], fov: 100 }
}

extend({ GradientShaderMaterial })

const Gradient = () => {
  const { camera } = useThree()
  const materialRef = useRef()

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh>
        <planeGeometry args={[5, 5, 300, 300]} />
        <gradientShaderMaterial ref={materialRef} side={DoubleSide} />
      </mesh>
    </>
  )
}

export default Gradient
