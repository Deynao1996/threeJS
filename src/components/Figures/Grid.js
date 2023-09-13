import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { GridShaderMaterial } from '../ExtendableShaders/GridShader'

extend({ GridShaderMaterial })

const Grid = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const {
    size: { height, width },
    camera
  } = useThree()

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
    materialRef.current.transparent = true
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh ref={planeRef}>
        <planeGeometry args={[100, 100, 128, 128]} />
        <gridShaderMaterial ref={materialRef} uResolution={[width, height]} />
      </mesh>
    </>
  )
}

export default Grid
