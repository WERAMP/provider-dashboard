import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProviderDashboard from './components/ProviderDashboard'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/:location" element={<ProviderDashboard />} />
        <Route path="/" element={<Navigate to="/flatiron" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
