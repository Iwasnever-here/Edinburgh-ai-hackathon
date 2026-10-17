import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './airline.css'
import AirlinePortal from './AirlinePortal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AirlinePortal />
  </StrictMode>,
)
