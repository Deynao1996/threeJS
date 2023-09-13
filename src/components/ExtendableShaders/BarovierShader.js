import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture, Vector2, Vector3 } from 'three'

export const BarovierShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uAlpha: 1,
    uMouse: new Vector3(),
    uTexture: new Texture(),
    uMap: new Texture(),
    uSize: new Vector2(),
    uResolution: new Vector2()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec2 uSize;
    uniform vec2 uResolution;
    void main() {
      vUv = uv;
      vPosition = position;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float uTime;
    uniform float uProgress;
    uniform float uAlpha;
    uniform sampler2D uMap;
    uniform sampler2D uTexture;
    uniform vec3 uMouse;

    void main() {
      vec2 uV = vUv.xy;
      float dist = length(vPosition - uMouse);

      uV.y += sin(uV.y*5. + uTime)*0.01;
      uV.x += sin(uV.x*10. + uTime*0.2)*0.01;

      uV.x = (uV.x - 0.5)*(1.0-uProgress)+0.5;
      
      if(dist < 0.1) {
        // color = vec4(1.0, 0.0, 0.0, 1.0);
        float temp = dist/0.1;
        float abs = 1.0 - temp;
        uV.x += sin(gl_FragColor.y*0.03 + uTime)*abs*0.003;
        uV.y += sin(gl_FragColor.x*0.03 + uTime*0.5)*abs*0.003;
        
        uV.x += sin(gl_FragColor.y*0.07 + uTime)*abs*0.003;
        uV.y += sin(gl_FragColor.x*0.08 + uTime*0.5)*abs*0.003;
        // color *= 2.0 + 1.0 - temp;
      }

      vec4 color = texture2D(uTexture, uV);

      if(dist < 0.1) {
        color *= 1.0 + (1.0 - dist/0.1);
      }

      gl_FragColor = color*uAlpha;
      // gl_FragColor = vec4(dist, dist, dist, 1);
    }  
  `
)
