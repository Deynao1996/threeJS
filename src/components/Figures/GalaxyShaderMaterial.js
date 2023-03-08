import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import particle from '../../resources/img/particle.jpg'

export const galaxyProps = {
  camera: { position: [0, 2, 2], fov: 30 }
}

const circleOptions = [
  {
    minRadius: 0.5,
    maxRadius: 1.5,
    color: '#f7b373',
    particleSize: 1,
    amp: 1
  },
  {
    minRadius: 0.5,
    maxRadius: 1.7,
    color: '#88b3ce',
    particleSize: 0.5,
    amp: 3
  }
]

function lerp(a, b, t) {
  return a * (1 - t) + b * t
}

const GalaxyShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uSize: 0,
    uAmp: 1,
    uMouse: new THREE.Vector3(),
    uTexture: new THREE.Texture(),
    uColor: new THREE.Color()
  },
  glsl`
    varying vec2 vUv;

    attribute vec3 aPosition;

    uniform float uTime;
    uniform vec3 uMouse;
    uniform float uSize;
    uniform float uAmp;

    vec3 mod289(vec3 x)
    {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x)
    {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x)
    {
      return mod289(((x*34.0)+10.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    vec3 fade(vec3 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

    // Classic Perlin noise
    float cnoise(vec3 P)
    {
      vec3 Pi0 = floor(P); // Integer part for indexing
      vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
      Pi0 = mod289(Pi0);
      Pi1 = mod289(Pi1);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
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

    // Classic Perlin noise, periodic variant
    float pnoise(vec3 P, vec3 rep)
    {
      vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
      vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
      Pi0 = mod289(Pi0);
      Pi1 = mod289(Pi1);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
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

    mat3 rotation3dY(float angle) {
      float s = sin(angle);
      float c = cos(angle);

      return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
      );
    }

    float saturate(float x)
    {
      return clamp(x, 0.0, 1.0);
    }

    vec3 curl_noise(vec3 p)
    {

      // return curlNoise(p);
      const float step = 0.01;
      float ddx = cnoise(p+vec3(step, 0.0, 0.0)) - cnoise(p-vec3(step, 0.0, 0.0));
      float ddy = cnoise(p+vec3(0.0, step, 0.0)) - cnoise(p-vec3(0.0, step, 0.0));
      float ddz = cnoise(p+vec3(0.0, 0.0, step)) - cnoise(p-vec3(0.0, 0.0, step));

      const float divisor = 1.0 / ( 2.0 * step );
      return ( vec3(ddy - ddz, ddz - ddx, ddx - ddy) * divisor );
    }

    vec3 fbm_vec3(vec3 p, float frequency, float offset)
    {
      return vec3(
        cnoise((p+vec3(offset))*frequency),
        cnoise((p+vec3(offset+20.0))*frequency),
        cnoise((p+vec3(offset-30.0))*frequency)
      );
    }

    vec3 getOffset(vec3 p) {
      float twist_scale = cnoise(aPosition) * 0.5 + 0.5;
      vec3 tempPos = rotation3dY(uTime * (0.1 + 0.5 * twist_scale) + length(aPosition.xz)) * p;
      vec3 offset = fbm_vec3(aPosition, 0.5, 0.);
      return offset * 0.5 * uAmp;
    }


    void main() {
      vUv = position.xy + vec2(0.5);
      vec3 finalPos = aPosition + position * 0.1;

      float particle_size = cnoise(aPosition * 5.) * 0.5 + 0.5;

      vec3 world_pos = rotation3dY(uTime * (0.1 + 0.5 * particle_size))* aPosition;

      vec3 offset0 = getOffset(world_pos);
      vec3 offset = fbm_vec3(world_pos + offset0, 0., 0.);

      vec3 particle_position = (modelMatrix * vec4(world_pos + offset + offset0, 1.)).xyz;

      float distanceToMouse = pow(1. - clamp(length(uMouse.xz - particle_position.xz) - 0.3, 0., 1.), 4.);
      vec3 dir = particle_position - uMouse;

      float radius = 0.05;
      particle_position = mix(particle_position, uMouse + normalize(dir) * radius, distanceToMouse);


      vec4 view_position = viewMatrix * vec4(particle_position, 1.);

      view_position.xyz += position * uSize * (0.01 + 0.1 * particle_size);

      // gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * view_position;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform vec3 uColor;
    uniform sampler2D uTexture;

    void main() {
      vec4 color = texture2D(uTexture, vUv);
      gl_FragColor = vec4(uColor, color.r);
    }  
  `
)

extend({ GalaxyShaderMaterial })

const Galaxy = () => {
  const { camera } = useThree()
  const [texture] = useLoader(THREE.TextureLoader, [particle])
  const dummyPlane = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const materialsRef = useRef([])
  const sphereRef = useRef()

  function handleMouseMove(e) {
    sphereRef.current.position.copy(e.point)
    materialsRef?.current.forEach((ref) => {
      ref.uMouse = e.point
    })
  }

  useFrame(({ clock }) => {
    materialsRef?.current.forEach((ref) => {
      ref.uTime = clock.getElapsedTime()
    })
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerMove={handleMouseMove}
      >
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshBasicMaterial color={0xff0000} wireframe={true} />
      </mesh>
      <mesh ref={sphereRef} visible={false}>
        <sphereBufferGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={0xff0000} wireframe={true} />
      </mesh>
      <group>
        {circleOptions.map((config, i) => (
          <Circle
            key={i}
            dummyPlane={dummyPlane}
            texture={texture}
            ref={(el) => (materialsRef.current[i] = el)}
            {...config}
          />
        ))}
      </group>
    </>
  )
}

const Circle = React.forwardRef(
  (
    {
      count = 1000,
      minRadius = 0.5,
      maxRadius = 1,
      color = '#f7b373',
      particleSize = 1,
      amp = 1,
      dummyPlane,
      texture
    },
    ref
  ) => {
    const geometryRef = useRef()

    function prepareGeometry(count) {
      geometryRef.current.instanceCount = count
      geometryRef.current.setAttribute(
        'position',
        dummyPlane.getAttribute('position')
      )
      geometryRef.current.index = dummyPlane.index
    }

    function setBufferPosition(count, minRadius, maxRadius) {
      let pos = new Float32Array(count * 3)

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI
        const r = lerp(minRadius, maxRadius, Math.random())

        const x = r * Math.sin(theta)
        const y = (Math.random() - 0.5) * 0.1
        const z = r * Math.cos(theta)

        pos.set([x, y, z], i * 3)
      }
      geometryRef.current.setAttribute(
        'aPosition',
        new THREE.InstancedBufferAttribute(pos, 3, false)
      )
    }

    useEffect(() => void prepareGeometry(count), [count])

    useEffect(
      () => void setBufferPosition(count, minRadius, maxRadius),
      [count, minRadius, maxRadius]
    )

    return (
      <mesh>
        <instancedBufferGeometry ref={geometryRef} />
        <galaxyShaderMaterial
          ref={ref}
          side={THREE.DoubleSide}
          uTexture={texture}
          uColor={color}
          uAmp={amp}
          uSize={particleSize}
          transparent={true}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    )
  }
)

export default Galaxy
