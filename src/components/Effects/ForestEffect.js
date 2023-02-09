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
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
      fragmentShader: glsl`
        uniform float progress;
        uniform sampler2D tex;

        varying vec2 vUv;

        void main() {
          vec2 p = vUv;
    
          if(p.x < 0.25) {
    
          } else if(p.x < 0.5) {
            p.x = p.x - 0.25 * progress;
          } else if(p.x < 0.75) {
            p.x = p.x - 0.35 * progress;
          } else {
            p.x = p.x - 0.65 * progress;
          }
    
          vec4 color = texture2D(tex, p);
          gl_FragColor = color;
        }`
    })

    const RGBAMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms
      },
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
      fragmentShader: glsl`
        uniform float progress;
        uniform sampler2D tex;
        
        varying vec2 vUv;

        void main() {
          vec2 p = vUv;

          vec4 cr = texture2D(tex, p + progress * vec2(0.1, 0.));
          vec4 cg = texture2D(tex, p);
          vec4 cb = texture2D(tex, p - progress * vec2(0.1, 0.));

          vec4 color = vec4(cr.r, cg.g, cb.b, 1.);
          gl_FragColor = color;
        }`
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
