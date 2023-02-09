import {shaderMaterial} from "@react-three/drei"
import {extend, useFrame, useLoader} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import {useRef} from "react"
import * as THREE from 'three'
import logo from '../../resources/img/firstImage.jpg'
import displacement from '../../resources/img/displacement1.jpg'
import gsap from "gsap"

const ImageShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new THREE.Texture(),
    uDisplacement: new THREE.Texture()
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
    uniform float uProgress;
    uniform sampler2D uDisplacement;
    uniform sampler2D uImage;

    void main() {
      vec4 displace = texture2D(uDisplacement, vUv.yx);
      vec2 displacedUV = vec2(vUv.x, vUv.y);

      displacedUV.y = mix(vUv.y, displace.r - 0.2, 0.);

      vec4 color = texture2D(uImage, displacedUV);
      
      color.r = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.005) * uProgress).r;
      color.g = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.01) * uProgress).g;
      color.b = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.02) * uProgress).b;
      gl_FragColor = color;
    }  
  `
)

extend({ImageShaderMaterial})

const Image = () => {
  const [image, disp] = useLoader(THREE.TextureLoader, [logo, displacement])
  const ref = useRef()

  useFrame(({clock}) => {
    ref.current.uTime = clock.getElapsedTime()
  })

  const onMouseLeave = () => {
    gsap.fromTo(ref.current, 
      {
        uProgress: 0.4
      },
      {
        uProgress: 0.0,
        duration: .5
      })
  }
  
  const onMouseEnter = () => {
    gsap.fromTo(ref.current, 
      {
        uProgress: 0.0
      },
      {
        uProgress: 0.4,
        duration: .5
      })
  }

  
  return (
    <>
      {/* <pointLight position={[10, 10, 10]}/> */}
      <mesh 
        onPointerEnter={onMouseEnter}
        onPointerLeave={onMouseLeave}
      >
        <planeBufferGeometry args={[0.4, 0.6, 100, 100]}/>
        <imageShaderMaterial 
          ref={ref}
          uProgress={0.0}
          uColor='hotpink' 
          uImage={image} 
          uDisplacement={disp}
        />
      </mesh>
    </>
  )
}

export default Image