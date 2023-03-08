import {
  Effects,
  OrbitControls,
  PerspectiveCamera,
  shaderMaterial,
  Stats
} from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useEffect, useMemo, useRef } from 'react'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CustomAberrationPass } from '../Effects/CustomAberrationPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { useControls } from 'leva'
import gsap from 'gsap'
import { Bloom, EffectComposer, TiltShift } from '@react-three/postprocessing'
import { normalizeMousePosition } from '../Figures/SketchShaderMaterial'

const DnaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uAppearProgress: 0,
    uMouse: new THREE.Vector3(),
    uColor1: new THREE.Color(),
    uColor2: new THREE.Color(),
    uColor3: new THREE.Color()
  },
  glsl`
    varying vec2 vUv;
    varying float vColorRandoms;

    uniform float uProgress;
    uniform float uTime;
    uniform vec3 uMouse;

    attribute float aRandoms;
    attribute float aColorRandoms;
    attribute float aOffset;

    float qinticInOut(float t) {
      return t < 0.5
        ? +16.0 * pow(t, 5.0)
        : -0.5 * pow(2.0 * t - 2.0, 5.0) + 1.0;
    }

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
      vUv = uv;
      vColorRandoms = aColorRandoms;

      vec3 newPos = position;
      vec3 noisePos;
      float uvOffset = uv.y;
      float distance = 3.;

      noisePos.x = snoise(vec4(position.x, position.y, position.z, uTime));
      noisePos.y = newPos.y + snoise(vec4(position.x, position.y, position.z, uTime));
      noisePos.z = 5. * snoise(vec4(position.x*0.5, position.y*0.5, position.z*0.5, uTime));
      
      newPos.y += qinticInOut(clamp(0., 1., (uProgress - aOffset * 0.9) / 0.1));
      
      if (length(newPos - uMouse) < distance) {
        float k = length(newPos - uMouse) / distance;
        k = sqrt(k);
        // newPos *= vec3(1. + k, 1., 2. + k);
        newPos = mix(newPos, noisePos, 1. - k);
      }
      
      // newPos.y += 3. * qinticInOut(clamp(0., 1., (uProgress - uvOffset * 0.6) / 0.4));

      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.);
      gl_PointSize = (70. * aRandoms + 30.) * (1. / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vColorRandoms;

    uniform float uTime;
    uniform float uAppearProgress;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    void main() {
      vec3 finalColor = uColor1;
      float alpha = 1. - smoothstep(-0.2, 0.5, length(gl_PointCoord - vec2(0.5)));
      alpha *= 0.5;
      
      if (vColorRandoms > 0.33 && vColorRandoms < 0.66) {
        finalColor = uColor2;
      }
      
      if (vColorRandoms > 0.66) {
        finalColor = uColor3;
      }

      // float gradient = smoothstep(0.38, 0.55, vUv.y);
      float gradient = 0.5;

      gl_FragColor = vec4(finalColor, 1.);
      gl_FragColor = vec4(finalColor * uAppearProgress, alpha * gradient);
    }  
  `
)

extend({ DnaShaderMaterial, CustomAberrationPass, UnrealBloomPass })

const Dna = ({ perspective = 900 }) => {
  const { camera, size } = useThree()
  const model = useLoader(GLTFLoader, '/dna/dna.glb', (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    loader.setDRACOLoader(dracoLoader)
  })
  const modelPositionX = 3
  const fov = useMemo(
    () => (180 * (2 * Math.atan(size.height / 2 / perspective))) / Math.PI,
    [size, perspective]
  )
  const geo = useMemo(() => {
    if (!model) return

    const tempGeo = model.scene.children[0].geometry.clone()
    const number = tempGeo.attributes.position.array.length
    // const tempGeo = new THREE.BufferGeometry()
    // const number = 90000

    const positions = new Float32Array(number)
    const randoms = new Float32Array(number / 3)
    const colorRandoms = new Float32Array(number / 3)
    const offset = new Float32Array(number / 3)

    for (let i = 0; i < number / 3; i++) {
      randoms.set([Math.random()], i)
      colorRandoms.set([Math.random()], i)

      // offset.set([Math.random()], i)
      // offset.set([Math.floor(i / 100) / 600])
      offset.set([(i % 100) / 100], i)

      const theta = 0.002 * Math.PI * 2 * Math.floor(i / 100)
      const radius = 0.03 * ((i % 100) - 50)

      const x = radius * Math.cos(theta)
      const y = 0.05 * Math.floor(i / 100)
      const z = radius * Math.sin(theta)

      positions.set([x, y, z], i * 3)
    }

    // tempGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    tempGeo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1))
    tempGeo.setAttribute('aRandoms', new THREE.BufferAttribute(randoms, 1))
    tempGeo.setAttribute(
      'aColorRandoms',
      new THREE.BufferAttribute(colorRandoms, 1)
    )
    tempGeo.center()
    return tempGeo
  }, [model])
  // const { progress } = useControls({
  //   progress: { value: 0.83, min: 0, max: 1, step: 0.01 }
  // })

  const pointsRef = useRef()
  const materialRef = useRef()
  const planeRef = useRef()
  const mouseRef = useRef([0, 0])

  function handleAppearTransition() {
    gsap.fromTo(
      materialRef.current,
      {
        uProgress: 0,
        uAppearProgress: 0
      },
      {
        uProgress: 0.83,
        uAppearProgress: 1,
        ease: 'back.out(1.7)',
        duration: 4
        // onComplete: () => setIsTransitionAppear(false)
      }
    )
  }

  function handleMouseMove(e) {
    const { normalizeX, normalizeY } = normalizeMousePosition(
      e,
      size,
      perspective
    )
    mouseRef.current = [normalizeX - modelPositionX, normalizeY]
    gsap.to(materialRef.current.uMouse, {
      x: normalizeX - modelPositionX,
      y: normalizeY,
      z: 0,
      duration: 1,
      ease: 'power2.out'
    })
  }

  useEffect(() => void handleAppearTransition(), [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 0.25
    pointsRef.current.rotation.y = time
    materialRef.current.uTime = time

    // materialRef.current.uProgress = progress
  })

  return (
    <>
      <PerspectiveCamera
        makeDefault
        args={[fov, size.width / size.height, 1, 10000]}
        position={[0, 0, 10]}
      />
      {/* <OrbitControls /> */}
      {/* <Stats /> */}

      <Particles mouse={mouseRef} />

      {/* <EffectComposer multisampling={0.5}>
        <Bloom
          intensity={2.0}
          width={size.width}
          height={size.height}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.025}
        />
        <TiltShift
          offset={0}
          rotation={0}
          focusArea={0.89}
          feather={0.3}
          bias={0.06}
        />
      </EffectComposer> */}

      <group position={[0, 0, 0]}>
        <mesh visible={false} ref={planeRef} onPointerMove={handleMouseMove}>
          <planeGeometry args={[150, 150, 1, 1]} />
          <meshBasicMaterial color={0xff0000} wireframe={true} />
        </mesh>
        <points
          geometry={geo}
          ref={pointsRef}
          position={[modelPositionX, 0, 0]}
        >
          <dnaShaderMaterial
            ref={materialRef}
            //light
            uColor1={0x00e6f6}
            uColor2={0x1f6cab}
            uColor3={0x082a3a}
            //violet
            // uColor1={0x9a0680}
            // uColor2={0x79018c}
            // uColor3={0x4c0070}
            //red
            // uColor1={0xc30101}
            // uColor2={0x560d0d}
            // uColor3={0x940000}
            //blue
            // uColor1={0x612574}
            // uColor2={0x293583}
            // uColor3={0x1954ec}
            transparent={true}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  )
}

const Particles = ({ count = 100, mouse }) => {
  const meshRef = useRef()

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])

  function handleAppearTransition() {
    gsap.fromTo(
      meshRef.current.material,
      {
        opacity: 0
      },
      {
        opacity: 1,
        ease: 'back.out(1.7)',
        duration: 4
        // onComplete: () => setIsTransitionAppear(false)
      }
    )
  }

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle

      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      particle.mx += (mouse.current[0] - particle.mx) * 0.01
      particle.my += (mouse.current[1] * -1 - particle.my) * 0.01

      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b +
          zFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  useEffect(() => void handleAppearTransition(), [])

  return (
    <>
      <ambientLight color="black" intensity={3} />
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshBasicMaterial
          color={0x00e6f6}
          transparent
          depthTest={true}
          depthWrite={true}
          opacity={1}
        />
      </instancedMesh>
    </>
  )
}

export default Dna
