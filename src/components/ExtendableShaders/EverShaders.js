import { shaderMaterial } from '@react-three/drei'

export const EverShaderMaterial = shaderMaterial(
  {
    uTime: 0
  },
  `
    varying vec2 vUv;
    varying float traveled;

    uniform float uTime;

    attribute float aDistance;
    attribute float aVelocity;
    attribute float aSize;
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.x = mod(aVelocity * uTime * 0.5, aDistance);

      traveled = pos.x;
      pos.x *= .4;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (1. / - mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;
    varying float traveled;

    uniform float uTime;

    void main() {
      float alpha = 1. - traveled;
      if (length(gl_PointCoord.xy - vec2(0.5)) > 0.5) {
        discard;
      }
      gl_FragColor = vec4(0.99, 0.85, 0.46, 0.5 * alpha);
    }  
  `
)

export const PointsShaderMaterial = shaderMaterial(
  {
    uTime: 0
  },
  `
    varying vec2 vUv;
    varying float traveled;

    uniform float uTime;

    attribute float aDistance;
    attribute float aVelocity;
    attribute float aSize;
    attribute float aRandom;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.x = mod(aVelocity * uTime * 0.05 - aRandom, 1.);

      traveled = pos.x;
      pos.x = (pos.x - 0.5) * 10.;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (1. / - mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;
    varying float traveled;

    uniform float uTime;

    void main() {
      if (length(gl_PointCoord.xy - vec2(0.5)) > 0.5) {
        discard;
      }
      gl_FragColor = vec4(0.99, 0.85, 0.46, 0.5);
    }  
  `
)
