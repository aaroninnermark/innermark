import { useState, useMemo, useEffect } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import useAppStore from '../store/useAppStore'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'

const MONTHLY_PROMPTS = [
  "What do I most want to move toward this month?",
  "What am I ready to release or let go of?",
  "Where do I want to show up differently?",
  "What needs more of my attention right now?",
]

export default function IntentionsPage() {
  const { topics, history, user } = useAppStore()
  const [topicIntentions, setTopicIntentions] = useState({}) // topicId -> string
  const [monthlyIntention, setMonthlyIntention] = useState('')
  const [editingTopic, setEditingTopic] = useState(null)
  const [showReflection, setShowReflection] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const currentMonth = format(new Date(), 'MMMM yyyy')
  const monthKey = format(new Date(), 'yyyy-MM')

  // Load intentions from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setLoading(false)
      return
    }
    async function loadIntentions() {
      const { data, error } = await supabase
        .from('intentions')
        .select('*')
        .eq('user_id', user.id)

      if (!error && data) {
        const topicMap = {}
        let monthly = ''
        data.forEach(item => {
          if (item.type === 'topic' && item.topic_id) {
            topicMap[item.topic_id] = item.text
          } else if (item.type === 'monthly' && item.month === monthKey) {
            monthly = item.text
          }
        })
        setTopicIntentions(topicMap)
        setMonthlyIntention(monthly)
      }
      setLoading(false)
    }
    loadIntentions()
  }, [user, monthKey])

  // Find topics with repeated reds in last 14 days
  const redAlerts = useMemo(() => {
    const alerts = []
    const cutoff = format(subDays(new Date(), 14), 'yyyy-MM-dd')
    const recentHistory = history.filter(h => h.date >= cutoff)
    topics.forEach(topic => {
      const redCount = recentHistory.filter(h =>
        h.topic_entries?.find(e => e.topic_id === topic.id && e.status === 'red')
      ).length
      if (redCount >= 7) alerts.push({ topic, redCount })
    })
    return alerts
  }, [history, topics])

  async function saveTopicIntention(topicId, value) {
    setTopicIntentions(prev => ({ ...prev, [topicId]: value }))
    setEditingTopic(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    if (!isSupabaseConfigured || !user) return
    await supabase.from('intentions').upsert({
      user_id: user.id,
      topic_id: topicId,
      type: 'topic',
      text: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,topic_id,type' })
  }

  async function saveMonthlyIntention() {
    if (!monthlyIntention.trim()) return
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    if (!isSupabaseConfigured || !user) return
    await supabase.from('intentions').upsert({
      user_id: user.id,
      topic_id: null,
      month: monthKey,
      type: 'monthly',
      text: monthlyIntention,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,month,type' })
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-400 text-sm">Loading intentions...</p>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <h1 className="text-xl font-semibold text-sage-800 mb-1">Intentions</h1>
      <p className="text-sm text-warm-400 mb-5">Direction without judgment</p>

      {/* Red alerts */}
      {redAlerts.length > 0 && (
        <div className="mb-5 space-y-2">
          {redAlerts.map(({ topic, redCount }) => (
            <div key={topic.id} className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-700 font-medium mb-1">
                {topic.emoji} {topic.name} has been hard lately
              </p>
              <p className="text-xs text-red-500 mb-3">
                {redCount} difficult days in the past two weeks.
                {topicIntentions[topic.id]
                  ? ` Your intention: "${topicIntentions[topic.id]}"`
                  : " What's one small thing that might help?"}
              </p>
              {!topicIntentions[topic.id] && (
                <button onClick={() => setEditingTopic(topic.id)} className="text-xs text-red-600 underline">
                  Set an intention for {topic.name} →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Monthly intention */}
      <div className="card mb-5">
        <div className="mb-3">
          <p className="text-sm font-semibold text-warm-700">🧭 {currentMonth}</p>
          <p className="text-xs text-warm-400">Your direction this month</p>
        </div>
        <p className="text-xs text-warm-400 italic mb-2">
          "{MONTHLY_PROMPTS[new Date().getMonth() % MONTHLY_PROMPTS.length]}"
        </p>
        <textarea
          value={monthlyIntention}
          onChange={e => setMonthlyIntention(e.target.value)}
          placeholder="This month I'm moving toward..."
          rows={2}
          className="w-full bg-warm-50 rounded-xl p-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none resize-none border border-warm-100 focus:border-sage-300 transition-colors"
          maxLength={200}
        />
        {monthlyIntention && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-warm-300">{monthlyIntention.length}/200</p>
            <button onClick={saveMonthlyIntention} className="text-xs text-sage-600 font-medium hover:text-sage-800">
              Save →
            </button>
          </div>
        )}
      </div>

      {/* Per-topic intentions */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-warm-700 mb-1">What does a good day look like?</p>
        <p className="text-xs text-warm-400 mb-3">
          Your personal compass for each life area. Not a standard to perform — a direction to move toward.
        </p>
        <div className="space-y-2">
          {topics.map(topic => (
            <div key={topic.id} className="card">
              {editingTopic === topic.id ? (
                <div>
                  <p className="text-sm font-medium text-warm-700 mb-2">{topic.emoji} {topic.name}</p>
                  <IntentionEditor
                    topic={topic}
                    initial={topicIntentions[topic.id] || ''}
                    onSave={(val) => saveTopicIntention(topic.id, val)}
                    onCancel={() => setEditingTopic(null)}
                  />
                </div>
              ) : (
                <button className="w-full flex items-start gap-3 text-left" onClick={() => setEditingTopic(topic.id)}>
                  <span className="text-xl mt-0.5">{topic.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-700">{topic.name}</p>
                    {topicIntentions[topic.id] ? (
                      <p className="text-xs text-warm-500 mt-0.5 italic">"{topicIntentions[topic.id]}"</p>
                    ) : (
                      <p className="text-xs text-warm-300 mt-0.5">Tap to set an intention...</p>
                    )}
                  </div>
                  <span className="text-warm-300 text-sm mt-0.5">✏️</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly reflection */}
      <div className="card mb-5">
        <button className="w-full flex items-center justify-between" onClick={() => setShowReflection(!showReflection)}>
          <div>
            <p className="text-sm font-semibold text-warm-700">📖 Monthly Reflection</p>
            <p className="text-xs text-warm-400">Look back, then look forward</p>
          </div>
          <span className="text-warm-300">{showReflection ? '▲' : '▼'}</span>
        </button>

        {showReflection && (
          <div className="mt-4 space-y-4">
            {[
              { q: 'How did this month feel overall?', placeholder: 'A word, a feeling, an image...' },
              { q: 'What shifted or surprised you?', placeholder: 'Something unexpected...' },
              { q: 'What needs more attention next month?', placeholder: 'One area to focus on...' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-warm-600 mb-1">{item.q}</p>
                <textarea
                  placeholder={item.placeholder}
                  rows={2}
                  className="w-full bg-warm-50 rounded-xl p-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none resize-none border border-warm-100 focus:border-sage-300 transition-colors"
                  maxLength={300}
                />
              </div>
            ))}
            <button className="btn-primary w-full text-sm">Save Reflection</button>
          </div>
        )}
      </div>

      {/* Guidance */}
      <div className="card bg-sage-50 border-sage-100">
        <p className="text-sm font-semibold text-sage-700 mb-2">💡 On intention setting</p>
        <div className="space-y-2 text-xs text-sage-600 leading-relaxed">
          <p>An intention is not a goal. A goal is something you achieve or fail. An intention is a direction — something you move toward, even imperfectly.</p>
          <p>The question to ask isn't "did I hit my target?" but "did I move in the direction I care about?"</p>
          <p>Start small. One honest sentence per area is enough.</p>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-sage-700 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-fade-in">
          ✓ Saved
        </div>
      )}
    </div>
  )
}

function IntentionEditor({ topic, initial, onSave, onCancel }) {
  const [value, setValue] = useState(initial)
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`A good day in ${topic.name.toLowerCase()} feels like...`}
        className="input-field text-sm w-full mb-2"
        maxLength={120}
        autoFocus
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost text-xs flex-1">Cancel</button>
        <button onClick={() => onSave(value)} className="btn-primary text-xs flex-1">Save</button>
      </div>
    </div>
  )
}
