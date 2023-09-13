import * as THREE from 'three'
import glsl from 'babel-plugin-glsl/macro'
import { useMemo, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  RenderPass,
  EffectComposer,
  NormalPass,
  ShaderPass
} from 'postprocessing'
import { HalfFloatType } from 'three'
import { transitionShader } from '../../shaders/transitionShader'
import { rgbaShader } from '../../shaders/rgbaShader'

const ForestEffect = ({ uniforms }) => {
  const { gl, scene, camera, size } = useThree()

  const composer = useMemo(() => {
    const effectComposer = new EffectComposer(gl, {
      frameBufferType: HalfFloatType
    })
    effectComposer.addPass(new RenderPass(scene, camera))

    const transitionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms
      },
      ...transitionShader
    })

    const RGBAMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms
      },
      ...rgbaShader
    })

    RGBAMaterial.map = true
    transitionMaterial.map = true

    const normalPass = new NormalPass(scene, camera)
    const RGBAPass = new ShaderPass(RGBAMaterial, 'tex')
    const transitionPass = new ShaderPass(transitionMaterial, 'tex')

    effectComposer.addPass(normalPass)
    effectComposer.addPass(transitionPass)

    RGBAPass.renderToScreen = true
    effectComposer.addPass(RGBAPass)

    return effectComposer
  }, [camera, gl, scene])

  useEffect(() => composer.setSize(size.width, size.height), [composer, size])

  return useFrame((_, delta) => {
    uniforms['time'].value += delta
    composer.render(delta)
  }, 2)
}

export default ForestEffect
