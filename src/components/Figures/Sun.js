import { CubeCamera, OrbitControls } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  SunShaderMaterial,
  PerlinShaderMaterial,
  AroundShaderMaterial
} from '../ExtendableShaders/SunShaders'
import { DoubleSide } from 'three'

extend({ SunShaderMaterial, PerlinShaderMaterial, AroundShaderMaterial })

const Sun = () => {
  const { camera } = useThree()
  // const [image, disp] = useLoader(THREE.TextureLoader, [logo, displacement])
  const sunMaterialRef = useRef()
  const perlinMaterialRef = useRef()
  const aroundMaterialRef = useRef()

  function renderSunTexture(texture) {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[1, 30, 30]} />
          <sunShaderMaterial
            // wireframe={true}
            side={DoubleSide}
            uPerlin={texture}
            ref={sunMaterialRef}
          />
        </mesh>
      </group>
    )
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    sunMaterialRef.current.uTime = perlinMaterialRef.current.uTime = time
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <group>
        <mesh>
          <sphereGeometry args={[0.5, 30, 30]} />
          <perlinShaderMaterial ref={perlinMaterialRef} side={DoubleSide} />
        </mesh>
        {/* <mesh>
          <sphereGeometry args={[1.2, 30, 30]}/>
          <aroundShaderMaterial 
            // wireframe={true}
            // transparent={true}
            side={THREE.BackSide}
            ref={aroundMaterialRef}
          />
        </mesh> */}
        <CubeCamera resolution={128} near={0.01} far={100}>
          {renderSunTexture}
        </CubeCamera>
      </group>
    </>
  )
}

export default Sun
