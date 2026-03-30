import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'

const TOPIC_GROUPS = [
  {
    group: 'Relationships',
    emoji: '💛',
    topics: [
      { name: 'Partner', emoji: '💑' },
      { name: 'Family', emoji: '👨‍👩‍👧' },
      { name: 'Friendships', emoji: '🤝' },
      { name: 'Community', emoji: '🌐' },
    ],
  },
  {
    group: 'Self',
    emoji: '🌿',
    topics: [
      { name: 'Body & Health', emoji: '💪' },
      { name: 'Mind', emoji: '🧠' },
      { name: 'Emotions', emoji: '🌊' },
      { name: 'Spirituality', emoji: '✨' },
      { name: 'Rest & Recovery', emoji: '😴' },
    ],
  },
  {
    group: 'Work & Purpose',
    emoji: '🔥',
    topics: [
      { name: 'Career', emoji: '💼' },
      { name: 'Creativity', emoji: '🎨' },
      { name: 'Finances', emoji: '💰' },
      { name: 'Mission', emoji: '🎯' },
    ],
  },
  {
    group: 'Growth',
    emoji: '🌱',
    topics: [
      { name: 'Learning', emoji: '📚' },
      { name: 'Healing', emoji: '🩹' },
      { name: 'Habits', emoji: '⚡' },
      { name: 'Adventure', emoji: '🗺️' },
    ],
  },
]

const STEPS = ['welcome', 'reflect', 'topics', 'intentions', 'reminder', 'done']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [customTopic, setCustomTopic] = useState('')
  const [intentions, setIntentions] = useState({}) // topicName -> intention string
  const [reminderTime, setReminderTime] = useState('20:00')
  const [loading, setLoading] = useState(false)

  const { addTopic, completeOnboarding, setReminderTime: saveReminderTime } = useAppStore()
  const navigate = useNavigate()

  const currentStep = STEPS[step]

  function toggleTopic(topic) {
    setSelectedTopics(prev => {
      const exists = prev.find(t => t.name === topic.name)
      if (exists) return prev.filter(t => t.name !== topic.name)
      if (prev.length >= 8) {
        toast.error('Free plan allows up to 8 topics')
        return prev
      }
      return [...prev, topic]
    })
  }

  function addCustomTopic() {
    if (!customTopic.trim()) return
    if (selectedTopics.length >= 8) {
      toast.error('Free plan allows up to 8 topics')
      return
    }
    const topic = { name: customTopic.trim(), emoji: '⭐' }
    if (selectedTopics.find(t => t.name === topic.name)) return
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

        {/* SCREEN 1 — WELCOME */}
        {currentStep === 'welcome' && (
          <div className="text-center animate-fade-in">
            <div className="text-7xl mb-6">🌿</div>
            <h1 className="text-3xl font-semibold text-sage-800 mb-4">Welcome to Innermark</h1>
            <p className="text-warm-600 text-base leading-relaxed mb-6">
              Most of us move through life on autopilot. Innermark helps you slow down and actually look at what's happening — not to judge yourself, but to understand yourself.
            </p>
            <p className="text-warm-500 text-sm leading-relaxed mb-8">
              Each day, you'll check in on the areas of life that matter to you. There are no right answers. The goal isn't to be green every day — it's to be honest.
            </p>
            <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm border border-warm-100 mb-8">
              {[
                { icon: '🎯', text: 'Choose areas of life to track' },
                { icon: '🔴🟡🟢', text: 'Tap a color daily — takes 60 seconds' },
                { icon: '📊', text: 'Watch patterns emerge over time' },
                { icon: '💡', text: 'Receive gentle insights and support' },
              ].map(item => (
                <div key={item.icon} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-warm-700 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full">
              Let's Begin →
            </button>
          </div>
        )}

        {/* SCREEN 2 — REFLECT */}
        {currentStep === 'reflect' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🪞</div>
              <h2 className="text-2xl font-semibold text-sage-800 mb-3">Before you choose</h2>
              <p className="text-warm-600 text-sm leading-relaxed">
                Take a moment. Think about the last few weeks of your life.
              </p>
            </div>
            <div className="space-y-4 mb-8">
              {[
                { q: 'What areas felt alive or energized?', icon: '✨' },
                { q: 'What felt heavy, stuck, or painful?', icon: '🌧️' },
                { q: 'What have you been avoiding or ignoring?', icon: '👀' },
                { q: 'What do you most want to grow or heal?', icon: '🌱' },
              ].map(item => (
                <div key={item.q} className="flex gap-3 bg-white rounded-2xl p-4 border border-warm-100 shadow-sm">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <p className="text-warm-700 text-sm leading-relaxed">{item.q}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-warm-400 mb-6">
              Let your answers guide which areas you choose to track.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1">
                Choose My Topics →
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3 — TOPICS */}
        {currentStep === 'topics' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-2xl font-semibold text-sage-800">Choose your areas</h2>
              <p className="text-warm-500 text-sm mt-1">
                Pick 3–8 areas that feel most alive or most unresolved right now
              </p>
            </div>

            <div className="space-y-4 mb-4">
              {TOPIC_GROUPS.map(group => (
                <div key={group.group}>
                  <p className="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-2">
                    {group.emoji} {group.group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.topics.map(topic => {
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
                          <span className="flex-1 text-left">{topic.name}</span>
                          {selected && <span className="text-sage-500 text-xs">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom topic */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTopic()}
                placeholder="Add your own area..."
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
              <div className="mb-4 bg-sage-50 rounded-2xl p-3 border border-sage-100">
                <p className="text-xs text-sage-600 font-medium mb-2">
                  Selected ({selectedTopics.length}/8):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(t => (
                    <span
                      key={t.name}
                      className="flex items-center gap-1 bg-white text-sage-700 px-3 py-1 rounded-full text-xs border border-sage-200"
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
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button
                onClick={() => selectedTopics.length > 0 && setStep(3)}
                disabled={selectedTopics.length === 0}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4 — INTENTIONS */}
        {currentStep === 'intentions' && (
          <div className="w-full animate-fade-in">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🧭</div>
              <h2 className="text-2xl font-semibold text-sage-800 mb-2">Set your intentions</h2>
              <p className="text-warm-500 text-sm leading-relaxed">
                For each area, describe what a <em>good day</em> looks like to you. This becomes your personal compass — not a standard to perform, but a direction to move toward.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {selectedTopics.map(topic => (
                <div key={topic.name} className="bg-white rounded-2xl p-4 border border-warm-100 shadow-sm">
                  <p className="text-sm font-medium text-warm-700 mb-2">
                    {topic.emoji} {topic.name}
                  </p>
                  <input
                    type="text"
                    value={intentions[topic.name] || ''}
                    onChange={e => setIntentions(prev => ({ ...prev, [topic.name]: e.target.value }))}
                    placeholder={`What does a good day in ${topic.name.toLowerCase()} feel like?`}
                    className="input-field text-sm w-full"
                    maxLength={120}
                  />
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-warm-400 mb-5">
              All optional — you can always add or edit these later.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1">
                Continue →
              </button>
            </div>
            <button
              onClick={() => setStep(4)}
              className="btn-ghost w-full mt-2 text-sm text-warm-400"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* SCREEN 5 — REMINDER */}
        {currentStep === 'reminder' && (
          <div className="w-full text-center animate-fade-in">
            <div className="text-4xl mb-2">🔔</div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-1">Daily reminder</h2>
            <p className="text-warm-500 text-sm mb-8">
              Consistency matters more than perfection. When would you like a nudge?
            </p>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100 mb-8">
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="input-field text-center text-2xl font-medium"
              />
              <p className="text-xs text-warm-400 mt-3">
                You can change this anytime in Settings.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(5)} className="btn-primary flex-1">
                Continue →
              </button>
            </div>
            <button onClick={() => setStep(5)} className="btn-ghost w-full mt-2 text-sm text-warm-400">
              Skip for now
            </button>
          </div>
        )}

        {/* SCREEN 6 — DONE */}
        {currentStep === 'done' && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-4">🌿</div>
            <h2 className="text-2xl font-semibold text-sage-800 mb-2">You're ready</h2>
            <p className="text-warm-600 text-sm mb-5 leading-relaxed">
              You've taken the first step — choosing to pay attention. That's more than most people do.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedTopics.map(t => (
                <span key={t.name} className="bg-sage-50 text-sage-700 px-3 py-1 rounded-full text-sm border border-sage-200">
                  {t.emoji} {t.name}
                </span>
              ))}
            </div>
            <p className="text-warm-400 text-xs mb-8">
              Your first check-in is waiting. It'll take less than a minute.
            </p>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Setting up...' : 'Begin →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
