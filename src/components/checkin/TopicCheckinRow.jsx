import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import clsx from 'clsx'

export const ICON_STYLES = {
  circles: {
    label: 'Colored Circles',
    icons: { red: '🔴', yellow: '🟡', green: '🟢' },
    preview: ['🔴', '🟡', '🟢'],
  },
  faces: {
    label: 'Emoji Faces',
    icons: { red: '😢', yellow: '😐', green: '😊' },
    preview: ['😢', '😐', '😊'],
  },
  marks: {
    label: 'Circle / Check / Star',
    icons: { red: '⭕', yellow: '✅', green: '⭐' },
    preview: ['⭕', '✅', '⭐'],
  },
}

const STATUS_BG = {
  red: { bg: 'bg-red-50', border: 'border-red-300' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300' },
  green: { bg: 'bg-sage-50', border: 'border-sage-300' },
}

const STATUS_LABELS = {
  red: 'Not good',
  yellow: 'Neutral',
  green: 'Good',
}

export default function TopicCheckinRow({ topic, entry, recentRedCount = 0 }) {
  const [showNote, setShowNote] = useState(false)
  const [editingIntention, setEditingIntention] = useState(false)
  const [intentionDraft, setIntentionDraft] = useState('')
  const { setEntryStatus, setEntryNote, iconStyle, topicIntentions, setTopicIntentionLocal, user } = useAppStore()

  const selectedStatus = entry?.status
  const note = entry?.note || ''
  const icons = ICON_STYLES[iconStyle || 'circles']?.icons || ICON_STYLES.circles.icons
  const intention = topicIntentions?.[topic.id]

  // Hide "set intention" prompt after 7 days if user still hasn't set one
  const accountAgeMs = user?.created_at ? Date.now() - new Date(user.created_at).getTime() : 0
  const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24)
  const showIntentionPrompt = !intention && accountAgeDays < 7

  async function saveIntention() {
    if (!intentionDraft.trim()) { setEditingIntention(false); return }
    setTopicIntentionLocal(topic.id, intentionDraft.trim())
    setEditingIntention(false)
    if (isSupabaseConfigured && user) {
      await supabase.from('intentions').upsert({
        user_id: user.id,
        topic_id: topic.id,
        type: 'topic',
        text: intentionDraft.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,topic_id,type' })
    }
  }

  return (
    <div
      className={clsx(
        'card transition-all duration-200',
        selectedStatus && STATUS_BG[selectedStatus].bg,
        selectedStatus && `border-2 ${STATUS_BG[selectedStatus].border}`,
        !selectedStatus && 'border border-warm-100'
      )}
    >
      {/* Red alert nudge */}
      {recentRedCount >= 7 && (
        <div className="flex items-center gap-2 mb-2 bg-red-50 rounded-xl px-3 py-1.5 -mx-1">
          <span className="text-xs text-red-500">This has been hard lately. What's one small thing that might help?</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-xl">{topic.emoji}</span>
        <div className="flex-1 min-w-0">
          {/* Category label */}
          <span className="text-xs font-semibold text-warm-400 uppercase tracking-wide block">
            {topic.name}
          </span>

          {editingIntention ? (
            /* Inline intention editor */
            <div className="mt-1">
              <input
                type="text"
                value={intentionDraft}
                onChange={e => setIntentionDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveIntention(); if (e.key === 'Escape') setEditingIntention(false) }}
                placeholder={`A good day in ${topic.name.toLowerCase()} feels like...`}
                className="w-full bg-white rounded-lg px-2 py-1 text-xs text-warm-800 border border-sage-300 focus:outline-none"
                maxLength={120}
                autoFocus
              />
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEditingIntention(false)} className="text-xs text-warm-400 hover:text-warm-600">Cancel</button>
                <button onClick={saveIntention} className="text-xs text-sage-600 font-medium hover:text-sage-800">Save →</button>
              </div>
            </div>
          ) : intention ? (
            /* Intention shown as primary — tap to edit */
            <button
              onClick={() => { setIntentionDraft(intention); setEditingIntention(true) }}
              className="text-sm font-medium text-warm-800 block text-left w-full hover:text-sage-700 transition-colors"
              title="Tap to edit intention"
            >
              {intention}
            </button>
          ) : showIntentionPrompt ? (
            /* No intention set, account < 7 days — show prompt */
            <button
              onClick={() => { setIntentionDraft(''); setEditingIntention(true) }}
              className="text-xs text-sage-500 italic hover:text-sage-700 transition-colors text-left"
            >
              ✏️ What does a good day here look like?
            </button>
          ) : null}
        </div>

        {/* Status icons */}
        <div className="flex gap-2 flex-shrink-0">
          {(['red', 'yellow', 'green']).map(status => (
            <button
              key={status}
              onClick={() => setEntryStatus(topic.id, selectedStatus === status ? null : status)}
              className={clsx(
                'text-2xl transition-all duration-150 active:scale-90 select-none leading-none',
                selectedStatus === status ? 'scale-110 drop-shadow-md' : 'opacity-60 hover:opacity-100'
              )}
              aria-label={STATUS_LABELS[status]}
            >
              {icons[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Note toggle */}
      {selectedStatus && (
        <div className="mt-2">
          <button
            onClick={() => setShowNote(!showNote)}
            className="text-xs text-warm-400 hover:text-warm-600 transition-colors flex items-center gap-1"
          >
            {showNote ? '▲' : '▼'}
            {note ? 'Edit note' : 'Add note (optional)'}
          </button>
          {showNote && (
            <textarea
              value={note}
              onChange={e => setEntryNote(topic.id, e.target.value)}
              placeholder={`What's going on with ${topic.name.toLowerCase()}?`}
              rows={2}
              className="mt-2 w-full bg-transparent resize-none text-sm text-warm-700 placeholder-warm-300 focus:outline-none border-t border-warm-100 pt-2"
              maxLength={300}
              autoFocus
            />
          )}
        </div>
      )}
    </div>
  )
}
