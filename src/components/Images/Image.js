import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import logo from '../../resources/img/firstImage.jpg'
import displacement from '../../resources/img/displacement1.jpg'
import gsap from 'gsap'
import { ImageShaderMaterial } from '../ExtendableShaders/ImageShader'
import { OrbitControls } from '@react-three/drei'
import { TextureLoader } from 'three'

extend({ ImageShaderMaterial })

const Image = () => {
  const { camera } = useThree()
  const [image, disp] = useLoader(TextureLoader, [logo, displacement])
  const ref = useRef()

  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  const onMouseLeave = () => {
    gsap.fromTo(
      ref.current,
      {
        uProgress: 0.4
      },
      {
        uProgress: 0.0,
        duration: 0.5
      }
    )
  }

  const onMouseEnter = () => {
    gsap.fromTo(
      ref.current,
      {
        uProgress: 0.0
      },
      {
        uProgress: 0.4,
        duration: 0.5
      }
    )
  }

  return (
    <>
      <OrbitControls camera={camera} />
      {/* <pointLight position={[10, 10, 10]}/> */}
      <mesh onPointerEnter={onMouseEnter} onPointerLeave={onMouseLeave}>
        <planeGeometry args={[0.4, 0.6, 100, 100]} />
        <imageShaderMaterial
          ref={ref}
          uProgress={0.0}
          uColor="hotpink"
          uImage={image}
          uDisplacement={disp}
        />
      </mesh>
    </>
  )
}

export default Image
