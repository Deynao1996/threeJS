import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import particle from '../../resources/img/particle.jpg'
import { GalaxyShaderMaterial } from '../ExtendableShaders/GalaxyShader'

export const galaxyProps = {
  camera: { position: [0, 2, 2], fov: 30 }
}

const circleOptions = [
  {
    minRadius: 0.5,
    maxRadius: 1.5,
    color: '#f7b373',
    particleSize: 1,
    amp: 1
  },
  {
    minRadius: 0.5,
    maxRadius: 1.7,
    color: '#88b3ce',
    particleSize: 0.5,
    amp: 3
  }
]

function lerp(a, b, t) {
  return a * (1 - t) + b * t
}

extend({ GalaxyShaderMaterial })

const Galaxy = () => {
  const { camera } = useThree()
  const [texture] = useLoader(THREE.TextureLoader, [particle])
  const dummyPlane = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const materialsRef = useRef([])
  const sphereRef = useRef()

  function handleMouseMove(e) {
    sphereRef.current.position.copy(e.point)
    materialsRef?.current.forEach((ref) => {
      ref.uMouse = e.point
    })
  }

  useFrame(({ clock }) => {
    materialsRef?.current.forEach((ref) => {
      ref.uTime = clock.getElapsedTime()
    })
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerMove={handleMouseMove}
      >
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshBasicMaterial color={0xff0000} wireframe={true} />
      </mesh>
      <mesh ref={sphereRef} visible={false}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={0xff0000} wireframe={true} />
      </mesh>
      <group>
        {circleOptions.map((config, i) => (
          <Circle
            key={i}
            dummyPlane={dummyPlane}
            texture={texture}
            ref={(el) => (materialsRef.current[i] = el)}
            {...config}
          />
        ))}
      </group>
    </>
  )
}

const Circle = React.forwardRef(
  (
    {
      count = 1000,
      minRadius = 0.5,
      maxRadius = 1,
      color = '#f7b373',
      particleSize = 1,
      amp = 1,
      dummyPlane,
      texture
    },
    ref
  ) => {
    const geometryRef = useRef()

    function prepareGeometry(count) {
      geometryRef.current.instanceCount = count
      geometryRef.current.setAttribute(
        'position',
        dummyPlane.getAttribute('position')
      )
      geometryRef.current.index = dummyPlane.index
    }

    function setBufferPosition(count, minRadius, maxRadius) {
      let pos = new Float32Array(count * 3)

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI
        const r = lerp(minRadius, maxRadius, Math.random())

        const x = r * Math.sin(theta)
        const y = (Math.random() - 0.5) * 0.1
        const z = r * Math.cos(theta)

        pos.set([x, y, z], i * 3)
      }
      geometryRef.current.setAttribute(
        'aPosition',
        new THREE.InstancedBufferAttribute(pos, 3, false)
      )
    }

    useEffect(() => void prepareGeometry(count), [count])

    useEffect(
      () => void setBufferPosition(count, minRadius, maxRadius),
      [count, minRadius, maxRadius]
    )

    return (
      <mesh>
        <instancedBufferGeometry ref={geometryRef} />
        <galaxyShaderMaterial
          ref={ref}
          side={THREE.DoubleSide}
          uTexture={texture}
          uColor={color}
          uAmp={amp}
          uSize={particleSize}
          transparent={true}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    )
  }
)

export default Galaxy
