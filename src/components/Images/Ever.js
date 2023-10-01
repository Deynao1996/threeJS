import { Center, Scroll, ScrollControls, useScroll } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import credit from '../../resources/img/credit.png'
import React, { useEffect } from 'react'
import { AdditiveBlending, BufferAttribute } from 'three'
import {
  EverShaderMaterial,
  PointsShaderMaterial
} from '../ExtendableShaders/EverShaders'

const store = {
  firstSliderClip: 'polygon(50% 0, 0 0, 0 76%, 50% 76%)',
  secondSliderClip: 'polygon(50% 0, 100% 0, 100% 76%, 50% 76%)',
  slidesCount: 4,
  scrollControlsProps: {
    horizontal: true,
    pages: 2,
    damping: 0.5
  }
}
const { firstSliderClip, secondSliderClip, scrollControlsProps, slidesCount } =
  store

function makeRndStr(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$*&'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    if (Math.random() > 0.95) {
      result += `<strong>${characters.charAt(
        Math.floor(Math.random() * charactersLength)
      )}</strong>`
    } else {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    result += ' '
    counter += 1
  }
  return result
}

function range(start, end) {
  const r = Math.random()
  return r * (end - start) + start
}

extend({ EverShaderMaterial, PointsShaderMaterial })

const Ever = () => {
  const meshRef = useRef()

  return (
    <>
      <ScrollControls {...scrollControlsProps}>
        <Scroll html>
          <SliderLeft />
        </Scroll>
        <CustomScrollWrapper>
          {(data) => (
            <ScrollControls style={{ zIndex: -1 }} {...scrollControlsProps}>
              <Scroll html>
                <SliderRight data={data} meshRef={meshRef} />
              </Scroll>
            </ScrollControls>
          )}
        </CustomScrollWrapper>
      </ScrollControls>
      <Center>
        <Particles />
      </Center>
    </>
  )
}

const Particles = ({ particlesNumber = 3000, pointsNumber = 1000 }) => {
  const ref = useRef()
  const pointsRef = useRef()

  function setAttributes(number, ref, sizeRange) {
    const geo = ref.current.geometry
    const positions = new Float32Array(number * 3)
    const sizes = new Float32Array(number)
    const velocity = new Float32Array(number)
    const distance = new Float32Array(number)
    const random = new Float32Array(number)

    for (let i = 0; i < number; i++) {
      let i3 = i * 3
      positions[i3] = 0
      positions[i3 + 1] = Math.random() - 0.5 + 0.5 * (Math.random() - 0.5)
      positions[i3 + 1] *= 1.05
      positions[i3 + 2] = 0

      random[i] = Math.random()
      sizes[i] = range(sizeRange.min, sizeRange.max)
      velocity[i] = range(0.1, 1)
      distance[i] = range(0.1, 1)
    }

    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1))
    geo.setAttribute('aVelocity', new BufferAttribute(velocity, 1))
    geo.setAttribute('aDistance', new BufferAttribute(distance, 1))
    geo.setAttribute('aRandom', new BufferAttribute(random, 1))
  }

  useEffect(() => {
    setAttributes(particlesNumber, ref, { min: 1, max: 50 })
    setAttributes(pointsNumber, pointsRef, { min: 3, max: 20 })
  }, [particlesNumber, pointsNumber])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    ref.current.material.uTime = time
    pointsRef.current.material.uTime = time
  })

  return (
    <group>
      <points ref={ref} scale={[1, 0.8, 1]}>
        <bufferGeometry />
        <everShaderMaterial blending={AdditiveBlending} />
      </points>
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsShaderMaterial blending={AdditiveBlending} />
      </points>
    </group>
  )
}

const SliderLeft = () => {
  const { fixed } = useScroll()

  useEffect(() => {
    fixed.style.clipPath = `${firstSliderClip}`
  }, [firstSliderClip])

  return (
    <div className="slider">
      <div className="slider__wrapper">
        <div className="slider__scroller">
          {[...new Array(slidesCount)].map((_, i) => (
            <div className="slide" key={i}>
              <img src={credit} alt="credit-card" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SliderRight = ({ data, encodeLength = 400 }) => {
  const { fixed } = useScroll()
  const width = useThree((state) => state.size.width)

  const transformRef = useRef(width / 2)
  const refsArr = useRef([])
  const rectRefsArr = useRef([])
  const framesRef = useRef(0)

  const separatorRef = useRef(document.createElement('div'))
  const canvas = document.querySelector('canvas')
  canvas.style.transition = 'opacity 0.8s ease-out'

  function handleCustomScroll() {
    if (data.delta > data.eps) {
      const transform = width * (data.pages - 1) * data.offset
      fixed.firstChild.style.transform = `translate3d(${-transform}px,${0}px,0)`
      transformRef.current = transform + width / 2
    }
  }

  function appendSeparator() {
    separatorRef.current.classList.add('slider__separator')
    fixed.appendChild(separatorRef.current)
  }

  function htmlDecode() {
    refsArr.current.forEach((el) => {
      el.innerHTML = makeRndStr(encodeLength)
    })
  }

  function toggleEncode() {
    const isShow = rectRefsArr.current.some((el) => {
      return transformRef.current >= el - 360 && transformRef.current <= el
    })
    if (isShow) {
      canvas.style.opacity = 1
      separatorRef.current.style.opacity = 1
    } else {
      canvas.style.opacity = 0
      separatorRef.current.style.opacity = 0
    }
  }

  useEffect(() => {
    fixed.style.clipPath = `${secondSliderClip}`
    appendSeparator()
  }, [secondSliderClip, fixed])

  useFrame(() => {
    framesRef.current += 1
    if (framesRef.current % 30 === 0) htmlDecode()
    if (!!data) handleCustomScroll()
    toggleEncode()
  })

  return (
    <div className="slider">
      <div className="slider__wrapper">
        <div className="slider__scroller">
          {[...new Array(slidesCount)].map((_, i) => (
            <div className="slide p-2" style={{ padding: '0.2rem' }} key={i}>
              <div
                ref={(el) => {
                  refsArr.current[i] = el
                  rectRefsArr.current[i] = el.getBoundingClientRect().right
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CustomScrollWrapper = ({ children }) => {
  const data = useScroll()

  return <>{children(data)}</>
}

export default Ever
