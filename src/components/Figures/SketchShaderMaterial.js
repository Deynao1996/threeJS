import {
  Effects,
  Html,
  OrbitControls,
  shaderMaterial,
  Stats,
  useAspect
} from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useControls } from 'leva'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { CustomDotsPass } from '../Effects/CustomDotsPass'
import { Box, Container, Grid, Stack, Typography } from '@mui/material'
import styled from '@emotion/styled'

export const sketchProps = {
  camera: { position: [0, 0, 20], fov: 30 },
  style: { position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }
}

const StyledHTML = styled(Html)({
  position: 'fixed',
  width: '100vw',
  height: '100vh',
  inset: 0
})

const SurfaceShaderMaterial = shaderMaterial(
  {
    uTime: 0,
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

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    
    uniform float uTime;
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

      gl_FragColor = vec4(1. - dist, 0, 0., 1.);
      gl_FragColor = vec4(diffusion, 0, 0., 1.);
      gl_FragColor = vec4(scatter, 0, 0., 1.);
    }  
  `
)

const LinesShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uLight: new THREE.Vector3(0, 0, 0)
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
      // float dash = sin(vUv.x*50. + vTime);
      // if (dash < 0.3) discard;

      // float o = fract(vTime / 20.);
      // float myLength = 0.05;
      // if (abs(vUv.x - o) > myLength && abs(vUv.x - o - 1.) > myLength && abs(vUv.x - o + 1.) > myLength) {
      //   discard;
      // }

      vec3 cameraToWorld = v_worldPosition - cameraPosition;
      vec3 cameraToWorldDir = normalize(cameraToWorld);
      float cameraToWorldDistance = length(cameraToWorld);

      vec3 lightToWorld = normalize(uLight - v_worldPosition);
      float diffusion = max(0., dot(vNormal, lightToWorld));

      float dist = length(uLight - vPosition);
      float r = 0.3;
      dist *= r;

      float scatter = getScatter(cameraPosition, cameraToWorldDir, uLight, cameraToWorldDistance);

      gl_FragColor = vec4(1. - dist, 0, 0., 1.);
      gl_FragColor = vec4(diffusion, 0, 0., 1.);
      gl_FragColor = vec4(scatter, 0, 0., 1.);
      // gl_FragColor = vec4(1., 1., 0., 1.);
    }  
  `
)

extend({
  LinesShaderMaterial,
  SurfaceShaderMaterial,
  UnrealBloomPass,
  CustomDotsPass
})

const Sketch = ({ num = 10 }) => {
  const { camera, gl, scene } = useThree()
  const [virtualScene] = useState(() => new THREE.Scene())
  const model = useLoader(GLTFLoader, '/ribbons/spline.glb')
  const geo = model?.scene.children[0].geometry.clone()
  geo.computeVertexNormals()

  const { rotX, rotY, rotZ, posX, posY, posZ } = useControls({
    rotX: { value: 0.5, min: 0, max: 10, step: 0.1 },
    rotY: { value: 0.5, min: 0, max: 10, step: 0.1 },
    rotZ: { value: 0.5, min: 0, max: 10, step: 0.1 },
    posX: { value: 0.5, min: 0, max: 10, step: 0.1 },
    posY: { value: 0.5, min: 0, max: 10, step: 0.1 },
    posZ: { value: 0.5, min: 0, max: 10, step: 0.1 }
  })

  const size = useAspect(1920, 1080)

  const linesMaterialRef = useRef()
  const meshRef = useRef()
  const sphereRef = useRef()
  const surfaceMaterialRef = useRef()

  const eMouseRef = useRef(new THREE.Vector2())
  const elasticMouseRef = useRef(new THREE.Vector2(0, 0))
  const elasticMouseVelRef = useRef(new THREE.Vector2(0, 0))
  const tempRef = useRef(new THREE.Vector2(0, 0))

  function setBufferAttribute() {
    const instancedPosition = []
    const instancedRotationAngle = []
    const instancedRotationAxis = []

    for (let i = 0; i < num; i++) {
      instancedPosition.push(
        2 * (Math.random() - posX),
        2 * (Math.random() - posY),
        2 * (Math.random() - posZ)
      )
      instancedRotationAxis.push(
        2 * (Math.random() - rotX),
        2 * (Math.random() - rotY),
        2 * (Math.random() - rotZ)
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

  function consistentScenesRender() {
    gl.autoClear = false
    gl.render(scene, camera)
    gl.clearDepth()
    gl.render(virtualScene, camera)
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
    // eMouseRef.current = new THREE.Vector2(e.point.x, e.point.y)
    console.log(e.point.x)
    console.log(
      ((((e.clientX / window.innerWidth) * 2 - 1) * size[0]) / size[1]) * 10
    )
    // console.log(e.clientX)
    // console.log(window.innerWidth)
    console.log(size)

    eMouseRef.current = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    )
  }

  useLayoutEffect(() => void setBufferAttribute())

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    consistentScenesRender()
    setUniforms(time)
    elasticMouse()
  })

  return (
    <>
      {/* <Stats /> */}
      {/* <OrbitControls camera={camera} /> */}
      {/* <Effects disableGamma multisamping={0.5}>
        <customDotsPass progress={1.0} />
      </Effects> */}

      <group>
        <instancedMesh ref={meshRef} args={[geo, null, num]}>
          <linesShaderMaterial
            ref={linesMaterialRef}
            side={THREE.DoubleSide}
            transparent={true}
            depthWrite={false}
            depthTest={false}
          />
        </instancedMesh>
        <group>
          <mesh onPointerMove={handleMouseMove} scale={size}>
            <planeBufferGeometry args={[1920, 1080, 1, 1]} />
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
