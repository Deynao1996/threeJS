import { Routes, Route } from 'react-router-dom'
import AboutPage from './Html/Pages/AboutPage'
import CanvasLayout from './Html/CanvasLayout'
import MainPage from './Html/Pages/MainPage'
import OtherPage from './Html/Pages/OtherPage'
import { withNavigate } from './Html/withNavigate'

import Scene from './Scene'
import SocialPage from './Html/Pages/SocialPage'
import BookingPage from './Html/Pages/BookingPage'
import DashboardPage from './Html/Pages/DashboardPage'

const WithNavigateMainPage = withNavigate(MainPage)
const WithNavigateSocialPage = withNavigate(SocialPage)
const WithNavigateBookingPage = withNavigate(BookingPage)
const WithNavigateDashboardPage = withNavigate(DashboardPage)
const WithNavigateOtherPage = withNavigate(OtherPage)
const WithNavigateAboutPage = withNavigate(AboutPage)

const App = () => {
  // return <Scene />
  return (
    <Routes>
      <Route path="/" element={<CanvasLayout />}>
        <Route index element={<WithNavigateMainPage />} />
        <Route path="works/social" element={<WithNavigateSocialPage />} />
        <Route path="works/booking" element={<WithNavigateBookingPage />} />
        <Route path="works/dashboard" element={<WithNavigateDashboardPage />} />
        <Route path="works/other" element={<WithNavigateOtherPage />} />
        <Route path="about" element={<WithNavigateAboutPage />} />
      </Route>
      <Route path="*" element={<div>123</div>}>
        <Route path="*" element={<div>Error 404</div>} />
      </Route>
    </Routes>
  )
}

export default App
