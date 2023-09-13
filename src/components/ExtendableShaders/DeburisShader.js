import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const DeburisShaderMaterial = shaderMaterial(
  {
    uProgress: 0.0,
    uTexture1: new Texture(),
    uTexture2: new Texture(),
    uResolution: new Vector2(),
    uCameraRotation: new Vector2(0, 0)
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
    uniform vec2 uCameraRotation;

    vec2 warp(vec2 pos, vec2 amplitude) {
      pos = pos * 2.0 - 1.0;
      pos.x *= 1.0 - (pos.y*pos.y)*amplitude.x * 0.2;
      pos.y *= 1.0 + (pos.x*pos.x)*amplitude.y;
      return pos*0.5 + 0.5;
    }

    void main() {
      vec2 warpedUV = warp(vUv, vec2(-0.7));
      vec2 center = (gl_FragCoord.xy/uResolution) - vec2(0.6);
      float p = fract(uProgress);

      float len = length(center);

      float vignette = 1. - smoothstep(0.5, 0.75, len);

      vec2 uvCurrent = vec2(
        warpedUV.x + p*0.8 + uCameraRotation.x, 
        warpedUV.y - p*0.5 - uCameraRotation.y
      );
      vec2 uvNext = vec2(
        warpedUV.x - (1. - p) + uCameraRotation.x, 
        warpedUV.y + (1. - p)*0.3 - uCameraRotation.y
      );

      vec4 imgCurrent = texture2D(uTexture1, uvCurrent);
      vec4 imgNext = texture2D(uTexture2, uvNext);

      vec3 colorCurrent = imgCurrent.rgb*(1. - p);
      vec3 colorNext = imgNext.rgb*p;

      gl_FragColor = vec4(colorCurrent + colorNext, 1.);
      gl_FragColor.rgb = mix(gl_FragColor.rgb*0.5, gl_FragColor.rgb, vignette);
    }  
  `
)
