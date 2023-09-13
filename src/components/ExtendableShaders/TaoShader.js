import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const TaoShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uTexture1: new Texture(),
    uTexture2: new Texture(),
    uAccel: new Vector2(0.5, 2),
    uResolution: new Vector2(),
    uRate1: new Vector2(1, 1)
  },
  glsl`
    varying vec2 vUv;
    varying vec2 vUv1;
    
    uniform vec3 uRate1;

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uAccel;

    vec2 mirrored(vec2 v) {
      vec2 m = mod(v, 2.);
      return mix(m, 2.0 - m, step(1.0, m));
    }
    
    float tri(float p) {
      return mix(p, 1.0 - p, step(0.5, p))* 2.;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy/uResolution.xy;

      float p = fract(uProgress);
      float delayValue = p*7. - uv.y*2. + (uv.x - 2.);

      delayValue = clamp(delayValue, 0., 1.);

      vec2 translateValue = p + delayValue*uAccel;
      vec2 translateValue1 = vec2(-0.5, 1.) * translateValue;
      vec2 translateValue2 = vec2(-0.5, 1.) * (translateValue - 1. - uAccel);

      vec2 w = sin(sin(uTime)*vec2(0, 0.3)+vUv.yx*vec2(0,4.))*vec2(0, 0.5);
      vec2 xy = w*(tri(p)*0.5 + tri(delayValue)*0.5);

      vec2 uv1 = vUv + translateValue1 + xy;
      vec2 uv2 = vUv + translateValue2 + xy;

      vec4 rgba1 = texture2D(uTexture1, mirrored(uv1));
      vec4 rgba2 = texture2D(uTexture2, mirrored(uv2));

      vec4 rgba = mix(rgba1, rgba2, delayValue);

      gl_FragColor = rgba;
    }  
  `
)
