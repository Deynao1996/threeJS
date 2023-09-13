import React, { useRef } from 'react'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { HeadShaderMaterial } from '../ExtendableShaders/HeadShader'

import sky from '../../resources/img/sky.jpg'
import { TextureLoader } from 'three'

extend({ HeadShaderMaterial })

const Head = (props) => {
  const groupRef = useRef()
  const { nodes } = useGLTF('/model/scene.gltf')
  const { camera } = useThree()

  const meshes = ['Object_2', 'Object_3', 'Object_4', 'Object_5', 'Object_6']

  function renderMeshes(arr) {
    return arr.map((item, i) => {
      const props = {
        geometry: nodes[item].geometry,
        key: i
      }

      return <CustomMesh {...props} />
    })
  }

  return (
    <>
      <OrbitControls camera={camera} />
      <group ref={groupRef} {...props} dispose={null}>
        <group rotation={[-Math.PI / 2, 0, 0]}>{renderMeshes(meshes)}</group>
      </group>
    </>
  )
}

useGLTF.preload('/model/scene.gltf')

const CustomMesh = (props) => {
  const [image] = useLoader(TextureLoader, [sky])
  const materialRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  return (
    <mesh {...props}>
      <headShaderMaterial uTexture={image} ref={materialRef} />
    </mesh>
  )
}

export default Head
