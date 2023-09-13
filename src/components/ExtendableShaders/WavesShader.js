import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const WavesShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
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

    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor;
    uniform sampler2D uImage;
    uniform sampler2D uMask;

    float PI = 3.141592653589793238;

    void main() {
      vec4 displacement = texture2D(uMask, vUv);
      float theta = displacement.r * 2. * PI;

      vec2 dir = vec2(sin(theta), cos(theta));
      vec2 uv = vUv + dir * displacement.r*0.1;

      vec4 color = texture2D(uImage, uv);

      gl_FragColor = color;
    }  
  `
)
