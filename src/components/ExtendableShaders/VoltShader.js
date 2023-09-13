import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const VoltShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uDisplacement: new Texture()
  },
  glsl`
    attribute float opacity;

    varying vec2 vUv;
    varying float vOpacity;

    void main() {
      vUv = uv;
      vOpacity = opacity;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
      gl_PointSize = 30000. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vOpacity;

    uniform float uTime;
    uniform float uProgress;
    uniform sampler2D uDisplacement;
    uniform sampler2D uImage;

    void main() {
      vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);
      vec2 cUV = 2.*uv - 1.;

      vec3 originalColor = vec3(4. / 255., 10. / 255., 20. / 255.);
      vec4 color = vec4(0.08 / length(cUV));

      color.rgb = min(vec3(10.), color.rgb);
      color.rgb *= originalColor*120.;
      color *= vOpacity;
      color.a = min(1., color.a)*10.;

      float dist = length(cUV);

      // gl_FragColor = vec4(vOpacity, vOpacity, vOpacity, 1.);
      gl_FragColor = vec4(color.rgb, color.a);
    }  
  `
)
