import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2 } from 'three'

export const WatchesShaderMaterial = shaderMaterial(
  {
    uSize: 2.1,
    uDimensions: new Vector2(),
    uSourceTexture: new Texture(),
    uTargetTexture: new Texture(),
    uBlend: 0
  },
  glsl`
    attribute vec2 source;
    attribute vec2 target;

    varying vec2 vUv;
    varying vec3 vColor;

    uniform vec2 uDimensions;
    uniform sampler2D uSourceTexture;
    uniform sampler2D uTargetTexture;
    uniform float uSize;
    uniform float uBlend;

    float PI = 3.141592653589793238;

    void main() {

      vec3 origin = vec3(source, 0.);
      vec3 destination = vec3(target, 0.);
      vec3 p = mix(origin, destination, uBlend);

      vec3 d = destination - origin;

      float r = length(d);

      p.z = r*sin(PI*uBlend);

      vec2 uvSource = source / uDimensions.x;
      vec2 uvTarget = target / uDimensions.x;

      vec3 vSourceColor = texture2D(uSourceTexture, uvSource).rgb;
      vec3 vTargetColor = texture2D(uTargetTexture, uvTarget).rgb;

      vColor = mix(vSourceColor, vTargetColor, uBlend);

      p.xy = p.xy -  0.5*uDimensions;

      p*= 1. / uDimensions.x;
      // p.y*= -1.;

      vec4 mvPosition = modelViewMatrix * vec4(p, 1.);
      gl_PointSize = uSize * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec3 vColor;
    varying vec2 vUv;

    void main() {

      gl_FragColor = vec4(vColor, 1.);
    }  
  `
)
