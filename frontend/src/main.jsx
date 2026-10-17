import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AirlinePortal from './airline/AirlinePortal.jsx'
import LiveBidding from './live/LiveBidding.jsx'
import RedirectToLive from './live/RedirectToLive.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/airline" element={<AirlinePortal />} />
        <Route path="/live" element={<LiveBidding />} />
        <Route path="/judges" element={<RedirectToLive />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
