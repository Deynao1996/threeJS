import { extend, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Color, Float32BufferAttribute, TextureLoader } from 'three'
import gsap from 'gsap'
import { WatchesShaderMaterial } from '../ExtendableShaders/WatchesShader'

import img from '../../resources/img/watches/watches1.jpg'
import img2 from '../../resources/img/watches/watches2.jpg'
import { OrbitControls } from '@react-three/drei'

extend({ WatchesShaderMaterial })

const Watches = () => {
  const { camera } = useThree()
  const textures = useLoader(TextureLoader, [img, img2])

  const pointsRef = useRef()
  const geometryRef = useRef()
  const materialRef = useRef()
  const objectRef = useRef([
    {
      file: img
    },
    {
      file: img2
    }
  ])

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

  function createFakeCanvas() {
    const fakeCanvas = document.createElement('canvas')
    const ctx = fakeCanvas.getContext('2d')

    return {
      fakeCanvas,
      ctx
    }
  }

  function setObjectData(buffer, image, i) {
    const rgb = []
    const c = new Color()

    for (let k = 0; k < buffer.length; k = k + 4) {
      c.setRGB(buffer[k], buffer[k + 1], buffer[k + 2])
      rgb.push({
        c: c.clone(),
        id: k / 4
      })
    }

    const result = []
    let j = 0

    rgb
      .sort((a, b) => {
        const aObj = {}
        const bObj = {}
        a.c.getHSL(aObj)
        b.c.getHSL(bObj)
        return aObj.s - bObj.s
      })
      .forEach((e) => {
        result[j] = e.id % image.width
        result[j + 1] = Math.floor(e.id / image.height)
        j = j + 2
      })
    objectRef.current[i].image = image
    objectRef.current[i].texture = textures[i]
    objectRef.current[i].buffer = result
    objectRef.current[i].needsUpdate = true
    objectRef.current[i].flipY = false
  }

  function createPoints(image) {
    const width = image.width
    const height = image.height
    const positions = []
    let customIndex = 0

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        positions[customIndex * 3] = j
        positions[customIndex * 3 + 1] = i
        positions[customIndex * 3 + 2] = 0
        customIndex++
      }
    }
    const positionAttribute = new Float32BufferAttribute(positions, 3)
    const sourceAttribute = new Float32BufferAttribute(
      objectRef.current[0].buffer,
      2
    )
    const targetAttribute = new Float32BufferAttribute(
      objectRef.current[1].buffer,
      2
    )
    const sourceTexture = objectRef.current[0].texture
    const targetTexture = objectRef.current[1].texture

    geometryRef.current.setAttribute('position', positionAttribute)
    geometryRef.current.setAttribute('source', sourceAttribute)
    geometryRef.current.setAttribute('target', targetAttribute)

    materialRef.current.uDimensions = [width, height]
    materialRef.current.uSourceTexture = sourceTexture
    materialRef.current.uTargetTexture = targetTexture
  }

  function onAnimate() {
    gsap.to(materialRef.current, {
      uBlend: 1,
      duration: 5
    })
  }

  async function drawFakeImage(file, fakeCanvas, ctx, i) {
    const pres = 600
    const fakeImg = await onLoadImage(file)

    fakeCanvas.width = fakeImg.width
    fakeCanvas.height = fakeImg.height
    ctx.drawImage(fakeImg, 0, 0, pres, pres)
    const imageData = ctx.getImageData(0, 0, pres, pres).data
    setObjectData(imageData, fakeImg, i)
    createPoints(fakeImg)
  }

  useEffect(() => {
    const { fakeCanvas, ctx } = createFakeCanvas()

    objectRef.current.forEach(({ file }, i) => {
      void drawFakeImage(file, fakeCanvas, ctx, i)
    })
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <points ref={pointsRef} frustumCulled={false} onClick={onAnimate}>
        <bufferGeometry ref={geometryRef} />
        <watchesShaderMaterial ref={materialRef} />
      </points>
    </>
  )
}

export default Watches
