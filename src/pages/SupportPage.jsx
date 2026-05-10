import { useState } from 'react'

const TABS = [
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'coaching', label: 'Coaching', icon: '🤝' },
]

const BOOKS = [
  {
    theme: '🍄 Psychedelics & Integration',
    items: [
      { title: 'Psychedelics and Psychotherapy', author: 'Tim Read', note: 'The most grounded clinical and experiential guide to working with psychedelic states.' },
      { title: 'The Immortality Key', author: 'Brian Muraresku', note: 'A deep investigation into the ancient sacramental roots of Western religion and psychedelic ritual.' },
      { title: 'The Transpersonal Vision', author: 'Stanislav Grof', note: 'The foundational framework for understanding non-ordinary states of consciousness from the pioneer of the field.' },
      { title: 'The Ra Contact', author: 'Don Elkins', note: 'The Law of One material — a channeled transmission on consciousness, free will, and the nature of reality that has influenced countless seekers.' },
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
      { title: 'The King Within', author: 'Douglas Gillette', note: 'Archetypal masculine psychology — the King, Warrior, Magician, and Lover archetypes that shape how men lead and love.' },
      { title: 'Adult Children of Alcoholics', author: 'Janet Woititz', note: 'The foundational text for understanding the lasting patterns that come from growing up in a dysfunctional family.' },
      { title: 'The Easy Way to Control Alcohol', author: 'Allen Carr', note: 'Carr\'s famous method applied to alcohol — addresses the psychological trap rather than relying on willpower.' },
      { title: 'Difficult Conversations', author: 'Douglas Stone', note: 'A Harvard Negotiation Project framework for having the conversations we avoid most — and why we must have them.' },
      { title: 'Healing Yourself with Your Own Voice', author: 'Don Campbell', note: 'The healing power of sound and voice — how toning, humming, and intentional listening restore the nervous system.' },
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
      { title: 'The Secret', author: 'Osho', note: 'Osho\'s commentaries on Sufism — the hidden path, the nature of the divine, and the secret that cannot be spoken but only lived.' },
      { title: 'The Cloud of Unknowing', author: 'Carmen Acevedo Butcher (trans.)', note: 'A 14th-century Christian mystical text on contemplative prayer — approaching God through unknowing rather than understanding.' },
      { title: 'A Course in Mysticism and Miracles', author: 'Jon Mundy', note: 'A clear, accessible guide to the principles behind A Course in Miracles and the mystical path it points toward.' },
      { title: 'Spiral Dynamics Integral', author: 'Don Beck', note: 'The developmental model of human values and worldviews — how individuals and cultures evolve through levels of consciousness.' },
      { title: 'The Hidden Reality', author: 'Brian Greene', note: 'A physicist\'s tour of the multiverse — all the ways modern physics suggests our universe may be one of many.' },
      { title: 'Whole Brain Living', author: 'Jill Bolte Taylor', note: 'The neuroscientist who had a stroke and found nirvana. A map of the four brain characters and how to live from the right hemisphere.' },
      { title: 'The Contemplative Journey', author: 'Thomas Keating', note: 'Centering prayer and the Christian contemplative tradition — a practical guide to silent, receptive prayer.' },
      { title: 'The Wisdom Jesus', author: 'Cynthia Bourgeault', note: 'Jesus as a wisdom teacher in the lineage of the world\'s great mystics — not a figure of doctrine but a path of transformation.' },
      { title: 'The Critique of Pure Reason', author: 'Immanuel Kant', note: 'The foundational text of modern philosophy — Kant\'s investigation into the limits of human knowledge and the nature of reality.' },
      { title: 'The Qur\'an', author: 'Abdel Haleem (trans.)', note: 'The central religious text of Islam — Haleem\'s translation is considered one of the most readable and accurate in English.' },
      { title: 'The Theory of Everything', author: 'Ken Wilber', note: 'An introduction to Integral Theory — Wilber\'s framework for integrating science, spirituality, psychology, and culture into a single map.' },
      { title: 'NLP: The New Technology of Achievement', author: 'Charles Faulkner', note: 'Neuro-linguistic programming as a practical toolkit for changing behavior, communication, and internal states.' },
      { title: 'Great Mythologies of the World', author: 'The Great Courses', note: 'A comprehensive exploration of world mythology — the stories cultures tell about creation, the divine, and what it means to be human.' },
    ]
  },
  {
    theme: '🌿 Nature, Soul & Ecology',
    items: [
      { title: 'Nature and the Human Soul', author: 'Bill Plotkin', note: 'A map of human development rooted in nature and soul. One of the most important books on initiation and wholeness.' },
      { title: 'Active Hope', author: 'Joanna Macy', note: 'How to face the state of the world without despair — and find meaningful action from a place of love.' },
      { title: 'Ishmael', author: 'Daniel Quinn', note: 'A gorilla teaches a man the story of civilization and what was lost. It will change how you see everything.' },
      { title: 'The Art of Living', author: 'Thich Nhat Hanh', note: 'Gentle and profound teachings on presence, interbeing, and the art of being fully alive.' },
      { title: 'The Power Path Training', author: 'Jose Luis Stevens', note: 'Shamanic tools for navigating power — how to work with your own energy, avoid power leaks, and live with intention.' },
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
      { title: 'Out of Your Mind', author: 'Alan Watts', note: 'Watts at his best — exploring the nature of consciousness, the illusion of the self, and why the universe is playing hide-and-seek with itself.' },
      { title: 'The Lessons of History', author: 'Will Durant', note: 'A distillation of everything Durant learned from writing his 11-volume Story of Civilization. Sweeping, wise, and short.' },
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
      { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', note: 'The original people skills book. Timeless principles for connection, persuasion, and genuine human understanding.' },
      { title: 'The Success Principles', author: 'Jack Canfield', note: '64 principles distilled from decades of studying successful people — practical, comprehensive, and endlessly applicable.' },
      { title: 'The Day That Turns Your Life Around', author: 'Jim Rohn', note: 'Rohn\'s teaching on the moments of decision that redirect a life — and how to deliberately create those turning points.' },
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
      { title: 'You Were Born Rich', author: 'Bob Proctor', note: 'Proctor\'s foundational work on the paradigms that keep people from wealth — and how to shift them at the level of the subconscious.' },
      { title: 'Thinking Big', author: 'Zig Ziglar', note: 'The case for enlarging your vision of what\'s possible — and the mindset shifts that allow ordinary people to achieve extraordinary things.' },
      { title: 'The Secret', author: 'Rhonda Byrne', note: 'The law of attraction made mainstream. Whatever your view of the metaphysics, the core message about focus and belief has moved millions.' },
    ]
  },
]

const MUSIC = [
  {
    state: '✨ Ceremony & Sacred Space',
    desc: 'For plant medicine, ritual, and deep inner work',
    links: [
      { title: 'Mushroom Ceremony A', url: 'https://open.spotify.com/playlist/7jjrybq4nZTWM0vObEUF3h?si=KtbdRXhvSmG25MI27W4QMg', note: 'Curated for psilocybin ceremony — expansive and intentional' },
      { title: 'Mushroom Ceremony B', url: 'https://open.spotify.com/playlist/42KSp0BZpms4HqaDm0eTfa?si=csZ143DyT3Cf7DqaZ3kagQ', note: 'Second ceremony playlist — a different arc and energy' },
      { title: 'Shamanic', url: 'https://open.spotify.com/album/4SbBdmNcCrE9q0jxPVrU6M?si=gpbDpT_xTK-678N8CoKoFQ', note: 'Drums, rattles, and earth tones for shamanic journeywork' },
      { title: 'Shamanic Playlist', url: 'https://open.spotify.com/playlist/1u4GtjIqH0vT25ztlF7kB4?si=qxR7QmpCSBeSM0VY6X5QxA', note: 'Extended shamanic collection for longer sessions' },
      { title: 'Pachamama', url: 'https://open.spotify.com/playlist/3nwZWJMA2rkbmJqWTKP8CC?si=iKuj6m-sRzSBL1ZOX0s6xA', note: 'Earth medicine vibes — grounded, devotional, alive' },
      { title: 'Chanting Mantras', url: 'https://open.spotify.com/playlist/6pHeoDEONYwAWgWDxC4ree?si=3o3AJFP1S-y8g9S9R7vuRA', note: 'Sacred mantras for opening the heart and steadying the mind' },
      { title: 'Duduk Meditation', url: 'https://open.spotify.com/album/7akUjc2IEfNeWPeZOeHtil?si=qbahQN0hR3GY7fg2SBjD5w', note: 'Armenian duduk — hauntingly beautiful for deep inner states' },
    ]
  },
  {
    state: '🌱 Meditation & Breathwork',
    desc: 'Stillness, presence, and nervous system regulation',
    links: [
      { title: 'Meditation', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u?si=MvgWf9CHSA-2YZZOJr8C6A', note: 'Spotify\'s curated meditation collection — calm and spacious' },
      { title: 'Breathwork', url: 'https://open.spotify.com/playlist/2gHyzx64o35vxhAPW3ioom?si=X20FqUxHSTW1weMjgR0PBg', note: 'Built for breathwork sessions — rhythmic and supportive' },
      { title: 'Piano', url: 'https://open.spotify.com/album/7dP1xv0rBw9sAKvcAlL1X8?si=3gG8HWlfRFmxKDoqTCFJgw', note: 'Solo piano — simple, unadorned, deeply settling' },
      { title: 'Relaxing Ragas', url: 'https://open.spotify.com/playlist/37i9dQZF1DX0TD2wVgaeIq?si=BwD614IGSUOfoThu9joKww', note: 'Indian classical ragas for deep relaxation and meditation' },
      { title: 'Slowdown Psychedelic', url: 'https://open.spotify.com/playlist/0yvEXSkoEeIi5oh5a1Ibkz?si=M1e0LMoXSYWheHXtUf28NQ', note: 'Slow, psychedelic textures for coming down and integrating' },
    ]
  },
  {
    state: '🔥 Focus & Flow',
    desc: 'For journaling, reflection, and getting into the zone',
    links: [
      { title: 'Focus', url: 'https://open.spotify.com/playlist/6qwcOZ2T8TYtexPqaMPpWp?si=Jb7Bvx-yRu2j7oGtqdzMlQ', note: 'Deep focus music — minimal and undistracting' },
      { title: 'Lofi', url: 'https://open.spotify.com/playlist/0AIovh0Qq1sUP7YfhxTDhw?si=fv2ikmU0RN-U0qVQt53kKg', note: 'Lo-fi beats for calm productivity and reflection' },
      { title: 'Downtempo', url: 'https://open.spotify.com/playlist/0EedULhw6qjt7m6PD0Zsjb?si=A-_RYYdLSBqvz0NJIvPGSQ', note: 'Slow, textured electronic — good for writing and inner work' },
    ]
  },
  {
    state: '☀️ Uplift & Joy',
    desc: 'For good days, movement, and feeling alive',
    links: [
      { title: 'Love is the Cure', url: 'https://open.spotify.com/playlist/37i9dQZF1E8L8gb3MhErDU?si=TMHHKg40SluYlnfBnWLLJw', note: 'Warm, soulful, heart-opening — music as medicine for good days' },
      { title: 'Tulum Vibes', url: 'https://open.spotify.com/playlist/37i9dQZF1DX9pP7cC2liKw?si=IpZ21RPMSaKiwa9FWq76ag', note: 'Organic house and world sounds — for when you want to move' },
      { title: 'Jazzy Mornings', url: 'https://open.spotify.com/playlist/3TYK9AfW5m6ZzkredxA4Uf?si=N9nlssP2So6VgHUoT1Iu5w', note: 'Easy jazz for a slow, intentional morning' },
      { title: 'Gypsy / Flamenco', url: 'https://open.spotify.com/playlist/4ntPIpr4t7NzcfRKAwbvAd?si=EnSySWlkTvmwgayNzquxEw', note: 'Passionate, alive, earthy — gypsy jazz and flamenco fire' },
    ]
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('books')
  const [openBook, setOpenBook] = useState(null)

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
        <div className="animate-fade-in space-y-6">
          <p className="text-xs text-warm-400 leading-relaxed">
            Music organized by state of being. Tap any title to open in Spotify.
          </p>
          {MUSIC.map((category, i) => (
            <div key={i}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-warm-700">{category.state}</h3>
                <p className="text-xs text-warm-400">{category.desc}</p>
              </div>
              <div className="space-y-2">
                {category.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card flex items-center gap-3 hover:border-sage-200 transition-all no-underline active:scale-[0.99] block"
                  >
                    <span className="text-2xl flex-shrink-0">🎵</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-800">{link.title}</p>
                      <p className="text-xs text-warm-400 leading-relaxed">{link.note}</p>
                    </div>
                    <span className="text-warm-300 text-sm flex-shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
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
              href="https://aarontritt.com"
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
