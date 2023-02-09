import {shaderMaterial} from "@react-three/drei"
import {extend, reconciler, useFrame, useLoader, useThree} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import gsap from "gsap"
import {useEffect, useRef} from "react"
import * as THREE from 'three'
import artas from '../../resources/img/warckraft.jpg'
import warckraftMap from '../../resources/img/warckraftMap.jpg'
import warckraftPrallax from '../../resources/img/warckraftParallax.jpg'

const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uMouseX: 0,
    uTexture: new THREE.Texture(),
    uMap: new THREE.Texture(),
    uSize: new THREE.Vector2(),
    uResolution: new THREE.Vector2(),
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 uSize;
    uniform vec2 uResolution;
    void main() {
      vUv = uv;

      gl_Position = vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uMap;
    uniform sampler2D uTexture;
    uniform float uMouseX;

    void main() {
      float m = (uMouseX - 0.5)*0.001;
      float distort = sin(vUv.y * 50.0 + uTime) * 0.001;
      float map = texture2D(uMap, vUv).r;
      vec4 color = texture2D(uTexture, vec2(vUv.x + 10.0*map*distort, vUv.y));

      gl_FragColor = vec4(color.rgb, 1.0);
    }  
  `
)

extend({WaveShaderMaterial})

const Wave = () => {
  const [texture, textureMap, textureParallax] = useLoader(THREE.TextureLoader, [artas, warckraftMap, warckraftPrallax])
  const ref = useRef()

  useFrame(({clock, mouse}) => {
    const time = clock.getElapsedTime()
    const {x} = mouse
    ref.current.uTime = time
    gsap.to(ref.current, {
      duration: 2,
      uMouseX: x
    })
  })

  
  return (
    <>
      <mesh>
        <planeBufferGeometry args={[2, 2]}/>
        <waveShaderMaterial 
          ref={ref}
          uTexture={texture} 
          uMap={textureMap}
        />
      </mesh>
    </>
  )
}

export default Wave