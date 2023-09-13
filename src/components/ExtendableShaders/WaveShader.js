import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uMouseX: 0,
    uTexture: new Texture(),
    uMap: new Texture(),
    uSize: new Vector2(),
    uResolution: new Vector2()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 uSize;
    uniform vec2 uResolution;
    void main() {
      vUv = uv;

      gl_Position = vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uMap;
    uniform sampler2D uTexture;
    uniform float uMouseX;

    void main() {
      float m = (uMouseX - 0.5)*0.001;
      float distort = sin(vUv.y * 50.0 + uTime) * 0.001;
      float map = texture2D(uMap, vUv).r;
      vec4 color = texture2D(uTexture, vec2(vUv.x + 10.0*map*distort, vUv.y));

      gl_FragColor = vec4(color.rgb, 1.0);
    }  
  `
)
