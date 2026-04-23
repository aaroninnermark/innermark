import { useState, useMemo } from 'react'
import { format, parseISO, subDays } from 'date-fns'
import useAppStore from '../store/useAppStore'
import toast from 'react-hot-toast'

const DATE_FILTERS = [
  { id: 'all', label: 'All time' },
  { id: '7', label: 'Past 7 days' },
  { id: '30', label: 'Past 30 days' },
  { id: '90', label: 'Past 3 months' },
]

export default function JournalPage() {
  const { history, topics, saveJournalEntry } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntryText, setNewEntryText] = useState('')
  const [newEntryTopic, setNewEntryTopic] = useState('day')
  const [entrySaved, setEntrySaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSaveEntry() {
    if (!newEntryText.trim()) return
    setSaving(true)
    try {
      const topicId = newEntryTopic === 'day' ? null : newEntryTopic
      await saveJournalEntry(newEntryText.trim(), topicId)
      setNewEntryText('')
      setNewEntryTopic('day')
      setShowNewEntry(false)
      setEntrySaved(true)
      setTimeout(() => setEntrySaved(false), 2500)
    } catch (err) {
      toast.error('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Build flattened note list from history
  const allNotes = useMemo(() => {
    const notes = []
    history.forEach(entry => {
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

  const filtered = useMemo(() => {
    let result = allNotes
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n => n.text.toLowerCase().includes(q) || n.topicName?.toLowerCase().includes(q))
    }
    if (filterTopic !== 'all') {
      result = result.filter(n => n.topicId === filterTopic || (filterTopic === 'day' && n.type === 'day'))
    }
    if (filterDate !== 'all') {
      const days = parseInt(filterDate)
      const cutoff = subDays(new Date(), days)
      result = result.filter(n => parseISO(n.date) >= cutoff)
    }
    return result
  }, [allNotes, search, filterTopic, filterDate])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(note => {
      if (!groups[note.date]) groups[note.date] = []
      groups[note.date].push(note)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const STATUS_EMOJI = { green: '🟢', yellow: '🟡', red: '🔴' }
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-sage-800">Journal</h1>
        <button
          onClick={() => setShowNewEntry(!showNewEntry)}
          className="flex items-center gap-1.5 bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
        >
          ✏️ New Entry
        </button>
      </div>

      {/* New entry panel */}
      {showNewEntry && (
        <div className="card border-sage-200 bg-sage-50 mb-5 animate-fade-in">
          <p className="text-xs font-semibold text-sage-700 mb-1">✏️ New Journal Entry</p>
          <p className="text-xs text-warm-400 mb-3">{today}</p>

          {/* Topic selector */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => setNewEntryTopic('day')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                newEntryTopic === 'day' ? 'bg-sage-600 text-white' : 'bg-warm-100 text-warm-600'
              }`}
            >
              📅 General
            </button>
            {topics.map(t => (
              <button
                key={t.id}
                onClick={() => setNewEntryTopic(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  newEntryTopic === t.id ? 'bg-sage-600 text-white' : 'bg-warm-100 text-warm-600'
                }`}
              >
                {t.emoji} {t.name}
              </button>
            ))}
          </div>

          <textarea
            value={newEntryText}
            onChange={e => setNewEntryText(e.target.value)}
            placeholder="Write freely. This is your space..."
            rows={4}
            className="w-full bg-white rounded-xl p-3 text-sm text-warm-800 placeholder-warm-300 focus:outline-none resize-none border border-warm-100 focus:border-sage-300 transition-colors mb-3"
            maxLength={1000}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowNewEntry(false); setNewEntryText('') }}
              className="btn-ghost flex-1 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEntry}
              disabled={!newEntryText.trim() || saving}
              className="btn-primary flex-1 text-sm disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

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
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">✕</button>
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
              filterDate === f.id ? 'bg-sage-600 text-white' : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
                        {note.status && <span className="text-sm">{STATUS_EMOJI[note.status]}</span>}
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
              <p className="text-warm-400 text-sm mb-4">Your journal is empty.</p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="btn-primary text-sm"
              >
                ✏️ Write your first entry
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-warm-400 text-sm">No notes match your search.</p>
              <button onClick={() => { setSearch(''); setFilterTopic('all'); setFilterDate('all') }} className="btn-ghost mt-3 text-sm">
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {entrySaved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-sage-700 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-fade-in">
          ✓ Entry saved
        </div>
      )}
    </div>
  )
}
