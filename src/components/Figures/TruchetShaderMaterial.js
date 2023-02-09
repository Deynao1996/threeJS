import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import gsap from 'gsap'
import { useEffect } from 'react'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export const truchetProps = {
  camera: { position: [0, 0, -4], fov: 70 },
  style: { zIndex: 110 }
}

const animationConfig = {
  duration: 12,
  repeat: -1,
  ease: 'none'
}

const TruchetShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0
  },
  glsl`
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uProgress;

    void main() {
      vUv = uv;
      vec3 newPos = position;

      newPos += 0.276 * normal * (4. * vUv.x - 0.03);

      vPosition = newPos;
      vNormal = normal;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform float uTime;
    uniform float uProgress;

    float Hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    void main() {
      float pi = 3.1415926;
      float angle = (atan(vPosition.y, vPosition.x) + pi) / (2. * pi);
      
      vec2 newUV = 6. * vec2(7. * angle + 6. * uProgress, vUv.y * 5. - 3. * uProgress);
      vec2 gUV = fract(newUV) - 0.5;
      vec2 id = mod(floor(newUV), vec2(6., 6.));

      float n = Hash21(id);
      gUV.x *= 2. * step(0.5, n) - 1.;

      float diff = clamp(dot(vec3(1., 2., 1.), vNormal), 0.3, 1.);

      float d = abs(abs(gUV.x + gUV.y) - 0.5);
      float mask = smoothstep(-0.01, 0.01, d - 0.3);

      if (mask < 0.0001) discard;

      gl_FragColor = vec4(vec3(mask) * diff, mask);

      if (!gl_FrontFacing) {
        gl_FragColor.a *= 0.2;
      }
    }  
  `
)

extend({ TruchetShaderMaterial })

const Truchet = ({ num = 1000 }) => {
  const { camera } = useThree()
  const materialRef = useRef()
  const tubeRef = useRef()

  const path = useMemo(() => {
    const dots = []
    for (let i = 0; i < num; i++) {
      const amount = i / num
      const angle = -80 + 120 * amount
      const k = 0.05

      const x = 0.3 * Math.exp(k * angle) * Math.sin(0.25 * angle)
      const y = 0.3 * Math.exp(k * angle) * Math.cos(0.25 * angle)
      const z = Math.cos(0)

      dots.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(dots)
  }, [num])

  function rotateMesh() {
    return gsap.fromTo(
      tubeRef.current.rotation,
      {
        z: 2 * Math.PI * 0
      },
      {
        z: 2 * Math.PI * 1,
        ...animationConfig
      }
    )
  }

  function animateUniform() {
    return gsap.fromTo(
      materialRef.current,
      {
        uProgress: 0
      },
      {
        uProgress: 1,
        ...animationConfig
      }
    )
  }

  useEffect(() => {
    const rotationAnimation = rotateMesh()
    const uniformAnimation = animateUniform()
    return () => {
      rotationAnimation.kill()
      uniformAnimation.kill()
    }
  }, [])

  // useFrame(({ clock }) => {
  //   materialRef.current.transparent = true
  // })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh ref={tubeRef}>
        <tubeGeometry args={[path, 1000, 0.01, 30, false]} />
        <truchetShaderMaterial
          ref={materialRef}
          side={THREE.DoubleSide}
          transparent={new Boolean(true)}
        />
      </mesh>
    </>
  )
}

export default Truchet
