import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const ImageShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uDisplacement: new Texture()
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
    uniform sampler2D uDisplacement;
    uniform sampler2D uImage;

    void main() {
      vec4 displace = texture2D(uDisplacement, vUv.yx);
      vec2 displacedUV = vec2(vUv.x, vUv.y);

      displacedUV.y = mix(vUv.y, displace.r - 0.2, 0.);

      vec4 color = texture2D(uImage, displacedUV);
      
      color.r = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.005) * uProgress).r;
      color.g = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.01) * uProgress).g;
      color.b = texture2D(uImage, displacedUV + vec2(0.0, 10.0* 0.02) * uProgress).b;
      gl_FragColor = color;
    }  
  `
)
