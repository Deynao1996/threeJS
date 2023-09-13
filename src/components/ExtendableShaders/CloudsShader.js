import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const CloudsShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uTexture: new Texture(),
    uDisplacement: new Texture()
  },
  glsl`
    attribute vec3 aTranslate;
    attribute float aRotate;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vAlpha;

    uniform float uTime;

    mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      
      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }
  
  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }

    void main() {
      float depth = 5.;
      vUv = uv;
      vec3 newPos = position;
      newPos = rotate(newPos, vec3(0, 0, 1), aRotate);
      newPos += aTranslate;
      newPos.z = -mod(newPos.z - uTime * 0.05, 5.);
      vPosition = newPos;
      vAlpha = smoothstep(-5. + 2., -4. + 2., newPos.z);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying float vAlpha;
    varying vec3 vPosition;
    varying vec2 vUv;

    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      vec3 color = vec3(0.835, 0., 0.564);
      vec4 map = texture2D(uTexture, vUv);
      if (map.r < 0.01) discard;

      vec3 final = mix(vec3(1.), color, map.r);

      float opacity = smoothstep(0.5, 1., length(vPosition.xy));
      // gl_FragColor = vec4(vUv, 0., vAlpha);
      gl_FragColor = vec4(final, vAlpha * opacity * 0.1);
    }  
  `
)
