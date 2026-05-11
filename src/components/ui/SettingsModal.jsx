import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import TopicsManager from './TopicsManager'
import { ICON_STYLES } from '../checkin/TopicCheckinRow'
import toast from 'react-hot-toast'

export default function SettingsModal({ onClose, onSignOut, isPremium, onUpgrade, userEmail }) {
  const { reminderTime, celebrationsEnabled, celebrationStyle, iconStyle, darkMode, setReminderTime, setCelebrationsEnabled, setCelebrationStyle, setIconStyle, setDarkMode, updateMarketingConsent, deleteAccount } = useAppStore()
  const [activeSection, setActiveSection] = useState('main') // main | topics | account
  const [marketingConsent, setMarketingConsentLocal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleMarketingToggle(val) {
    setMarketingConsentLocal(val)
    await updateMarketingConsent(val)
    toast.success(val ? 'Marketing emails enabled' : 'Marketing emails disabled')
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await deleteAccount()
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-warm-50 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>

        <div className="px-5 py-3">
          {activeSection === 'topics' ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setActiveSection('main')} className="text-sage-600 text-sm">← Back</button>
                <h2 className="text-lg font-semibold text-warm-800">Manage Topics</h2>
              </div>
              <TopicsManager onClose={() => setActiveSection('main')} />
            </>
          ) : activeSection === 'account' ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setActiveSection('main')} className="text-sage-600 text-sm">← Back</button>
                <h2 className="text-lg font-semibold text-warm-800">Account</h2>
              </div>

              {/* Email */}
              <div className="card mb-4">
                <p className="text-xs text-warm-400 mb-1">Signed in as</p>
                <p className="text-sm font-medium text-warm-800">{userEmail}</p>
              </div>

              {/* Marketing consent */}
              <div className="card mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="flex-shrink-0 mt-0.5">
                    <ToggleSwitch
                      checked={marketingConsent}
                      onChange={handleMarketingToggle}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-700">Marketing emails</p>
                    <p className="text-xs text-warm-400 mt-0.5 leading-relaxed">
                      Receive occasional tips, new features, and resources on personal growth and integration. You can change this anytime.
                    </p>
                  </div>
                </label>
              </div>

              {/* Delete account */}
              <div className="card border-red-100 bg-red-50">
                <p className="text-sm font-semibold text-red-700 mb-1">Delete Account</p>
                <p className="text-xs text-red-500 mb-3 leading-relaxed">
                  This permanently deletes your account, all topics, check-ins, notes, and data. This cannot be undone.
                </p>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-100 transition-all"
                  >
                    Delete my account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600 font-medium text-center">Are you sure? This is permanent.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2 rounded-xl border border-warm-200 text-warm-600 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                      >
                        {deleteLoading ? 'Deleting...' : 'Yes, delete everything'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-warm-800">Settings</h2>
                <button onClick={onClose} className="text-warm-400 hover:text-warm-600 text-2xl leading-none">×</button>
              </div>

              {/* User info */}
              <div className="card mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 font-medium">
                    {userEmail?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-800">{userEmail}</p>
                    <p className="text-xs text-warm-400">{isPremium ? '✨ Premium' : 'Free plan'}</p>
                  </div>
                </div>
              </div>

              {/* Premium */}
              {!isPremium && (
                <button
                  onClick={onUpgrade}
                  className="w-full mb-4 bg-gradient-to-r from-sage-500 to-sage-700 text-white rounded-2xl p-4 text-left"
                >
                  <p className="font-semibold mb-0.5">✨ Upgrade to Premium</p>
                  <p className="text-xs opacity-80">$6.99/mo or $49.99/yr · Unlimited topics · Full history</p>
                </button>
              )}

              {/* Settings items */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setActiveSection('topics')}
                  className="card w-full flex items-center justify-between hover:border-warm-200"
                >
                  <span className="text-sm font-medium text-warm-700">🎯 Manage Topics</span>
                  <span className="text-warm-300">→</span>
                </button>

                <button
                  onClick={() => setActiveSection('account')}
                  className="card w-full flex items-center justify-between hover:border-warm-200"
                >
                  <span className="text-sm font-medium text-warm-700">👤 Account & Privacy</span>
                  <span className="text-warm-300">→</span>
                </button>

                <div className="card">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-warm-700">🌙 Dark Mode</p>
                      <p className="text-xs text-warm-400">Easier on the eyes at night</p>
                    </div>
                    <ToggleSwitch checked={!!darkMode} onChange={setDarkMode} />
                  </label>
                </div>

                <div className="card">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-warm-700">🔔 Daily Reminder</p>
                      <p className="text-xs text-warm-400">Web push notification</p>
                    </div>
                    <input
                      type="time"
                      value={reminderTime || '20:00'}
                      onChange={e => {
                        setReminderTime(e.target.value)
                        requestNotificationPermission()
                      }}
                      className="text-sm text-warm-700 bg-transparent border border-warm-200 rounded-lg px-2 py-1"
                    />
                  </label>
                </div>

                <div className="card">
                  <p className="text-sm font-medium text-warm-700 mb-3">🎉 Celebration Style</p>
                  <div className="space-y-2">
                    {[
                      { id: 'confetti', label: 'Confetti', desc: 'Animated confetti burst' },
                      { id: 'message', label: 'Message only', desc: 'A short encouraging message' },
                      { id: 'both', label: 'Both', desc: 'Confetti + message' },
                      { id: 'none', label: 'Off', desc: 'No celebrations' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setCelebrationStyle(opt.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                          (celebrationStyle || 'confetti') === opt.id
                            ? 'border-sage-400 bg-sage-50'
                            : 'border-warm-100 hover:border-warm-200'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-sm text-warm-700 font-medium">{opt.label}</p>
                          <p className="text-xs text-warm-400">{opt.desc}</p>
                        </div>
                        {(celebrationStyle || 'confetti') === opt.id && (
                          <span className="text-sage-500 text-sm">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <p className="text-sm font-medium text-warm-700 mb-1">🎨 Check-in Icon Style</p>
                  <p className="text-xs text-warm-400 mb-3">Choose how your check-in options look</p>
                  <div className="space-y-2">
                    {Object.entries(ICON_STYLES).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => setIconStyle(key)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                          iconStyle === key
                            ? 'border-sage-400 bg-sage-50'
                            : 'border-warm-100 hover:border-warm-200'
                        }`}
                      >
                        <span className="text-sm text-warm-700">{style.label}</span>
                        <div className="flex gap-1.5 text-xl">
                          {style.preview.map((icon, i) => (
                            <span key={i}>{icon}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose()
                    setTimeout(onSignOut, 200)
                  }}
                  className="w-full py-3 rounded-2xl border border-warm-200 text-warm-500 text-sm hover:bg-warm-100 transition-all"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => {
                    onClose()
                    setTimeout(onSignOut, 200)
                  }}
                  className="w-full py-3 rounded-2xl bg-sage-50 border border-sage-200 text-sage-700 text-sm hover:bg-sage-100 transition-all font-medium"
                >
                  🔄 Switch User
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? 'bg-sage-500' : 'bg-warm-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch (e) {
      console.log('Notification permission request failed:', e)
    }
  }
}
