import { useRef } from 'react'
import Sketch from '../../Figures/SketchShaderMaterial'
import Footer from '../Footer'
import Header from '../Header'
import HtmlLayout from '../HtmlLayout'
import MainContent from '../MainContent'

const MainPage = ({ handleNavigate }) => {
  const scrollProgressRef = useRef()
  const layoutRef = useRef()

  return (
    <>
      <Sketch
        handleNavigate={handleNavigate}
        scrollProgressRef={scrollProgressRef}
        layoutRef={layoutRef}
      />
      <HtmlLayout ref={layoutRef}>
        <Header handleNavigate={handleNavigate} layoutRef={layoutRef} />
        <MainContent />
        <Footer ref={scrollProgressRef} />
      </HtmlLayout>
    </>
  )
}

export default MainPage
