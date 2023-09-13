import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const AntoniShaderMaterial = shaderMaterial(
  {
    uProgress: 0.0,
    uTexture1: new Texture(),
    uTexture2: new Texture(),
    uResolution: new Vector2()
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
    uniform vec2 uResolution;

    void main() {
      vec2 uv = gl_FragCoord.xy/uResolution.xy;
      float p = fract(uProgress);
      float p1 = p - 1.;
      vec2 position = step(0., p)*uv + step(0., -p)*(1.-uv);

      float vert = abs(p*0.3);
      float dx1 = p*0.8;
      dx1 -= step(0.2 - vert, position.x/1.25)*0.3*p;
      dx1 -= step(0.4 - vert, position.x/1.25)*0.3*p;
      dx1 += step(0.6 - vert, position.x/1.25)*0.3*p;
      dx1 += step(0.8 - vert, position.x/1.25)*0.3*p;
      vec4 text1 = texture2D(uTexture1, vec2(vUv.x + dx1, vUv.y));
      float bounds = step(0., 1. - (uv.x/1.25 + p)) * step(0., uv.x/1.25 + p);
      vec4 fcolor = text1*bounds;

      float dx2 = p1*0.8;
      float vert1 = abs(p1*0.3);
      dx2 -= step(0.2 + vert1, position.x/1.25)*0.3*p1;
      dx2 -= step(0.4 + vert1, position.x/1.25)*0.3*p1;
      dx2 += step(0.6 + vert1, position.x/1.25)*0.3*p1;
      dx2 += step(0.8 + vert1, position.x/1.25)*0.3*p1;
      vec4 text2 = texture2D(uTexture2, vec2(vUv.x + dx2, vUv.y));
      float bounds1 = step(0., 1. - (uv.x/1.25 + p1)) * step(0., uv.x/1.25 + p1);
      fcolor += text2*bounds1;

      gl_FragColor = fcolor;
    }  
  `
)
