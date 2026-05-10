import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import useAppStore from './store/useAppStore'

// Pages
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import MainApp from './pages/MainApp'
import LoadingScreen from './components/ui/LoadingScreen'

export default function App() {
  const { user, isLoading, userReady, onboardingComplete, initAuth, loadHistory } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    initAuth()
  }, [])

  // After auth + profile fully loaded, restore last path if we're sitting at root
  useEffect(() => {
    if (!userReady || !user || !onboardingComplete) return
    const saved = localStorage.getItem('innermark_last_path')
    const validPaths = ['/trends', '/journal', '/support']
    if (saved && validPaths.includes(saved) && location.pathname === '/') {
      navigate(saved, { replace: true })
    }
  }, [userReady, user, onboardingComplete])

  // When tab becomes visible again, refresh data silently
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && user) {
        loadHistory()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  // Show loading until fully initialized
  if (isLoading || !userReady) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  if (!onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/*" element={<MainApp />} />
    </Routes>
  )
}
