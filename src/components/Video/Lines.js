import * as THREE from 'three'
import { useEffect, useRef } from "react"

const Lines = ({ counterRef }) => {

  function renderLinesContent() {
    let arr = []
    for (let i = -counterRef.current/2; i < counterRef.current/2; i++) {
      const start = [-5, i/10 + 0.05, 0]
      const end = [5, i/10 + 0.05, 0]

      arr.push(
        <Line 
          start={start}
          end={end}
          key={i}
        />
      )
    }

    for (let i = -counterRef.current/2; i < counterRef.current/2; i++) {
      const start = [i/10 + 0.05, -5,  0]
      const end = [i/10 + 0.05, 5, 0]

      arr.push(
        <Line 
          start={start}
          end={end}
          key={i + counterRef.current}
        />
      )
    }
    return arr
  }

  const lineContent = renderLinesContent()


  return (
    <group>
      {lineContent}
    </group>
  )
}

const Line = ({ start, end }) => {
  const lineRef = useRef()

  useEffect(() => {
    lineRef.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)))
    lineRef.current.position.z = 0.009
  }, [start, end])


  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial 
        color="white"
        transparent={true}
        opacity={0.1}
      />
    </line>
  )
}


export default Lines