import { Effects } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { triColorShader } from '../../shaders/triColorShader'

extend({
  ShaderPass,
  SavePass,
  RenderPass
})

const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

const triColorMix = triColorShader

export const Post = () => {
  const composer = useRef()
  const blendPass = useRef()
  const savePass = useRef()
  const swap = useRef(false)

  const { scene, gl, size, camera } = useThree()
  const { rtA, rtB } = useMemo(() => {
    const rtA = new THREE.WebGLRenderTarget(size.width, size.height)
    const rtB = new THREE.WebGLRenderTarget(size.width, size.height)
    return { rtA, rtB }
  }, [size])

  useEffect(
    () => void composer.current.setSize(size.width, size.height),
    [size]
  )

  useFrame(() => {
    // Swap render targets and update dependencies
    let delay1 = swap.current ? rtB : rtA
    let delay2 = swap.current ? rtA : rtB
    savePass.current.renderTarget = delay2
    blendPass.current.uniforms['tDiffuse2'].value = delay1.texture
    blendPass.current.uniforms['tDiffuse3'].value = delay2.texture
    swap.current = !swap.current
    composer.current.render()
  }, 1)

  return (
    <Effects ref={composer} args={[gl]} multisamping={0.1} disableGamma>
      <renderPass attach="passes" scene={scene} camera={camera} />
      <shaderPass
        attach="passes"
        ref={blendPass}
        args={[triColorMix, 'tDiffuse1']}
        needsSwap={false}
      />
      <savePass attachArray="passes" ref={savePass} needsSwap={true} />
      <shaderPass attachArray="passes" args={[CopyShader]} />
    </Effects>
  )
}

const Dave = ({ count = 10000 }) => {
  const ref = useRef()

  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()
    const positions = [...Array(count)].map((_, i) => {
      const position = new THREE.Vector3()
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50
      position.y += (i % 2) * 0.5
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })

    const right = new THREE.Vector3(1, 0, 0)
    const distances = positions.map(
      (pos) => pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5
    )
    return { vec, transform, positions, distances }
  }, [])

  useFrame(({ clock }) => {
    for (let i = 0; i < 10000; ++i) {
      const t = clock.elapsedTime - distances[i] / 80
      const wave = roundedSquareWave(t, 0.1, 1, 1 / 3)
      const scale = 1 + wave * 0.3

      vec.copy(positions[i]).multiplyScalar(scale)
      transform.setPosition(vec)
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {/* <OrbitControls /> */}
      {/* <OrthographicCamera makeDefault zoom={30} position={[0, 0, 0.1]} /> */}
      <Post />
      <group position={[0, 0, -20]}>
        <instancedMesh args={[null, null, count]} ref={ref}>
          <circleGeometry args={[0.15]} />
          <meshBasicMaterial />
        </instancedMesh>
      </group>
    </>
  )
}

export default Dave
