import { Effects, PerspectiveCamera, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useControls } from 'leva'
import { CustomDotsPass } from '../Effects/CustomDotsPass'
import gsap from 'gsap'
import { useLocation } from 'react-router-dom'

export const sketchProps = {
  camera: { position: [0, 0, 20], fov: 30 },
  style: { position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }
}

export function normalizeMousePosition(e, size, perspective) {
  const posX = (e.clientX / size.width) * 2 - 1
  const posY = -(e.clientY / size.height) * 2 + 1

  const kX = (size.width / 2 / perspective) * 10
  const kY = (size.height / 2 / perspective) * 10

  return {
    normalizeX: posX * kX,
    normalizeY: posY * kY
  }
}

const pathsSequenceArr = [
  '/',
  '/works/social',
  '/works/booking',
  '/works/dashboard',
  '/works/other'
]

const SurfaceShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uLight: new THREE.Vector3(0, 0, 0),
    uProgress: 1.0
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;

      v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uLight;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      float brightness = 15.;
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / brightness), 0.4);
    }

    void main() {
      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));

      float dist = length(uLight - vPosition);
      float r = 0.3;
      dist *= r;

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);

      gl_FragColor = vec4(diffusion, 0, 0., 1.);
      gl_FragColor = vec4(1. - dist, 0, 0., 1.);
      gl_FragColor = vec4(scatter * uProgress, 0., 0., 1.);
    }  
  `
)

const LinesShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uLight: new THREE.Vector3(0, 0, 0),
    uProgress: 1.0,
    uIsDiscard: false,
    uAnimationLines: false
  },
  glsl`
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 v_worldPosition;
  varying float vTime;

  attribute vec3 aPosition;
  attribute vec3 aRotationAxis;
  attribute float aRotationAngle;

  uniform float uTime;

  float PI = 3.141592653589793238;

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

  void main() {
    vUv = uv;
    vPosition = position;
    vTime = uTime;
    vNormal = normal;
    v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    // vec3 newPosition = position + aPosition;
    vec3 newPosition = position + sin(vUv.x* 10. + vTime) / 4. + aPosition;

    newPosition = rotate(newPosition, aRotationAxis, aRotationAngle * PI * 4.);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 v_worldPosition;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying float vTime;

    uniform vec3 uLight;
    uniform float uProgress;
    uniform bool uIsDiscard;
    uniform bool uAnimationLines;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      float brightness = 15.;
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / brightness), 0.4);
    }

    void main() {
      // Cut lines
      if (uIsDiscard) {
        float dash = sin(vUv.x*50. + vTime);
        if (dash < 0.3) discard;
      }

      //Move lines
      if (uAnimationLines) {
        float o = fract(vTime / 20.);
        float myLength = 0.05;
        if (abs(vUv.x - o) > myLength && abs(vUv.x - o - 1.) > myLength && abs(vUv.x - o + 1.) > myLength) {
          discard;
        }
      }


      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));

      float dist = length(uLight - vPosition);
      float r = 0.3;
      dist *= r;

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);

      gl_FragColor = vec4(diffusion, 0, 0., 1.);
      gl_FragColor = vec4(1. - dist, 0, 0., 1.);
      gl_FragColor = vec4(scatter * uProgress, 0., 0., 1.);
      // gl_FragColor = vec4(1., 1., 0., 1.);
    }  
  `
)

extend({
  LinesShaderMaterial,
  SurfaceShaderMaterial,
  CustomDotsPass
})

const Sketch = ({
  scrollProgressRef,
  layoutRef,
  postProgress,
  handleNavigate,
  isDiscard,
  animationLines,
  num = 10,
  perspective = 800
}) => {
  const { camera, size } = useThree()
  const [isTransitionAppear, setIsTransitionAppear] = useState(true)
  const location = useLocation()
  const model = useLoader(GLTFLoader, '/ribbons/spline.glb')
  const geo = useMemo(() => model?.scene.children[0].geometry.clone(), [model])

  const fov = useMemo(
    () => (180 * (2 * Math.atan(size.height / 2 / perspective))) / Math.PI,
    [size, perspective]
  )
  // const { rotX, rotY, rotZ, posX, posY, posZ } = useControls({
  //   rotX: { value: 0.5, min: 0, max: 10, step: 0.1 },
  //   rotY: { value: 0.5, min: 0, max: 10, step: 0.1 },
  //   rotZ: { value: 0.5, min: 0, max: 10, step: 0.1 },
  //   posX: { value: 0.5, min: 0, max: 10, step: 0.1 },
  //   posY: { value: 0.5, min: 0, max: 10, step: 0.1 },
  //   posZ: { value: 0.5, min: 0, max: 10, step: 0.1 }
  // })
  const linesMaterialRef = useRef()
  const meshRef = useRef()
  const sphereRef = useRef()
  const surfaceMaterialRef = useRef()
  const groupRef = useRef()

  const eMouseRef = useRef(new THREE.Vector2())
  const elasticMouseRef = useRef(new THREE.Vector2(0, 0))
  const elasticMouseVelRef = useRef(new THREE.Vector2(0, 0))
  const tempRef = useRef(new THREE.Vector2(0, 0))
  const speedRef = useRef(0)
  const positionRef = useRef(0)

  function setBufferAttribute() {
    const instancedPosition = []
    const instancedRotationAngle = []
    const instancedRotationAxis = []

    for (let i = 0; i < num; i++) {
      instancedPosition.push(
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5)
      )
      instancedRotationAxis.push(
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5),
        2 * (Math.random() - 0.5)
      )
      instancedRotationAngle.push(Math.random())
    }

    meshRef.current.geometry.setAttribute(
      'aPosition',
      new THREE.InstancedBufferAttribute(new Float32Array(instancedPosition), 3)
    )
    meshRef.current.geometry.setAttribute(
      'aRotationAxis',
      new THREE.InstancedBufferAttribute(
        new Float32Array(instancedRotationAxis),
        3
      )
    )
    meshRef.current.geometry.setAttribute(
      'aRotationAngle',
      new THREE.InstancedBufferAttribute(
        new Float32Array(instancedRotationAngle),
        1
      )
    )
  }

  function elasticMouse() {
    sphereRef.current.position.x = elasticMouseRef.current.x
    sphereRef.current.position.y = elasticMouseRef.current.y
    tempRef.current
      .copy(eMouseRef.current)
      .sub(elasticMouseRef.current)
      .multiplyScalar(0.15)
    elasticMouseVelRef.current.add(tempRef.current)
    elasticMouseVelRef.current.multiplyScalar(0.8)
    elasticMouseRef.current.add(elasticMouseVelRef.current)
  }

  function setUniforms(time) {
    const { x, y } = elasticMouseRef.current

    surfaceMaterialRef.current.uLight = new THREE.Vector3(x, y, 0)
    linesMaterialRef.current.uLight = new THREE.Vector3(x, y, 0)

    linesMaterialRef.current.uTime = time
    surfaceMaterialRef.current.uTime = time
  }

  function handleMouseMove(e) {
    const { normalizeX, normalizeY } = normalizeMousePosition(
      e,
      size,
      perspective
    )
    eMouseRef.current = new THREE.Vector2(normalizeX, normalizeY)
  }

  function animateCamera() {
    camera.rotation.x = elasticMouseRef.current.y * 0.001
    camera.rotation.y = -elasticMouseRef.current.x * 0.001

    groupRef.current.rotation.x = elasticMouseRef.current.y * 0.01
  }

  function handleScroll(e) {
    speedRef.current += e.deltaY * 0.0003
  }

  function manualNavigate(n) {
    let nextIndex =
      pathsSequenceArr.findIndex((path) => path === location.pathname) + n
    if (nextIndex > pathsSequenceArr.length - 1) {
      nextIndex = 0
    } else if (nextIndex < 0) {
      nextIndex = pathsSequenceArr.length - 1
    }

    handleNavigate(pathsSequenceArr[nextIndex])
  }

  function scrollAnimation() {
    positionRef.current += speedRef.current
    speedRef.current *= 0.7
    let i = Math.round(positionRef.current)
    let diff = i - positionRef.current

    if (!isTransitionAppear) positionRef.current += diff * 0.1

    const k = gsap.utils.clamp(-0.2, 0.2, positionRef.current % 1)
    const normalizeK = gsap.utils.normalize(-0.2, 0.2, k)
    const scrollNormalizeK = 100 - normalizeK * 100

    if (scrollNormalizeK <= 1) {
      handleDisappearTransition(1)
    } else if (scrollNormalizeK >= 100) {
      handleDisappearTransition(-1)
    }

    camera.rotation.x -= k * 0.1
    groupRef.current.rotation.x -= k

    scrollProgressRef.current &&
      gsap.set(scrollProgressRef.current, {
        strokeDashoffset: 200 - normalizeK * 200,
        opacity: Math.abs(100 - normalizeK * 200) + '%'
      })
  }

  function handleDisappearTransition(n) {
    const tl = gsap.timeline()

    tl.to(layoutRef.current, {
      opacity: 0,
      duration: 2,
      filter: 'blur(5px)',
      onStart: () => setIsTransitionAppear(true)
    })

    tl.to(
      gsap.utils.toArray([
        linesMaterialRef.current,
        surfaceMaterialRef.current
      ]),
      {
        uProgress: 0,
        duration: 3
      },
      '='
    )
    tl.to(
      camera.position,
      {
        z: 25,
        duration: 3,
        onComplete: () => manualNavigate(n)
      },
      '='
    )
  }

  function handleAppearTransition() {
    gsap.fromTo(
      gsap.utils.toArray([
        linesMaterialRef.current,
        surfaceMaterialRef.current
      ]),
      {
        uProgress: 0
      },
      {
        uProgress: 1,
        duration: 4,
        onComplete: () => setIsTransitionAppear(false)
      }
    )
  }

  useLayoutEffect(() => void setBufferAttribute(), [geo])

  useEffect(() => void handleAppearTransition(), [])

  useEffect(() => {
    if (!isTransitionAppear) {
      window.addEventListener('wheel', handleScroll)
      return () => window.removeEventListener('wheel', handleScroll)
    }
  }, [isTransitionAppear])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    setUniforms(time)
    elasticMouse()
    animateCamera()
    scrollAnimation()
  })

  return (
    <>
      <PerspectiveCamera
        makeDefault
        args={[fov, size.width / size.height, 1, 10000]}
        position={[0, 0, 10]}
      />

      {postProgress && (
        <Effects disableGamma multisamping={0.5}>
          <customDotsPass progress={postProgress} />
        </Effects>
      )}

      {/* <OrbitControls /> */}

      <group ref={groupRef}>
        <instancedMesh ref={meshRef} args={[geo, null, num]}>
          <linesShaderMaterial
            ref={linesMaterialRef}
            side={THREE.DoubleSide}
            uIsDiscard={isDiscard}
            uAnimationLines={animationLines}
            transparent={true}
            depthWrite={false}
            depthTest={false}
          />
        </instancedMesh>
        <group>
          <mesh onPointerMove={handleMouseMove}>
            <planeBufferGeometry args={[150, 150, 1, 1]} />
            <surfaceShaderMaterial
              side={THREE.DoubleSide}
              ref={surfaceMaterialRef}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
          <mesh ref={sphereRef}>
            <sphereBufferGeometry args={[0.1, 20, 20]} />
            <meshBasicMaterial color={0xa8e6c} />
          </mesh>
        </group>
      </group>
    </>
  )
}

export default Sketch
