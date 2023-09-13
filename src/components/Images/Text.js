import { extend, useLoader, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { TextShaderMaterial } from '../ExtendableShaders/TextShader'
import text from '../../resources/img/background.jpg'
import { TextureLoader } from 'three'
import { OrbitControls } from '@react-three/drei'

extend({ TextShaderMaterial })

const Text = () => {
  const { camera } = useThree()
  const [textImage] = useLoader(TextureLoader, [text])
  const ref = useRef()

  const onMouseMove = (e) => {
    ref.current.uMouse = e.point
  }

  return (
    <>
      <OrbitControls camera={camera} />
      <mesh onPointerMove={onMouseMove}>
        <planeGeometry args={[2, 1, 100, 100]} />
        <textShaderMaterial
          ref={ref}
          uProgress={0.0}
          uColor="hotpink"
          uMouse={[1.0, 1.0, 1.0]}
          uImage={textImage}
        />
      </mesh>
    </>
  )
}

export default Text
