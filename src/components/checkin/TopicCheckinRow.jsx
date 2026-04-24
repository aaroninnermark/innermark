import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import clsx from 'clsx'

// Icon styles: each has red/yellow/green variants
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

export default function TopicCheckinRow({ topic, entry }) {
  const [showNote, setShowNote] = useState(false)
  const { setEntryStatus, setEntryNote, iconStyle } = useAppStore()

  const selectedStatus = entry?.status
  const note = entry?.note || ''
  const icons = ICON_STYLES[iconStyle || 'circles']?.icons || ICON_STYLES.circles.icons
  const { topicIntentions } = useAppStore()
  const intention = topicIntentions?.[topic.id]

  return (
    <div
      className={clsx(
        'card transition-all duration-200',
        selectedStatus && STATUS_BG[selectedStatus].bg,
        selectedStatus && `border-2 ${STATUS_BG[selectedStatus].border}`,
        !selectedStatus && 'border border-warm-100'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{topic.emoji}</span>
        <div className="flex-1 min-w-0">
          <span className="text-base font-medium text-warm-800 block">{topic.name}</span>
          {intention ? (
            <span className="text-xs text-warm-400 italic block truncate" title={intention}>
              {intention}
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          {(['red', 'yellow', 'green']).map(status => (
            <button
              key={status}
              onClick={() => setEntryStatus(topic.id, selectedStatus === status ? null : status)}
              className={clsx(
                'text-2xl transition-all duration-150 active:scale-90 select-none leading-none',
                selectedStatus === status
                  ? 'scale-110 drop-shadow-md'
                  : 'opacity-60 hover:opacity-100'
              )}
              aria-label={STATUS_LABELS[status]}
            >
              {icons[status]}
            </button>
          ))}
        </div>
      </div>

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
