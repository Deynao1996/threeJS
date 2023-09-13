import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useRef } from 'react'
import * as THREE from 'three'
import { WaveShaderMaterial } from '../ExtendableShaders/WaveShader'
import artas from '../../resources/img/warckraft.jpg'
import warckraftMap from '../../resources/img/warckraftMap.jpg'
import warckraftPrallax from '../../resources/img/warckraftParallax.jpg'
import { OrbitControls } from '@react-three/drei'

extend({ WaveShaderMaterial })

const Wave = () => {
  const { camera } = useThree()
  const [texture, textureMap, textureParallax] = useLoader(
    THREE.TextureLoader,
    [artas, warckraftMap, warckraftPrallax]
  )
  const ref = useRef()

  useFrame(({ clock, mouse }) => {
    const time = clock.getElapsedTime()
    const { x } = mouse
    ref.current.uTime = time
    gsap.to(ref.current, {
      duration: 2,
      uMouseX: x
    })
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh>
        <planeGeometry args={[2, 2]} />
        <waveShaderMaterial ref={ref} uTexture={texture} uMap={textureMap} />
      </mesh>
    </>
  )
}

export default Wave
