import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const TriangleShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new Texture(),
    uProgress: 0
  },
  glsl`
    attribute vec3 colors;
    attribute vec3 position1;
    attribute float rotation;
    attribute float size;
    attribute float alpha;
    
    varying vec2 vUv;
    varying vec3 vColors;
    varying float vAlpha;
    varying float vRot;
    
    uniform float uTime;
    uniform float uProgress;

    void main() {
      vUv = uv;
      vRot = rotation;
      vAlpha = alpha*(1. - uProgress);
      vColors = colors;

      vec3 newPos = position;
      float dist = distance(newPos, vec3(-1., 0., 0.));

      newPos.x += sin(dist*5. + uTime)*0.01*2.;
      newPos.y += sin(dist*5. + uTime)*0.01*2.;
      newPos = mix(position, position1, uProgress);

      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.);
      gl_PointSize = size*15. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying float vDist;
    varying vec2 vUv;
    varying vec3 vColors;
    varying float vRot;
    varying float vAlpha;

    uniform float uTime;
    uniform sampler2D uTexture;

    float PI = 3.141592653589793238;

    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }

    void main() {
      vec2 uv1 = gl_PointCoord;

      uv1 = rotate(uv1 - vec2(0.5), vRot) + vec2(0.5);

      vec4 t = texture2D(uTexture, uv1);
      gl_FragColor = vec4(vColors, t.a*vAlpha);
    }  
  `
)
