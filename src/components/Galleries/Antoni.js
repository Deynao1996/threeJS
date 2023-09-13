import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { AntoniShaderMaterial } from '../ExtendableShaders/AntoniShader'
import * as THREE from 'three'
import barovier from '../../resources/img/antoni/antoni1.jpg'
import tao from '../../resources/img/antoni/antoni2.jpg'
import lich from '../../resources/img/antoni/antoni3.jpg'

const gallery = [barovier, lich, tao]

extend({ AntoniShaderMaterial })

const Antoni = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(THREE.TextureLoader, gallery)
  const {
    size: { height, width }
  } = useThree()

  function customSmoothScroll() {
    positionRef.current += speedRef.current
    speedRef.current *= 0.7

    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current
    positionRef.current += dif * 0.03

    if (positionRef.current < -2) {
      positionRef.current = gallery.length + 1
    }
    materialRef.current.uProgress = positionRef.current
  }

  function setSliderTextures() {
    let curSlide =
      (Math.floor(positionRef.current) - 1 + gallery.length) % gallery.length
    let nextSlide =
      (((Math.floor(positionRef.current) + 1) % gallery.length) -
        1 +
        gallery.length) %
      gallery.length
    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  }

  function handleScroll(e) {
    speedRef.current += e.deltaY * 0.003
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
    customSmoothScroll()
    setSliderTextures()

    gsap.set('.dot', {
      y: positionRef.current * 200
    })
  })

  useEffect(() => {
    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [])

  return (
    <>
      <mesh ref={planeRef}>
        <planeGeometry args={[2, 1, 64, 64]} />
        <antoniShaderMaterial ref={materialRef} uResolution={[width, height]} />
      </mesh>
    </>
  )
}

export default Antoni
