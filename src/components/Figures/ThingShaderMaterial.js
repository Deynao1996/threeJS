import {
  Box,
  Center,
  OrbitControls,
  OrthographicCamera,
  Plane,
  shaderMaterial,
  Text3D,
  useAspect
} from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useControls } from 'leva'
import { useEffect } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import font from '../../resources/fonts/Poppins_Bold.json'

const ThingShaderMaterial = shaderMaterial(
  {
    uTime: 0.0,
    uResolution: new THREE.Vector2(),
    uRotation: 0.0,
    uLineWidth: 0.0,
    uRepeat: 0.0
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
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
    uniform float uRotation;
    uniform float uLineWidth;
    uniform float uRepeat;
    uniform vec2 uResolution;

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

    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }

    float aastep(float threshold, float value) {
      #ifdef GL_OES_standard_derivatives
        float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
        return smoothstep(threshold-afwidth, threshold+afwidth, value);
      #else
        return step(threshold, value);
      #endif  
    }

    float line(vec2 uv, float width) {
      float u = 0.;
      if (uv.x < 0.01) {
        u = 0.;
      } else if (uv.x > 1. - 0.01) {
        u = 0.;
      } else {
        u = aastep(width, uv.x) - aastep(1. - width, uv.x);
      }
      return u;
    }

    void main() {
      // vec2 newUV = gl_FragCoord.xy / uResolution;
      vec2 newUV = vPosition.xy;

      newUV = rotate(newUV, uRotation);
      float noise = cnoise(vec3(newUV + uTime / 10. + vPosition.z, 0.));
      newUV += vec2(noise);

      newUV = vec2(fract((newUV.x + newUV.y) * uRepeat), newUV.y);

      gl_FragColor = vec4(vec3(line(newUV, uLineWidth)), 1.);
    }  
  `
)

extend({ ThingShaderMaterial })

const Thing = () => {
  const { camera, size } = useThree()
  const materialsRef = useRef([])
  const boxRef = useRef()
  const textRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(0, 0))
  const targetMouseRef = useRef(new THREE.Vector2(0, 0))
  const { rotation, lineWidth, repeat, translate } = useControls({
    rotation: { value: 0, min: 0, max: Math.PI / 4, step: 0.01 },
    lineWidth: { value: 0.3, min: 0, max: 1, step: 0.01 },
    repeat: { value: 10, min: 0, max: 100, step: 1 },
    translate: { value: 0.02, min: -1.0, max: 1.0, step: 0.01 }
  })

  const frustumSize = 3
  const aspect = size.width / size.height

  function handlePointerMove({ pointer }) {
    mouseRef.current = pointer
  }

  function handleRotateBox() {
    targetMouseRef.current.x -=
      0.1 * (targetMouseRef.current.x - mouseRef.current.x)
    targetMouseRef.current.y -=
      0.1 * (targetMouseRef.current.y - mouseRef.current.y)

    boxRef.current.rotation.y = targetMouseRef.current.x
    boxRef.current.rotation.x = targetMouseRef.current.y
  }

  useEffect(() => {
    // boxRef.current.geometry.translate(0, 0, -0.05)
    textRef.current.geometry.translate(-1.5, 0, -0.2)
  }, [translate])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialsRef.current.forEach((m) => {
      m.uTime = time
    })

    // handleRotateBox()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <OrthographicCamera
        makeDefault
        position={[0, 0, 3]}
        left={(frustumSize * aspect) / -2}
        right={(frustumSize * aspect) / 2}
        top={frustumSize / 2}
        bottom={frustumSize / -2}
        near={1}
        far={1000}
      />
      <group onPointerMove={handlePointerMove}>
        <Plane args={[3 * aspect - 0.2 * aspect, 2.8, 1, 1]}>
          <thingShaderMaterial
            ref={(el) => (materialsRef.current[0] = el)}
            side={THREE.DoubleSide}
            uResolution={new THREE.Vector2(size.width, size.height)}
            uRotation={rotation}
            uLineWidth={lineWidth}
            uRepeat={repeat}
          />
        </Plane>
        <Text3D
          position={[0, 0, 0.5]}
          // translateOnAxis={[0, 0, 100]}
          size={0.4}
          font={font}
          ref={textRef}
          curveSegments={12}
          bevelEnabled
          height={0.2}
          // bevelSize={0.04}
          // bevelThickness={0.1}
          // lineHeight={0.5}
          // letterSpacing={-0.06}
        >
          Hello World!
          <thingShaderMaterial
            ref={(el) => (materialsRef.current[1] = el)}
            side={THREE.DoubleSide}
            uResolution={new THREE.Vector2(size.width, size.height)}
            uRotation={rotation}
            uLineWidth={lineWidth}
            uRepeat={repeat}
          />
        </Text3D>
        {/* <Box
          args={[1, 1, 0.2]}
          position={[0, 0, 1.2]}
          translateOnAxis={[0, 0, 10]}
          ref={boxRef}
        >
          <thingShaderMaterial
            ref={(el) => (materialsRef.current[2] = el)}
            side={THREE.DoubleSide}
            uResolution={new THREE.Vector2(size.width, size.height)}
            uRotation={rotation}
            uLineWidth={lineWidth}
            uRepeat={repeat}
          />
        </Box> */}
      </group>
    </>
  )
}

export default Thing
