import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useRef } from 'react'
import * as THREE from 'three'

const TemplateShaderMaterial = shaderMaterial(
  {
    uTime: 0
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

    uniform float uTime;

    void main() {
      gl_FragColor = vec4(vUv, 0., 1.);
    }  
  `
)

extend({ TemplateShaderMaterial })

const Template = () => {
  const { camera } = useThree()
  const materialRef = useRef()

  // useFrame(({ clock }) => {
  //   materialRef.current.uTime = clock.getElapsedTime()
  // })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh>
        <planeBufferGeometry args={[1, 1, 1, 1]} />
        <templateShaderMaterial ref={materialRef} />
      </mesh>
    </>
  )
}

export default Template
