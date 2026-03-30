import { useState } from 'react'
import useAppStore from '../../store/useAppStore'
import toast from 'react-hot-toast'

const EMOJI_OPTIONS = ['⭐', '💛', '💼', '🌿', '🧠', '💰', '👨‍👩‍👧', '🎨', '✨', '🤝', '🎉', '🏃', '📚', '🌙', '🔥']

export default function TopicsManager() {
  const { topics, isPremium, addTopic, updateTopic, archiveTopic, reorderTopics } = useAppStore()
  const [newTopicName, setNewTopicName] = useState('')
  const [newTopicEmoji, setNewTopicEmoji] = useState('⭐')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(null)

  const limit = isPremium ? 25 : 8
  const canAdd = topics.length < limit

  async function handleAdd() {
    if (!newTopicName.trim()) return
    if (!canAdd) {
      toast.error(isPremium ? 'Maximum 25 topics reached' : 'Upgrade to add more topics')
      return
    }
    setLoading(true)
    try {
      await addTopic(newTopicName.trim(), newTopicEmoji)
      setNewTopicName('')
      setNewTopicEmoji('⭐')
      toast.success('Topic added!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRename(id) {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      await updateTopic(id, { name: editName.trim() })
      setEditingId(null)
      toast.success('Topic updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleArchive(id) {
    if (!confirm('Archive this topic? It won\'t appear in check-ins.')) return
    try {
      await archiveTopic(id)
      toast.success('Topic archived')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Simple drag reorder (touch-friendly)
  function handleDragStart(i) { setDragging(i) }
  function handleDragOver(e, i) {
    e.preventDefault()
    if (dragging === null || dragging === i) return
    const newTopics = [...topics]
    const [item] = newTopics.splice(dragging, 1)
    newTopics.splice(i, 0, item)
    reorderTopics(newTopics)
    setDragging(i)
  }
  function handleDragEnd() { setDragging(null) }

  return (
    <div>
      {/* Header with count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-warm-500">
          Your topics <span className="font-semibold text-warm-700">{topics.length}/{limit}</span>
        </p>
        <p className="text-xs text-warm-400">Drag ⠿ to reorder</p>
      </div>

      {/* Topic list */}
      <div className="space-y-2 mb-5">
        {topics.map((topic, i) => (
          <div
            key={topic.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={e => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className={`card flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all ${
              dragging === i ? 'opacity-50 scale-95' : ''
            }`}
          >
            <span className="text-warm-300 text-base select-none">⠿</span>
            <span className="text-xl">{topic.emoji}</span>

            {editingId === topic.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => handleRename(topic.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename(topic.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className="flex-1 bg-transparent text-sm text-warm-800 focus:outline-none border-b border-sage-300"
                autoFocus
                maxLength={40}
              />
            ) : (
              <span className="flex-1 text-sm font-medium text-warm-800">{topic.name}</span>
            )}

            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => { setEditingId(topic.id); setEditName(topic.name) }}
                className="flex items-center gap-1 text-xs text-warm-400 hover:text-sage-600 bg-warm-50 hover:bg-sage-50 px-2 py-1 rounded-lg transition-all"
                title="Rename"
              >
                ✏️ <span className="hidden sm:inline">Rename</span>
              </button>
              <button
                onClick={() => handleArchive(topic.id)}
                className="flex items-center gap-1 text-xs text-warm-400 hover:text-red-500 bg-warm-50 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                title="Delete"
              >
                🗑️ <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="text-center text-warm-400 text-sm py-4">No topics yet — add one below</p>
        )}
      </div>

      {/* Add new topic — prominent */}
      <div className={`rounded-2xl border-2 p-4 transition-all ${canAdd ? 'border-sage-300 bg-sage-50' : 'border-warm-100 bg-warm-50 opacity-60'}`}>
        <p className="text-sm font-semibold text-sage-700 mb-3">
          ＋ Add a new topic
        </p>

        {/* Emoji picker */}
        <div className="flex flex-wrap gap-2 mb-3">
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => setNewTopicEmoji(emoji)}
              className={`text-xl p-1.5 rounded-lg transition-all ${
                newTopicEmoji === emoji ? 'bg-sage-200 scale-110 shadow-sm' : 'hover:bg-warm-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTopicName}
            onChange={e => setNewTopicName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Topic name (e.g. Sleep, Parenting...)"
            className="input-field flex-1 text-sm"
            maxLength={40}
            disabled={!canAdd}
          />
          <button
            onClick={handleAdd}
            disabled={!newTopicName.trim() || !canAdd || loading}
            className="bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '…' : 'Add'}
          </button>
        </div>

        {!canAdd && (
          <p className="text-xs text-sage-600 mt-2">
            {isPremium ? 'Maximum 25 topics reached' : '✨ Upgrade to Premium to add up to 25 topics'}
          </p>
        )}
      </div>
    </div>
  )
}
