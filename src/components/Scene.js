import { CssBaseline } from '@mui/material'
import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Dna from './Models/DnaShaderMaterial'

const canvasProps = {
  camera: { position: [0, 0, 7], fov: 30 },
  style: { zIndex: 110 }
}

const Scene = () => {
  return (
    <>
      <Canvas {...canvasProps}>
        <color attach="background" args={['black']} />
        <CssBaseline />
        <Suspense fallback={null}>
          <Dna />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}
// import CrossWire, { crossWireProps } from './Models/CrossWireShaderMaterial'
// import Head from './Models/HeadShaderMaterial'
// import Ancient from './Models/AncientShaderMaterial'
// import Mathis from './Models/MathisShaderMaterial'
// import Beyonce from './Models/BeyonceShaderMaterial'

// import Galaxy, { galaxyProps } from './Figures/GalaxyShaderMaterial'
// import Sun from './Figures/SunShaderMaterial'
// import Monopo from './Figures/MonopoShaderMaterial'
// import Clouds from './Figures/CloudsShaderMaterial'
// import Sketch, { sketchProps } from './Figures/SketchShaderMaterial'
// import Ribbons, { ribbonsProps } from './Figures/RibbonsShaderMaterial'
// import Truchet, { truchetProps } from './Figures/TruchetShaderMaterial'
// import Thing from './Figures/ThingShaderMaterial'
// import Mattka from './Figures/MattkaShaderMaterial'
// import Tornado from './Figures/TornadoShaderMaterial'
// import Midwam, { midreamCanvasProps } from './Models/MidwamShaderMaterial'
// import Lusion from './Figures/LusionShaderMaterial'
// import Boeve from './Figures/BoeveShaderMaterial'
// import Gradient, { gradientCanvasProps } from './Figures/GradientShaderMaterial'
// import Triangles from './Figures/TriangleShaderMaterial'
// import Grid from './Figures/GridShaderMaterial'

// import Pixi from './Images/PixiShaderMaterial'
// import Volt from './Images/VoltShaderMaterial'
// import Forest, { forestCanvasProps } from './Galleries/ForestShaderMaterial'
// import Antoni from './Galleries/AntoniShaderMaterial'
// import Bubbles from '../CannonJS/Bubbles'
// import Billie from './Images/BillieShaderMaterial'
// import Hajime from './Galleries/HajimeShaderMaterial'
// import Tao from './Galleries/TaoShaderMaterial'
// import Deburis from './Galleries/DeburisShaderMaterial'
// import Whatever from './Images/WhateverShaderMaterial'
// import Video from './Video/Video'
// import Cannon from './CannonJS/Cannon'
// import Image from './Images/ImageShaderMaterial'
// import Barovier from './Images/BarovierShaderMaterial'
// import Wave from './Images/WaveShaderMaterial'
// import Text from './Images/TextShaderMaterial'
// import Watches from './Images/WatchesShaderMaterial'
// import Waves from './Images/WavesShaderMaterial'

export default Scene
