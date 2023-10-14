import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  DoubleSide,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PlaneGeometry
} from 'three'
import { extendMaterial } from '../../utils/extendMaterial'
import { useEffect } from 'react'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'

const noise = `
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
`

const dirLightProps = {
  args: [0xffffff, 0.5],
  position: [-3, 2, 0],
  castShadow: true,
  'shadow-camera-left': -2,
  'shadow-camera-right': 2,
  'shadow-camera-top': 2,
  'shadow-camera-bottom': -2,
  'shadow-mapSize-width': 2048,
  'shadow-mapSize-height': 2048,
  'shadow-camera-near': 0.1,
  'shadow-camera-far': 10,
  'shadow-bias': -0.001
}

const Ribbon = ({ count = 7, length = 2, thickness = length / count }) => {
  const { camera } = useThree()

  return (
    <>
      <OrbitControls camera={camera} />
      <color attach="background" args={['#001524']} />
      <Lights />
      <group>
        <Floor length={length} />
        {[...new Array(count)].map((_, i) => (
          <Line
            key={i}
            i={i}
            count={count}
            length={length}
            thickness={thickness}
          />
        ))}
      </group>
    </>
  )
}

const Lights = () => {
  const sunRef = useRef()
  return (
    <group>
      <ambientLight args={[0xffffff, 0.3]} />
      <directionalLight {...dirLightProps} ref={sunRef} />
      <directionalLight args={[0xffffff, 0.5]} position={[0, 3, -3]} />
    </group>
  )
}

const Line = ({ i, count, length, thickness }) => {
  const progress = i / (count - 1)
  // Calculate the amplitude using a sin function
  let amp = Math.sin(progress * Math.PI)
  amp = Math.max(0.1, amp)

  const meshRef = useRef()
  // Define the template material using MeshStandardMaterial and extending it
  const templateMaterial = useMemo(
    () =>
      extendMaterial(MeshStandardMaterial, {
        header: `
      varying vec3 vEye;
      uniform float uTime;
      uniform float uOffset;
      uniform float uAmp;
      ${noise}  
    `,
        vertexHeader: `
          float getPos(vec3 pos) {
            float ss = smoothstep(1., 0.4, pos.z) * smoothstep(-1., -0.6, pos.z);
            float noiseFreq = 1.5;
            float noiseAmp = uAmp;
            vec3 noisePos = vec3(
              uTime,
              uOffset,
              pos.z * noiseFreq + uTime * .1
            );
            return (0.1 + 0.8 * cnoise(noisePos)) * uAmp * ss;
          }
          vec3 getCurrentPos(vec3 pos) {
            vec3 newPos = pos;
            newPos.y += getPos(pos);
            return newPos;
          }
          vec3 getNormal(vec3 pos) {
            vec3 currPos = getCurrentPos(pos);
            vec3 nextPos = getCurrentPos(pos + vec3(0., 0., 0.01));
            vec3 tangent = normalize(nextPos - currPos);
            vec3 biTangent = vec3(1., 0., 0.);
            vec3 normal = normalize(cross(tangent, biTangent));
            return normal;
          }
        `,
        fragmentHeader: '',
        vertex: {
          '#include <begin_vertex>': `
          transformed.y += getPos(transformed.xyz);
        `,
          '#include <beginnormal_vertex>': `
          objectNormal = getNormal(position.xyz);
        `
        },
        fragment: {},
        material: {
          side: DoubleSide
        },
        uniforms: {
          diffuse: new Color(0xffffff),
          uTime: {
            shared: true,
            mixed: true,
            linked: true,
            value: 0
          },
          uOffset: {
            shared: true,
            mixed: true,
            linked: true,
            value: i
          },
          uAmp: {
            shared: true,
            mixed: true,
            linked: true,
            value: amp
          }
        }
      }),
    []
  )
  // Create an extended depth material using the template material
  const extendedDepthMaterial = useMemo(
    () =>
      extendMaterial(MeshDepthMaterial, {
        template: templateMaterial
      }),
    [templateMaterial]
  )

  useEffect(() => {
    meshRef.current.geometry.rotateX(-Math.PI / 2)
  }, [])

  useFrame(({ clock }) => {
    meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh
      ref={meshRef}
      castShadow
      receiveShadow
      position={[i * thickness - length / 2 + thickness / 2, 0, 0]}
      material={templateMaterial}
      key={i}
      customDepthMaterial={extendedDepthMaterial}
      uOffset={i}
    >
      <planeGeometry args={[thickness, length, 1, 300]} />
    </mesh>
  )
}

const Floor = ({ length }) => {
  const geo = useMemo(() => {
    const planeGeo = new PlaneGeometry(30, 30, 200, 200).rotateX(-Math.PI / 2)
    const brush1 = new Brush(planeGeo)
    brush1.updateMatrixWorld()

    const brush2 = new Brush(new BoxGeometry(length, 100, length))
    brush2.updateMatrixWorld()

    const evaluator = new Evaluator()
    const result = evaluator.evaluate(brush1, brush2, SUBTRACTION)
    return result.geometry
  }, [length])

  return (
    <mesh receiveShadow geometry={geo}>
      <meshStandardMaterial color={0xffffff} side={DoubleSide} />
    </mesh>
  )
}

export default Ribbon
