import { OrbitControls, shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useLayoutEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

export const ribbonsProps = {
  camera: { position: [0, 0, 10], fov: 70 },
  style: { zIndex: 110 }
}

const RibbonsShaderMaterial = shaderMaterial(
  {
    uTime: 0
  },
  glsl`
    uniform float uTime;

    varying vec2 vUv;
    varying float vTime;

    attribute vec3 aPosition;
    attribute vec3 aRotationAxis;
    attribute float aRotationAngle;

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
      vTime = uTime;
      vec3 newPosition = position + sin(vUv.x* 10. + uTime) / 4. + aPosition;
      newPosition = rotate(newPosition, aRotationAxis, aRotationAngle * PI * 2.);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vTime;


    void main() {
      float o = fract(vTime / 20.);
      float length = 0.05;
      float myColor = 0.;

      myColor = 1. - 2. * abs(vUv.x - 0.5) + 0.1;
      myColor = myColor * myColor * myColor;

      if (abs(vUv.x - o) > length && abs(vUv.x - o - 1.) > length && abs(vUv.x - o + 1.) > length) {
        // discard;
      }

      gl_FragColor = vec4(vec3(myColor), 1.);
    }  
  `
)

extend({ RibbonsShaderMaterial })

const Ribbons = ({ num = 300 }) => {
  const { camera } = useThree()
  const model = useLoader(GLTFLoader, '/ribbons/spline.glb')
  const geo = model?.scene.children[0].geometry.clone()
  geo.computeVertexNormals()

  const materialRef = useRef()
  const meshRef = useRef()

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

  useLayoutEffect(() => void setBufferAttribute())

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <instancedMesh ref={meshRef} args={[geo, null, num]}>
        <ribbonsShaderMaterial ref={materialRef} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  )
}

export default Ribbons
