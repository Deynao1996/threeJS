import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Color } from 'three'

export const TornadoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 1.0,
    uOffset: 0,
    uColor: new Color('#000000')
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
    uniform float uOffset;
    uniform vec3 uColor;

    float quarticOut(float t) {
      return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    }

    void main() {
      float localProgress = mod(uProgress * 2. + uOffset * 2., 2.);
      localProgress = quarticOut(localProgress / 2.) * 2.;

      if (vUv.x > localProgress || vUv.x + 1. < localProgress) discard;

      gl_FragColor = vec4(uColor, 1.);
    }  
  `
)
