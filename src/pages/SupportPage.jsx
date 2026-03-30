import { useState } from 'react'
import { TEACHINGS, MUSIC_LINKS } from '../lib/mockData'

const TABS = [
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'teachings', label: 'Teachings', icon: '📖' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'coaching', label: 'Coaching', icon: '🤝' },
]

const THEMES = ['Self-Compassion', 'Shame & Growth', 'Patience', 'Forgiveness']

const DAILY_INSIGHTS = [
  { theme: 'Shame', text: "Shame says you are the problem. Growth says you have one. You're not broken — you're human." },
  { theme: 'Self-Compassion', text: "Would you say what you just said to yourself to a close friend? If not, try rewriting it with kindness." },
  { theme: 'Forgiveness', text: "Forgiveness isn't saying it was okay. It's saying you won't let it keep costing you." },
  { theme: 'Patience', text: "You can't harvest what you haven't planted yet. Keep showing up." },
  { theme: 'Growth', text: "The discomfort you're feeling might be growth, not failure. It often feels the same from the inside." },
  { theme: 'Self-Compassion', text: "You are allowed to be a work in progress and enough, simultaneously." },
  { theme: 'Forgiveness', text: "Carrying a grudge against yourself is exhausting. What would it feel like to set it down?" },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('insights')
  const [openTeaching, setOpenTeaching] = useState(null)

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
            <span className="mt-0.5 hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-warm-400 mb-4">
            Short reflections on shame, compassion, forgiveness, and growth.
          </p>
          {DAILY_INSIGHTS.map((insight, i) => (
            <div key={i} className="card">
              <span className="inline-block text-xs font-medium text-sage-600 bg-sage-50 rounded-lg px-2 py-0.5 mb-2">
                {insight.theme}
              </span>
              <p className="text-warm-800 text-sm leading-relaxed">"{insight.text}"</p>
            </div>
          ))}
        </div>
      )}

      {/* TEACHINGS */}
      {activeTab === 'teachings' && (
        <div className="space-y-3 animate-fade-in">
          {openTeaching ? (
            <TeachingDetail
              teaching={TEACHINGS.find(t => t.id === openTeaching)}
              onBack={() => setOpenTeaching(null)}
            />
          ) : (
            <>
              <p className="text-xs text-warm-400 mb-4">
                Longer reads on themes that matter. Tap any to read.
              </p>
              {TEACHINGS.map(teaching => (
                <button
                  key={teaching.id}
                  onClick={() => setOpenTeaching(teaching.id)}
                  className="card w-full text-left hover:border-sage-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <span className="inline-block text-xs font-medium text-sage-600 bg-sage-50 rounded-lg px-2 py-0.5 mb-1.5">
                        {teaching.theme}
                      </span>
                      <h3 className="text-sm font-semibold text-warm-800 mb-1">{teaching.title}</h3>
                      <p className="text-xs text-warm-500 leading-relaxed">{teaching.preview}</p>
                    </div>
                    <div className="text-warm-300 text-sm mt-1">→</div>
                  </div>
                  <p className="text-xs text-warm-300 mt-2">{teaching.readTime} read</p>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* MUSIC */}
      {activeTab === 'music' && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-xs text-warm-400 mb-2">
            Music organized by how you're feeling.
          </p>

          {[
            { key: 'difficult', label: 'For difficult days', icon: '🌧️', desc: 'When things feel hard' },
            { key: 'grounding', label: 'Grounding', icon: '🌱', desc: 'Return to the present' },
            { key: 'positive', label: 'Positive & uplifting', icon: '☀️', desc: 'Celebrate a good day' },
          ].map(category => (
            <div key={category.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-warm-700">{category.label}</h3>
                  <p className="text-xs text-warm-400">{category.desc}</p>
                </div>
              </div>
              <div className="space-y-2">
                {MUSIC_LINKS[category.key].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card flex items-center gap-3 hover:border-sage-200 transition-all no-underline active:scale-[0.99]"
                  >
                    <span className="text-2xl">🎵</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warm-800">{link.title}</p>
                      <p className="text-xs text-warm-400">{link.note}</p>
                    </div>
                    <span className="text-warm-300 text-sm">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COACHING */}
      {activeTab === 'coaching' && (
        <div className="animate-fade-in">
          <div className="card text-center py-8 mb-4">
            <div className="text-5xl mb-4">🤝</div>
            <h2 className="text-lg font-semibold text-sage-800 mb-2">Work with a Coach</h2>
            <p className="text-sm text-warm-500 leading-relaxed mb-6">
              Sometimes the patterns we notice deserve more than a check-in.
              Book a 1:1 session to work through what's coming up.
            </p>
            <a
              href="https://placeholder-coaching-url.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Book a Session →
            </a>
          </div>

          <div className="card bg-sage-50 border-sage-200">
            <h3 className="text-sm font-semibold text-sage-800 mb-2">What coaching offers</h3>
            <ul className="space-y-2">
              {[
                'A safe, confidential space to explore patterns',
                'Support with shame, relationships, and personal growth',
                'Practical tools grounded in research',
                'Consistent accountability and encouragement',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sage-700">
                  <span className="text-sage-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function TeachingDetail({ teaching, onBack }) {
  if (!teaching) return null

  // Simple markdown-like rendering
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-warm-800 mt-4 mb-1">{line.slice(2, -2)}</p>
      }
      if (line.match(/^\d\. /)) {
        const [num, ...rest] = line.split('. ')
        return (
          <div key={i} className="flex gap-2 text-sm text-warm-700 mb-1">
            <span className="text-sage-500 font-medium">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: rest.join('. ').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )
      }
      if (line === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-sm text-warm-700 leading-relaxed mb-0"
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    })
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-800 mb-4 transition-colors"
      >
        ← Back
      </button>
      <span className="inline-block text-xs font-medium text-sage-600 bg-sage-50 rounded-lg px-2 py-0.5 mb-3">
        {teaching.theme}
      </span>
      <h2 className="text-xl font-semibold text-warm-800 mb-1">{teaching.title}</h2>
      <p className="text-xs text-warm-400 mb-5">{teaching.readTime} read</p>
      <div className="prose-sm">
        {renderContent(teaching.content)}
      </div>
    </div>
  )
}
