import { useState, useMemo } from 'react'
import { format, parseISO, isWithinInterval, subDays } from 'date-fns'
import useAppStore from '../store/useAppStore'

const DATE_FILTERS = [
  { id: 'all', label: 'All time' },
  { id: '7', label: 'Past 7 days' },
  { id: '30', label: 'Past 30 days' },
  { id: '90', label: 'Past 3 months' },
]

export default function JournalPage() {
  const { history, topics } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [expandedEntry, setExpandedEntry] = useState(null)

  // Build flattened note list
  const allNotes = useMemo(() => {
    const notes = []

    history.forEach(entry => {
      // Day note
      if (entry.day_note) {
        notes.push({
          id: `day-${entry.id}`,
          date: entry.date,
          type: 'day',
          text: entry.day_note,
          topicId: null,
          topicName: null,
          topicEmoji: '📅',
        })
      }

      // Topic notes
      entry.topic_entries?.forEach(te => {
        if (te.note) {
          const topic = topics.find(t => t.id === te.topic_id)
          notes.push({
            id: `topic-${te.id || `${entry.id}-${te.topic_id}`}`,
            date: entry.date,
            type: 'topic',
            text: te.note,
            topicId: te.topic_id,
            topicName: topic?.name || 'Unknown',
            topicEmoji: topic?.emoji || '⭐',
            status: te.status,
          })
        }
      })
    })

    return notes.sort((a, b) => b.date.localeCompare(a.date))
  }, [history, topics])

  // Filtered notes
  const filtered = useMemo(() => {
    let result = allNotes

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n => n.text.toLowerCase().includes(q) || n.topicName?.toLowerCase().includes(q))
    }

    // Topic filter
    if (filterTopic !== 'all') {
      result = result.filter(n => n.topicId === filterTopic || (filterTopic === 'day' && n.type === 'day'))
    }

    // Date filter
    if (filterDate !== 'all') {
      const days = parseInt(filterDate)
      const cutoff = subDays(new Date(), days)
      result = result.filter(n => parseISO(n.date) >= cutoff)
    }

    return result
  }, [allNotes, search, filterTopic, filterDate])

  // Group by date
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(note => {
      if (!groups[note.date]) groups[note.date] = []
      groups[note.date].push(note)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const STATUS_EMOJI = { green: '🟢', yellow: '🟡', red: '🔴' }

  return (
    <div className="page-container animate-fade-in">
      <h1 className="text-xl font-semibold text-sage-800 mb-5">Journal</h1>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="input-field pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
        <select
          value={filterTopic}
          onChange={e => setFilterTopic(e.target.value)}
          className="flex-shrink-0 bg-warm-100 text-warm-700 rounded-xl px-3 py-1.5 text-xs font-medium border-none outline-none"
        >
          <option value="all">All topics</option>
          <option value="day">Day notes</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
          ))}
        </select>

        {DATE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilterDate(f.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterDate === f.id
                ? 'bg-sage-600 text-white'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Entry count */}
      {filtered.length > 0 && (
        <p className="text-xs text-warm-400 mb-4">{filtered.length} note{filtered.length !== 1 ? 's' : ''}</p>
      )}

      {/* Notes timeline */}
      <div className="space-y-5">
        {grouped.map(([date, notes]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-warm-500">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </span>
              <div className="flex-1 h-px bg-warm-100" />
            </div>

            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className="card">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{note.topicEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-warm-500">
                          {note.type === 'day' ? 'Day note' : note.topicName}
                        </span>
                        {note.status && (
                          <span className="text-sm">{STATUS_EMOJI[note.status]}</span>
                        )}
                      </div>
                      <p className="text-sm text-warm-800 leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-16">
          {allNotes.length === 0 ? (
            <>
              <div className="text-4xl mb-3">📝</div>
              <p className="text-warm-400 text-sm">
                Your journal is empty. Add notes during check-ins to see them here.
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-warm-400 text-sm">No notes match your search.</p>
              <button
                onClick={() => { setSearch(''); setFilterTopic('all'); setFilterDate('all') }}
                className="btn-ghost mt-3 text-sm"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
