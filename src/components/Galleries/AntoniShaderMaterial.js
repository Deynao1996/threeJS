import {shaderMaterial} from "@react-three/drei"
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import gsap from "gsap"
import {useEffect, useRef} from "react"
import * as THREE from 'three'
import barovier from '../../resources/img/antoni/antoni1.jpg'
import tao from '../../resources/img/antoni/antoni2.jpg'
import lich from '../../resources/img/antoni/antoni3.jpg'

const gallery = [
  barovier,
  lich,
  tao,
]


const AntoniShaderMaterial = shaderMaterial(
  {
    uProgress: 0.0,
    uTexture1: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uResolution: new THREE.Vector2(),
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
    uniform vec2 uResolution;

    void main() {
      vec2 uv = gl_FragCoord.xy/uResolution.xy;
      float p = fract(uProgress);
      float p1 = p - 1.;
      vec2 position = step(0., p)*uv + step(0., -p)*(1.-uv);

      float vert = abs(p*0.3);
      float dx1 = p*0.8;
      dx1 -= step(0.2 - vert, position.x/1.25)*0.3*p;
      dx1 -= step(0.4 - vert, position.x/1.25)*0.3*p;
      dx1 += step(0.6 - vert, position.x/1.25)*0.3*p;
      dx1 += step(0.8 - vert, position.x/1.25)*0.3*p;
      vec4 text1 = texture2D(uTexture1, vec2(vUv.x + dx1, vUv.y));
      float bounds = step(0., 1. - (uv.x/1.25 + p)) * step(0., uv.x/1.25 + p);
      vec4 fcolor = text1*bounds;

      float dx2 = p1*0.8;
      float vert1 = abs(p1*0.3);
      dx2 -= step(0.2 + vert1, position.x/1.25)*0.3*p1;
      dx2 -= step(0.4 + vert1, position.x/1.25)*0.3*p1;
      dx2 += step(0.6 + vert1, position.x/1.25)*0.3*p1;
      dx2 += step(0.8 + vert1, position.x/1.25)*0.3*p1;
      vec4 text2 = texture2D(uTexture2, vec2(vUv.x + dx2, vUv.y));
      float bounds1 = step(0., 1. - (uv.x/1.25 + p1)) * step(0., uv.x/1.25 + p1);
      fcolor += text2*bounds1;

      gl_FragColor = fcolor;
    }  
  `
)

extend({AntoniShaderMaterial})

const Antoni = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(THREE.TextureLoader, gallery)
  const {size: {height, width}} = useThree()


  function customSmoothScroll() {
    positionRef.current += speedRef.current
    speedRef.current *= 0.7
  
    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current
    positionRef.current += dif*0.03

    if (positionRef.current < -2) {
      positionRef.current = gallery.length + 1
    }
    materialRef.current.uProgress = positionRef.current
  }

  function setSliderTextures() {
    let curSlide = (Math.floor(positionRef.current) - 1 + gallery.length)%gallery.length
    let nextSlide = (((Math.floor(positionRef.current) + 1) % gallery.length - 1) + gallery.length)%gallery.length
    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  }

  function handleScroll(e) {
    speedRef.current += e.deltaY*0.003
  }

  useFrame(({clock}) => {
    materialRef.current.uTime = clock.getElapsedTime()
    customSmoothScroll()
    setSliderTextures()

    gsap.set('.dot', {
      y: positionRef.current*200
    })
  })

  useEffect(() => {
    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [])


  return (
    <>
      <mesh ref={planeRef}>
        <planeBufferGeometry args={[2, 1, 64, 64]}/>
        <antoniShaderMaterial 
          ref={materialRef}
          uResolution={[width, height]}
        />
      </mesh>
    </>
  )
}

export default Antoni