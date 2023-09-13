import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector3 } from 'three'

export const WhateverShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uDirection: 0,
    uSpeed: 0,
    uImage: new Texture(),
    uMouse: new Vector3(-1, 1.2, 0)
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uProgress;
    uniform float uDirection;
    uniform float uTime;
    void main() {
      vUv = uv;

      vec3 pos = position;
      vec3 vPosition = position;

      float distance = length(uv - vec2(0.5));
      float maxDist = length(vec2(0.5));
      float normalizeDist = distance / maxDist;

      float myProgress = min(2. * uProgress, 2.*(1. - uProgress));

      float zOffset = 2.;
      float zProgress = mix(clamp(2. * uProgress, 0., 1.), clamp(1. - 2. * (1. - uProgress), 0., 1.), uDirection);

      float stickTo = normalizeDist;
      float stickOut = -normalizeDist;

      float stickEffect = mix(stickTo, stickOut, uDirection);

      pos.z += zOffset * stickEffect*myProgress - zProgress;

      pos.z += uProgress*sin(distance * 10. + 2.* uTime)*0.1;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform float uSpeed;
    uniform vec2 uMouse;
    uniform sampler2D uImage;

    void main() {
      float mouseDistance = length(vUv - uMouse);
      float normalizedSpeed = clamp(uSpeed, 0., 1.);

      float c = smoothstep(0.2*uSpeed, 0., mouseDistance);

      float r = texture2D(uImage, vUv + 0.1 * 0.5 * c * uSpeed).r;
      float g = texture2D(uImage, vUv + 0.1 * 0.3 * c * uSpeed).g;
      float b = texture2D(uImage, vUv + 0.1 * 0.1 * c * uSpeed).b;

      vec4 color = texture2D(uImage, vUv);
      gl_FragColor = vec4(r, g, b, 1.);
      // gl_FragColor = vec4(mouseDistance, 0., 0., 1.);
    }  
  `
)
