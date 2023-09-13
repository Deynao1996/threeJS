import { CubeCamera, OrbitControls } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  MonopoShaderMaterial,
  SphereShaderMaterial
} from '../ExtendableShaders/MonopoShaders'
import { DoubleSide } from 'three'

extend({ MonopoShaderMaterial, SphereShaderMaterial })

const Monopo = () => {
  const { camera } = useThree()
  // const [ image, disp ] = useLoader(TextureLoader, [logo, displacement])
  const materialRef = useRef()
  const sphereMaterialRef = useRef()

  function renderInternalSphere(texture) {
    return (
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <sphereShaderMaterial
          // wireframe={true}
          side={DoubleSide}
          uCube={texture}
          ref={sphereMaterialRef}
        />
      </mesh>
    )
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <group>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <monopoShaderMaterial
            // wireframe={true}
            side={DoubleSide}
            ref={materialRef}
          />
        </mesh>
        <CubeCamera resolution={128} near={0.01} far={100}>
          {renderInternalSphere}
        </CubeCamera>
      </group>
    </>
  )
}

export default Monopo
