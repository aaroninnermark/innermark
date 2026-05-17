import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'
import Logo from '../ui/Logo'

export default function InsightScreen({ message, coachingTopicIds = [], topics = [], onDone }) {
  const navigate = useNavigate()
  const { darkMode } = useAppStore()
  // Only show coaching nudge if multiple topics have been persistently red
  const coachingTopics = topics.filter(t => coachingTopicIds.includes(t.id))
  const showNudge = coachingTopics.length >= 2

  function handleDone() {
    onDone()
  }

  const bgStyle = darkMode
    ? { background: 'linear-gradient(180deg, #1a1f1a 0%, #1e2a1e 60%, #1a2a1e 100%)' }
    : { background: 'linear-gradient(180deg, #faf9f6 0%, #f0f5f0 60%, #e8f0e8 100%)' }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in"
      style={bgStyle}
    >
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-5">
          <Logo size={56} />
        </div>

        <div className={`rounded-2xl p-5 mb-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-warm-100 shadow-sm'}`}>
          <p className={`text-base leading-relaxed font-medium text-center ${darkMode ? 'text-gray-100' : 'text-sage-800'}`}>
            "{message}"
          </p>
        </div>

        {showNudge && (
          <div className={`rounded-2xl p-4 mb-5 text-left ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-amber-50 border border-amber-100'}`}>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>A gentle nudge 💛</p>
            <p className={`text-sm mb-2 ${darkMode ? 'text-amber-200' : 'text-amber-700'}`}>
              {coachingTopics.map(t => t.name).join(' and ')} ha{coachingTopics.length === 1 ? 's' : 've'} been hard lately. Support is available.
            </p>
            <button
              onClick={() => { navigate('/support'); handleDone() }}
              className={`text-sm font-medium underline underline-offset-2 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}
            >
              Explore support resources →
            </button>
          </div>
        )}

        <p className={`text-xs mb-6 ${darkMode ? 'text-gray-500' : 'text-warm-400'}`}>Check-in saved ✓</p>

        <button onClick={handleDone} className="btn-primary w-full mb-2">
          See today's summary
        </button>

        <button
          onClick={() => { navigate('/trends'); handleDone() }}
          className="btn-ghost w-full text-sm"
        >
          View my trends →
        </button>
      </div>
    </div>
  )
}
