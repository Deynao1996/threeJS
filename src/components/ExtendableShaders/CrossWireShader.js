import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'
import { Texture } from 'three'

export const CrossWireShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMatCap: new Texture(),
    uScan: new Texture()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vTime;

    uniform float uTime;

    attribute float aRandom;

    void main() {
      vUv = uv;

      float offset =  aRandom + sin(uTime  + 15. * aRandom);
      offset *= 0.2;
      // offset *= 0.;

      vec4 mvPosition = modelMatrix * instanceMatrix* vec4(position, 1.0);
      mvPosition.y += offset;
      mvPosition = viewMatrix * mvPosition;

      vNormal = normalMatrix * mat3(instanceMatrix) * normal;
      vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      worldPosition.y += offset;

      vWorldPosition = worldPosition.xyz;
      vViewPosition = - mvPosition.xyz;
      vTime = uTime;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vTime;

    uniform sampler2D uMatCap;
    uniform sampler2D uScan;


    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize( vViewPosition );
	    vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	    vec3 y = cross( viewDir, x );
	    vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

      vec2 scanUv = fract(vWorldPosition.xz);
      if (vNormal.y < 0.) {
        scanUv = fract(vUv * 10.);
      }
      vec4 scanMask = texture2D(uScan, scanUv);

      vec4 matcapColor = texture2D( uMatCap, uv );

      vec3 origin = vec3(0.);
      float dist = distance(vWorldPosition, origin);

      float radialMove = fract(dist - vTime);

      // radialMove *= 1. - smoothstep(1., 3., dist);

      radialMove *= 1. - step(vTime, dist);

      float scanMix = smoothstep(0.3, 0., 1. - radialMove) * 1.5;
      scanMix *= 1. + scanMask.r * 0.7;

      vec3 scanColor = mix(vec3(1.), vec3(0.5, 0.5, 1.), scanMix * 0.5);

      // gl_FragColor = vec4(vUv, 0., 1.);
      gl_FragColor = matcapColor;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, scanColor, scanMix * 0.5);
    }  
  `
)
