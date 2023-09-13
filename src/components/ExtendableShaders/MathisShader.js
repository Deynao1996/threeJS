import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const MathisShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMove: 0,
    uMousePressed: 0,
    uTransition: 1,
    uTexture: new Texture(),
    uTexture1: new Texture(),
    uMask: new Texture(),
    uMouse: new Vector2()
  },
  glsl`
    attribute vec3 aCoordinates;
    attribute float aSpeed;
    attribute float aOffset;
    attribute float aDirection;
    attribute float aPress;

    varying vec2 vUv;
    varying vec2 vCoordinates;
    varying vec3 vPos;
    varying float vMove;

    uniform float uMove;
    uniform float uTime;
    uniform float uMousePressed;
    uniform vec2 uMouse;
    uniform float uTransition;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Not Stable
      pos.x += sin(uMove * aSpeed) * 3.;
      pos.y += sin(uMove * aSpeed) * 3.;
      pos.z = mod(position.z + uMove * 200. * aSpeed + aOffset, 2000.) - 1000.;
      
      // Stable
      vec3 stable = position;
      float dist = distance(stable.xy, uMouse);
      float area = 1. - smoothstep(0., 300., dist);

      stable.x += 50. * sin(uTime * aPress) * aDirection * area * uMousePressed;
      stable.x += 50. * sin(uTime * aPress) * aDirection * area * uMousePressed;
      stable.z += 200. * cos(uTime * aPress) * aDirection * area * uMousePressed;

      pos = mix(pos, stable, uTransition);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
      gl_PointSize = 4000. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;

      vCoordinates = aCoordinates.xy;
      vPos = pos;
      vMove = uMove;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vCoordinates;
    varying vec3 vPos;
    varying float vMove;
    varying vec2 vUv;

    uniform float uTime;
    // uniform float uMove;
    uniform sampler2D uTexture;
    uniform sampler2D uTexture1;
    uniform sampler2D uMask;

    void main() {
      vec2 myUV = vec2(vCoordinates.x / 512., vCoordinates.y / 512.);
      vec4 maskTexture = texture2D(uMask, gl_PointCoord);
      vec4 tt1 = texture2D(uTexture, myUV);
      vec4 tt2 = texture2D(uTexture1, myUV);

      vec4 final = mix(tt1, tt2, smoothstep(0., 1., fract(vMove)));

      float alpha = 1. - clamp(0., 1., abs(vPos.z / 900.));

      gl_FragColor = final;
      gl_FragColor.a *= maskTexture.r * alpha;
    }  
  `
)
