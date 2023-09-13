import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const BillieShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uTexture: new Texture(),
    uDataTexture: new Texture()
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
    uniform float uProgress;
    uniform sampler2D uTexture;
    uniform sampler2D uDataTexture;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      vec4 offset = texture2D(uDataTexture, vUv);
      
      gl_FragColor = texture2D(uTexture, vUv - 0.02*offset.rg);
    }  
  `
)
