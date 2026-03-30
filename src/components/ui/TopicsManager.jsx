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

  const limit = isPremium ? 25 : 3
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
      {/* Topic list */}
      <div className="space-y-2 mb-4">
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
            <span className="text-warm-300 text-sm">⠿</span>
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

            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingId(topic.id)
                  setEditName(topic.name)
                }}
                className="text-warm-400 hover:text-sage-600 text-sm p-1"
                title="Rename"
              >
                ✏️
              </button>
              <button
                onClick={() => handleArchive(topic.id)}
                className="text-warm-400 hover:text-clay-500 text-sm p-1"
                title="Archive"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="text-center text-warm-400 text-sm py-4">No topics yet</p>
        )}
      </div>

      {/* Add new topic */}
      <div className="card border-dashed border-warm-200">
        <p className="text-xs font-medium text-warm-500 mb-3">
          Add topic ({topics.length}/{limit})
        </p>

        {/* Emoji picker */}
        <div className="flex flex-wrap gap-2 mb-3">
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => setNewTopicEmoji(emoji)}
              className={`text-xl p-1 rounded-lg transition-all ${
                newTopicEmoji === emoji ? 'bg-sage-100 scale-110' : 'hover:bg-warm-100'
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
            placeholder="Topic name..."
            className="input-field flex-1 text-sm"
            maxLength={40}
            disabled={!canAdd}
          />
          <button
            onClick={handleAdd}
            disabled={!newTopicName.trim() || !canAdd || loading}
            className="btn-primary px-4 disabled:opacity-40"
          >
            {loading ? '…' : '+'}
          </button>
        </div>

        {!isPremium && topics.length >= 3 && (
          <p className="text-xs text-sage-600 mt-2">
            ✨ Upgrade to Premium to add up to 25 topics
          </p>
        )}
      </div>
    </div>
  )
}
