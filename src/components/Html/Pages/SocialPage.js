import { useRef } from 'react'
import Sketch from '../../Figures/SketchShaderMaterial'
import Footer from '../Footer'
import Header from '../Header'
import HtmlLayout from '../HtmlLayout'
import MainContent from '../MainContent'

const SocialPage = ({ handleNavigate }) => {
  const scrollProgressRef = useRef()
  const layoutRef = useRef()

  return (
    <>
      <Sketch
        postProgress={0.5}
        num={50}
        animationLines={true}
        handleNavigate={handleNavigate}
        scrollProgressRef={scrollProgressRef}
        layoutRef={layoutRef}
      />
      <HtmlLayout ref={layoutRef}>
        <Header handleNavigate={handleNavigate} layoutRef={layoutRef} />
        <MainContent title="SOCIAL" subtitle="PROJECT" />
        <Footer ref={scrollProgressRef} />
      </HtmlLayout>
    </>
  )
}

export default SocialPage
