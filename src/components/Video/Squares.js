import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const SquareShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: 0,
    uMouse: new THREE.Vector3(5, 5, 0)
  },
  glsl`
    varying vec2 vUv;
    varying float vDist;

    uniform vec3 uMouse;
    uniform float uTime;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    float cnoise(vec3 P){
      vec3 Pi0 = floor(P); // Integer part for indexing
      vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;
    
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
    
      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;
    
      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);
    
      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return 2.2 * n_xyz;
    }


    void main() {
      vUv = uv;

      float distance = length(uMouse - instanceMatrix[3].xyz);
      vec3 newPosition = position;

      float koef = 0.;
      if (distance < 0.3) {
        koef = 1. - distance/0.3;
        koef *= abs(cnoise(vec3(instanceMatrix[3].x*10., instanceMatrix[3].y*10., uTime/4.)));
      }
      vDist = koef;

      newPosition.z += koef*0.1;

      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(newPosition, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying float vDist;
    varying vec2 vUv;

    uniform float uTime;
    uniform sampler2D uTexture;

    void main() {
      gl_FragColor = vec4(1., 1., 1., .7*vDist);
    }  
  `
)

extend({ SquareShaderMaterial })

const Squares = ({ squaresMaterialRef, counterRef }) => {
  const boxRef = useRef()

  function setCustomMatrix() {
    let dummy = new THREE.Object3D(),
      counter = 0
    for (let i = -counterRef.current / 2; i < counterRef.current / 2; i++) {
      for (let j = -counterRef.current / 2; j < counterRef.current / 2; j++) {
        dummy.position.set(i / 10, j / 10, 0)
        dummy.updateMatrix()
        boxRef.current.setMatrixAt(counter++, dummy.matrix)
      }
    }
    boxRef.current.position.z = 0.01
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    squaresMaterialRef.current.uTime = time
  })

  useEffect(() => void setCustomMatrix(), [])

  return (
    <instancedMesh ref={boxRef} args={[null, null, counterRef.current ** 2]}>
      <planeBufferGeometry args={[0.1, 0.1]} />
      <squareShaderMaterial
        ref={squaresMaterialRef}
        side={THREE.DoubleSide}
        transparent={true}
      />
    </instancedMesh>
  )
}

export default Squares
