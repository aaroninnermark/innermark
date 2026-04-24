import { useState, useMemo, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import useAppStore from '../store/useAppStore'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function IntentionsPage() {
  const { topics, history, user, setTopicIntentionLocal } = useAppStore()
  const [topicIntentions, setTopicIntentions] = useState({})
  const [monthlyIntention, setMonthlyIntention] = useState('')
  const [monthlyIntentionId, setMonthlyIntentionId] = useState(null)
  const [editingTopic, setEditingTopic] = useState(null)
  const [editingMonthly, setEditingMonthly] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const currentMonth = format(new Date(), 'MMMM yyyy')
  const monthKey = format(new Date(), 'yyyy-MM')

  useEffect(() => {
    if (!isSupabaseConfigured || !user) { setLoading(false); return }
    async function loadIntentions() {
      const { data, error } = await supabase
        .from('intentions')
        .select('*')
        .eq('user_id', user.id)
      if (!error && data) {
        const topicMap = {}
        let monthly = ''
        let monthlyId = null
        data.forEach(item => {
          if (item.type === 'topic' && item.topic_id) {
            topicMap[item.topic_id] = item.text
          } else if (item.type === 'monthly' && item.month === monthKey) {
            monthly = item.text
            monthlyId = item.id
          }
        })
        setTopicIntentions(topicMap)
        setMonthlyIntention(monthly)
        setMonthlyIntentionId(monthlyId)
      }
      setLoading(false)
    }
    loadIntentions()
  }, [user, monthKey])

  // Red alerts — 7+ red days in last 14
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
    setTopicIntentionLocal(topicId, value)
    setEditingTopic(null)
    flashSaved()
    if (!isSupabaseConfigured || !user) return
    await supabase.from('intentions').upsert({
      user_id: user.id,
      topic_id: topicId,
      type: 'topic',
      text: value,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,topic_id,type' })
  }

  async function saveMonthlyIntention(text) {
    if (!text.trim()) return
    setMonthlyIntention(text)
    setEditingMonthly(false)
    flashSaved()
    if (!isSupabaseConfigured || !user) return
    const { data } = await supabase.from('intentions').upsert({
      user_id: user.id,
      topic_id: null,
      month: monthKey,
      type: 'monthly',
      text: text.trim(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,month,type' }).select().single()
    if (data) setMonthlyIntentionId(data.id)
  }

  async function clearMonthlyIntention() {
    setMonthlyIntention('')
    setMonthlyIntentionId(null)
    if (!isSupabaseConfigured || !user || !monthlyIntentionId) return
    await supabase.from('intentions').delete().eq('id', monthlyIntentionId)
  }

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                  Set an intention →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Monthly intention */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-warm-700">🧭 {currentMonth}</p>
            <p className="text-xs text-warm-400">Your direction this month</p>
          </div>
          {monthlyIntention && !editingMonthly && (
            <div className="flex gap-2">
              <button onClick={() => setEditingMonthly(true)} className="text-xs text-warm-400 hover:text-sage-600">✏️</button>
              <button onClick={clearMonthlyIntention} className="text-xs text-warm-300 hover:text-red-400">✕</button>
            </div>
          )}
        </div>

        {monthlyIntention && !editingMonthly ? (
          // Set state — show clearly as confirmed
          <div className="bg-sage-50 rounded-xl p-3 border border-sage-100">
            <p className="text-sm text-sage-800 leading-relaxed">{monthlyIntention}</p>
          </div>
        ) : editingMonthly ? (
          <MonthlyEditor
            initial={monthlyIntention}
            onSave={saveMonthlyIntention}
            onCancel={() => setEditingMonthly(false)}
          />
        ) : (
          // Unset state
          <MonthlyEditor
            initial=""
            onSave={saveMonthlyIntention}
            onCancel={null}
          />
        )}
      </div>

      {/* Per-topic intentions */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-warm-700 mb-1">What does a good day look like?</p>
        <p className="text-xs text-warm-400 mb-3">
          Your personal compass for each area. Not a standard to hit — a direction to move toward.
        </p>
        <div className="space-y-2">
          {topics.map(topic => (
            <div key={topic.id} className="card">
              {editingTopic === topic.id ? (
                <div>
                  <p className="text-xs text-warm-400 uppercase tracking-wide mb-2">{topic.emoji} {topic.name}</p>
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
                    <p className="text-xs text-warm-400 uppercase tracking-wide">{topic.name}</p>
                    {topicIntentions[topic.id] ? (
                      <p className="text-sm font-medium text-warm-800 mt-0.5">{topicIntentions[topic.id]}</p>
                    ) : (
                      <p className="text-xs text-warm-300 mt-0.5 italic">Tap to set an intention...</p>
                    )}
                  </div>
                  <span className="text-warm-300 text-sm mt-0.5 flex-shrink-0">✏️</span>
                </button>
              )}
            </div>
          ))}
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

function MonthlyEditor({ initial, onSave, onCancel }) {
  const [value, setValue] = useState(initial)
  return (
    <div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="This month I'm moving toward..."
        rows={2}
        className="w-full bg-warm-50 rounded-xl p-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none resize-none border border-warm-100 focus:border-sage-300 transition-colors"
        maxLength={200}
        autoFocus={!!initial}
      />
      <div className="flex gap-2 mt-2">
        {onCancel && (
          <button onClick={onCancel} className="btn-ghost text-xs flex-1">Cancel</button>
        )}
        <button
          onClick={() => onSave(value)}
          disabled={!value.trim()}
          className="btn-primary text-xs flex-1 disabled:opacity-40"
        >
          Save
        </button>
      </div>
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
        <button onClick={() => onSave(value)} disabled={!value.trim()} className="btn-primary text-xs flex-1 disabled:opacity-40">Save</button>
      </div>
    </div>
  )
}
