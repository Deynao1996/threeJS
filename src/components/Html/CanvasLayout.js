import { CssBaseline } from '@mui/material'
import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { sketchProps } from '../Figures/SketchShaderMaterial'

const CanvasLayout = () => {
  return (
    <>
      <CssBaseline enableColorScheme />
      <Canvas {...sketchProps}>
        <color attach="background" args={['black']} />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}

export default CanvasLayout
