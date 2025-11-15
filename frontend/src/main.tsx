import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PredictionModeProvider } from './context/PredictionModeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PredictionModeProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </PredictionModeProvider>
)
