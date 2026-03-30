import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAppStore from './store/useAppStore'

// Pages
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import MainApp from './pages/MainApp'
import LoadingScreen from './components/ui/LoadingScreen'

export default function App() {
  const { user, isLoading, onboardingComplete, initAuth } = useAppStore()

  useEffect(() => {
    initAuth()
  }, [])

  if (isLoading) {
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
