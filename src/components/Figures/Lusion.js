import { OrbitControls } from '@react-three/drei'
import { createPortal, extend, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import SimplexNoise from 'simplex-noise'
import * as THREE from 'three'
import { Scene } from 'three'
import {
  LusionShaderMaterial,
  TubeShaderMaterial
} from '../ExtendableShaders/LusionShaders'

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
      <OrbitControls camera={camera} />
      <group>{createPortal(memoTubes, virtualScene)}</group>
      <group>
        <mesh onPointerMove={onMouseMove}>
          <planeGeometry args={[10, 10, 1, 2]} />
          <lusionShaderMaterial ref={planeMaterialRef} />
        </mesh>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.01, 20, 20]} />
          <meshBasicMaterial color={'cornsilk'} />
        </mesh>
      </group>
    </>
  )
}

export default Lusion
