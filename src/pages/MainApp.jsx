import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import CheckInPage from './CheckInPage'
import TrendsPage from './TrendsPage'
import JournalPage from './JournalPage'
import SupportPage from './SupportPage'
import Logo, { LogoWatermark } from '../components/ui/Logo'

const TABS = [
  { id: 'checkin', path: '/', label: 'Check In', icon: null, isLogo: true },
  { id: 'trends', path: '/trends', label: 'Trends', icon: '📊' },
  { id: 'journal', path: '/journal', label: 'Journal', icon: '📝' },
  { id: 'support', path: '/support', label: 'Support', icon: '💡' },
]

export default function MainApp() {
  const navigate = useNavigate()
  const location = useLocation()

  const activeTab = TABS.find(t => t.path === location.pathname)?.id || 'checkin'

  // Restore last visited tab on mount
  useEffect(() => {
    const savedPath = sessionStorage.getItem('innermark_last_path')
    if (savedPath && savedPath !== '/' && location.pathname === '/') {
      navigate(savedPath, { replace: true })
    }
  }, [])

  // Save current tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('innermark_last_path', location.pathname)
  }, [location.pathname])

  // Listen for navigation events from child components
  useEffect(() => {
    function handleIntentionNav() { navigate('/intentions') }
    function handleNav(e) { navigate(e.detail) }
    window.addEventListener('navigate-to-intentions', handleIntentionNav)
    window.addEventListener('navigate-to', handleNav)
    return () => {
      window.removeEventListener('navigate-to-intentions', handleIntentionNav)
      window.removeEventListener('navigate-to', handleNav)
    }
  }, [])

  function handleTabPress(tab) {
    navigate(tab.path)
  }

  return (
    <div className="min-h-screen bg-warm-50 relative">
      {/* Subtle logo watermark on every page */}
      <LogoWatermark />

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<CheckInPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar z-20">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabPress(tab)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95 ${
              activeTab === tab.id
                ? 'text-sage-700'
                : 'text-warm-400 hover:text-warm-600'
            }`}
          >
            {tab.isLogo ? (
              <Logo
                size={22}
                className={`transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}
              />
            ) : (
              <span className="text-xl leading-none">{tab.icon}</span>
            )}
            <span className={`text-xs font-medium ${activeTab === tab.id ? 'text-sage-700' : ''}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-sage-500" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
