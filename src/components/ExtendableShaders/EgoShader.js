import { shaderMaterial } from '@react-three/drei'
import { Texture, Vector2 } from 'three'

export const EgoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uTexture: new Texture(),
    uResolution: new Vector2()
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform sampler2D uTexture;

    void main() {
      vec2 normalizedUv = gl_FragCoord.xy / uResolution.xy;
      float aspect = uResolution.x / uResolution.y;
      vec2 scale;

      if (aspect < 1.) {
        scale = vec2(1., 1. / aspect);
      } else {
        scale = vec2(aspect, 1.);
      }

      normalizedUv = (normalizedUv - vec2(0.5)) * scale * 1. + vec2(0.5);
      normalizedUv.x -= uProgress;

      vec4 color = texture2D(uTexture, normalizedUv);
      gl_FragColor = color;
    }  
  `
)
