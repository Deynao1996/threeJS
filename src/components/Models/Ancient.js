import { OrbitControls, useGLTF } from '@react-three/drei'
import { extend, useLoader, useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  TextureLoader,
  Vector3
} from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import { AncientShaderMaterial } from '../ExtendableShaders/AncientShader'
import colorsPalette from 'nice-color-palettes'

import mapCap from '../../resources/maps/matCap.png'

extend({ AncientShaderMaterial })

const Ancient = () => {
  const { nodes } = useGLTF('/ancientModel/scene.gltf')
  const model = useGLTF('/ancientModel/scene.gltf')
  const [texture] = useLoader(TextureLoader, [mapCap])
  const { camera } = useThree()

  const groupRef = useRef()
  const materialRef = useRef()
  const bufferGeometryRef = useRef()

  function setBufferGeometry() {
    const mesh = model.scene.children[0].children[0].children[0]
    const sampler = new MeshSurfaceSampler(mesh)
      .setWeightAttribute('uv')
      .build()

    const number = 50000
    const pointsPos = new Float32Array(number * 3)
    const colors = new Float32Array(number * 3)
    const sizes = new Float32Array(number)
    const normals = new Float32Array(number * 3)
    const color = colorsPalette[Math.floor(Math.random() * 100)]

    for (let i = 0; i < number; i++) {
      let _position = new Vector3()
      let _normal = new Vector3()
      let randomColor = new Color(color[Math.floor(Math.random() * 5)])

      sampler.sample(_position, _normal)
      pointsPos.set([_position.x, _position.y, _position.z], i * 3)
      normals.set([_normal.x, _normal.y, _normal.z], i * 3)
      colors.set([randomColor.r, randomColor.g, randomColor.b], i * 3)
      sizes.set([Math.random()], i)
    }

    bufferGeometryRef.current.setAttribute(
      'position',
      new BufferAttribute(pointsPos, 3)
    )
    bufferGeometryRef.current.setAttribute(
      'color',
      new BufferAttribute(colors, 3)
    )
    bufferGeometryRef.current.setAttribute(
      'size',
      new BufferAttribute(sizes, 1)
    )
    bufferGeometryRef.current.setAttribute(
      'normal',
      new BufferAttribute(normals, 3)
    )
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  useEffect(() => setBufferGeometry(), [])

  return (
    <>
      <OrbitControls camera={camera} />
      <group ref={groupRef} dispose={null} scale={[0.06, 0.06, 0.06]}>
        <group
          rotation={[(3 * Math.PI) / 2, (-Math.PI / 2) * 4, (-Math.PI / 2) * 5]}
        >
          {/* <points geometry={nodes.Object_2.geometry}>
            <ancientShaderMaterial />
          </points> */}
          <points>
            <bufferGeometry ref={bufferGeometryRef} />
            <ancientShaderMaterial
              ref={materialRef}
              transparent={true}
              blending={AdditiveBlending}
              depthTest={false}
              depthWrite={false}
            />
          </points>
          <mesh geometry={nodes.Object_2.geometry}>
            <meshMatcapMaterial
              opacity={0.2}
              matcap={texture}
              // transparent={true}
              // blending={THREE.AdditiveBlending}
              // depthTest={true}
              // depthWrite={true}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}

useGLTF.preload('/ancientModel/scene.gltf')

export default Ancient
