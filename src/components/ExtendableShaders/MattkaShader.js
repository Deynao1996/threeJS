import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Vector2 } from 'three'

export const MattkaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new Vector2(0, 0)
  },
  glsl`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;
    uniform vec2 uMouse;

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

    float sineCrazy(vec3 p) {
      return 1. - (sin(p.x) + sin(p.y) + sin(p.z)) / 3.;
    }

    float sphere(vec3 p) {
      return length(p) - 0.3;
    }

    vec3 getColor(float amount) {
      vec3 col = 0.5 + 0.5 * cos(6.28319 * (vec3(0.2, 0.0, 0.0) + amount * vec3(1., 1., 0.5)));
      return col * amount;
    }
    
    vec3 getColorAmount(vec3 p) {
      float amount = clamp((1.5 - length(p)) / 2., 0., 1.);
      vec3 col = 0.5 + 0.5 * cos(6.28319 * (vec3(0.2, 0.0, 0.0) + amount * vec3(1., 1., 0.5)));
      return col * amount;
    }
    
    float sdBox(vec3 p, vec3 b) {
      vec3 q = abs(p) - b;
      return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }
    
    float scene(vec3 p) {
      vec3 p1 = rotate(p, vec3(1., 1., 1.), uTime * 0.4);
      // return max(sdBox(p1, vec3(0.25, 0.25, 0.25)), sphere(p));
      float scale = 15. + 10. * sin(uTime / 12.);
      return max(sphere(p1), (0.85 - sineCrazy(p1 * scale)) / scale);
    }

    vec3 getNormal(vec3 p){
      vec2 o = vec2(0.001,0.);
      return normalize(
        vec3(
          scene(p + o.xyy) - scene(p - o.xyy),
          scene(p + o.yxy) - scene(p - o.yxy),
          scene(p + o.yyx) - scene(p - o.yyx)
        )
      );
    }

    void main() {
      vec2 p = vUv - vec2(0.5);

      p.x += uMouse.x * 0.1;
      p.y -= uMouse.y * 0.1;

      vec3 camPos = vec3(0., 0., 2. + 0.5 * sin(uTime/ 4.));
      vec3 ray = normalize(vec3(p, -1));
      vec3 rayPos = camPos;

      float curDist = 0.;
      float rayLen = 0.;

      vec3 color = vec3(0.);
      vec3 light = vec3(-1., 1., 1.);

      for(int i = 0; i <= 64; i++) {
        curDist = scene(rayPos);
        rayLen += 0.6 * curDist;

        rayPos = camPos + ray * rayLen;

        if (abs(curDist) < 0.001) {
          vec3 n = getNormal(rayPos);
          float diff = dot(n, light);

          // color = getColor(diff);
          // color = getColor(2. * length(rayPos));
          break;
        }
        color += 0.04 * getColorAmount(rayPos);
      }

      gl_FragColor = vec4(color, 1.);
      gl_FragColor.r -= abs(uMouse.x) * 0.6;
    }  
  `
)
