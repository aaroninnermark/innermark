import { INSIGHTS } from '../../lib/mockData'
import { useNavigate } from 'react-router-dom'

export default function InsightScreen({ message, coachingTopicIds = [], topics = [], onDone }) {
  const navigate = useNavigate()

  const coachingTopics = topics.filter(t => coachingTopicIds.includes(t.id))

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-warm-50 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-6">🌿</div>

        <div className="card mb-6 text-left">
          <p className="text-sage-800 text-lg leading-relaxed font-medium text-center">
            "{message}"
          </p>
        </div>

        {coachingTopics.length > 0 && (
          <div className="card mb-6 bg-clay-50 border-clay-200 text-left">
            <p className="text-sm font-semibold text-clay-700 mb-1">
              A gentle nudge 💛
            </p>
            <p className="text-sm text-clay-600 mb-2">
              You've had a tough stretch with{' '}
              {coachingTopics.map(t => t.name).join(', ')}.
              Would it help to talk to someone?
            </p>
            <button
              onClick={() => { navigate('/support'); onDone() }}
              className="text-sm text-clay-700 font-medium underline underline-offset-2"
            >
              Explore support resources →
            </button>
          </div>
        )}

        <p className="text-warm-400 text-sm mb-8">
          Check-in saved ✓
        </p>

        <button
          onClick={onDone}
          className="btn-primary w-full"
        >
          Done
        </button>

        <button
          onClick={() => { navigate('/trends'); onDone() }}
          className="btn-ghost w-full mt-2 text-sm"
        >
          View my trends →
        </button>
      </div>
    </div>
  )
}
