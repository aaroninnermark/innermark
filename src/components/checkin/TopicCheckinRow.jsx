import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import clsx from 'clsx'

const STATUS_CONFIG = {
  red: {
    emoji: '🔴',
    bg: 'bg-red-50',
    border: 'border-red-300',
    ring: 'ring-red-200',
    label: 'Not good',
  },
  yellow: {
    emoji: '🟡',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    ring: 'ring-yellow-200',
    label: 'Neutral',
  },
  green: {
    emoji: '🟢',
    bg: 'bg-sage-50',
    border: 'border-sage-300',
    ring: 'ring-sage-200',
    label: 'Good',
  },
}

export default function TopicCheckinRow({ topic, entry }) {
  const [showNote, setShowNote] = useState(false)
  const { setEntryStatus, setEntryNote } = useAppStore()

  const selectedStatus = entry?.status
  const note = entry?.note || ''

  return (
    <div
      className={clsx(
        'card transition-all duration-200',
        selectedStatus && STATUS_CONFIG[selectedStatus].bg,
        selectedStatus && `border-2 ${STATUS_CONFIG[selectedStatus].border}`,
        !selectedStatus && 'border border-warm-100'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Topic name */}
        <span className="text-xl">{topic.emoji}</span>
        <span className="flex-1 text-base font-medium text-warm-800">{topic.name}</span>

        {/* Status circles */}
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
              aria-label={STATUS_CONFIG[status].label}
            >
              {STATUS_CONFIG[status].emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Note toggle & input */}
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
