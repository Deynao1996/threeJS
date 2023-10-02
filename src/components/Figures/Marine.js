import { OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { useRef } from 'react'
import {
  AdditiveBlending,
  CatmullRomCurve3,
  RepeatWrapping,
  TextureLoader,
  Vector3
} from 'three'
import {
  MarineShaderMaterial,
  TubeShaderMaterial,
  GodRayShaderMaterial
} from '../ExtendableShaders/MarineShaders'
import normalMap from '../../resources/maps/sphere-normal.webp'
import dotsMap from '../../resources/maps/dots.jpg'
import stripesMap from '../../resources/maps/stripes.jpeg'
import noiseMap from '../../resources/maps/noise.png'

const { PI, sin, cos } = Math
extend({ MarineShaderMaterial, TubeShaderMaterial, GodRayShaderMaterial })

const Marine = () => {
  const [texture, dotsTexture, stripesTexture, noiseTexture] = useLoader(
    TextureLoader,
    [normalMap, dotsMap, stripesMap, noiseMap]
  )
  // Set the wrap mode for the textures
  dotsTexture.wrapS = dotsTexture.wrapT = RepeatWrapping
  stripesTexture.wrapS = stripesTexture.wrapT = RepeatWrapping
  noiseTexture.wrapS = dotsTexture.wrapT = RepeatWrapping
  const { camera } = useThree()

  return (
    <>
      <OrbitControls camera={camera} />
      <color attach="background" args={[0x05233c]} />
      <Tube uDotsTexture={dotsTexture} uStripesTexture={stripesTexture} />
      <TubePoints uTexture={texture} />
      <GodRayPlane uTexture={noiseTexture} />
    </>
  )
}

const Tube = ({ uDotsTexture, uStripesTexture }) => {
  //Create a curves for the tube using the Catmull-Rom algorithm
  const curves = useMemo(() => {
    const points = []
    for (let i = 0; i <= 100; i++) {
      const angle = (2 * PI * i) / 100
      const x = sin(angle) + 2 * sin(2 * angle)
      const y = cos(angle) - 2 * cos(2 * angle)
      const z = -sin(3 * angle)
      points.push(new Vector3(x, y, z))
    }
    return new CatmullRomCurve3(points)
  }, [])
  const tubesMaterialRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    tubesMaterialRef.current.uTime = time
  })

  return (
    <mesh>
      <tubeGeometry args={[curves, 100, 0.4, 100, true]} />
      <tubeShaderMaterial
        ref={tubesMaterialRef}
        uDotsTexture={uDotsTexture}
        uStripesTexture={uStripesTexture}
        transparent={true}
      />
    </mesh>
  )
}

const TubePoints = ({ count = 50000, uTexture }) => {
  const materialRef = useRef()
  const { positions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const randoms = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = Math.random() - 0.5
      positions[i + 1] = Math.random() - 0.5
      positions[i + 2] = Math.random() - 0.5

      randoms[i] = Math.random()
      randoms[i + 1] = Math.random()
      randoms[i + 2] = Math.random()

      sizes[i] = 0.5 + 0.5 * Math.random()
    }
    return {
      positions,
      randoms,
      sizes
    }
  }, [count])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          itemSize={3}
          array={positions}
        />
        <bufferAttribute
          attach="attributes-randoms"
          count={randoms.length / 3}
          itemSize={3}
          array={randoms}
        />
        <bufferAttribute
          attach="attributes-sizes"
          count={sizes.length}
          itemSize={1}
          array={sizes}
        />
      </bufferGeometry>
      <marineShaderMaterial
        ref={materialRef}
        uTexture={uTexture}
        transparent={true}
        depthWrite={true}
        blending={AdditiveBlending}
      />
    </points>
  )
}

const GodRayPlane = ({ uTexture }) => {
  const godRayRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    godRayRef.current.uTime = time
  })

  return (
    <mesh>
      <planeGeometry args={[15, 15]} />
      <godRayShaderMaterial
        transparent={true}
        uTexture={uTexture}
        ref={godRayRef}
      />
    </mesh>
  )
}

export default Marine
