import { OrbitControls, shaderMaterial, useAspect } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import barovier from '../../resources/img/portfolio.jpg'

const BarovierShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uAlpha: 1,
    uMouse: new THREE.Vector3(),
    uTexture: new THREE.Texture(),
    uMap: new THREE.Texture(),
    uSize: new THREE.Vector2(),
    uResolution: new THREE.Vector2()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 uSize;
    uniform vec2 uResolution;
    void main() {
      vUv = uv;
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform float uAlpha;
    uniform sampler2D uMap;
    uniform sampler2D uTexture;
    uniform vec3 uMouse;

    void main() {
      vec2 uV = vUv.xy;
      float dist = length(vPosition - uMouse);

      uV.y += sin(uV.y*5. + uTime)*0.01;
      uV.x += sin(uV.x*10. + uTime*0.2)*0.01;

      uV.x = (uV.x - 0.5)*(1.0-uProgress)+0.5;
      
      if(dist < 0.1) {
        // color = vec4(1.0, 0.0, 0.0, 1.0);
        float temp = dist/0.1;
        float abs = 1.0 - temp;
        uV.x += sin(gl_FragColor.y*0.03 + uTime)*abs*0.003;
        uV.y += sin(gl_FragColor.x*0.03 + uTime*0.5)*abs*0.003;
        
        uV.x += sin(gl_FragColor.y*0.07 + uTime)*abs*0.003;
        uV.y += sin(gl_FragColor.x*0.08 + uTime*0.5)*abs*0.003;
        // color *= 2.0 + 1.0 - temp;
      }

      vec4 color = texture2D(uTexture, uV);

      if(dist < 0.1) {
        color *= 1.0 + (1.0 - dist/0.1);
      }

      gl_FragColor = color*uAlpha;
      // gl_FragColor = vec4(dist, dist, dist, 1);
    }  
  `
)

extend({ BarovierShaderMaterial })

const Barovier = () => {
  const [texture] = useLoader(THREE.TextureLoader, [barovier])
  const size = useAspect(1800, 1080)
  const ref = useRef()
  const { camera } = useThree()

  useFrame(({ clock }) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  const onMouseMove = (e) => {
    ref.current.uMouse = [e.point.x * 1.6, e.point.y / 1.6, e.point.z]
  }

  const onMouseClick = (e) => {
    gsap.to(ref.current, {
      duration: 2,
      uProgress: 0.8,
      uAlpha: 0.1
    })
  }

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh onPointerMove={onMouseMove} onClick={onMouseClick} scale={size}>
        <planeBufferGeometry args={[1, 1, 100, 100]} />
        <barovierShaderMaterial ref={ref} uTexture={texture} />
      </mesh>
    </>
  )
}

export default Barovier
