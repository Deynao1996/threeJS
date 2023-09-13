import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useLayoutEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RibbonsShaderMaterial } from '../ExtendableShaders/RibbonsShader'
import { DoubleSide, InstancedBufferAttribute } from 'three'
import { OrbitControls } from '@react-three/drei'

export const ribbonsProps = {
  camera: { position: [0, 0, 10], fov: 70 },
  style: { zIndex: 110 }
}

extend({ RibbonsShaderMaterial })

const Ribbons = ({ num = 300 }) => {
  const { camera, size } = useThree()
  const model = useLoader(GLTFLoader, '/ribbons/spline.glb')
  const geo = model?.scene.children[0].geometry.clone()
  geo.computeVertexNormals()

  const materialRef = useRef()
  const meshRef = useRef()

  function setBufferAttribute() {
    const instancedPosition = []
    const instancedRotationAngle = []
    const instancedRotationAxis = []

    for (let i = 0; i < num; i++) {
      instancedPosition.push(
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5)
      )
      instancedRotationAxis.push(
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5)
      )
      instancedRotationAngle.push(Math.random())
    }

    meshRef.current.geometry.setAttribute(
      'aPosition',
      new InstancedBufferAttribute(new Float32Array(instancedPosition), 3)
    )
    meshRef.current.geometry.setAttribute(
      'aRotationAxis',
      new InstancedBufferAttribute(new Float32Array(instancedRotationAxis), 3)
    )
    meshRef.current.geometry.setAttribute(
      'aRotationAngle',
      new InstancedBufferAttribute(new Float32Array(instancedRotationAngle), 1)
    )
  }

  useLayoutEffect(() => {
    setBufferAttribute()
  }, [size])

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <group position={[0, 0, -20]}>
        <instancedMesh ref={meshRef} args={[geo, null, num]}>
          <ribbonsShaderMaterial ref={materialRef} side={DoubleSide} />
        </instancedMesh>
      </group>
    </>
  )
}

export default React.memo(Ribbons)
