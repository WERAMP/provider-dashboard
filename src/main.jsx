import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProviderDashboard from './components/ProviderDashboard'

// Derive basename dynamically from the browser URL.
// URLs follow the pattern /:location/provider[/:provider_name]
// e.g. ampintelligence.ai/flatiron/provider → basename = /flatiron/provider
const parts = window.location.pathname.split('/').filter(Boolean)
const locationSlug = parts[0] || 'flatiron'
const basename = `/${locationSlug}/provider`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<ProviderDashboard />} />
        <Route path="/:provider" element={<ProviderDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
