import { Float, OrbitControls, useAspect } from '@react-three/drei'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'

import t0 from '../../resources/img/forest/t0.jpg'
import t1 from '../../resources/img/forest/t1.jpg'
import t2 from '../../resources/img/forest/t2.jpg'
import mask from '../../resources/img/forest/mask.jpg'
import { EffectComposer } from '@react-three/postprocessing'
import ForestEffect from '../Effects/ForestEffect'

const gallery = [t0, t1, t2]

export const forestCanvasProps = {
  camera: { position: [0, 0, 7], fov: 35 },
  linear: true
}

const uniforms = {
  tex: { value: null },
  time: { value: 0.0 },
  progress: { value: 0.0 }
}

const Forest = () => {
  const { camera } = useThree()
  const size = useAspect(1920, 1080)
  const textures = useLoader(THREE.TextureLoader, gallery)
  const maskTexture = useLoader(THREE.TextureLoader, mask)

  const groupsRef = useRef([])
  const mouseTargetRef = useRef(new THREE.Vector2())
  const layersCount = 3
  const isEffect = false

  function handlePointerMove({ pointer }) {
    mouseTargetRef.current.lerp(pointer, 0.1)
    groupsRef.current.forEach(rotateGroup)
  }

  function rotateGroup(group) {
    group.rotation.x = mouseTargetRef.current.y * 0.1
    group.rotation.y = -mouseTargetRef.current.x * 0.1
  }

  function animateEffects(tl) {
    tl.to(
      uniforms.progress,
      {
        value: 1,
        duration: 1,
        ease: 'power3.inOut'
      },
      0
    )
    tl.to(
      uniforms.progress,
      {
        value: 0,
        duration: 1,
        ease: 'power3.inOut'
      },
      1
    )
  }

  function handleAnimate() {
    const tl = gsap.timeline()
    tl.to(camera.position, {
      x: 10,
      duration: 1.5,
      ease: 'power4.inOut'
    })
    tl.to(
      camera.position,
      {
        z: 6,
        duration: 1,
        ease: 'power4.inOut'
      },
      0
    )
    tl.to(
      camera.position,
      {
        z: 7,
        duration: 1,
        ease: 'power4.inOut'
      },
      1
    )
    if (isEffect) animateEffects(tl)
  }

  return (
    <>
      {textures.map((t, i) => (
        <group
          onPointerMove={handlePointerMove}
          ref={(el) => (groupsRef.current[i] = el)}
          key={i}
          position={[i * 10, 0, 0]}
        >
          {[...new Array(layersCount)].map((_, j) => {
            return j > 0 ? (
              <Float speed={1} rotationIntensity={0.1} key={j}>
                <mesh scale={size} position={[0, 0, j]} onClick={handleAnimate}>
                  <planeGeometry args={[1, 1, 1, 1]} />
                  <meshBasicMaterial
                    side={THREE.DoubleSide}
                    map={t}
                    transparent={true}
                    alphaMap={maskTexture}
                  />
                </mesh>
              </Float>
            ) : (
              <mesh scale={size} position={[0, 0, j]} key={j}>
                <planeGeometry args={[1, 1, 1, 1]} />
                <meshBasicMaterial side={THREE.DoubleSide} map={t} />
              </mesh>
            )
          })}
        </group>
      ))}
      {isEffect && (
        <EffectComposer multisampling={0.5}>
          <ForestEffect uniforms={uniforms} />
        </EffectComposer>
      )}
    </>
  )
}

export default Forest
