import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useRef, useEffect } from 'react'
import { DeburisShaderMaterial } from '../ExtendableShaders/DeburisShader'
import img1 from '../../resources/img/deburis/deburis1.jpg'
import img2 from '../../resources/img/deburis/deburis2.jpg'
import img3 from '../../resources/img/deburis/deburis3.jpg'
import { BackSide, TextureLoader } from 'three'

const gallery = [img1, img2, img3]

extend({ DeburisShaderMaterial })

const Deburis = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(TextureLoader, gallery)
  const {
    size: { height, width },
    camera,
    pointer
  } = useThree()

  function handleScroll(e) {
    speedRef.current += e.deltaY * 0.003
  }

  function customSmoothScroll() {
    positionRef.current += speedRef.current
    speedRef.current *= 0.7

    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current
    positionRef.current += dif * 0.03
    materialRef.current.uProgress = positionRef.current
  }

  function setSliderTextures() {
    let curSlide =
      (((Math.floor(positionRef.current) - 1) % gallery.length) +
        gallery.length) %
      gallery.length
    let nextSlide =
      (((curSlide + 1) % gallery.length) + gallery.length) % gallery.length
    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  }

  useFrame(({ clock }) => {
    customSmoothScroll()
    setSliderTextures()

    gsap.to(materialRef.current.uCameraRotation, {
      x: pointer.x / 50,
      y: pointer.y / 50,
      duration: 3,
      ease: 'power2.out'
    })
  })

  useEffect(() => {
    planeRef.current.rotation.y = -Math.PI / 2
    materialRef.current.side = BackSide

    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh ref={planeRef}>
        <cylinderGeometry args={[10, 10, 30, 30, 1, 1, 0, Math.PI]} />
        <deburisShaderMaterial
          ref={materialRef}
          uResolution={[width, height]}
          uTexture1={textures[0]}
          uTexture2={textures[1]}
        />
      </mesh>
    </>
  )
}

export default Deburis
