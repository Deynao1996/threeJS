import { OrbitControls, shaderMaterial, useAspect } from "@react-three/drei"
import { createPortal, extend, useFrame, useLoader, useThree } from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import { useMemo, useRef } from "react"
import * as THREE from 'three'

import logo from '../../resources/img/pixi/logo.jpg'
import background from '../../resources/img/pixi/background.jpg'
import blob from '../../resources/img/pixi/blob.png'
import test from '../../resources/img/pixi/test.jpg'


const PixiShaderMaterial = shaderMaterial(
  {
    uBg: new THREE.Texture(),
    uMask: new THREE.Texture(),
  },
  glsl`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform sampler2D uBg;
    uniform sampler2D uMask;

    void main() {
      vec4 mask = texture2D(uMask, vUv);

      float strength = mask.a * mask.r;
      strength *= 3.;
      strength = min(1., strength);

      vec4 color = texture2D(uBg, vUv + (1. - strength) * 0.1);

      gl_FragColor = color*strength;
    }  
  `
)

extend({ PixiShaderMaterial })

const Pixi = () => {
  const size = useAspect(1300, 657)
  const [ image, bg, mask, testImg ] = useLoader(THREE.TextureLoader, [logo, background, blob, test])
  const { camera, gl } = useThree()

  const materialRef = useRef()
  const mouseRef = useRef([0, 0, 0])
  const blobsRef = useRef([])

  const blobs = useMemo(() => renderBlobs(), [])
  const [ scene, target ] = useMemo(() => createScene(), [])
  
  const onMouseMove = (e) => {
    mouseRef.current = [e.point.x, e.point.y, e.point.z]
  }

  function getRange(a, b) {
    let r = Math.random()
    return a * r + b * (1 - r)
  }

  function animateBlobs(blob) {
    blob.userData.life += 0.1
    blob.scale.setScalar(Math.sin(0.5 * blob.userData.life))

    if (blob.userData.life > 2*Math.PI) {
      const theta = getRange(0, 2*Math.PI)
      const r = getRange(0.05, 0.1)
      
      blob.userData.life = -2*Math.PI
      blob.position.x = mouseRef.current[0] + r*Math.sin(theta)
      blob.position.y = mouseRef.current[1] + r*Math.cos(theta)
    }
  }

  function renderTarget() {
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    materialRef.current.uMask = target.texture
  }

  function createScene() {
    const scene = new THREE.Scene()
    const target = new THREE.WebGLRenderTarget(1920, 1080, {
      format: THREE.RGBAFormat,
      stencilBuffer: false
    })
    return [
      scene, 
      target
    ]
  }

  function renderBlobs() {
    const num = 50
    const blobs = []

    for (let i = 0; i < num; i++) {
      const theta = getRange(0, 2*Math.PI)
      const r = getRange(0.05, 0.1)
      const newPosX = r*Math.sin(theta)
      const newPosY = r*Math.cos(theta)
      const newPos = [newPosX, newPosY, 0.0012]
      const userData = {life: getRange(-2*Math.PI, 2*Math.PI)}

      blobs.push(
        <mesh 
          position={newPos} 
          key={i}
          ref={el => blobsRef.current[i] = el} 
          userData={userData}
        >
          <planeBufferGeometry args={[0.15, 0.15]}/>
          <meshBasicMaterial 
            map={mask} 
            blending={THREE.AdditiveBlending}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      )
    }
    return blobs
  }

  useFrame(() => {
    blobsRef.current.forEach(animateBlobs)
    renderTarget()
  })

  
  return (
    <>
      <OrbitControls camera={camera} />
      <group>
        <mesh 
          scale={size} 
          position={[0, 0, 0.001]}
          onPointerMove={onMouseMove}
        >
          <planeBufferGeometry args={[1, 1, 1, 1]}/>
          <pixiShaderMaterial 
            ref={materialRef}
            uBg={testImg}
            uMask={mask}
            transparent={true}
          />
        </mesh>
        <mesh scale={size}>
          <planeBufferGeometry args={[1, 1, 1, 1]}/>
          <meshBasicMaterial map={image} />
        </mesh>
        <group>
          {createPortal(blobs, scene)}
        </group>
      </group>
    </>
  )
}

export default Pixi