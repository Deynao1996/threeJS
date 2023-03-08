import * as ReactDOM from 'react-dom/client'
import App from './components/App'
import { BrowserRouter as Router } from 'react-router-dom'
import './style.css'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)
root.render(
  <Router>
    <App />
  </Router>
)
