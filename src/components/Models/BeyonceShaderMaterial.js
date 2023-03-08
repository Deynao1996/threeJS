import React, { useEffect, useRef } from 'react'
import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'

export const beyonceCanvasProps = {
  camera: { position: [0, 0, 650], fov: 30 },
  style: { zIndex: 110 }
}

const BeyonceShaderMaterial = shaderMaterial(
  {
    uMouse: new THREE.Vector3(-180, 180, 0),
    uTime: 0
  },
  glsl`
    varying vec2 vUv;

    uniform vec3 uMouse;
    uniform float uTime;

    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0; }
    
    float mod289(float x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0; }
    
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    float permute(float x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float taylorInvSqrt(float r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    vec4 grad4(float j, vec4 ip)
      {
      const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
      vec4 p,s;
    
      p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
      p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
      s = vec4(lessThan(p, vec4(0.0)));
      p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
    
      return p;
      }
    
    #define F4 0.309016994374947451
    
    float snoise(vec4 v)
      {
      const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                            0.276393202250021,  // 2 * G4
                            0.414589803375032,  // 3 * G4
                           -0.447213595499958); // -1 + 4 * G4
    
      vec4 i  = floor(v + dot(v, vec4(F4)) );
      vec4 x0 = v -   i + dot(i, C.xxxx);
    
    
      vec4 i0;
      vec3 isX = step( x0.yzw, x0.xxx );
      vec3 isYZ = step( x0.zww, x0.yyz );
      i0.x = isX.x + isX.y + isX.z;
      i0.yzw = 1.0 - isX;
      i0.y += isYZ.x + isYZ.y;
      i0.zw += 1.0 - isYZ.xy;
      i0.z += isYZ.z;
      i0.w += 1.0 - isYZ.z;
    
      vec4 i3 = clamp( i0, 0.0, 1.0 );
      vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
      vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
    
      vec4 x1 = x0 - i1 + C.xxxx;
      vec4 x2 = x0 - i2 + C.yyyy;
      vec4 x3 = x0 - i3 + C.zzzz;
      vec4 x4 = x0 + C.wwww;
    
      i = mod289(i);
      float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
      vec4 j1 = permute( permute( permute( permute (
                 i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
               + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
               + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
               + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
    
      vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
    
      vec4 p0 = grad4(j0,   ip);
      vec4 p1 = grad4(j1.x, ip);
      vec4 p2 = grad4(j1.y, ip);
      vec4 p3 = grad4(j1.z, ip);
      vec4 p4 = grad4(j1.w, ip);
    
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      p4 *= taylorInvSqrt(dot(p4,p4));
    
      vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
      vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
      m0 = m0 * m0;
      m1 = m1 * m1;
      return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                   + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
    }

    void main() {
      float distance = 50.;

      vec3 newPos = position;
      vec3 noisePos;

      noisePos.x = 150.*snoise(vec4(position.x, position.y, position.z, uTime/10.));
      noisePos.y = newPos.y + 10.*snoise(vec4(position.x, position.y, position.z, uTime/10.));
      noisePos.x = 150.*snoise(vec4(position.x*0.5, position.y*0.5, position.z*0.5, uTime/10.));

      if (length(position - uMouse)<distance) {
        float koef = length(position - uMouse)/distance;
        koef = sqrt(koef);
        // newPos *= vec3(2. + koef, 1., 2. + koef);
        newPos = mix(newPos, noisePos, 1. - koef);
      }


      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.);
      gl_PointSize = 1000. * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;

    void main() {

      gl_FragColor = vec4(0.728, 0.592, 0.677, 1.);
    }  
  `
)

extend({ BeyonceShaderMaterial })

const Beyonce = () => {
  const model = useLoader(GLTFLoader, '/model/beyonce.glb')
  const { camera } = useThree()
  const geometryRef = useRef()
  const materialRef = useRef()
  const pointsRef = useRef()

  const onMouseMove = (e) => {
    gsap.to(materialRef.current.uMouse, {
      x: e.point.x,
      y: e.point.y,
      z: e.point.z,
      duration: 1,
      ease: 'power2.out'
    })
  }

  function setBufferAttribute() {
    let buffer = model.scene.children[0].geometry.attributes.position.array
    const positionAttribute = new THREE.BufferAttribute(buffer, 3, true)
    geometryRef.current.setAttribute('position', positionAttribute)
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  useEffect(() => {
    setBufferAttribute()
  }, [])

  return (
    <>
      <OrbitControls camera={camera} />
      <points ref={pointsRef}>
        <bufferGeometry ref={geometryRef} />
        <beyonceShaderMaterial ref={materialRef} />
      </points>

      <mesh onPointerMove={onMouseMove}>
        <planeGeometry args={[400, 370, 1, 1]} />
        <meshBasicMaterial color={'white'} visible={false} />
      </mesh>
    </>
  )
}

export default Beyonce
