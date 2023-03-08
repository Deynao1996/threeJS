import { useRef } from 'react'
import Sketch from '../../Figures/SketchShaderMaterial'
import Dna from '../../Models/DnaShaderMaterial'
import Footer from '../Footer'
import Header from '../Header'
import HtmlLayout from '../HtmlLayout'
import MainContent from '../MainContent'

const AboutPage = ({ handleNavigate }) => {
  const scrollProgressRef = useRef()
  const layoutRef = useRef()

  return (
    <>
      {/* <Sketch
        postProgress={1.0}
        num={100}
        handleNavigate={handleNavigate}
        scrollProgressRef={scrollProgressRef}
        layoutRef={layoutRef}
      /> */}
      <Dna />
      <HtmlLayout ref={layoutRef}>
        <Header handleNavigate={handleNavigate} layoutRef={layoutRef} />
        <MainContent title="ABOUT" subtitle="ME" />
        <Footer ref={scrollProgressRef} />
      </HtmlLayout>
    </>
  )
}

export default AboutPage
