import * as THREE from 'three'
import { useMemo, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  RenderPass,
  EffectComposer,
  NormalPass,
  ShaderPass,
  EffectPass,
  BloomEffect
} from 'postprocessing'
import { HalfFloatType } from 'three'
import { dotShader } from '../../shaders/dotShader'

const MidwamEffect = ({
  scale = 1.0,
  angle = 1.57,
  intensity = 3,
  luminanceThreshold = 0.05
}) => {
  const { gl, scene, camera, size } = useThree()

  const composer = useMemo(() => {
    const effectComposer = new EffectComposer(gl, {
      frameBufferType: HalfFloatType
    })
    effectComposer.addPass(new RenderPass(scene, camera))

    const dotsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: null },
        angle: { value: angle },
        scale: { value: scale },
        tSize: { value: new THREE.Vector2(256, 256) },
        center: { value: new THREE.Vector2(256, 256) }
      },
      ...dotShader
    })

    dotsMaterial.map = true

    const bloomPass = new EffectPass(
      camera,
      new BloomEffect({ intensity, luminanceThreshold })
    )

    const normalPass = new NormalPass(scene, camera)
    const dotsPass = new ShaderPass(dotsMaterial, 'tex')

    effectComposer.addPass(normalPass)
    effectComposer.addPass(bloomPass)
    dotsPass.renderToScreen = true
    effectComposer.addPass(dotsPass)

    return effectComposer
  }, [camera, gl, scene])

  useEffect(() => composer.setSize(size.width, size.height), [composer, size])

  return useFrame((_, delta) => {
    // uniforms['time'].value += delta
    composer.render(delta)
  }, 2)
}

export default MidwamEffect
