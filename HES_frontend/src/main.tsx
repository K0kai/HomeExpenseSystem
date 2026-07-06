import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppLoader from './AppLoader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppLoader>
      <App />
    </AppLoader>
    
  </StrictMode>,
)
