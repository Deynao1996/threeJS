import { shaderMaterial } from '@react-three/drei'
import { Texture } from 'three'

export const MarineShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new Texture()
  },
  `
    varying vec2 vUv;

    uniform float uTime;

    attribute vec3 randoms;
    attribute float sizes;

    float PI = 3.14159265359;

    vec3 getPos(float progress) {
      float angle = PI * 2. * progress;
      float x = sin(angle) + 2. * sin(2. * angle);
      float y = cos(angle) - 2. * cos(2. * angle);
      float z = -sin(3. * angle);
      return vec3(x, y, z);
    }

    vec3 getTangent(float progress) {
      float angle = PI * 2. * progress;
      float x = cos(angle) + 4. * cos(2. * angle);
      float y = -sin(angle) + 4. * sin(2. * angle);
      float z = 3. * -cos(3. * angle);
      return normalize(vec3(x, y, z));
    }

    vec3 getNormal(float progress) {
      float angle = PI * 2. * progress;
      float x = -sin(angle) - 8. * sin(2. * angle);
      float y = -cos(angle) + 8. * cos(2. * angle);
      float z = 9. * sin(3. * angle);
      return normalize(vec3(x, y, z));
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float progress = fract(uTime * 0.1 * randoms.x);
      pos = getPos(progress);
      vec3 tangent = getTangent(progress);
      vec3 normal = getNormal(progress);
      vec3 binormal = normalize(cross(tangent, normal));

      float radius = 0.3 + randoms.z * 0.2;
      float cx = radius * cos(uTime * randoms.y * 2. * 0.1 + randoms.z * 7.);
      float cy = radius * sin(uTime * randoms.y * 2. * 0.1 + randoms.z * 7.);

      pos += (normal * cx + binormal * cy);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
      gl_PointSize = 80. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      vec2 st = gl_PointCoord.xy;
      vec3 color = vec3(0.136, 0.559, 0.832);

      float dist = length(st - vec2(0.5, 0.5));
      float alpha = smoothstep(0.5, 0.48, dist);
      vec4 normalTexture = texture2D(uTexture, st);

      vec3 normal = vec3(normalTexture.rg * 2. - 1., 0.0);
      normal.z = sqrt(1. - normal.x * normal.x - normal.y * normal.y);
      normal = normalize(normal);

      vec3 lightPos = vec3(1.0, 1.0, 1.0);
      float diffuse = max(0., dot(normal, normalize(lightPos)));
      vec3 newColor = vec3(0.579, 0.903, 0.983);

      gl_FragColor = vec4(newColor, alpha * diffuse * 0.5);
    }  
  `
)

export const TubeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uDotsTexture: new Texture(),
    uStripesTexture: new Texture()
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normal;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    uniform float uTime;
    uniform sampler2D uDotsTexture;
    uniform sampler2D uStripesTexture;

    void main() {
      float slowedTime = uTime * 0.09;
      float texture1 = texture2D(uStripesTexture, vUv - slowedTime).r;
      float texture2 = texture2D(uStripesTexture, vUv - slowedTime * 1.5).r;
      float texture3 = texture2D(uDotsTexture, vUv* vec2(8., 4.) - slowedTime * 0.5).r;

      float alpha = min(texture1, texture2) + texture3;

      vec3 viewDir = -normalize(vWorldPosition - cameraPosition);
      float fresnel = dot(viewDir, vNormal);
      fresnel = pow(fresnel, 3.);

      vec3 color = vec3(0.579, 0.903, 0.983);
      gl_FragColor = vec4(color, alpha * fresnel);
    }  
  `
)

export const GodRayShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new Texture()
  },
  `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vWorldPosition;

    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      vec2 godRay = vWorldPosition.xy - vec2(0., 6.);
      float uvDirection = atan(godRay.y, godRay.x);

      float fade = smoothstep(0.35, 0.86, abs(vUv.y));

      float c = texture2D(uTexture, vec2(uvDirection, 0.) + 0.09 * uTime * 1.5).x;
      float c1 = texture2D(uTexture, vec2(0.1, uvDirection) + 0.09 * uTime).x;
      float alpha = min(c, c1);

      gl_FragColor = vec4(vec3(alpha), alpha * 0.3 * fade);
    }  
  `
)
