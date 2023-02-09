import * as THREE from 'three'
import glsl from 'babel-plugin-glsl/macro'
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
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
      fragmentShader: glsl`
        uniform vec2 center;
        uniform float angle;
        uniform float scale;
        uniform vec2 tSize;
      
        uniform sampler2D tex;
      
        varying vec2 vUv;
      
        float pattern() {
      
          float s = sin( angle ), c = cos( angle );
      
          vec2 tex = vUv * tSize - center;
          vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;
      
          return ( sin( point.x ) * sin( point.y ) ) * 4.0;
      
        }
      
        void main() {
      
          vec4 color = texture2D( tex, vUv );
      
          float average = ( color.r + color.g + color.b ) / 3.0;
      
          gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );
      
        }`
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
