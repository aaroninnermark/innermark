import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import useAppStore from '../store/useAppStore'
import { getInsightMessage, getCoachingPromptTopics } from '../lib/insights'
import { fireConfetti } from '../lib/confetti'
import toast from 'react-hot-toast'
import TopicCheckinRow from '../components/checkin/TopicCheckinRow'
import InsightScreen from '../components/checkin/InsightScreen'
import SettingsModal from '../components/ui/SettingsModal'
import PremiumPrompt from '../components/ui/PremiumPrompt'

export default function CheckInPage() {
  const {
    topics,
    currentEntries,
    dayNote,
    checkInSubmitted,
    todayCheckin,
    history,
    isPremium,
    celebrationsEnabled,
    setDayNote,
    submitCheckin,
    resetTodayCheckin,
    user,
    signOut,
  } = useAppStore()

  const [submitting, setSubmitting] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [insightMessage, setInsightMessage] = useState('')
  const [coachingTopics, setCoachingTopics] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)

  const today = format(new Date(), 'EEEE, MMMM d')

  const enteredCount = topics.filter(t => currentEntries[t.id]?.status).length
  const totalCount = topics.length
  const progressPct = totalCount > 0 ? (enteredCount / totalCount) * 100 : 0

  // Check if today is already done
  useEffect(() => {
    if (checkInSubmitted && todayCheckin) {
      setShowInsight(false) // Only show insight right after submit
    }
  }, [checkInSubmitted])

  async function handleSubmit() {
    if (enteredCount === 0) {
      toast.error('Tap at least one color to check in')
      return
    }

    setSubmitting(true)
    try {
      await submitCheckin()

      // Determine insight
      const entries = topics
        .filter(t => currentEntries[t.id]?.status)
        .map(t => ({ topic_id: t.id, status: currentEntries[t.id].status }))

      const msg = getInsightMessage(entries, history)
      setInsightMessage(msg)

      const alertTopics = getCoachingPromptTopics(history, topics)
      setCoachingTopics(alertTopics)

      // Celebrations
      if (celebrationsEnabled) {
        const allGreen = entries.every(e => e.status === 'green')
        if (allGreen) fireConfetti('allGreen')
        else if (entries.filter(e => e.status === 'green').length >= 2) fireConfetti('default')
      }

      setShowInsight(true)
    } catch (err) {
      toast.error(err.message || 'Failed to save check-in')
    } finally {
      setSubmitting(false)
    }
  }

  // Insight screen
  if (showInsight) {
    return (
      <InsightScreen
        message={insightMessage}
        coachingTopicIds={coachingTopics}
        topics={topics}
        onDone={() => setShowInsight(false)}
      />
    )
  }

  // Already checked in today
  if (checkInSubmitted && todayCheckin) {
    return (
      <div className="page-container animate-fade-in">
        <PageHeader
          today={today}
          onSettings={() => setShowSettings(true)}
        />

        <div className="card mb-4 text-center py-6">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-lg font-semibold text-sage-800 mb-1">Today's done!</h2>
          <p className="text-warm-500 text-sm">
            You checked in at{' '}
            {format(new Date(todayCheckin.created_at || new Date()), 'h:mm a')}
          </p>
        </div>

        {/* Today's summary */}
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-warm-600 mb-3">Today's check-in</h3>
          <div className="space-y-2">
            {topics.map(topic => {
              const entry = todayCheckin.topic_entries?.find(e => e.topic_id === topic.id)
              return (
                <div key={topic.id} className="flex items-center gap-3 py-1">
                  <span className="text-lg">{topic.emoji}</span>
                  <span className="text-sm text-warm-700 flex-1">{topic.name}</span>
                  {entry ? (
                    <StatusDot status={entry.status} />
                  ) : (
                    <span className="text-warm-300 text-xs">skipped</span>
                  )}
                </div>
              )
            })}
          </div>
          {todayCheckin.day_note && (
            <p className="mt-3 pt-3 border-t border-warm-100 text-sm text-warm-600 italic">
              "{todayCheckin.day_note}"
            </p>
          )}
        </div>

        <button
          onClick={() => resetTodayCheckin()}
          className="btn-ghost w-full text-sm text-warm-400"
        >
          Edit today's check-in
        </button>

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            onSignOut={signOut}
            isPremium={isPremium}
            onUpgrade={() => { setShowSettings(false); setShowPremiumPrompt(true) }}
            userEmail={user?.email}
          />
        )}
        {showPremiumPrompt && <PremiumPrompt onClose={() => setShowPremiumPrompt(false)} />}
      </div>
    )
  }

  // Check-in form
  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        today={today}
        onSettings={() => setShowSettings(true)}
      />

      {/* Daily framing */}
      <p className="text-xs text-warm-400 italic text-center mb-4">
        Check in honestly. No performance, no pressure.
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-warm-500">
            {enteredCount} of {totalCount} done
          </span>
          <span className="text-xs text-warm-400">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-2 mb-4">
        {topics.map(topic => (
          <TopicCheckinRow
            key={topic.id}
            topic={topic}
            entry={currentEntries[topic.id]}
          />
        ))}
      </div>

      {topics.length === 0 && (
        <div className="card text-center py-8 text-warm-400">
          <p className="text-sm">No topics yet. Add some in Settings!</p>
        </div>
      )}

      {/* Day note */}
      <div className="card mb-5">
        <label className="block text-sm font-medium text-warm-600 mb-2">
          Anything to note about today? <span className="text-warm-300 font-normal">(optional)</span>
        </label>
        <textarea
          value={dayNote}
          onChange={e => setDayNote(e.target.value)}
          placeholder="A quick note, a feeling, anything..."
          rows={2}
          className="w-full bg-transparent resize-none text-sm text-warm-800 placeholder-warm-300 focus:outline-none"
          maxLength={500}
        />
        {dayNote && (
          <p className="text-right text-xs text-warm-300 mt-1">{dayNote.length}/500</p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || enteredCount === 0}
        className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-200 active:scale-95 select-none ${
          enteredCount > 0
            ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-200'
            : 'bg-warm-100 text-warm-300 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Saving...
          </span>
        ) : (
          `Done${enteredCount > 0 ? ` (${enteredCount}/${totalCount})` : ''}`
        )}
      </button>

      {!isPremium && topics.length >= 3 && (
        <button
          onClick={() => setShowPremiumPrompt(true)}
          className="w-full text-center mt-3 text-xs text-sage-600 hover:text-sage-800 transition-colors"
        >
          ✨ Upgrade for more topics
        </button>
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
          isPremium={isPremium}
          onUpgrade={() => { setShowSettings(false); setShowPremiumPrompt(true) }}
          userEmail={user?.email}
        />
      )}
      {showPremiumPrompt && <PremiumPrompt onClose={() => setShowPremiumPrompt(false)} />}
    </div>
  )
}

function PageHeader({ today, onSettings }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold text-sage-800">How are you today?</h1>
        <p className="text-sm text-warm-400">{today}</p>
      </div>
      <button
        onClick={onSettings}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-warm-100 text-warm-500 transition-colors"
      >
        ⚙️
      </button>
    </div>
  )
}

function StatusDot({ status }) {
  const colors = {
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-sage-500',
  }
  const labels = { red: '🔴', yellow: '🟡', green: '🟢' }
  return <span className="text-lg">{labels[status] || '⚪'}</span>
}
