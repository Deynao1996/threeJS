import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import loadable from '@loadable/component'

const defaultLabel = 'Boeve'
const componentsArr = [
  { label: '--FIGURES--', component: null },
  { label: 'Boeve', component: loadable(() => import('./Figures/Boeve')) },
  { label: 'Clouds', component: loadable(() => import('./Figures/Clouds')) },
  { label: 'Dave', component: loadable(() => import('./Figures/Dave')) },
  {
    label: 'Galaxy',
    component: loadable(() => import('./Figures/Galaxy')),
    props: {
      camera: { position: [0, 2, 2], fov: 30 }
    }
  },
  {
    label: 'Gradient',
    component: loadable(() => import('./Figures/Gradient')),
    props: {
      camera: { position: [0, 0, 0.4], fov: 100 }
    }
  },
  { label: 'Grid', component: loadable(() => import('./Figures/Grid')) },
  { label: 'Lusion', component: loadable(() => import('./Figures/Lusion')) },
  { label: 'Mattka', component: loadable(() => import('./Figures/Mattka')) },
  { label: 'Monopo', component: loadable(() => import('./Figures/Monopo')) },
  {
    label: 'Ribbons',
    component: loadable(() => import('./Figures/Ribbons')),
    props: {
      camera: { position: [0, 0, 10], fov: 70 }
    }
  },
  { label: 'Sun', component: loadable(() => import('./Figures/Sun')) },
  { label: 'Tornado', component: loadable(() => import('./Figures/Tornado')) },
  {
    label: 'Triangle',
    component: loadable(() => import('./Figures/Triangle'))
  },
  {
    label: 'Truchet',
    component: loadable(() => import('./Figures/Truchet')),
    props: {
      camera: { position: [0, 0, -4], fov: 10 }
    }
  },
  { label: '--GALLERIES--', component: null },
  { label: 'Antoni', component: loadable(() => import('./Galleries/Antoni')) },
  {
    label: 'Deburis',
    component: loadable(() => import('./Galleries/Deburis'))
  },
  {
    label: 'Forest',
    component: loadable(() => import('./Galleries/Forest')),
    props: {
      camera: { position: [0, 0, 7], fov: 35 },
      linear: true
    }
  },
  { label: 'Hajime', component: loadable(() => import('./Galleries/Hajime')) },
  { label: 'Tao', component: loadable(() => import('./Galleries/Tao')) },
  { label: '--IMAGES--', component: null },
  { label: 'Barovier', component: loadable(() => import('./Images/Barovier')) },
  { label: 'Billie', component: loadable(() => import('./Images/Billie')) },
  { label: 'Image', component: loadable(() => import('./Images/Image')) },
  { label: 'Pixi', component: loadable(() => import('./Images/Pixi')) },
  { label: 'Text', component: loadable(() => import('./Images/Text')) },
  { label: 'Volt', component: loadable(() => import('./Images/Volt')) },
  { label: 'Watches', component: loadable(() => import('./Images/Watches')) },
  { label: 'Wave', component: loadable(() => import('./Images/Wave')) },
  { label: 'Waves', component: loadable(() => import('./Images/Waves')) },
  { label: 'Whatever', component: loadable(() => import('./Images/Whatever')) },
  { label: '--MODELS--', component: null },
  { label: 'Ancient', component: loadable(() => import('./Models/Ancient')) },
  { label: 'Beyonce', component: loadable(() => import('./Models/Beyonce')) },
  {
    label: 'CrossWire',
    component: loadable(() => import('./Models/CrossWire'))
  },
  { label: 'Head', component: loadable(() => import('./Models/Head')) },
  { label: 'Mathis', component: loadable(() => import('./Models/Mathis')) },
  { label: 'Midwam', component: loadable(() => import('./Models/Midwam')) },
  { label: '--VIDEO--', component: null },
  {
    label: 'Video',
    component: loadable(() => import('./Video/Video')),
    props: {
      camera: { position: [0, 0, 7], fov: 7 }
    }
  },
  { label: '--TEMPLATE--', component: null },
  { label: 'Template', component: loadable(() => import('./Template')) }
]

const defaultProps = {
  camera: { position: [0, 0, 7], fov: 30 }
}

const Scene = () => {
  const [selectedValue, setSelectedValue] = useState(defaultLabel)
  const selectedProps = componentsArr.find(
    (item) => item.label === selectedValue
  )?.props
  const canvasProps = selectedProps ? selectedProps : defaultProps

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value)
  }

  const renderSelectedComponent = () => {
    const SelectedComponent = componentsArr.find(
      (c) => c.label === selectedValue
    ).component
    if (SelectedComponent) {
      return <SelectedComponent />
    }
    return null
  }

  return (
    <>
      <CustomSelect
        selectedValue={selectedValue}
        handleSelectChange={handleSelectChange}
      />
      <Canvas {...canvasProps} style={{ zIndex: 110 }}>
        <color attach="background" args={['#0a0a0a']} />
        <Suspense fallback={null}>{renderSelectedComponent()}</Suspense>
      </Canvas>
      <Loader />
    </>
  )
}

const CustomSelect = ({ selectedValue, handleSelectChange }) => {
  return (
    <div className="container">
      <div className="select">
        <select onChange={handleSelectChange} value={selectedValue}>
          {componentsArr.map((item) => (
            <option
              value={item.label}
              key={item.label}
              disabled={!item.component}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
// import CrossWire, { crossWireProps } from './Models/CrossWire'
// import Head from './Models/Head'
// import Ancient from './Models/Ancient'
// import Mathis from './Models/Mathis'
// import Beyonce from './Models/Beyonce'
// import Dna from './Models/Dna'

// import Triangles from './Figures/Triangle'
// import Dave from './Figures/Dave'
// import Sun from './Figures/Sun'
// import Tornado from './Figures/Tornado'
// import Monopo from './Figures/Monopo'
// import Sketch, { sketchProps } from './Figures/Sketch'
// import Ribbons, { ribbonsProps } from './Figures/Ribbons'
// import Truchet, { truchetProps } from './Figures/Truchet'
// import Tornado from './Figures/Tornado'
// import Midwam, { midreamCanvasProps } from './Models/Midwam'
// import Lusion from './Figures/Lusion'
// import Boeve from './Figures/Boeve'
// import Gradient, { gradientCanvasProps } from './Figures/Gradient'
// import Grid from './Figures/Grid'
// import Galaxy, { galaxyProps } from './Figures/Galaxy'
// import Clouds from './Figures/Clouds'

// import Forest, { forestCanvasProps } from './Galleries/Forest'
// import Antoni from './Galleries/Antoni'
// import Gallery, { galleryProps } from './Galleries/Gallery'
// import Hajime from './Galleries/Hajime'
// import Tao from './Galleries/Tao'
// import Deburis from './Galleries/Deburis'
// import Video, { videoCanvasProps } from './Video/Video'
// import Pixi from './Images/Pixi'
// import Volt from './Images/Volt'
// import Billie from './Images/Billie'
// import Whatever from './Images/Whatever'
// import Image from './Images/Image'
// import Barovier from './Images/Barovier'
// import Wave from './Images/Wave'
// import Text from './Images/Text'
// import Watches from './Images/Watches'
// import Waves from './Images/Waves'

export default Scene
