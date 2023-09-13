import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { TaoShaderMaterial } from '../ExtendableShaders/TaoShader'
import barovier from '../../resources/img/portfolio.jpg'
import tao from '../../resources/img/fashion.jpg'
import lich from '../../resources/img/lichKing.jpg'
import bg from '../../resources/img/background.jpg'
import { TextureLoader } from 'three'

const gallery = [barovier, tao, lich, bg]

extend({ TaoShaderMaterial })

const Tao = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(TextureLoader, gallery)
  const {
    size: { height, width }
  } = useThree()

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
    positionRef.current += speedRef.current
    speedRef.current *= 0.7

    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current

    positionRef.current += dif * 0.03

    gsap.set('.dot', {
      y: positionRef.current * 200
    })

    materialRef.current.uProgress = positionRef.current

    let curSlide = Math.floor(positionRef.current)
    let nextSlide = (Math.floor(positionRef.current) + 1) % gallery.length

    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  })

  useEffect(() => {
    window.addEventListener('wheel', (e) => {
      speedRef.current += e.deltaY * 0.003
    })
  }, [])

  return (
    <>
      <mesh ref={planeRef}>
        <planeGeometry args={[2, 1, 64, 64]} />
        <taoShaderMaterial ref={materialRef} uResolution={[width, height]} />
      </mesh>
    </>
  )
}

export default Tao
