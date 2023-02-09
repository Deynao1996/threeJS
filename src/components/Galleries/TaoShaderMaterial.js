import {Scroll, shaderMaterial, useScroll} from "@react-three/drei"
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import gsap from "gsap"
import {useEffect, useRef, useState} from "react"
import * as THREE from 'three'
import barovier from '../../resources/img/portfolio.jpg'
import tao from '../../resources/img/fashion.jpg'
import lich from '../../resources/img/lichKing.jpg'
import bg from '../../resources/img/background.jpg'

const gallery = [
  barovier,
  tao,
  lich,
  bg
]

const TaoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uTexture1: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uAccel: new THREE.Vector2(0.5, 2),
    uResolution: new THREE.Vector2(),
    uRate1: new THREE.Vector2(1, 1),
  },
  glsl`
    varying vec2 vUv;
    varying vec2 vUv1;
    
    uniform vec3 uRate1;

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uAccel;

    vec2 mirrored(vec2 v) {
      vec2 m = mod(v, 2.);
      return mix(m, 2.0 - m, step(1.0, m));
    }
    
    float tri(float p) {
      return mix(p, 1.0 - p, step(0.5, p))* 2.;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy/uResolution.xy;

      float p = fract(uProgress);
      float delayValue = p*7. - uv.y*2. + (uv.x - 2.);

      delayValue = clamp(delayValue, 0., 1.);

      vec2 translateValue = p + delayValue*uAccel;
      vec2 translateValue1 = vec2(-0.5, 1.) * translateValue;
      vec2 translateValue2 = vec2(-0.5, 1.) * (translateValue - 1. - uAccel);

      vec2 w = sin(sin(uTime)*vec2(0, 0.3)+vUv.yx*vec2(0,4.))*vec2(0, 0.5);
      vec2 xy = w*(tri(p)*0.5 + tri(delayValue)*0.5);

      vec2 uv1 = vUv + translateValue1 + xy;
      vec2 uv2 = vUv + translateValue2 + xy;

      vec4 rgba1 = texture2D(uTexture1, mirrored(uv1));
      vec4 rgba2 = texture2D(uTexture2, mirrored(uv2));

      vec4 rgba = mix(rgba1, rgba2, delayValue);

      gl_FragColor = rgba;
    }  
  `
)

extend({TaoShaderMaterial})

const Tao = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(THREE.TextureLoader, gallery)
  const {size: {height, width}} = useThree()


  useFrame(({clock}) => {
    materialRef.current.uTime = clock.getElapsedTime()
    positionRef.current += speedRef.current
    speedRef.current *= 0.7

    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current

    positionRef.current += dif*0.03
    
    gsap.set('.dot', {
      y: positionRef.current*200
    })

    materialRef.current.uProgress = positionRef.current

    let curSlide = Math.floor(positionRef.current)
    let nextSlide = (Math.floor(positionRef.current) + 1) % gallery.length

    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  })

  useEffect(() => {
    window.addEventListener('wheel', (e) => {
      speedRef.current += e.deltaY*0.003
    })
  }, [])


  return (
    <>
      <mesh ref={planeRef}>
        <planeBufferGeometry args={[2, 1, 64, 64]}/>
        <taoShaderMaterial 
          ref={materialRef}
          uResolution={[width, height]}
        />
      </mesh>
    </>
  )
}

export default Tao