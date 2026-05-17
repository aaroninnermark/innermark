import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Initialize Capacitor plugins when running as native app
async function initCapacitor() {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { Keyboard } = await import('@capacitor/keyboard')

    // Hide splash after app loads
    await SplashScreen.hide()

    // Style status bar
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#faf9f6' })

    // Keyboard behavior
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open')
    })
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open')
    })
  } catch {
    // Not running in Capacitor (web) — silently ignore
  }
}

initCapacitor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#faf9f6',
            color: '#2e5934',
            border: '1px solid #cce1cc',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
