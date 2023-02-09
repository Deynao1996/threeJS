import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { createPortal, extend, useFrame, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useMemo, useRef, useState } from 'react'
import SimplexNoise from 'simplex-noise'
import * as THREE from 'three'
import { Scene } from 'three'

const simplex = new SimplexNoise()

function computeCurl(x, y, z) {
  var eps = 0.0001

  var curl = new THREE.Vector3()

  var n1 = simplex.noise3D(x, y + eps, z)
  var n2 = simplex.noise3D(x, y - eps, z)

  var a = (n1 - n2) / (2 * eps)
  var n1 = simplex.noise3D(x, y, z + eps)
  var n2 = simplex.noise3D(x, y, z - eps)

  var b = (n1 - n2) / (2 * eps)
  curl.x = a - b

  n1 = simplex.noise3D(x, y, z + eps)
  n2 = simplex.noise3D(x, y, z - eps)
  a = (n1 - n2) / (2 * eps)
  n1 = simplex.noise3D(x + eps, y, z)
  n2 = simplex.noise3D(x - eps, y, z)
  b = (n1 - n2) / (2 * eps)
  curl.y = a - b

  n1 = simplex.noise3D(x + eps, y, z)
  n2 = simplex.noise3D(x - eps, y, z)
  a = (n1 - n2) / (2 * eps)
  n1 = simplex.noise3D(x, y + eps, z)
  n2 = simplex.noise3D(x, y - eps, z)
  b = (n1 - n2) / (2 * eps)
  curl.z = a - b

  return curl
}

const TubeShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new THREE.Texture(),
    uLight: new THREE.Vector3(0, 0, 0)
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

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    varying vec2 vUv;

    uniform vec3 uLight;
    uniform float uTime;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / 15.), 0.4);
    }

    void main() {
      float dash = sin(vUv.x*50. + uTime);
      if (dash < 0.3) discard;

      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));
      float dist = length(uLight - vNormal);

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);
      float final = diffusion*scatter;
      
      // gl_FragColor = vec4(1. - dist, 0., 0., 1.);
      gl_FragColor = vec4(final, 0., 0., 1.);
    }  
  `
)

const LusionShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new THREE.Texture(),
    uLight: new THREE.Vector3(0, 0, 0)
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

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    varying vec2 vUv;

    uniform vec3 uLight;

    float getScatter(vec3 cameraPos, vec3 dir, vec3 lightPos, float d) {
      vec3 q = cameraPos - lightPos;

      float b = dot(dir, q);
      float c = dot(q, q);

      float t = c - b*b;
      float s = 1.0 / sqrt(max(0.0001, t));
      float l = s * (atan((d + b) * s) - atan(b*s));

      return pow(max(0.0, l / 150.), 0.4);
    }

    void main() {
      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));
      float dist = length(uLight - vNormal);

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);
      float final = diffusion*scatter;
      
      // gl_FragColor = vec4(1. - dist, 0., 0., 1.);
      gl_FragColor = vec4(scatter, 0., 0., 1.);
    }  
  `
)

extend({ LusionShaderMaterial, TubeShaderMaterial })

const Lusion = () => {
  const { camera, gl, scene } = useThree()
  const [virtualScene] = useState(() => new Scene())

  const tubesMaterialRef = useRef([])
  const planeMaterialRef = useRef()
  const sphereRef = useRef()

  const eMouseRef = useRef(new THREE.Vector2())
  const elasticMouseRef = useRef(new THREE.Vector2(0, 0))
  const elasticMouseVelRef = useRef(new THREE.Vector2(0, 0))
  const tempRef = useRef(new THREE.Vector2(0, 0))

  const onMouseMove = (e) => {
    eMouseRef.current = new THREE.Vector2(e.point.x, e.point.y)
    planeMaterialRef.current.uLight = new THREE.Vector3(e.point.x, e.point.y, 0)
    tubesMaterialRef.current.forEach((tube) => {
      tube.uLight = new THREE.Vector3(e.point.x, e.point.y, 0)
    })
  }

  function getCurve(start) {
    const scale = 1
    const num = 600
    const points = []
    const currentPoint = start.clone()

    points.push(start)

    for (let i = 0; i < num; i++) {
      const v = computeCurl(
        currentPoint.x / scale,
        currentPoint.y / scale,
        currentPoint.z / scale
      )
      currentPoint.addScaledVector(v, 0.001)
      points.push(currentPoint.clone())
    }
    return points
  }

  function createElasticMouse() {
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

  function consistentScenesRender() {
    gl.autoClear = false
    gl.render(scene, camera)
    gl.clearDepth()
    gl.render(virtualScene, camera)
  }

  function animateTubes(clock) {
    const time = clock.getElapsedTime()
    tubesMaterialRef.current.forEach((tube) => {
      tube.uTime = time * 0.1
    })
  }

  function renderTubes() {
    const tubes = []
    const num = 100

    for (let i = 0; i < num; i++) {
      const curve = getCurve(
        new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        )
      )
      const path = new THREE.CatmullRomCurve3(curve)

      tubes.push(
        <mesh key={i}>
          <tubeGeometry args={[path, 600, 0.005, 8, false]} />
          <tubeShaderMaterial
            ref={(el) => (tubesMaterialRef.current[i] = el)}
          />
        </mesh>
      )
    }
    return tubes
  }

  useFrame(({ clock }) => {
    animateTubes(clock)
    consistentScenesRender()
    createElasticMouse()
  }, 1)

  const memoTubes = useMemo(() => renderTubes(), [])

  return (
    <>
      {/* <OrbitControls camera={camera} /> */}
      <group>{createPortal(memoTubes, virtualScene)}</group>
      <group>
        <mesh onPointerMove={onMouseMove}>
          <planeBufferGeometry args={[10, 10, 1, 2]} />
          <lusionShaderMaterial ref={planeMaterialRef} />
        </mesh>
        <mesh ref={sphereRef}>
          <sphereBufferGeometry args={[0.01, 20, 20]} />
          <meshBasicMaterial color={'cornsilk'} />
        </mesh>
      </group>
    </>
  )
}

export default Lusion
