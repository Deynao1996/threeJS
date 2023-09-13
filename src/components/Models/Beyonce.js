import React, { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { BeyonceShaderMaterial } from '../ExtendableShaders/BeyonceShader'
import gsap from 'gsap'
import { BufferAttribute } from 'three'

export const beyonceCanvasProps = {
  camera: { position: [0, 0, 650], fov: 30 },
  style: { zIndex: 110 }
}

extend({ BeyonceShaderMaterial })

const Beyonce = () => {
  const model = useLoader(GLTFLoader, '/model/beyonce.glb')
  const { camera } = useThree()
  const geometryRef = useRef()
  const materialRef = useRef()
  const pointsRef = useRef()

  const onMouseMove = (e) => {
    gsap.to(materialRef.current.uMouse, {
      x: e.point.x,
      y: e.point.y,
      z: e.point.z,
      duration: 1,
      ease: 'power2.out'
    })
  }

  function setBufferAttribute() {
    let buffer = model.scene.children[0].geometry.attributes.position.array
    const positionAttribute = new BufferAttribute(buffer, 3, true)
    geometryRef.current.setAttribute('position', positionAttribute)
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  useEffect(() => {
    setBufferAttribute()
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <points ref={pointsRef}>
        <bufferGeometry ref={geometryRef} />
        <beyonceShaderMaterial ref={materialRef} />
      </points>

      <mesh onPointerMove={onMouseMove}>
        <planeGeometry args={[400, 370, 1, 1]} />
        <meshBasicMaterial color={'white'} visible={false} />
      </mesh>
    </>
  )
}

export default Beyonce
