import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'

const SUGGESTED_TOPICS = [
  { name: 'Relationships', emoji: '💛' },
  { name: 'Work', emoji: '💼' },
  { name: 'Body & Health', emoji: '🌿' },
  { name: 'Mental Health', emoji: '🧠' },
  { name: 'Finances', emoji: '💰' },
  { name: 'Family', emoji: '👨‍👩‍👧' },
  { name: 'Creativity', emoji: '🎨' },
  { name: 'Spirituality', emoji: '✨' },
  { name: 'Friends', emoji: '🤝' },
  { name: 'Fun & Play', emoji: '🎉' },
]

const STEPS = ['welcome', 'topics', 'reminder', 'done']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [customTopic, setCustomTopic] = useState('')
  const [reminderTime, setReminderTime] = useState('20:00')
  const [loading, setLoading] = useState(false)

  const { addTopic, completeOnboarding, setReminderTime: saveReminderTime } = useAppStore()
  const navigate = useNavigate()

  const currentStep = STEPS[step]

  function toggleTopic(topic) {
    setSelectedTopics(prev => {
      const exists = prev.find(t => t.name === topic.name)
      if (exists) return prev.filter(t => t.name !== topic.name)
      if (prev.length >= 3) {
        toast.error('Free plan allows up to 3 topics (upgrade for more!)')
        return prev
      }
      return [...prev, topic]
    })
  }

  function addCustomTopic() {
    if (!customTopic.trim()) return
    if (selectedTopics.length >= 3) {
      toast.error('Free plan allows up to 3 topics')
      return
    }
    const topic = { name: customTopic.trim(), emoji: '⭐' }
    setSelectedTopics(prev => [...prev, topic])
    setCustomTopic('')
  }

  async function handleFinish() {
    if (selectedTopics.length === 0) {
      toast.error('Add at least one topic to get started')
      return
    }

    setLoading(true)
    try {
      for (const topic of selectedTopics) {
        await addTopic(topic.name, topic.emoji)
      }
      saveReminderTime(reminderTime)
      await completeOnboarding()
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-warm-50 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= step ? 'w-8 bg-sage-500' : 'w-4 bg-warm-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-sm mx-auto w-full">

        {/* WELCOME */}
        {currentStep === 'welcome' && (
          <div className="text-center animate-fade-in">
            <div className="text-7xl mb-6">🌿</div>
            <h1 className="text-3xl font-semibold text-sage-800 mb-3">Welcome to Innermark</h1>
            <p className="text-warm-600 text-lg leading-relaxed mb-8">
              A simple daily check-in to see how you're doing across the areas of your life that matter most.
            </p>
            <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm border border-warm-100 mb-8">
              {[
                { icon: '🎯', text: 'Pick your life areas (topics)' },
                { icon: '🔴🟡🟢', text: 'Tap a color each day — takes 60 seconds' },
                { icon: '📊', text: 'See patterns emerge over time' },
                { icon: '💡', text: 'Get gentle insights and support' },
              ].map(item => (
                <div key={item.icon} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-warm-700 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full">
              Get Started →
            </button>
          </div>
        )}

        {/* TOPICS */}
        {currentStep === 'topics' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-2xl font-semibold text-sage-800">Choose your topics</h2>
              <p className="text-warm-500 text-sm mt-1">
                Pick up to 3 life areas to track (free plan)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {SUGGESTED_TOPICS.map(topic => {
                const selected = selectedTopics.find(t => t.name === topic.name)
                return (
                  <button
                    key={topic.name}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      selected
                        ? 'border-sage-500 bg-sage-50 text-sage-800'
                        : 'border-warm-100 bg-white text-warm-700 hover:border-warm-200'
                    }`}
                  >
                    <span>{topic.emoji}</span>
                    <span>{topic.name}</span>
                    {selected && <span className="ml-auto text-sage-500">✓</span>}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTopic()}
                placeholder="Add your own..."
                className="input-field flex-1 text-sm"
                maxLength={40}
              />
              <button
                onClick={addCustomTopic}
                disabled={!customTopic.trim()}
                className="btn-secondary px-4 disabled:opacity-40"
              >
                +
              </button>
            </div>

            {selectedTopics.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-warm-400 mb-2">Your topics ({selectedTopics.length}/3):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(t => (
                    <span
                      key={t.name}
                      className="flex items-center gap-1 bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm border border-sage-200"
                    >
                      {t.emoji} {t.name}
                      <button
                        onClick={() => setSelectedTopics(prev => prev.filter(p => p.name !== t.name))}
                        className="ml-1 text-sage-400 hover:text-sage-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-ghost">Back</button>
              <button
                onClick={() => selectedTopics.length > 0 && setStep(2)}
                disabled={selectedTopics.length === 0}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* REMINDER */}
        {currentStep === 'reminder' && (
          <div className="w-full text-center animate-fade-in">
            <div className="text-4xl mb-2">🔔</div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-1">Daily reminder</h2>
            <p className="text-warm-500 text-sm mb-8">
              When would you like to be reminded to check in?
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100 mb-8">
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="input-field text-center text-2xl font-medium"
              />
              <p className="text-xs text-warm-400 mt-3">
                Push notifications will be requested when you submit your first check-in.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">
                Continue →
              </button>
            </div>
            <button
              onClick={() => setStep(3)}
              className="btn-ghost w-full mt-2 text-sm text-warm-400"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* DONE */}
        {currentStep === 'done' && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">You're all set!</h2>
            <p className="text-warm-600 mb-2">
              You've chosen:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedTopics.map(t => (
                <span key={t.name} className="bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm border border-sage-200">
                  {t.emoji} {t.name}
                </span>
              ))}
            </div>
            <p className="text-warm-500 text-sm mb-8">
              Your first check-in is waiting. It'll take less than a minute. 🌿
            </p>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Setting up...' : 'Start My First Check-In →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
