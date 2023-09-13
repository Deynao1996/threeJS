import { OrbitControls, shaderMaterial, useAspect } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { BarovierShaderMaterial } from '../ExtendableShaders/BarovierShader'
import barovier from '../../resources/img/portfolio.jpg'
import { TextureLoader } from 'three'

extend({ BarovierShaderMaterial })

const Barovier = () => {
  const [texture] = useLoader(TextureLoader, [barovier])
  const size = useAspect(1800, 1080)
  const ref = useRef()
  const { camera } = useThree()

  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  const onMouseMove = (e) => {
    ref.current.uMouse = [e.point.x * 1.6, e.point.y / 1.6, e.point.z]
  }

  const onMouseClick = (e) => {
    gsap.to(ref.current, {
      duration: 2,
      uProgress: 0.8,
      uAlpha: 0.1
    })
  }

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh onPointerMove={onMouseMove} onClick={onMouseClick} scale={size}>
        <planeGeometry args={[1, 1, 100, 100]} />
        <barovierShaderMaterial ref={ref} uTexture={texture} />
      </mesh>
    </>
  )
}

export default Barovier
