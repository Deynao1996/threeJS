import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect } from 'react'
import { useMemo, useRef } from 'react'
import { TruchetShaderMaterial } from '../ExtendableShaders/TruchetShader'
import { CatmullRomCurve3, DoubleSide, Vector3 } from 'three'

export const truchetProps = {
  camera: { position: [0, 0, -4], fov: 10 },
  style: { zIndex: 110 }
}

const animationConfig = {
  duration: 12,
  repeat: -1,
  ease: 'none'
}

extend({ TruchetShaderMaterial })

const Truchet = ({ num = 1000 }) => {
  const { camera } = useThree()
  const materialRef = useRef()
  const tubeRef = useRef()

  const path = useMemo(() => {
    const dots = []
    for (let i = 0; i < num; i++) {
      const amount = i / num
      const angle = -80 + 120 * amount
      const k = 0.05

      const x = 0.3 * Math.exp(k * angle) * Math.sin(0.25 * angle)
      const y = 0.3 * Math.exp(k * angle) * Math.cos(0.25 * angle)
      const z = Math.cos(0)

      dots.push(new Vector3(x, y, z))
    }
    return new CatmullRomCurve3(dots)
  }, [num])

  function rotateMesh() {
    return gsap.fromTo(
      tubeRef.current.rotation,
      {
        z: 2 * Math.PI * 0
      },
      {
        z: 2 * Math.PI * 1,
        ...animationConfig
      }
    )
  }

  function animateUniform() {
    return gsap.fromTo(
      materialRef.current,
      {
        uProgress: 0
      },
      {
        uProgress: 1,
        ...animationConfig
      }
    )
  }

  useEffect(() => {
    const rotationAnimation = rotateMesh()
    const uniformAnimation = animateUniform()
    return () => {
      rotationAnimation.kill()
      uniformAnimation.kill()
    }
  }, [])

  // useFrame(({ clock }) => {
  //   materialRef.current.transparent = true
  // })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh ref={tubeRef}>
        <tubeGeometry args={[path, 1000, 0.01, 30, false]} />
        <truchetShaderMaterial
          ref={materialRef}
          side={DoubleSide}
          transparent={new Boolean(true)}
        />
      </mesh>
    </>
  )
}

export default Truchet
