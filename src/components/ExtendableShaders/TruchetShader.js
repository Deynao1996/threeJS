import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'

export const TruchetShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0
  },
  glsl`
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    uniform float uProgress;

    void main() {
      vUv = uv;
      vec3 newPos = position;

      newPos += 0.276 * normal * (4. * vUv.x - 0.03);

      vPosition = newPos;
      vNormal = normal;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform float uTime;
    uniform float uProgress;

    float Hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    void main() {
      float pi = 3.1415926;
      float angle = (atan(vPosition.y, vPosition.x) + pi) / (2. * pi);
      
      vec2 newUV = 6. * vec2(7. * angle + 6. * uProgress, vUv.y * 5. - 3. * uProgress);
      vec2 gUV = fract(newUV) - 0.5;
      vec2 id = mod(floor(newUV), vec2(6., 6.));

      float n = Hash21(id);
      gUV.x *= 2. * step(0.5, n) - 1.;

      float diff = clamp(dot(vec3(1., 2., 1.), vNormal), 0.3, 1.);

      float d = abs(abs(gUV.x + gUV.y) - 0.5);
      float mask = smoothstep(-0.01, 0.01, d - 0.3);

      if (mask < 0.0001) discard;

      gl_FragColor = vec4(vec3(mask) * diff, mask);

      if (!gl_FrontFacing) {
        gl_FragColor.a *= 0.2;
      }
    }  
  `
)
