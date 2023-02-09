import {OrbitControls, shaderMaterial} from "@react-three/drei"
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import gsap from "gsap"
import {useRef, useEffect} from "react"
import * as THREE from 'three'
import img1 from '../../resources/img/deburis/deburis1.jpg'
import img2 from '../../resources/img/deburis/deburis2.jpg'
import img3 from '../../resources/img/deburis/deburis3.jpg'

const gallery = [
  img1,
  img2,
  img3
]


const DeburisShaderMaterial = shaderMaterial(
  {
    uProgress: 0.0,
    uTexture1: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uResolution: new THREE.Vector2(),
    uCameraRotation: new THREE.Vector2(0, 0),
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
    uniform vec2 uCameraRotation;

    vec2 warp(vec2 pos, vec2 amplitude) {
      pos = pos * 2.0 - 1.0;
      pos.x *= 1.0 - (pos.y*pos.y)*amplitude.x * 0.2;
      pos.y *= 1.0 + (pos.x*pos.x)*amplitude.y;
      return pos*0.5 + 0.5;
    }

    void main() {
      vec2 warpedUV = warp(vUv, vec2(-0.7));
      vec2 center = (gl_FragCoord.xy/uResolution) - vec2(0.6);
      float p = fract(uProgress);

      float len = length(center);

      float vignette = 1. - smoothstep(0.5, 0.75, len);

      vec2 uvCurrent = vec2(
        warpedUV.x + p*0.8 + uCameraRotation.x, 
        warpedUV.y - p*0.5 - uCameraRotation.y
      );
      vec2 uvNext = vec2(
        warpedUV.x - (1. - p) + uCameraRotation.x, 
        warpedUV.y + (1. - p)*0.3 - uCameraRotation.y
      );

      vec4 imgCurrent = texture2D(uTexture1, uvCurrent);
      vec4 imgNext = texture2D(uTexture2, uvNext);

      vec3 colorCurrent = imgCurrent.rgb*(1. - p);
      vec3 colorNext = imgNext.rgb*p;

      gl_FragColor = vec4(colorCurrent + colorNext, 1.);
      gl_FragColor.rgb = mix(gl_FragColor.rgb*0.5, gl_FragColor.rgb, vignette);
    }  
  `
)

extend({DeburisShaderMaterial})

const Deburis = () => {
  const materialRef = useRef()
  const planeRef = useRef()
  const speedRef = useRef(0)
  const positionRef = useRef(0)
  const textures = useLoader(THREE.TextureLoader, gallery)
  const {size: {height, width}, camera, pointer} = useThree()

  function handleScroll(e) {
    speedRef.current += e.deltaY*0.003
  }

  function customSmoothScroll() {
    positionRef.current += speedRef.current
    speedRef.current *= 0.7
  
    let i = Math.round(positionRef.current)
    let dif = i - positionRef.current
    positionRef.current += dif*0.03
    materialRef.current.uProgress = positionRef.current
  }

  function setSliderTextures() {
    let curSlide = ((Math.floor(positionRef.current) - 1) % gallery.length + gallery.length) % gallery.length
    let nextSlide = ((curSlide + 1) % gallery.length + gallery.length) % gallery.length
    materialRef.current.uTexture1 = textures[curSlide]
    materialRef.current.uTexture2 = textures[nextSlide]
  }

  useFrame(({clock}) => {
    customSmoothScroll()
    setSliderTextures()

    gsap.to(materialRef.current.uCameraRotation, {
      x: pointer.x/50,
      y: pointer.y/50,
      duration: 3,
      ease: "power2.out"
    })
  })

  useEffect(() => {
    planeRef.current.rotation.y = -Math.PI/2
    materialRef.current.side = THREE.BackSide
    
    window.addEventListener('wheel', handleScroll)
    return () => window.removeEventListener('wheel', handleScroll)
  }, [])


  return (
    <>
      <OrbitControls camera={camera}/>
      <mesh ref={planeRef}>
        <cylinderGeometry args={[10, 10, 30, 30, 1, 1, 0, Math.PI]}/>
        <deburisShaderMaterial
          ref={materialRef}
          uResolution={[width, height]}
          uTexture1={textures[0]}
          uTexture2={textures[1]}
        />
      </mesh>
    </>
  )
}

export default Deburis