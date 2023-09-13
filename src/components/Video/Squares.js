import { extend, useFrame } from '@react-three/fiber'
import { SquareShaderMaterial } from '../ExtendableShaders/SquareShader'
import { useEffect, useRef } from 'react'
import { DoubleSide, Object3D } from 'three'

extend({ SquareShaderMaterial })

const Squares = ({ squaresMaterialRef, counterRef }) => {
  const boxRef = useRef()

  function setCustomMatrix() {
    let dummy = new Object3D(),
      counter = 0
    for (let i = -counterRef.current / 2; i < counterRef.current / 2; i++) {
      for (let j = -counterRef.current / 2; j < counterRef.current / 2; j++) {
        dummy.position.set(i / 10, j / 10, 0)
        dummy.updateMatrix()
        boxRef.current.setMatrixAt(counter++, dummy.matrix)
      }
    }
    boxRef.current.position.z = 0.01
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    squaresMaterialRef.current.uTime = time
  })

  useEffect(() => void setCustomMatrix(), [])

  return (
    <instancedMesh ref={boxRef} args={[null, null, counterRef.current ** 2]}>
      <planeGeometry args={[0.1, 0.1]} />
      <squareShaderMaterial
        ref={squaresMaterialRef}
        side={DoubleSide}
        transparent={true}
      />
    </instancedMesh>
  )
}

export default Squares
