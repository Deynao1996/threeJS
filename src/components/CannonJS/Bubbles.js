import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Physics, useSphere, useBox } from '@react-three/cannon'
import { TextureLoader } from 'three'

import cross from '../../resources/img/cross.jpg'

export const bubblesCanvasProps = {
  shadows: true,
  dpr: [1, 2],
  camera: {
    position: [0, 0, 20],
    vof: 35,
    near: 1,
    far: 40
  }
}

const Clump = () => {
  const [texture] = useLoader(TextureLoader, [cross])
  const mat = new THREE.Matrix4()
  const vec = new THREE.Vector3()
  const rfs = THREE.MathUtils.randFloatSpread
  const num = 40

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
  const baubleMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    roughness: 0,
    envMapIntensity: 0.2,
    emissive: 'black'
  })

  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)]
  }))

  useFrame((state) => {
    for (let i = 0; i < num; i++) {
      // Get current whereabouts of the instanced sphere
      ref.current.getMatrixAt(i, mat)
      // api.position.set(state.mouse.x * 10, state.mouse.y * 5, 0)
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        .applyForce(
          vec
            .setFromMatrixPosition(mat)
            .normalize()
            .multiplyScalar(-50)
            .toArray(),
          [0, 0, 0]
        )
    }
  })

  return (
    <instancedMesh
      ref={ref}
      castShadow
      receiveShadow
      args={[null, null, num]}
      geometry={sphereGeometry}
      material={baubleMaterial}
      material-map={texture}
    />
  )
}

const Pointer = () => {
  const viewport = useThree((state) => state.viewport)
  const [, api] = useSphere(() => ({
    type: 'Kinematic',
    args: [3],
    position: [0, 0, 0]
  }))
  return useFrame((state) =>
    api.position.set(
      (state.mouse.x * viewport.width) / 2,
      (state.mouse.y * viewport.height) / 2,
      0
    )
  )
}

const Bubbles = () => {
  return (
    <Physics gravity={[0, 2, 0]} iterations={10}>
      <Pointer />
      <Clump />
    </Physics>
  )
}

export default Bubbles
