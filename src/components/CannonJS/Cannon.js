import { Physics, useBox, useHeightfield } from "@react-three/cannon"
import { OrbitControls } from "@react-three/drei"
import { useLoader, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { TextureLoader } from "three"
import * as THREE from 'three'

import image from '../../resources/img/watches/watches1.jpg'


const Cannon = () => {
  const {camera} = useThree()

  function renderCards() {
    let arr = []
    for (let i = 0; i < 200; i++) {
      const card = <Card 
        key={i}
        position={[10*(Math.random() - 0.5), 4 + 4*Math.random(), 10*(Math.random() - 0.5)]} 
        rotation={[0.0, 0.0, 0.0]}
      />
      arr.push(card)
    }
    return arr
  }


  return (
    <Physics 
      allowSleep
      quatNormalizeFast
      quatNormalizeSkip={8}
      gravity={[0, -1, 0]}
    >
      <OrbitControls camera={camera}/>
      {renderCards()}
      <Plane />
    </Physics>
  )
}

const Plane = () => {
  const matrixRef = useRef([])
  const [ref] = useHeightfield(() => ({
    args: [matrixRef.current, {elementSize: 5}],
    rotation: [-Math.PI / 2, 0, 0],
    position: [-5, 0, 10]
  }))

  function fieldMatrixArray() {
    let sizeX = 20
    let sizeY = 20
    for (let i = 0; i < sizeX; i++) {
      matrixRef.current.push([])
      for (let j = 0; j < sizeY; j++) {
        matrixRef.current[i].push(Math.random() * 0.5)
      }
    }
  }

  useEffect(() => {
    fieldMatrixArray()
  }, [])


  return (
    <mesh ref={ref} position={[-5, 0, 20]}>
      <planeGeometry args={[100, 100]} />
      <meshPhongMaterial color='grey' visible={false}/>
    </mesh>
  )
}

const Card = ({ rotation, position }) => {
  const [normalMap] = useLoader(TextureLoader, [image])

  const args = [0.01, 1, 0.5]
  const [ref] = useBox(() => ({
    mass: 0.1, 
    position,
    rotation,
    args
  }))

  return (
    <mesh ref={ref}>
      <boxGeometry args={args}/>
      <meshLambertMaterial map={normalMap} side={THREE.DoubleSide}/>
    </mesh>
  )
}

export default Cannon