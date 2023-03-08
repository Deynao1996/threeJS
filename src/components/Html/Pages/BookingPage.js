import { useRef } from 'react'
import Sketch from '../../Figures/SketchShaderMaterial'
import Footer from '../Footer'
import Header from '../Header'
import HtmlLayout from '../HtmlLayout'
import MainContent from '../MainContent'

const BookingPage = ({ handleNavigate }) => {
  const scrollProgressRef = useRef()
  const layoutRef = useRef()

  return (
    <>
      <Sketch
        postProgress={1.0}
        num={50}
        handleNavigate={handleNavigate}
        scrollProgressRef={scrollProgressRef}
        layoutRef={layoutRef}
      />
      <HtmlLayout ref={layoutRef}>
        <Header handleNavigate={handleNavigate} layoutRef={layoutRef} />
        <MainContent title="BOOKING" subtitle="PROJECT" />
        <Footer ref={scrollProgressRef} />
      </HtmlLayout>
    </>
  )
}

export default BookingPage
