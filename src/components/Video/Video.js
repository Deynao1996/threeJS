import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRef } from 'react'

import FakeMesh from './FakeMesh'
import Lines from './Lines'
import Points from './Points'
import Squares from './Squares'
import VideoMesh from './VideoMesh'

export const videoCanvasProps = {
  camera: { position: [0, 0, 7], fov: 7 },
  style: { zIndex: 110 }
}

const Video = () => {
  const { camera } = useThree()
  const squaresMaterialRef = useRef()
  const counterRef = useRef(40)

  return (
    <>
      {/* <OrbitControls camera={camera} /> */}
      <group>
        <Squares
          squaresMaterialRef={squaresMaterialRef}
          counterRef={counterRef}
        />
        <VideoMesh />
        <FakeMesh squaresMaterialRef={squaresMaterialRef} />
        <Points counterRef={counterRef} />
        <Lines counterRef={counterRef} />
      </group>
    </>
  )
}

export default Video
