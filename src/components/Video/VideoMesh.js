import { shaderMaterial, useAspect } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

const VideoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uTexture: 0
  },
  glsl`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      gl_FragColor = color;
    }  
  `
)

extend({ VideoShaderMaterial })

const VideoMesh = () => {
  const size = useAspect(1920, 1080)
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), {
      src: '/video/video.mp4',
      crossOrigin: 'Anonymous',
      loop: true,
      muted: true
    })
  )

  useEffect(() => void video.play(), [video])

  const newSize = size.map((pos, index) => (index === 0 ? 2.4 : pos))

  return (
    <mesh scale={newSize}>
      <planeGeometry />
      <videoShaderMaterial
        uTexture={new THREE.VideoTexture(video)}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default VideoMesh
