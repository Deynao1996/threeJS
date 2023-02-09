import { useThree } from "@react-three/fiber"

const FakeMesh = ({ squaresMaterialRef }) => {
  const { scene } = useThree()
  const onMouseMove = (e) => {
    squaresMaterialRef.current.uMouse = e.point

    scene.rotation.x = -e.point.y / 10
    scene.rotation.y = e.point.x / 10
  }


  return (
    <mesh onPointerMove={onMouseMove} visible={false}>
      <planeBufferGeometry args={[5, 5]} />
      <meshBasicMaterial />
    </mesh>
  )
}

export default FakeMesh