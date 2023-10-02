import { shaderMaterial } from '@react-three/drei'
import { Color, Vector3 } from 'three'

export const BrainShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color(0.1, 0.3, 0.6),
    uMouse: new Vector3(0, 0, 0)
  },
  `
    varying vec2 vUv;
    varying float vProgress;

    uniform float uTime;
    uniform vec3 uMouse;

    void main() {
      vUv = uv;
      vProgress = smoothstep(-1., 1., sin(vUv.x * 8. + uTime * 3.));

      vec3 p = position;
      float maxDist = 0.5;
      float dist = length(uMouse - p);
      if (dist < maxDist) {
        vec3 dir = normalize(uMouse - p);
        dir *= (1. - dist / maxDist);
        p -= dir * 0.01;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  `
    precision mediump float;

    varying float vProgress;
    varying vec2 vUv;

    uniform vec3 uColor;

    void main() {
      float hideCorners = smoothstep(1., 0.9, vUv.x);
      float hideCorners1 = smoothstep(0., 0.1, vUv.x);
      vec3 finalColor = mix(uColor, uColor * 0.25, vProgress);

      gl_FragColor = vec4(finalColor, hideCorners * hideCorners1);
    }  
  `
)

export const PointsShaderMaterial = shaderMaterial(
  {
    uTime: 0
  },
  `
    varying vec2 vUv;

    uniform float uTime;

    attribute float randoms;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
      gl_PointSize = randoms * 2. * (1. / -mvPosition.z);
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;

    void main() {
      float dist = length(gl_PointCoord.xy - vec2(0.5, 0.5));
      float opacity = 0.5 * smoothstep(0.5, 0.4, dist);
      gl_FragColor = vec4(vec3(opacity), 1.);
    }  
  `
)
