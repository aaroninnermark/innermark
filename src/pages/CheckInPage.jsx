import { useState, useEffect, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import useAppStore from '../store/useAppStore'
import { getInsightMessage, getCoachingPromptTopics } from '../lib/insights'
import { fireConfetti } from '../lib/confetti'
import { getTodaysPrompt } from '../lib/prompts'
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
    topicIntentions,
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

  // No auto-clearing of insight — user dismisses it manually via the button

  async function handleSubmit() {
    if (enteredCount === 0) {
      toast.error('Tap at least one color to check in')
      return
    }

    setSubmitting(true)

    // Safety: never leave user stuck on saving button
    const safetyTimer = setTimeout(() => {
      setSubmitting(false)
      setShowInsight(true)
    }, 8000)

    // Capture entries BEFORE submitting (store clears them after)
    const entries = topics
      .filter(t => currentEntries[t.id]?.status)
      .map(t => ({ topic_id: t.id, status: currentEntries[t.id].status }))

    try {
      await submitCheckin()
      clearTimeout(safetyTimer)

      const msg = getInsightMessage(entries, history)
      setInsightMessage(msg)

      const alertTopics = getCoachingPromptTopics(history, topics)
      setCoachingTopics(alertTopics)

      // Celebrations — wrapped so errors never block the flow
      try {
        if (celebrationsEnabled) {
          const allGreen = entries.every(e => e.status === 'green')
          if (allGreen) fireConfetti('allGreen')
          else if (entries.filter(e => e.status === 'green').length >= 2) fireConfetti('default')
        }
      } catch (_) {}

      setSubmitting(false)
      setShowInsight(true)
    } catch (err) {
      clearTimeout(safetyTimer)
      toast.error(err.message || 'Failed to save check-in')
      setSubmitting(false)
    }
  }

  // ALL hooks must be before any conditional returns
  const streak = useMemo(() => {
    let count = 0
    for (let i = 1; i <= 365; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const entry = history.find(h => h.date === date)
      if (entry && entry.topic_entries?.length > 0) count++
      else break
    }
    return count
  }, [history])

  const missedYesterday = useMemo(() => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    return !history.find(h => h.date === yesterday)
  }, [history])

  const allGreenToday = useMemo(() => {
    if (!todayCheckin?.topic_entries?.length) return false
    return todayCheckin.topic_entries.every(e => e.status === 'green')
  }, [todayCheckin])

  // Insight screen — shown immediately after submit
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

        {/* Missed yesterday nudge */}
        {missedYesterday && streak === 0 && (
          <div className="card bg-amber-50 border-amber-100 mb-4 flex items-start gap-3">
            <span className="text-xl">🌱</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Fresh start today</p>
              <p className="text-xs text-amber-600 mt-0.5">You missed yesterday — and that's okay. Consistency isn't perfection. You're here now.</p>
            </div>
          </div>
        )}

        {/* Streak celebration */}
        {streak >= 3 && (
          <div className="card bg-sage-50 border-sage-200 mb-4 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-sage-800">{streak} day streak</p>
              <p className="text-xs text-sage-600">Keep going. Small consistency over time is how real change happens.</p>
            </div>
          </div>
        )}

        <div className="card mb-4 text-center py-6">
          <div className="text-4xl mb-2">{allGreenToday ? '🌿' : '✅'}</div>
          <h2 className="text-lg font-semibold text-sage-800 mb-1">{allGreenToday ? 'All green today!' : "Today's done!"}</h2>
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
              const intention = topicIntentions?.[topic.id]
              return (
                <div key={topic.id} className="flex items-center gap-3 py-1">
                  <span className="text-lg">{topic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    {intention ? (
                      <>
                        <span className="text-xs text-warm-400 uppercase tracking-wide block">{topic.name}</span>
                        <span className="text-sm text-warm-700 block truncate">{intention}</span>
                      </>
                    ) : (
                      <span className="text-sm text-warm-700">{topic.name}</span>
                    )}
                  </div>
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

        {/* What's next bridge */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Trends', icon: '📊', path: '/trends' },
            { label: 'Journal', icon: '📝', path: '/journal' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to', { detail: item.path }))}
              className="card text-center py-3 hover:border-sage-200 transition-all active:scale-95"
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs text-warm-500 font-medium">{item.label}</div>
            </button>
          ))}
        </div>

        {/* Share card — appears on all-green or streak milestones */}
        {(allGreenToday || streak >= 7) && (
          <div className="card bg-sage-50 border-sage-200 mb-3 text-center py-4">
            <p className="text-sm font-semibold text-sage-800 mb-1">
              {allGreenToday && streak >= 7 ? `🌿 ${streak} days strong — all green today` :
               allGreenToday ? '🌿 All green day' :
               `🔥 ${streak} day streak`}
            </p>
            <p className="text-xs text-sage-600 mb-3">Share this moment</p>
            <button
              onClick={() => {
                const text = allGreenToday && streak >= 7
                  ? `${streak} days of showing up for myself with @Innermark 🌿`
                  : allGreenToday
                  ? `All green day on Innermark — checking in on what matters 🌿`
                  : `${streak} day check-in streak on Innermark 🔥`
                if (navigator.share) {
                  navigator.share({ text, url: 'https://getinnermark.com' })
                } else {
                  navigator.clipboard.writeText(text + ' getinnermark.com')
                  toast.success('Copied to clipboard!')
                }
              }}
              className="text-xs text-sage-600 border border-sage-300 rounded-xl px-4 py-2 hover:bg-sage-100 transition-all"
            >
              📤 Share
            </button>
          </div>
        )}

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
        {topics.map(topic => {
          // Count red days in last 14 days for this topic
          const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14)
          const recentRedCount = history.filter(h => {
            return new Date(h.date) >= cutoff &&
              h.topic_entries?.find(e => e.topic_id === topic.id && e.status === 'red')
          }).length
          return (
            <TopicCheckinRow
              key={topic.id}
              topic={topic}
              entry={currentEntries[topic.id]}
              recentRedCount={recentRedCount}
            />
          )
        })}
      </div>

      {topics.length === 0 && (
        <div className="card text-center py-8 text-warm-400">
          <p className="text-sm">No topics yet. Add some in Settings!</p>
        </div>
      )}

      {/* Day note with daily prompt */}
      <div className="card mb-5">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-base">💭</span>
          <p className="text-xs text-warm-500 italic leading-relaxed flex-1">
            "{getTodaysPrompt()}"
          </p>
        </div>
        <textarea
          value={dayNote}
          onChange={e => setDayNote(e.target.value)}
          placeholder="Write something, or leave it blank..."
          rows={3}
          className="w-full bg-warm-50 rounded-xl p-3 resize-none text-sm text-warm-800 placeholder-warm-300 focus:outline-none border border-warm-100 focus:border-sage-300 transition-colors"
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

      {!isPremium && topics.length >= 8 && (
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
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  )
}

function StatusDot({ status }) {
  const { iconStyle } = useAppStore()
  const ICONS = {
    circles: { red: '🔴', yellow: '🟡', green: '🟢', null: '⚪' },
    faces:   { red: '😢', yellow: '😐', green: '😊', null: '⚪' },
    marks:   { red: '⭕', yellow: '✅', green: '⭐', null: '⚪' },
  }
  const icons = ICONS[iconStyle || 'circles']
  return <span className="text-lg">{icons[status] || icons.null}</span>
}
