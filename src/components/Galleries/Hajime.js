import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { HajimeShaderMaterial } from '../ExtendableShaders/HajimeShader'
import logo from '../../resources/img/fashion.jpg'
import logo2 from '../../resources/img/portfolio.jpg'
import { TextureLoader } from 'three'
import { OrbitControls } from '@react-three/drei'

extend({ HajimeShaderMaterial })

const Hajime = () => {
  const [image, image2] = useLoader(TextureLoader, [logo, logo2])
  const ref = useRef()
  const planeRef = useRef()
  const {
    camera,
    pointer,
    size: { height, width }
  } = useThree()

  function fitImage() {
    let dist = camera.position.z - planeRef.current.position.z
    let planeHeight = 1
    planeRef.current.position.y = -0.2
    camera.fov = 2 * (180 / Math.PI) * Math.atan(planeHeight / (2 * dist))

    if (width / height > 1) {
      planeRef.current.scale.x = planeRef.current.scale.y =
        (1.05 * width) / height
    }
  }

  function onAnimate() {
    let tl = gsap.timeline()

    tl.to(ref.current, {
      uWaveLength: 24,
      duration: 0.5
    })
      .to(ref.current, {
        uRatio: 0,
        duration: 0.5,
        onComplete: () => (ref.current.uImage = image2)
      })
      .to(ref.current, {
        uRatio: 1,
        duration: 0.5
      })
      .to(
        ref.current,
        {
          uWaveLength: 3,
          duration: 0.5
        },
        '-=0.5'
      )
  }

  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()

    gsap.to(ref.current, {
      uMouseX: pointer.x,
      duration: 0.5,
      ease: 'power2.out'
    })
    gsap.to(ref.current, {
      uMouseY: pointer.y,
      duration: 0.5,
      ease: 'power2.out'
    })
  })

  useEffect(() => {
    fitImage()
    ref.current.uResolution = [width, height]
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh ref={planeRef} position={[0, -2, 0]} onClick={onAnimate}>
        <planeGeometry args={[2, 1, 64, 64]} />
        <hajimeShaderMaterial ref={ref} uImage={image} uWaveLength={3} />
      </mesh>
    </>
  )
}

export default Hajime
