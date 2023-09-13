import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { CrossWireShaderMaterial } from '../ExtendableShaders/CrossWireShader'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import mapUrl from '../../resources/maps/crosswireMatCap.png'
import scanUrl from '../../resources/img/scan.png'
import { InstancedBufferAttribute, Object3D, TextureLoader } from 'three'

export const crossWireProps = {
  camera: { position: [8, 12, 16], fov: 70, near: 1, far: 100 }
}

extend({ CrossWireShaderMaterial })

const CrossWire = ({ rows = 20 }) => {
  const { size } = useThree()
  const model = useLoader(GLTFLoader, '/crossWireModel/ob1.glb')
  const [map, scan] = useLoader(TextureLoader, [mapUrl, scanUrl])

  const meshRef = useRef()
  const materialRef = useRef()
  const frustumSize = 10
  const aspect = size.width / size.height
  const geo = model?.scene.children[0].geometry.clone()
  geo.computeVertexNormals()

  function setCustomMatrixAt() {
    let dummy = new Object3D(),
      counter = 0,
      randomArr = new Float32Array(rows ** 2)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        randomArr[counter] = Math.random()
        dummy.position.set(i - rows / 2, -10, j - rows / 2)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(counter++, dummy.matrix)
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.geometry.setAttribute(
      'aRandom',
      new InstancedBufferAttribute(randomArr, 1)
    )
  }

  useEffect(() => {
    model && setCustomMatrixAt()
  })

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[8, 12, 16]}
        left={(frustumSize * aspect) / -2}
        right={(frustumSize * aspect) / 2}
        top={frustumSize / 2}
        bottom={frustumSize / -2}
        near={-1000}
        far={1000}
      />
      <OrbitControls />
      <group>
        <instancedMesh args={[geo, null, rows ** 2]} ref={meshRef}>
          <crossWireShaderMaterial
            uMatCap={map}
            uScan={scan}
            ref={materialRef}
          />
        </instancedMesh>
      </group>
    </>
  )
}

export default CrossWire
