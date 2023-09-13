import { Effects, OrbitControls, Stats } from '@react-three/drei'
import { extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import env from '../../resources/img/midwam.jpg'

export const midreamCanvasProps = {
  camera: { position: [-1, 0, 0], fov: 70 }
}

const Midwam = () => {
  const model = useLoader(GLTFLoader, '/midwamModel/human.glb', (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    loader.setDRACOLoader(dracoLoader)
  })
  const envMap = useLoader(TextureLoader, env)

  const { gl, camera } = useThree()
  const modelRef = useRef()
  gl.toneMapping = THREE.ACESFilmicToneMapping
  gl.toneMappingExposure = 0.7

  const customEnvMap = useMemo(() => {
    const gen = new THREE.PMREMGenerator(gl)
    gen.compileEquirectangularShader()
    const map = gen.fromEquirectangular(envMap).texture
    gen.dispose()
    return map
  }, [envMap])

  const customMaterial = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0.28
    })
    m.envMap = customEnvMap
    m.onBeforeCompile = (shader) => {
      handleBeforeCompile(shader)
      m.userData.shader = shader
    }
    return m
  }, [customEnvMap])

  function handleBeforeCompile(shader) {
    shader.uniforms.uTime = { value: 0 }
    shader.fragmentShader =
      `
    uniform float uTime;

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
  ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <envmap_physical_pars_fragment>`,
      `
      #if defined( USE_ENVMAP )
        vec3 getIBLIrradiance( const in vec3 normal ) {
          #if defined( ENVMAP_TYPE_CUBE_UV )
            vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
            vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
            return PI * envMapColor.rgb * envMapIntensity;
          #else
            return vec3( 0.0 );
          #endif
        }
        vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
          #if defined( ENVMAP_TYPE_CUBE_UV )
            vec3 reflectVec = reflect( - viewDir, normal );
            // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
            reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
            reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

            reflectVec = rotate(reflectVec, vec3(1., 0., 0.), uTime * 0.1);
            vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
            return envMapColor.rgb * envMapIntensity;
          #else
            return vec3( 0.0 );
          #endif
        }
      #endif
      `
    )
  }

  function setModelParams(model) {
    const human = model.scene.children[0]
    human.scale.set(0.1, 0.1, 0.1)
    human.geometry.center()

    human.material = customMaterial
  }

  function handleRotate(time) {
    if (modelRef.current) {
      modelRef.current.rotation.y = time * 0.2
      const modelShader = modelRef.current.children[0].material.userData.shader
      if (modelShader) {
        modelShader.uniforms.uTime.value = time
      }
    }
  }

  useEffect(() => {
    model && setModelParams(model)
  }, [model])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    handleRotate(time)
  })

  return (
    <>
      <OrbitControls camera={camera} />
      <ambientLight intensity={0.8} />

      {/* <Effects disableGamma>
        <unrealBloomPass strength={3} radius={0.8} threshold={0.05} />
        <customDotsPass progress={progress} />
      </Effects> */}
      <Stats />
      {!!model && <primitive object={model.scene} ref={modelRef} />}
    </>
  )
}

export default Midwam
