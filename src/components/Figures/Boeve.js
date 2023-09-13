import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  BoeveShaderMaterial,
  LinesShaderMaterial
} from '../ExtendableShaders/BoeveShaders'
import boeve from '../../resources/img/ico.jpg'

extend({ BoeveShaderMaterial, LinesShaderMaterial })

const Boeve = () => {
  const [image] = useLoader(THREE.TextureLoader, [boeve])
  image.wrapS = image.wrapT = THREE.MirroredRepeatWrapping
  const { camera, scene } = useThree()

  const materialsRef = useRef([])
  const geometryRef = useRef([])

  function setBufferAttribute() {
    const bary = []
    const length = geometryRef.current[0].attributes.position.array.length

    for (let i = 0; i < length / 3; i++) {
      bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0)
    }
    const aBary = new Float32Array(bary)
    geometryRef.current.forEach((g) => {
      g.setAttribute('aBary', new THREE.BufferAttribute(aBary, 3))
    })
  }

  function mouseDistortion(speed, time) {
    materialsRef.current.forEach((m) => {
      m.uMouse = speed * 2
      m.uTime = time * 0.09
    })
  }

  useFrame(({ clock, pointer }) => {
    const time = clock.getElapsedTime()
    const speed = Math.sqrt(pointer.x ** 2 + pointer.x ** 2)

    scene.rotation.x = scene.rotation.y = time * 0.09
    mouseDistortion(speed, time)
  })

  useEffect(() => setBufferAttribute(), [])

  return (
    <>
      {/* <OrbitControls camera={camera} /> */}
      <group>
        <mesh>
          <icosahedronGeometry
            args={[1, 1]}
            ref={(el) => (geometryRef.current[0] = el)}
          />
          <boeveShaderMaterial
            ref={(el) => (materialsRef.current[0] = el)}
            uImage={image}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry
            args={[1.001, 1]}
            ref={(el) => (geometryRef.current[1] = el)}
          />
          <linesShaderMaterial ref={(el) => (materialsRef.current[1] = el)} />
        </mesh>
      </group>
    </>
  )
}

export default Boeve
