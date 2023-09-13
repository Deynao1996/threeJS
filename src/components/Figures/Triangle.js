import { OrbitControls, useAspect } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { TextureLoader } from 'three'
import { TriangleShaderMaterial } from '../ExtendableShaders/TriangleShader'

import img from '../../resources/img/triangles/mask.jpg'
import tri from '../../resources/img/triangles/triangle.png'
import gsap from 'gsap'

export const TRIANGLES_STYLES = {
  position: 'fixed',
  zIndex: '1000',
  left: 0,
  top: 0
}

extend({ TriangleShaderMaterial })

const Triangles = () => {
  const { camera } = useThree()
  const [texture] = useLoader(TextureLoader, [tri])
  const size = useAspect(1680, 1050)

  const geometryRef = useRef()
  const materialRef = useRef()
  const pointsRef = useRef()
  const speedRef = useRef([])
  const imageRef = useRef([])

  const onAnimate = () => {
    gsap.fromTo(
      materialRef.current,
      {
        uProgress: 0
      },
      {
        uProgress: 1,
        duration: 2
      }
    )
  }

  function onLoadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = path
      img.onload = () => {
        resolve(img)
      }
      img.onerror = (e) => {
        reject(e)
      }
    })
  }

  function setBufferAttribute(imageData, pres) {
    const image = Array.from(Array(pres), () => new Array(pres))
    const position = []
    const position1 = []
    const rotation = []
    const size = []
    const alpha = []
    const colors = []

    for (let i = 0; i < imageData.length; i += 4) {
      let x = (i / 4) % pres
      let y = Math.floor(i / 4 / pres)
      image[x][y] = imageData[i]

      if (imageData[i] > 50) {
        position.push((1.6 * (x - pres / 2)) / 100, (-y + pres / 2) / 100, 0)
        position1.push(6 * (Math.random() - 0.5), 6 * (Math.random() - 0.5), 0)
        rotation.push(Math.random() * 2 * Math.PI)
        size.push(Math.random() * 0.5 + 0.5)
        alpha.push(Math.random() * 2 * Math.PI)

        if (Math.random() > 0.5) {
          colors.push(1, 1, 1)
        } else {
          colors.push(1, 1, 0)
        }

        speedRef.current.push(Math.random() * 0.1 + 0.1)
      }
    }

    imageRef.current = image
    geometryRef.current.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(position, 3)
    )
    geometryRef.current.setAttribute(
      'position1',
      new THREE.Float32BufferAttribute(position1, 3)
    )
    geometryRef.current.setAttribute(
      'colors',
      new THREE.Float32BufferAttribute(colors, 3)
    )
    geometryRef.current.setAttribute(
      'rotation',
      new THREE.Float32BufferAttribute(rotation, 1)
    )
    geometryRef.current.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(size, 1)
    )
    geometryRef.current.setAttribute(
      'alpha',
      new THREE.Float32BufferAttribute(alpha, 1)
    )
  }

  function moveTriangles() {
    const position = geometryRef.current.attributes.position
    const rotation = geometryRef.current.attributes.rotation
    if (!position || !rotation) return

    const positionArr = position.array
    const rotationArr = rotation.array
    const pres = 100

    for (let i = 0; i < positionArr.length; i += 3) {
      const speed = speedRef.current[i / 3]
      let x = positionArr[i]
      let y = positionArr[i + 1]
      let r = rotationArr[i / 3]

      const tx = (x * 100) / 1.6 + pres / 2
      const ty = -y * 100 + pres / 2

      if (tx <= 0 || tx >= pres || ty <= 0 || ty >= pres) {
        r += Math.PI
      } else {
        const pixelColor = imageRef.current[Math.floor(tx)][Math.floor(ty)]
        if (pixelColor < 50) {
          r += Math.PI * 0.01
        }
      }

      x = x + Math.cos(r) * speed * 0.001
      y = y + Math.sin(r) * speed * 0.001

      positionArr[i] = x
      positionArr[i + 1] = y
      rotationArr[i / 3] = r
    }
    position.needsUpdate = true
    rotation.needsUpdate = true
  }

  async function drawFakeImage() {
    const pres = 100
    const fakeImg = await onLoadImage(img)

    const fakeCanvas = document.createElement('canvas')
    const ctx = fakeCanvas.getContext('2d')
    fakeCanvas.width = fakeImg.width
    fakeCanvas.height = fakeImg.height
    ctx.drawImage(fakeImg, 0, 0, pres, pres)
    const imageData = ctx.getImageData(0, 0, pres, pres).data
    setBufferAttribute(imageData, pres)
  }

  useFrame(({ clock }) => {
    let time = clock.getElapsedTime()
    materialRef.current.uTime = time
    moveTriangles()
  })

  useEffect(() => {
    drawFakeImage()
    pointsRef.current.position.z = 0
  }, [])

  return (
    <>
      {/* <OrbitControls camera={camera} /> */}
      <points
        ref={pointsRef}
        frustumCulled={false}
        onClick={onAnimate}
        scale={size}
      >
        <bufferGeometry ref={geometryRef} />
        <triangleShaderMaterial
          uTexture={texture}
          transparent={true}
          ref={materialRef}
        />
      </points>
    </>
  )
}

export default Triangles
