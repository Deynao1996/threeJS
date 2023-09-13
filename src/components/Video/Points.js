import { extend, useFrame } from '@react-three/fiber'
import { PointsShaderMaterial } from '../ExtendableShaders/PointsShader'
import { useEffect, useRef } from 'react'
import { Float32BufferAttribute } from 'three'

extend({ PointsShaderMaterial })

const Points = ({ counterRef }) => {
  const geometryRef = useRef()
  const materialRef = useRef()

  function setBufferAttribute() {
    let vertices = []

    for (let i = -counterRef.current / 2; i < counterRef.current / 2; i++) {
      for (let j = -counterRef.current / 2; j < counterRef.current / 2; j++) {
        vertices.push(i / 10 + 0.05, j / 10 + 0.05, 0.005)
      }
    }

    geometryRef.current.setAttribute(
      'position',
      new Float32BufferAttribute(vertices, 3)
    )
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  useEffect(() => void setBufferAttribute(), [])

  return (
    <points>
      <bufferGeometry ref={geometryRef} />
      <pointsShaderMaterial ref={materialRef} />
    </points>
  )
}

export default Points
