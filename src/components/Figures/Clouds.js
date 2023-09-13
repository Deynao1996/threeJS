import { OrbitControls, Stats } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { CloudsShaderMaterial } from '../ExtendableShaders/CloudsShader'

import cloud from '../../resources/img/cloud.jpg'

extend({ CloudsShaderMaterial })

const Clouds = () => {
  const [brush] = useLoader(TextureLoader, [cloud])
  const { camera } = useThree()
  const materialRef = useRef()
  const meshRef = useRef()
  const num = 1000

  function setBufferAttribute() {
    const translateArray = new Float32Array(num * 3)
    const rotateArray = new Float32Array(num)
    const radius = 0.7

    for (let i = 0; i < num; i++) {
      const theta = Math.random() * 2 * Math.PI
      translateArray.set(
        [
          Math.sin(theta) * radius,
          Math.cos(theta) * radius,
          -Math.random() * 5
        ],
        3 * i
      )
      rotateArray.set([Math.random() * 2 * Math.PI], i)
    }
    meshRef.current.geometry.setAttribute(
      'aTranslate',
      new THREE.InstancedBufferAttribute(translateArray, 3)
    )
    meshRef.current.geometry.setAttribute(
      'aRotate',
      new THREE.InstancedBufferAttribute(rotateArray, 1)
    )
  }

  useFrame(({ clock }) => (materialRef.current.uTime = clock.getElapsedTime()))

  useEffect(() => {
    camera.lookAt(0, 0, 2)
    setBufferAttribute()
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <Stats />
      <instancedMesh ref={meshRef} args={[null, null, num]}>
        <planeGeometry args={[0.5, 0.5, 1, 1]} />
        <cloudsShaderMaterial
          ref={materialRef}
          transparent={true}
          side={THREE.DoubleSide}
          uTexture={brush}
          depthWrite={false}
          depthTest={false}
        />
      </instancedMesh>
    </>
  )
}

export default Clouds
