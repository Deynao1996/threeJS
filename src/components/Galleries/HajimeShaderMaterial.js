import {shaderMaterial} from "@react-three/drei"
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import gsap from "gsap"
import {useEffect, useRef} from "react"
import * as THREE from 'three'
import logo from '../../resources/img/fashion.jpg'
import logo2 from '../../resources/img/portfolio.jpg'


const HajimeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uWaveLength: 3,
    uMouseX: 0,
    uMouseY: 0,
    uRatio: 1.0,
    uImage: new THREE.Texture(),
    uResolution: new THREE.Vector2()
  },
  glsl`
    precision mediump float;
  
    varying vec2 vUv;
    varying vec3 vPosition;
    
    uniform float uWaveLength;
    uniform float uTime;
    uniform float uMouseX;
    uniform float uMouseY;
    
    void main() {
      vUv = uv;
      lowp float vWave = sin(uTime+(position.x+position.y)*uWaveLength);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x+uMouseX*0.02, position.y+(uMouseY*0.02), vWave*0.04, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec3 vPosition;
    varying vec2 vUv;
    
    uniform sampler2D uImage;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uMouseX;
    uniform float uMouseY;
    uniform float uRatio;

    void main() {
      vec2 p = 7.68*(gl_FragCoord.xy/uResolution.xy - vec2(0.5, 1.0)) - vec2(uMouseX, -15);
      vec2 i = p;

      float c = 1.0;

      for(int n = 0;n<4;n++) {
        float t = uTime*(1.0 - (10./float(n+10)));
        float ix = i.x + uMouseX;
        float iy = i.y + uMouseY;
        i = vec2(cos(t-ix)+sin(t+iy), sin(t-iy) + cos(t+ix)) + p;
        c += float(n)/length(vec2(p.x/sin(t+ix)/1.1, p.y/cos(t+i.y)/1.1))*20.0;
      }
      c /= 100.;
      c = 1.8 - sqrt(c);


      vec4 color = texture2D(uImage, vUv) * texture2D(uImage, vec2(vUv.x + cos(c)*uMouseX*0.2, vUv.y + cos(c)*uMouseY*0.2)) * 0.75;
      vec4 ct = c*c*c*color;

      gl_FragColor = (ct - color*color - vec4(color.rgb, vPosition.z)) * uRatio;
    }  
  `
)

extend({HajimeShaderMaterial})

const Hajime = () => {
  const [image, image2] = useLoader(THREE.TextureLoader, [logo, logo2])
  const ref = useRef()
  const planeRef = useRef()
  const {camera, pointer, size: {height, width}} = useThree()

  function fitImage() {
    let dist = camera.position.z - planeRef.current.position.z
    let planeHeight = 1
    planeRef.current.position.y = -.2
    camera.fov = 2*(180/Math.PI)*Math.atan(planeHeight/(2*dist)) 
    
    if(width / height > 1) {
      planeRef.current.scale.x = planeRef.current.scale.y = 1.05*width/height 
    }
  }

  function onAnimate() {
    let tl = gsap.timeline()
    
    tl
    .to(ref.current, {
      uWaveLength: 24,
      duration: 0.5
    })
    .to(ref.current, {
      uRatio: 0,
      duration: 0.5,
      onComplete: () => ref.current.uImage = image2
    })
    .to(ref.current, {
      uRatio: 1,
      duration: 0.5
    })
    .to(ref.current, {
      uWaveLength: 3,
      duration: 0.5
    }, '-=0.5')
  }

  useFrame(({clock}) => {
    ref.current.uTime = clock.getElapsedTime()

    gsap.to(ref.current, {
      uMouseX: pointer.x,
      duration: 0.5,
      ease: "power2.out"
    })
    gsap.to(ref.current, {
      uMouseY: pointer.y,
      duration: 0.5,
      ease: "power2.out"
    })
  })

  useEffect(() => {
    fitImage()
    ref.current.uResolution = [width, height]
  }, [])

  
  return (
    <>
      <mesh 
        ref={planeRef} 
        position={[0, -2, 0]} 
        onClick={onAnimate}
      >
        <planeBufferGeometry args={[2, 1, 64, 64]}/>
        <hajimeShaderMaterial 
          ref={ref}
          uImage={image} 
          uWaveLength={3}
        />
      </mesh>
    </>
  )
}

export default Hajime