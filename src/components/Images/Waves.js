import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import {
  createPortal,
  extend,
  useFrame,
  useLoader,
  useThree
} from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { WavesShaderMaterial } from '../ExtendableShaders/WavesShader'

import brush from '../../resources/img/waves/brush.png'
import ocean from '../../resources/img/waves/waves.jpg'

extend({ WavesShaderMaterial })

const Waves = () => {
  const [texture, image] = useLoader(TextureLoader, [brush, ocean])
  const {
    size: { width, height },
    gl,
    camera
  } = useThree()

  const max = 100
  const currentWaveRef = useRef(0)
  const materialRef = useRef()
  const brushesRef = useRef([])
  const prevMouseRef = useRef([0, 0])

  const [scene, target] = useMemo(() => createScene(), [])
  const brushes = useMemo(() => renderBrushes(), [])

  function createScene() {
    const scene = new THREE.Scene()
    const target = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      stencilBuffer: false
    })
    return [scene, target]
  }

  function renderTarget() {
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    materialRef.current.uMask = target.texture
  }

  function setNewWave(x, y, index) {
    const mesh = brushesRef.current[index]
    mesh.visible = true
    mesh.material.opacity = 0.5
    mesh.position.x = (x * width) / 2
    mesh.position.y = (y * height) / 2
    mesh.scale.x = mesh.scale.y = 0.2
  }

  function trackMousePos({ x, y }) {
    if (
      Math.abs(x - prevMouseRef.current[0]) < 0.05 &&
      Math.abs(y - prevMouseRef.current[1]) < 0.05
    ) {
      return
    } else {
      setNewWave(x, y, currentWaveRef.current)
      currentWaveRef.current = (currentWaveRef.current + 1) % 50
    }

    prevMouseRef.current[0] = x
    prevMouseRef.current[1] = y
  }

  function updateBrushes() {
    brushesRef.current.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.05
        mesh.material.opacity *= 0.96
        mesh.scale.x = 0.982 * mesh.scale.x + 0.108
        mesh.scale.y = mesh.scale.x

        if (mesh.material.opacity < 0.0009) mesh.visible = false
      }
    })
  }

  function renderBrushes() {
    const arr = []

    for (let i = 0; i < max; i++) {
      arr.push(
        <CustomMesh i={i} texture={texture} brushesRef={brushesRef} key={i} />
      )
    }
    return arr
  }

  useFrame(({ mouse }) => {
    trackMousePos(mouse)
    updateBrushes()
    renderTarget()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <OrthographicCamera makeDefault position={[0, 0, 2]} />
      <group>
        <mesh>
          <planeGeometry args={[width, height, 1, 1]} />
          <wavesShaderMaterial
            ref={materialRef}
            uTexture={texture}
            uImage={image}
            transparent={true}
          />
        </mesh>
        {createPortal(brushes, scene)}
      </group>
    </>
  )
}

const CustomMesh = ({ i, brushesRef, texture }) => {
  const randomRotation = 2 * Math.PI * Math.random()

  return (
    <mesh
      rotateZ={randomRotation}
      ref={(el) => (brushesRef.current[i] = el)}
      visible={false}
    >
      <planeGeometry args={[64, 64, 1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

export default Waves
