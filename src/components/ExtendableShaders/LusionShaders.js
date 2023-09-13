import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector3 } from 'three'

export const TubeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uLight: new Vector3(0, 0, 0)
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;

      v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    varying vec2 vUv;

    uniform vec3 uLight;
    uniform float uTime;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / 15.), 0.4);
    }

    void main() {
      float dash = sin(vUv.x*50. + uTime);
      if (dash < 0.3) discard;

      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));
      float dist = length(uLight - vNormal);

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);
      float final = diffusion*scatter;
      
      // gl_FragColor = vec4(1. - dist, 0., 0., 1.);
      gl_FragColor = vec4(final, 0., 0., 1.);
    }  
  `
)

export const LusionShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new Texture(),
    uLight: new Vector3(0, 0, 0)
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;

      v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    varying vec2 vUv;

    uniform vec3 uLight;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / 150.), 0.4);
    }

    void main() {
      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));
      float dist = length(uLight - vNormal);

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);
      float final = diffusion*scatter;
      
      // gl_FragColor = vec4(1. - dist, 0., 0., 1.);
      gl_FragColor = vec4(scatter, 0., 0., 1.);
    }  
  `
)
