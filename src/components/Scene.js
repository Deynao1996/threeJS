import { CssBaseline } from '@mui/material'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Sketch, { sketchProps } from './Figures/SketchShaderMaterial'

const canvasProps = {
  camera: { position: [0, 0, 7], fov: 30 },
  style: { zIndex: 110 }
}

const Scene = () => {
  return (
    <>
      <Canvas {...sketchProps}>
        <color attach="background" args={['black']} />
        <CssBaseline />
        <Suspense fallback={null}>
          <Sketch />
        </Suspense>
      </Canvas>
    </>
  )
}

// import Ribbons, { ribbonsProps } from './Figures/RibbonsShaderMaterial'
// import Truchet, { truchetProps } from './Figures/TruchetShaderMaterial'
// import Thing from './Figures/ThingShaderMaterial'
// import Mattka from './Figures/MattkaShaderMaterial'
// import Tornado from './Figures/TornadoShaderMaterial'
// import Midwam, { midreamCanvasProps } from './Models/MidwamShaderMaterial'
// import Gradient, { gradientCanvasProps } from './Figures/GradientShaderMaterial'
// import Lusion from './Figures/LusionShaderMaterial'
// import Antoni from './Galleries/AntoniShaderMaterial'
// import Boeve from '../Figures/BoeveShaderMaterial'
// import Bubbles from '../CannonJS/Bubbles'
// import Billie from '../Images/BillieShaderMaterial'
// import Hajime from './Galleries/HajimeShaderMaterial'
// import Tao from './Galleries/TaoShaderMaterial'
// import Triangles from '../Figures/TriangleShaderMaterial'
// import Deburis from './Galleries/DeburisShaderMaterial'
// import Whatever from '../Images/WhateverShaderMaterial'
// import Video from '../Video/Video'
// import Cannon from '../CannonJS/Cannon'
// import Image from '../Images/ImageShaderMaterial'
// import Barovier from '../Images/BarovierShaderMaterial'
// import Wave from '../Images/WaveShaderMaterial'
// import Text from '../Images/TextShaderMaterial'
// import Grid from '../Figures/GridShaderMaterial'
// import Head from '../Models/HeadShaderMaterial'
// import Watches from '../Images/WatchesShaderMaterial'
// import Ancient from '../Models/AncientShaderMaterial'
// import Waves from '../Images/WavesShaderMaterial'
// import Sun from '../Figures/SunShaderMaterial'
// import Monopo from '../Figures/MonopoShaderMaterial'
// import Clouds from '../Figures/CloudsShaderMaterial'
// import Mathis from '../Models/MathisShaderMaterial'
// import Pixi from '../Images/PixiShaderMaterial'
// import Beyonce from '../Models/BeyonceShaderMaterial'
// import Volt from '../Images/VoltShaderMaterial'
// import Forest, { forestCanvasProps } from './Galleries/ForestShaderMaterial'

export default Scene
