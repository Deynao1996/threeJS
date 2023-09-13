import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const PixiShaderMaterial = shaderMaterial(
  {
    uBg: new Texture(),
    uMask: new Texture()
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

    uniform sampler2D uBg;
    uniform sampler2D uMask;

    void main() {
      vec4 mask = texture2D(uMask, vUv);

      float strength = mask.a * mask.r;
      strength *= 3.;
      strength = min(1., strength);

      vec4 color = texture2D(uBg, vUv + (1. - strength) * 0.1);

      gl_FragColor = color*strength;
    }  
  `
)
