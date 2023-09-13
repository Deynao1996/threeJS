import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector3 } from 'three'

export const TextShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uMouse: new Vector3(),
    uDisplacement: new Texture()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uDisplacement;
    uniform sampler2D uImage;
    uniform vec3 uMouse;

    float map(float value, float min1, float max1, float min2, float max2) {
      return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    void main() {
      float dist = length(vPosition - uMouse);
      float prox = 1. - map(dist, 0., 0.1, 0., 1.);
      vec2 direction = normalize(vPosition.xy - uMouse.xy);
      
      prox = clamp(prox, 0., 1.);
      
      vec2 zoomedUV = vUv + direction*prox*0.01;
      vec2 zoomedUV1 = mix(vUv, uMouse.xy + vec2(0.5), prox*0.4);
      vec4 color = texture2D(uImage, zoomedUV1);

      gl_FragColor = color;
      // gl_FragColor = vec4(dist, 0., 0., 1.);
    }  
  `
)
