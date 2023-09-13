import { OrbitControls, Stats } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import colorsPalette from 'nice-color-palettes'
import { TornadoShaderMaterial } from '../ExtendableShaders/TornadoShader'

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
            <tubeGeometry
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
            <tubeGeometry
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
