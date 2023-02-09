import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

import image from '../../resources/img/mathis/image.png'
import image1 from '../../resources/img/mathis/image1.png'
import point from '../../resources/img/mathis/mask.jpg'

export const mathisCanvasProps = {
  camera: { position: [0, 0, 1000], fov: 45 },
  style: { zIndex: 110 }
}

const MathisShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMove: 0,
    uMousePressed: 0,
    uTransition: 1,
    uTexture: new THREE.Texture(),
    uTexture1: new THREE.Texture(),
    uMask: new THREE.Texture(),
    uMouse: new THREE.Vector2()
  },
  glsl`
    attribute vec3 aCoordinates;
    attribute float aSpeed;
    attribute float aOffset;
    attribute float aDirection;
    attribute float aPress;

    varying vec2 vUv;
    varying vec2 vCoordinates;
    varying vec3 vPos;
    varying float vMove;

    uniform float uMove;
    uniform float uTime;
    uniform float uMousePressed;
    uniform vec2 uMouse;
    uniform float uTransition;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Not Stable
      pos.x += sin(uMove * aSpeed) * 3.;
      pos.y += sin(uMove * aSpeed) * 3.;
      pos.z = mod(position.z + uMove * 200. * aSpeed + aOffset, 2000.) - 1000.;
      
      // Stable
      vec3 stable = position;
      float dist = distance(stable.xy, uMouse);
      float area = 1. - smoothstep(0., 300., dist);

      stable.x += 50. * sin(uTime * aPress) * aDirection * area * uMousePressed;
      stable.x += 50. * sin(uTime * aPress) * aDirection * area * uMousePressed;
      stable.z += 200. * cos(uTime * aPress) * aDirection * area * uMousePressed;

      pos = mix(pos, stable, uTransition);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
      gl_PointSize = 4000. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;

      vCoordinates = aCoordinates.xy;
      vPos = pos;
      vMove = uMove;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vCoordinates;
    varying vec3 vPos;
    varying float vMove;
    varying vec2 vUv;

    uniform float uTime;
    // uniform float uMove;
    uniform sampler2D uTexture;
    uniform sampler2D uTexture1;
    uniform sampler2D uMask;

    void main() {
      vec2 myUV = vec2(vCoordinates.x / 512., vCoordinates.y / 512.);
      vec4 maskTexture = texture2D(uMask, gl_PointCoord);
      vec4 tt1 = texture2D(uTexture, myUV);
      vec4 tt2 = texture2D(uTexture1, myUV);

      vec4 final = mix(tt1, tt2, smoothstep(0., 1., fract(vMove)));

      float alpha = 1. - clamp(0., 1., abs(vPos.z / 900.));

      gl_FragColor = final;
      gl_FragColor.a *= maskTexture.r * alpha;
    }  
  `
)

extend({ MathisShaderMaterial })

const Mathis = () => {
  const [mask, ...textures] = useLoader(THREE.TextureLoader, [
    point,
    image,
    image1
  ])
  const { camera } = useThree()

  const moveRef = useRef(0)
  const mouseRef = useRef([2000, 2000])
  const materialRef = useRef()
  const pointsRef = useRef()
  const bufferGeometryRef = useRef()

  function onMouseMove(e) {
    mouseRef.current = [e.point.x, e.point.y]
  }

  function onMouseInteraction(value) {
    gsap.to(materialRef.current, {
      uMousePressed: value,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    })
  }

  function getRange(a, b) {
    let r = Math.random()
    return a + (b - a) * r
  }

  function setBufferAttribute() {
    const num = 512 * 512
    const positions = new THREE.BufferAttribute(new Float32Array(num * 3), 3)
    const coordinates = new THREE.BufferAttribute(new Float32Array(num * 3), 3)
    const offset = new THREE.BufferAttribute(new Float32Array(num), 1)
    const speed = new THREE.BufferAttribute(new Float32Array(num), 1)
    const direction = new THREE.BufferAttribute(new Float32Array(num), 1)
    const press = new THREE.BufferAttribute(new Float32Array(num), 1)
    let index = 0

    for (let i = 0; i < 512; i++) {
      const posX = i - 256
      for (let j = 0; j < 512; j++) {
        positions.setXYZ(index, posX * 2, (j - 256) * 2, 0)
        coordinates.setXYZ(index, i, j, 0)
        offset.setX(index, getRange(-1000, 1000))
        speed.setX(index, getRange(0.4, 1))
        direction.setX(index, Math.random() > 0.5 ? 1 : -1)
        press.setX(index, getRange(0.4, 1))
        index++
      }
    }
    bufferGeometryRef.current.setAttribute('position', positions)
    bufferGeometryRef.current.setAttribute('aCoordinates', coordinates)
    bufferGeometryRef.current.setAttribute('aOffset', offset)
    bufferGeometryRef.current.setAttribute('aSpeed', speed)
    bufferGeometryRef.current.setAttribute('aDirection', direction)
    bufferGeometryRef.current.setAttribute('aPress', press)
  }

  function mouseEffects(e) {
    moveRef.current += e.wheelDeltaY / 4000
  }

  function setMaterialUniforms(clock) {
    const next = Math.floor(moveRef.current + 40) % 2
    const prev = (Math.floor(moveRef.current) + 40 + 1) % 2

    materialRef.current.uTexture = textures[prev]
    materialRef.current.uTexture1 = textures[next]
    materialRef.current.uTime = clock.getElapsedTime()
    materialRef.current.uMove = moveRef.current
    materialRef.current.uMouse = mouseRef.current
  }

  useFrame(({ clock }) => setMaterialUniforms(clock))

  useEffect(() => {
    setBufferAttribute()
    window.addEventListener('mousewheel', mouseEffects)
    return () => window.removeEventListener('mousewheel', mouseEffects)
  }, [])

  return (
    <>
      {/* <OrbitControls camera={camera} /> */}
      <group>
        <points ref={pointsRef}>
          <bufferGeometry ref={bufferGeometryRef} />
          <mathisShaderMaterial
            ref={materialRef}
            side={THREE.DoubleSide}
            uTexture={textures[0]}
            uTexture1={textures[1]}
            uMask={mask}
            transparent={true}
            depthTest={false}
            depthWrite={false}
          />
        </points>
        <mesh
          visible={false}
          onPointerMove={onMouseMove}
          onPointerDown={() => onMouseInteraction(1)}
          onPointerUp={() => onMouseInteraction(0)}
        >
          <planeBufferGeometry args={[2000, 2000]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </>
  )
}

export default Mathis
