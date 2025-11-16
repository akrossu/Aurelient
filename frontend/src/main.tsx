import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PredictionModeProvider } from './context/PredictionModeContext'
import { DevBoundariesProvider } from './context/DevBoundariesContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PredictionModeProvider>
    <DevBoundariesProvider>
      <App />
    </DevBoundariesProvider>
  </PredictionModeProvider>
)
