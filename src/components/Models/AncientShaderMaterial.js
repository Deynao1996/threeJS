import { OrbitControls, Sampler, shaderMaterial, useGLTF } from "@react-three/drei"
import { extend, useLoader, useThree, useFrame } from "@react-three/fiber"
import glsl from "babel-plugin-glsl/macro"
import { useEffect, useRef } from "react"
import * as THREE from 'three'
import { TextureLoader } from "three"
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import colorsPalette from 'nice-color-palettes'

import mapCap from '../../resources/maps/matCap.png'

const AncientShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0.0,
    uImage: new THREE.Texture(),
    uDisplacement: new THREE.Texture()
  },
  glsl`
    precision mediump float;

    attribute vec3 color;
    attribute float size;

    varying vec3 vColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;

    uniform float uTime;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
              -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // float noise = snoise(position.xy*10. + vec2(uTime/10.));
      float noise = snoise(vNormal.xz*10. + vec2(uTime/10.));

      vUv = uv;
      vNormal = normal;
      vColor = color;
      vPosition = position;
      vNoise = noise;

      vec3 newPos = position+normal*0.01+3.*noise*normal;
      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.);
      gl_PointSize = (10. + size*5.) * (1. / -mvPosition).z;
      gl_Position = projectionMatrix * mvPosition;

      // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vNoise;

    uniform float uTime;
    uniform sampler2D uDisplacement;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      float disc = smoothstep(0.5, 0.45, dist);

      gl_FragColor = vec4(vColor, disc*vNoise);
      if (disc < 0.01) discard;
    }  
  `
)

extend({AncientShaderMaterial})

const Ancient = () => {
  const { nodes } = useGLTF('/ancientModel/scene.gltf')
  const model = useGLTF('/ancientModel/scene.gltf')
  const [ texture ] = useLoader(TextureLoader, [mapCap])
  const { camera } = useThree()

  const groupRef = useRef()
  const matcapRef = useRef()
  const materialRef = useRef()
  const bufferGeometryRef = useRef()

  function setBufferGeometry() {
    const mesh = model.scene.children[0].children[0].children[0]
    const sampler = new MeshSurfaceSampler(mesh)
      .setWeightAttribute('uv')
      .build()
    
    const number = 50000
    const pointsPos = new Float32Array(number*3)
    const colors = new Float32Array(number*3)
    const sizes = new Float32Array(number)
    const normals = new Float32Array(number*3)
    const color = colorsPalette[Math.floor(Math.random()*100)]

    for (let i = 0; i < number; i++) {
      let _position = new THREE.Vector3()
      let _normal = new THREE.Vector3()
      let randomColor = new THREE.Color(color[Math.floor(Math.random()*5)])
      
      sampler.sample(_position, _normal)
      pointsPos.set([_position.x, _position.y, _position.z], i*3)
      normals.set([_normal.x, _normal.y, _normal.z], i*3)
      colors.set([randomColor.r, randomColor.g, randomColor.b], i*3)
      sizes.set([Math.random()], i)
    }

    bufferGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(pointsPos, 3))
    bufferGeometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    bufferGeometryRef.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    bufferGeometryRef.current.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  }

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    materialRef.current.uTime = time
  })

  useEffect(() => setBufferGeometry(), [])


  return (
    <>
      <OrbitControls camera={camera} />
      <group ref={groupRef} dispose={null} scale={[0.06, 0.06, 0.06]}>
        <group rotation={[3*Math.PI / 2, -Math.PI / 2*4, -Math.PI / 2*5]}>
          {/* <points geometry={nodes.Object_2.geometry}>
            <ancientShaderMaterial />
          </points> */}
          <points>
            <bufferGeometry ref={bufferGeometryRef} />
            <ancientShaderMaterial 
              ref={materialRef}
              transparent={true}
              blending={THREE.AdditiveBlending}
              depthTest={false}
              depthWrite={false}
            />
          </points>
          <mesh geometry={nodes.Object_2.geometry}>
            <meshMatcapMaterial 
              opacity={0.2}
              matcap={texture} 
              // transparent={true} 
              // blending={THREE.AdditiveBlending}
              // depthTest={true}
              // depthWrite={true}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}

useGLTF.preload('/ancientModel/scene.gltf')

export default Ancient