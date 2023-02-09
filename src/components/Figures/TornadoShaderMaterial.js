import { OrbitControls, shaderMaterial, Stats } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useRef } from 'react'
import { useEffect } from 'react'
import gsap from 'gsap'
import colorsPalette from 'nice-color-palettes'

const palette = colorsPalette[Math.floor(Math.random() * 100)]

const params = {
  extrustionSegments: 400,
  radiusSegments: 16,
  closed: false,
  precision: 100,
  rad: 80,
  scale: 4,
  thickness: 0.5
}

const TornadoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 1.0,
    uOffset: 0,
    uColor: new THREE.Color('#000000')
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
    uniform float uOffset;
    uniform vec3 uColor;

    float quarticOut(float t) {
      return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    }

    void main() {
      float localProgress = mod(uProgress * 2. + uOffset * 2., 2.);
      localProgress = quarticOut(localProgress / 2.) * 2.;

      if (vUv.x > localProgress || vUv.x + 1. < localProgress) discard;

      gl_FragColor = vec4(uColor, 1.);
    }  
  `
)

extend({ TornadoShaderMaterial })

const Tornado = ({ num = 250 }) => {
  const { camera, scene } = useThree()
  const tubesMaterialRef = useRef([])
  const shadowsMaterialRef = useRef([])
  scene.rotation.z = Math.PI / 9

  function range(min, max) {
    return min + Math.random() * (max - min)
  }

  const tubes = useMemo(() => {
    return [...new Array(num)].map((_, i) => {
      const spline = []
      const level = range(-300, 300)
      const zero = level / 300
      const rad = 130 * zero * zero + Math.random() * 20
      const width = Math.random() * 0.5 + 0.5
      const offset = Math.abs(zero)
      const angle = range(0, 2 * Math.PI)
      const center = {
        x: range(-10, 10),
        y: range(-10, 10)
      }

      for (let j = 0; j <= params.precision * width; j++) {
        const x =
          center.x + rad * Math.sin((Math.PI * 2 * j) / params.precision)
        const z =
          center.y + rad * Math.cos((Math.PI * 2 * j) / params.precision)
        spline.push(new THREE.Vector3(x, level, z))
      }

      const sampleClosedSpline = new THREE.CatmullRomCurve3(spline)

      return (
        <group key={i}>
          <mesh scale={[0.01, 0.01, 0.01]} rotation={[0, angle, 0]}>
            <tubeBufferGeometry
              attach="geometry"
              args={[
                sampleClosedSpline,
                params.extrustionSegments,
                params.thickness,
                params.radiusSegments,
                params.closed
              ]}
            />
            <tornadoShaderMaterial
              side={THREE.DoubleSide}
              // uColor={new THREE.Color(palette[Math.floor(Math.random() * 5)])}
              uColor={new THREE.Color('#ffffff')}
              uOffset={offset}
              ref={(el) => (tubesMaterialRef.current[i] = el)}
            />
          </mesh>
          <mesh scale={[0.01, 0.01, 0.01]} rotation={[0, angle, 0]}>
            <tubeBufferGeometry
              attach="geometry"
              args={[
                sampleClosedSpline,
                params.extrustionSegments,
                params.thickness + 0.5,
                params.radiusSegments,
                params.closed
              ]}
            />
            <tornadoShaderMaterial
              uOffset={offset}
              side={THREE.BackSide}
              ref={(el) => (shadowsMaterialRef.current[i] = el)}
            />
          </mesh>
        </group>
      )
    })
  }, [num])

  function animateIt(refsArr) {
    refsArr.current.forEach((item) => {
      gsap.fromTo(
        item,
        {
          uProgress: 0
        },
        {
          uProgress: 1,
          duration: 2,
          repeat: -1,
          ease: 'none'
        }
      )
    })
  }

  useEffect(() => {
    animateIt(tubesMaterialRef)
    animateIt(shadowsMaterialRef)
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <group>{tubes}</group>
    </>
  )
}

export default Tornado
