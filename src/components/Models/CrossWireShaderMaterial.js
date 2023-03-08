import {
  OrbitControls,
  OrthographicCamera,
  shaderMaterial
} from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import glsl from 'babel-plugin-glsl/macro'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import mapUrl from '../../resources/maps/crosswireMatCap.png'
import scanUrl from '../../resources/img/scan.png'

export const crossWireProps = {
  camera: { position: [8, 12, 16], fov: 70, near: 1, far: 100 }
}

const CrossWireShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uMatCap: new THREE.Texture(),
    uScan: new THREE.Texture()
  },
  glsl`
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vTime;

    uniform float uTime;

    attribute float aRandom;

    void main() {
      vUv = uv;

      float offset =  aRandom + sin(uTime  + 15. * aRandom);
      offset *= 0.2;
      // offset *= 0.;

      vec4 mvPosition = modelMatrix * instanceMatrix* vec4(position, 1.0);
      mvPosition.y += offset;
      mvPosition = viewMatrix * mvPosition;

      vNormal = normalMatrix * mat3(instanceMatrix) * normal;
      vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
      worldPosition.y += offset;

      vWorldPosition = worldPosition.xyz;
      vViewPosition = - mvPosition.xyz;
      vTime = uTime;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vTime;

    uniform sampler2D uMatCap;
    uniform sampler2D uScan;


    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize( vViewPosition );
	    vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	    vec3 y = cross( viewDir, x );
	    vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

      vec2 scanUv = fract(vWorldPosition.xz);
      if (vNormal.y < 0.) {
        scanUv = fract(vUv * 10.);
      }
      vec4 scanMask = texture2D(uScan, scanUv);

      vec4 matcapColor = texture2D( uMatCap, uv );

      vec3 origin = vec3(0.);
      float dist = distance(vWorldPosition, origin);

      float radialMove = fract(dist - vTime);

      // radialMove *= 1. - smoothstep(1., 3., dist);

      radialMove *= 1. - step(vTime, dist);

      float scanMix = smoothstep(0.3, 0., 1. - radialMove) * 1.5;
      scanMix *= 1. + scanMask.r * 0.7;

      vec3 scanColor = mix(vec3(1.), vec3(0.5, 0.5, 1.), scanMix * 0.5);

      // gl_FragColor = vec4(vUv, 0., 1.);
      gl_FragColor = matcapColor;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, scanColor, scanMix * 0.5);
    }  
  `
)

extend({ CrossWireShaderMaterial })

const CrossWire = ({ rows = 20 }) => {
  const { size } = useThree()
  const model = useLoader(GLTFLoader, '/crossWireModel/ob1.glb')
  const [map, scan] = useLoader(THREE.TextureLoader, [mapUrl, scanUrl])

  const meshRef = useRef()
  const materialRef = useRef()
  const frustumSize = 10
  const aspect = size.width / size.height
  const geo = model?.scene.children[0].geometry.clone()
  geo.computeVertexNormals()

  function setCustomMatrixAt() {
    let dummy = new THREE.Object3D(),
      counter = 0,
      randomArr = new Float32Array(rows ** 2)

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        randomArr[counter] = Math.random()
        dummy.position.set(i - rows / 2, -10, j - rows / 2)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(counter++, dummy.matrix)
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    meshRef.current.geometry.setAttribute(
      'aRandom',
      new THREE.InstancedBufferAttribute(randomArr, 1)
    )
  }

  useEffect(() => {
    model && setCustomMatrixAt()
  })

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[8, 12, 16]}
        left={(frustumSize * aspect) / -2}
        right={(frustumSize * aspect) / 2}
        top={frustumSize / 2}
        bottom={frustumSize / -2}
        near={-1000}
        far={1000}
      />
      <OrbitControls />
      <group>
        <instancedMesh args={[geo, null, rows ** 2]} ref={meshRef}>
          <crossWireShaderMaterial
            uMatCap={map}
            uScan={scan}
            ref={materialRef}
          />
        </instancedMesh>
      </group>
    </>
  )
}

export default CrossWire
