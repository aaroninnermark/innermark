import { useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function InsightScreen({ message, coachingTopicIds = [], topics = [], onDone }) {
  const navigate = useNavigate()
  const coachingTopics = topics.filter(t => coachingTopicIds.includes(t.id))

  function handleDone() {
    // Always call onDone — CheckInPage will show the completed view
    onDone()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 animate-fade-in"
      style={{ background: 'linear-gradient(180deg, #faf9f6 0%, #f0f5f0 60%, #e8f0e8 100%)' }}
    >
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-5">
          <Logo size={56} />
        </div>

        <div className="card mb-5 text-left">
          <p className="text-sage-800 text-base leading-relaxed font-medium text-center">
            "{message}"
          </p>
        </div>

        {coachingTopics.length > 0 && (
          <div className="card mb-5 bg-amber-50 border-amber-100 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">A gentle nudge 💛</p>
            <p className="text-sm text-amber-700 mb-2">
              You've had a tough stretch with {coachingTopics.map(t => t.name).join(', ')}. Would it help to talk to someone?
            </p>
            <button
              onClick={() => { navigate('/support'); handleDone() }}
              className="text-sm text-amber-700 font-medium underline underline-offset-2"
            >
              Explore support resources →
            </button>
          </div>
        )}

        <p className="text-warm-400 text-xs mb-6">Check-in saved ✓</p>

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
