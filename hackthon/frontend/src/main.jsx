import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './premium.css'
import App from './App.jsx'

alert('DEBUG: Live Hackathon Version 2.0 Loading...');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
