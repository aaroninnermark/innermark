import { useState, useMemo } from 'react'

const TABS = [
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'coaching', label: 'Coaching', icon: '🤝' },
]

// Daily prompts — rotate by day of year
const PROMPTS = [
  // Self-Compassion
  { theme: 'Self-Compassion', text: 'What would you say to a close friend who was struggling the way you are right now?' },
  { theme: 'Self-Compassion', text: 'Where are you holding yourself to a standard you would never impose on someone you love?' },
  { theme: 'Self-Compassion', text: 'What part of yourself have you been trying hardest to fix — and what if it didn\'t need fixing?' },
  { theme: 'Self-Compassion', text: 'What\'s one thing you did today, no matter how small, that deserves acknowledgment?' },
  { theme: 'Self-Compassion', text: 'If your inner critic had a name, what would it be — and what is it actually afraid of?' },
  { theme: 'Self-Compassion', text: 'What does rest feel like for you, without guilt?' },
  { theme: 'Self-Compassion', text: 'What are you carrying right now that isn\'t yours to carry?' },
  // Shame & Healing
  { theme: 'Shame & Healing', text: 'What\'s something you\'ve been afraid to say out loud, even to yourself?' },
  { theme: 'Shame & Healing', text: 'Where does shame live in your body? What does it feel like physically?' },
  { theme: 'Shame & Healing', text: 'What story have you been telling about yourself that began with someone else\'s words?' },
  { theme: 'Shame & Healing', text: 'What would it mean to stop earning your worth and simply have it?' },
  { theme: 'Shame & Healing', text: 'What part of your story are you most ashamed of — and what did it teach you?' },
  { theme: 'Shame & Healing', text: 'Who taught you that you were too much, or not enough? Do you still believe them?' },
  { theme: 'Shame & Healing', text: 'What would healing look like for you — not as a destination, but as a direction?' },
  // Integration
  { theme: 'Integration', text: 'What insight have you had that you haven\'t yet put into action?' },
  { theme: 'Integration', text: 'What has life been trying to show you lately that you\'ve been resisting?' },
  { theme: 'Integration', text: 'Where is the gap between who you know you can be and how you\'re currently living?' },
  { theme: 'Integration', text: 'What experience changed you — and have you fully honored what it asked of you?' },
  { theme: 'Integration', text: 'What does your body know that your mind hasn\'t caught up to yet?' },
  { theme: 'Integration', text: 'If your life were trying to teach you something right now, what would it be?' },
  { theme: 'Integration', text: 'What pattern keeps repeating — and what might it be asking you to look at?' },
  // Growth & Change
  { theme: 'Growth & Change', text: 'What\'s one thing you\'ve been putting off that, if you did it, would change everything?' },
  { theme: 'Growth & Change', text: 'Where are you choosing comfort over growth right now?' },
  { theme: 'Growth & Change', text: 'What does the version of you that you\'re becoming actually look like?' },
  { theme: 'Growth & Change', text: 'What would you do today if you knew you couldn\'t fail?' },
  { theme: 'Growth & Change', text: 'What old version of yourself are you holding onto that no longer serves you?' },
  { theme: 'Growth & Change', text: 'What does growth cost you — and are you willing to pay it?' },
  { theme: 'Growth & Change', text: 'Where in your life are you playing it safe when you know you\'re meant for more?' },
  // Forgiveness
  { theme: 'Forgiveness', text: 'Who are you still punishing — yourself or someone else — by holding onto this?' },
  { theme: 'Forgiveness', text: 'What would it cost you to forgive? What would it give you?' },
  { theme: 'Forgiveness', text: 'Is there something you\'ve done that you haven\'t yet forgiven yourself for?' },
  { theme: 'Forgiveness', text: 'What resentment is taking up space that could be used for something better?' },
  { theme: 'Forgiveness', text: 'Forgiveness isn\'t saying it was okay. What did it teach you that nothing else could?' },
  // Presence & Awareness
  { theme: 'Presence', text: 'What is actually happening right now — separate from your story about it?' },
  { theme: 'Presence', text: 'When did you last feel fully alive? What was present in that moment?' },
  { theme: 'Presence', text: 'What are you not seeing because you\'re too busy thinking about what already happened?' },
  { theme: 'Presence', text: 'Where is your mind right now — and where would you like it to be?' },
  { theme: 'Presence', text: 'What would change if you brought 10% more attention to what\'s in front of you today?' },
  // Intention & Direction
  { theme: 'Intention', text: 'What do you most want your life to feel like — not look like, but feel like?' },
  { theme: 'Intention', text: 'What are you moving toward right now, and is that actually where you want to go?' },
  { theme: 'Intention', text: 'What would you have to let go of to become who you\'re meant to be?' },
  { theme: 'Intention', text: 'If you knew this was the only year you had, what would you stop tolerating?' },
  { theme: 'Intention', text: 'What is your life asking of you right now?' },
  // Relationships
  { theme: 'Relationships', text: 'Where are you showing up fully in your relationships — and where are you hiding?' },
  { theme: 'Relationships', text: 'What do the people closest to you need from you that you haven\'t been giving?' },
  { theme: 'Relationships', text: 'What boundary have you been avoiding that you know you need to set?' },
  { theme: 'Relationships', text: 'Who in your life brings out the best version of you — and how often do you prioritize them?' },
  { theme: 'Relationships', text: 'Where are you seeking validation instead of connection?' },
]

const THEME_COLORS = {
  'Self-Compassion': 'bg-rose-50 text-rose-700 border-rose-100',
  'Shame & Healing': 'bg-purple-50 text-purple-700 border-purple-100',
  'Integration': 'bg-sage-50 text-sage-700 border-sage-100',
  'Growth & Change': 'bg-amber-50 text-amber-700 border-amber-100',
  'Forgiveness': 'bg-blue-50 text-blue-700 border-blue-100',
  'Presence': 'bg-teal-50 text-teal-700 border-teal-100',
  'Intention': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Relationships': 'bg-pink-50 text-pink-700 border-pink-100',
}

const BOOKS = [
  {
    theme: '🍄 Psychedelics & Integration',
    items: [
      { title: 'Psychedelics and Psychotherapy', author: 'Tim Read', note: 'The most grounded clinical and experiential guide to working with psychedelic states.' },
      { title: 'The Immortality Key', author: 'Brian Muraresku', note: 'A deep investigation into the ancient sacramental roots of Western religion and psychedelic ritual.' },
      { title: 'The Transpersonal Vision', author: 'Stanislav Grof', note: 'The foundational framework for understanding non-ordinary states of consciousness from the pioneer of the field.' },
    ]
  },
  {
    theme: '🌊 Healing & Shadow Work',
    items: [
      { title: 'The Myth of Normal', author: 'Gabor Maté', note: 'A compassionate, unflinching look at trauma, illness, and what it means to truly heal in a sick society.' },
      { title: 'Internal Family Systems Therapy', author: 'Richard Schwartz', note: 'The IFS model transformed how we understand the inner world — parts, protectors, and the Self beneath it all.' },
      { title: 'The 5 Personality Patterns', author: 'Steven Kessler', note: 'How early wounds shape the way we move, speak, and connect — and how to find your way back to yourself.' },
      { title: 'Loving What Is', author: 'Byron Katie', note: 'Four questions that can dissolve a lifetime of suffering. Deceptively simple, profoundly liberating.' },
      { title: 'Existential Kink', author: 'Carolyn Elliott', note: 'The uncomfortable idea that we unconsciously create what we suffer. A radical approach to shadow integration.' },
      { title: 'Man\'s Search for Meaning', author: 'Viktor Frankl', note: 'Written in a Nazi concentration camp. The most important book ever written about suffering and purpose.' },
      { title: 'Iron John', author: 'Robert Bly', note: 'The seminal work on masculine initiation, the wild man within, and what it means to grow into full manhood.' },
    ]
  },
  {
    theme: '🧭 Consciousness & Spirituality',
    items: [
      { title: 'The Map of Consciousness Explained', author: 'David Hawkins', note: 'A calibrated map of human consciousness from shame to enlightenment. A framework that changes how you see everything.' },
      { title: 'Power vs. Force', author: 'David Hawkins', note: 'The companion to Map of Consciousness — the difference between power that uplifts and force that controls.' },
      { title: 'Reality Transurfing', author: 'Vadim Zeland', note: 'A Russian quantum physicist\'s model for navigating the space of variations — unusual, expansive, and practical.' },
      { title: 'Gene Keys', author: 'Richard Rudd', note: 'A living transmission based on the I Ching. Each Gene Key maps a path from shadow to gift to siddhi.' },
      { title: 'Dispelling Wetiko', author: 'Paul Levy', note: 'The wetiko mind-virus — the Indigenous concept of collective psychic contagion — examined through a modern lens.' },
      { title: 'The Original Be Here Now Talks', author: 'Ram Dass', note: 'The foundational text of the Western spiritual renaissance. Still one of the most alive books in print.' },
      { title: 'A Course in Miracles', author: 'Helen Schucman', note: 'A complete spiritual curriculum that redefines perception, forgiveness, and the nature of reality.' },
      { title: 'Autobiography of a Yogi', author: 'Paramahansa Yogananda', note: 'The book that introduced the West to Eastern mysticism. Steve Jobs had it on his iPad at his death.' },
      { title: 'The Kybalion', author: 'The Three Initiates', note: 'The seven Hermetic principles — including mentalism, correspondence, and vibration — that underlie all esoteric traditions.' },
      { title: 'Quantum Psychology', author: 'Isaac Betanzos', note: 'The meeting point between quantum physics and the nature of mind and consciousness.' },
    ]
  },
  {
    theme: '🌿 Nature, Soul & Ecology',
    items: [
      { title: 'Nature and the Human Soul', author: 'Bill Plotkin', note: 'A map of human development rooted in nature and soul. One of the most important books on initiation and wholeness.' },
      { title: 'Active Hope', author: 'Joanna Macy', note: 'How to face the state of the world without despair — and find meaningful action from a place of love.' },
      { title: 'Ishmael', author: 'Daniel Quinn', note: 'A gorilla teaches a man the story of civilization and what was lost. It will change how you see everything.' },
      { title: 'The Art of Living', author: 'Thich Nhat Hanh', note: 'Gentle and profound teachings on presence, interbeing, and the art of being fully alive.' },
    ]
  },
  {
    theme: '👁️ Philosophy & Perennial Wisdom',
    items: [
      { title: 'Meditations', author: 'Marcus Aurelius', note: 'A Roman emperor\'s private journal. Two thousand years old and more useful than almost anything written since.' },
      { title: 'The Four Agreements', author: 'Don Miguel Ruiz', note: 'Ancient Toltec wisdom distilled into four commitments that can transform every relationship you have.' },
      { title: 'A New Earth', author: 'Eckhart Tolle', note: 'The ego, the pain body, and the awakening of consciousness. One of the most widely transformative books of our time.' },
      { title: 'The Essential Rumi', author: 'Jalal ad-Din Rumi', note: 'The poetry of the 13th-century mystic that still pierces directly to the heart of longing and love.' },
      { title: 'The Way of the Bodhisattva', author: 'Shantideva', note: 'The classic Buddhist text on awakening — not for yourself, but for the sake of all beings.' },
      { title: 'The Story of Philosophy', author: 'Will Durant', note: 'The most readable introduction to Western philosophy ever written. A map of how humans have tried to understand existence.' },
      { title: 'As a Man Thinketh', author: 'James Allen', note: 'The original mind-as-garden metaphor. Short, timeless, and still one of the clearest statements on personal responsibility.' },
    ]
  },
  {
    theme: '🔥 Leadership & Conscious Living',
    items: [
      { title: 'The 15 Commitments of Conscious Leadership', author: 'Jim Dethmer', note: 'Above or below the line — the framework for leading from curiosity instead of fear.' },
      { title: 'The Way of the Superior Man', author: 'David Deida', note: 'Masculine purpose, presence, and the practice of living from your deepest truth.' },
      { title: 'Breaking the Habit of Being Yourself', author: 'Joe Dispenza', note: 'The neuroscience and quantum model of how to literally become a different person through thought and meditation.' },
      { title: 'Maps of Meaning', author: 'Jordan Peterson', note: 'The mythological and psychological architecture of meaning — dense, but one of the most ambitious books of our era.' },
      { title: 'The Book of Joy', author: 'Dalai Lama & Desmond Tutu', note: 'Two of the world\'s greatest spiritual leaders on joy in the face of suffering. Remarkably practical.' },
      { title: 'I Know What to Do, So Why Don\'t I Do It?', author: 'Nick Hall', note: 'The neuroscience of why knowing isn\'t enough — and what actually creates lasting change.' },
    ]
  },
  {
    theme: '💰 Wealth, Purpose & Abundance',
    items: [
      { title: 'The Soul of Money', author: 'Lynne Twist', note: 'Money as a reflection of values. One of the most honest and liberating books ever written about our relationship with wealth.' },
      { title: 'Think and Grow Rich', author: 'Napoleon Hill', note: 'The original. Still the most penetrating study of what separates those who achieve from those who don\'t.' },
      { title: 'The Science of Getting Rich', author: 'Wallace Wattles', note: 'Written in 1910 and still radical — the idea that prosperity is a natural result of thinking in a certain way.' },
      { title: 'The Richest Man in Babylon', author: 'George Clason', note: 'Timeless financial principles told through ancient Babylonian parables. Simple, memorable, and true.' },
      { title: 'The Compound Effect', author: 'Darren Hardy', note: 'Small consistent actions are the only real strategy. This book makes that undeniable.' },
      { title: 'Love Yourself Like Your Life Depends on It', author: 'Kamal Ravikant', note: 'One man\'s account of how a single practice — radical self-love — saved his life.' },
    ]
  },
]

const MUSIC = [
  {
    state: '🌧️ For difficult days',
    desc: 'When things feel heavy, stuck, or hard',
    links: [
      { title: 'Add a playlist', url: '#', note: 'Coming soon — curated for hard moments' },
    ]
  },
  {
    state: '🌱 For grounding',
    desc: 'Return to the present, settle the nervous system',
    links: [
      { title: 'Add a playlist', url: '#', note: 'Coming soon — earth tones and stillness' },
    ]
  },
  {
    state: '✨ For intentional states',
    desc: 'Ceremony, meditation, deep inner work',
    links: [
      { title: 'Add a playlist', url: '#', note: 'Coming soon — music for altered and sacred states' },
    ]
  },
  {
    state: '☀️ For celebrating good days',
    desc: 'When things are flowing and you want to ride it',
    links: [
      { title: 'Add a playlist', url: '#', note: 'Coming soon — uplift and joy' },
    ]
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('insights')
  const [openBook, setOpenBook] = useState(null)
  const [selectedTheme, setSelectedTheme] = useState('all')

  // Rotate prompt daily
  const todayPrompt = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return PROMPTS[dayOfYear % PROMPTS.length]
  }, [])

  // All unique themes
  const promptThemes = ['all', ...new Set(PROMPTS.map(p => p.theme))]
  const filteredPrompts = selectedTheme === 'all'
    ? PROMPTS
    : PROMPTS.filter(p => p.theme === selectedTheme)

  return (
    <div className="page-container animate-fade-in">
      <h1 className="text-xl font-semibold text-sage-800 mb-5">Support</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-warm-100 rounded-2xl p-1 mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-sage-700 shadow-sm'
                : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="animate-fade-in">
          {/* Today's prompt */}
          <div className="card bg-sage-50 border-sage-200 mb-5">
            <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide mb-2">Today's reflection</p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-lg border mb-3 ${THEME_COLORS[todayPrompt.theme] || 'bg-warm-100 text-warm-600 border-warm-200'}`}>
              {todayPrompt.theme}
            </span>
            <p className="text-base text-sage-800 leading-relaxed font-medium">"{todayPrompt.text}"</p>
          </div>

          {/* Filter by theme */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
            {promptThemes.map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedTheme === theme
                    ? 'bg-sage-600 text-white'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                {theme === 'all' ? 'All' : theme}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredPrompts.map((prompt, i) => (
              <div key={i} className="card">
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-lg border mb-2 ${THEME_COLORS[prompt.theme] || 'bg-warm-100 text-warm-600 border-warm-200'}`}>
                  {prompt.theme}
                </span>
                <p className="text-sm text-warm-800 leading-relaxed">"{prompt.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKS */}
      {activeTab === 'books' && (
        <div className="animate-fade-in space-y-5">
          <p className="text-xs text-warm-400 leading-relaxed">
            Books that have shaped how we think about healing, consciousness, and becoming fully human. Not a reading list — a library of doorways.
          </p>
          {BOOKS.map((section, si) => (
            <div key={si}>
              <h3 className="text-sm font-semibold text-warm-700 mb-3">{section.theme}</h3>
              <div className="space-y-2">
                {section.items.map((book, bi) => {
                  const key = `${si}-${bi}`
                  const isOpen = openBook === key
                  return (
                    <button
                      key={bi}
                      onClick={() => setOpenBook(isOpen ? null : key)}
                      className="card w-full text-left hover:border-sage-200 transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-warm-800">{book.title}</p>
                          <p className="text-xs text-warm-400">{book.author}</p>
                          {isOpen && (
                            <p className="text-xs text-warm-600 leading-relaxed mt-2">{book.note}</p>
                          )}
                        </div>
                        <span className="text-warm-300 text-sm flex-shrink-0 mt-0.5">{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MUSIC */}
      {activeTab === 'music' && (
        <div className="animate-fade-in space-y-5">
          <p className="text-xs text-warm-400 mb-2">Music organized by how you're feeling.</p>
          {MUSIC.map((category, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-warm-700">{category.state}</h3>
                  <p className="text-xs text-warm-400">{category.desc}</p>
                </div>
              </div>
              <div className="space-y-2">
                {category.links.map((link, j) => (
                  <div key={j} className="card border-dashed text-center py-4 text-warm-300">
                    <p className="text-xs">{link.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="card bg-sage-50 border-sage-100">
            <p className="text-xs text-sage-600">🎵 Playlists coming soon — curated for each state of being.</p>
          </div>
        </div>
      )}

      {/* COACHING */}
      {activeTab === 'coaching' && (
        <div className="animate-fade-in space-y-4">
          <div className="card bg-sage-50 border-sage-200">
            <p className="text-sm text-sage-700 leading-relaxed italic">
              "I've been through it. I know the terrain — the disorientation, the breakthroughs, the hard days after. I offer coaching rooted in real experience, not textbooks."
            </p>
          </div>

          <div className="card text-center py-6">
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-lg font-semibold text-sage-800 mb-2">Work 1:1 with a Coach</h2>
            <p className="text-sm text-warm-500 leading-relaxed mb-6">
              Sometimes what you're seeing in your check-ins deserves more than a reflection. A session creates space to go deeper — to make sense of patterns, work through what's stuck, and find your next step.
            </p>
            <a
              href="https://placeholder-coaching-url.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Book a Session →
            </a>
            <p className="text-xs text-warm-400 mt-3">Sessions available via video or phone</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-warm-700 mb-3">This coaching is for you if...</h3>
            <ul className="space-y-2">
              {[
                "You've had a psychedelic or plant medicine experience and want support integrating it",
                "You're noticing patterns in your life that you're ready to understand more deeply",
                "You want a grounded, experienced guide — not a therapist, not a guru",
                "You're ready to move from awareness into action",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                  <span className="text-sage-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-warm-700 mb-2">What to expect</h3>
            <p className="text-xs text-warm-500 leading-relaxed">
              Sessions are 60 minutes. No agenda imposed on you — we follow what's alive. Between sessions, Innermark keeps you tracking so we have real data to work with, not just memory.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
