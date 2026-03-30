import { useState, useMemo } from 'react'
import { format, subDays, eachDayOfInterval, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns'
import useAppStore from '../store/useAppStore'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PremiumPrompt from '../components/ui/PremiumPrompt'

const RANGES = [
  { id: '7', label: '7 days', days: 7 },
  { id: '30', label: '30 days', days: 30 },
  { id: '90', label: '3 months', days: 90 },
  { id: '365', label: '1 year', days: 365, premium: true },
  { id: 'all', label: 'All time', days: null, premium: true },
]

const STATUS_COLOR = {
  green: '#4e8f50',
  yellow: '#f59e0b',
  red: '#ef4444',
  null: '#e8e0d2',
}

const STATUS_SCORE = { green: 2, yellow: 1, red: 0, null: -1 }

export default function TrendsPage() {
  const { topics, history, isPremium, historyLoaded } = useAppStore()
  const [selectedRange, setSelectedRange] = useState('7')
  const [viewMode, setViewMode] = useState('grid') // grid | chart
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)

  const range = RANGES.find(r => r.id === selectedRange)

  // Date range
  const endDate = new Date()
  const startDate = range.days ? subDays(endDate, range.days - 1) : (
    history.length > 0 ? parseISO(history[history.length - 1].date) : subDays(endDate, 29)
  )

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Build lookup: date -> { topicId -> status }
  const dataMap = useMemo(() => {
    const map = {}
    history.forEach(entry => {
      map[entry.date] = {}
      entry.topic_entries?.forEach(te => {
        map[entry.date][te.topic_id] = te.status
      })
    })
    return map
  }, [history])

  // Streak calculation
  const streaks = useMemo(() => {
    let currentStreak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    // Walk backwards
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      if (date === today) continue // skip today if not checked in
      const dayData = dataMap[date]
      if (!dayData) break
      const statuses = Object.values(dayData)
      if (statuses.length > 0 && statuses.every(s => s === 'green')) {
        currentStreak++
      } else {
        break
      }
    }
    return currentStreak
  }, [dataMap])

  // Bar chart data
  const chartData = useMemo(() => {
    return allDays.slice(-30).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = dataMap[dateStr] || {}
      const statuses = Object.values(dayData)
      if (statuses.length === 0) return { date: format(day, 'M/d'), score: null, dateStr }

      const greenCount = statuses.filter(s => s === 'green').length
      const total = statuses.length
      const score = Math.round((greenCount / total) * 100)
      return { date: format(day, 'M/d'), score, dateStr }
    })
  }, [allDays, dataMap])

  function handleRangeSelect(range) {
    if (range.premium && !isPremium) {
      setShowPremiumPrompt(true)
      return
    }
    setSelectedRange(range.id)
  }

  // Limit grid to 30 days for readability
  const gridDays = allDays.slice(-Math.min(allDays.length, selectedRange === '7' ? 7 : 30))

  if (!historyLoaded) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-400">Loading trends...</p>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-sage-800">Trends</h1>
        <div className="flex gap-1">
          {['grid', 'chart'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                viewMode === mode
                  ? 'bg-sage-600 text-white'
                  : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
              }`}
            >
              {mode === 'grid' ? '▦' : '📊'}
            </button>
          ))}
        </div>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
        {RANGES.map(r => (
          <button
            key={r.id}
            onClick={() => handleRangeSelect(r)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedRange === r.id
                ? 'bg-sage-600 text-white'
                : r.premium && !isPremium
                ? 'bg-warm-50 text-warm-300 border border-warm-100'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            {r.label}
            {r.premium && !isPremium && ' ✨'}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard
          value={streaks}
          label={streaks === 1 ? 'day streak' : 'day streak'}
          icon="🔥"
          highlight={streaks >= 3}
        />
        <StatCard
          value={history.filter(h => {
            const statuses = h.topic_entries?.map(e => e.status) || []
            return statuses.length > 0 && statuses.every(s => s === 'green')
          }).length}
          label="all-green days"
          icon="🌿"
        />
        <StatCard
          value={history.length}
          label="check-ins"
          icon="✅"
        />
      </div>

      {viewMode === 'grid' ? (
        <GridView topics={topics} gridDays={gridDays} dataMap={dataMap} />
      ) : (
        <ChartView chartData={chartData} />
      )}

      {topics.length === 0 && (
        <div className="card text-center py-8 text-warm-400">
          <p className="text-sm">Add topics and start checking in to see trends!</p>
        </div>
      )}

      {showPremiumPrompt && <PremiumPrompt onClose={() => setShowPremiumPrompt(false)} />}
    </div>
  )
}

function StatCard({ value, label, icon, highlight }) {
  return (
    <div className={`card text-center py-3 ${highlight ? 'bg-sage-50 border-sage-200' : ''}`}>
      <div className="text-xl mb-0.5">{icon}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-sage-700' : 'text-warm-800'}`}>{value}</div>
      <div className="text-xs text-warm-400">{label}</div>
    </div>
  )
}

function GridView({ topics, gridDays, dataMap }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="text-left p-3 text-warm-400 font-medium w-24 sticky left-0 bg-white">Topic</th>
              {gridDays.map(day => (
                <th key={day.toISOString()} className="p-1.5 text-warm-400 font-medium text-center min-w-[2rem]">
                  <div>{format(day, 'EEE')[0]}</div>
                  <div>{format(day, 'd')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map(topic => (
              <tr key={topic.id} className="border-b border-warm-50">
                <td className="p-3 text-warm-700 font-medium sticky left-0 bg-white whitespace-nowrap">
                  <span className="mr-1">{topic.emoji}</span>
                  <span className="text-xs">{topic.name.length > 10 ? topic.name.slice(0, 9) + '…' : topic.name}</span>
                </td>
                {gridDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const status = dataMap[dateStr]?.[topic.id]
                  return (
                    <td key={day.toISOString()} className="p-1.5 text-center">
                      <div
                        className="w-6 h-6 rounded-full mx-auto transition-all"
                        style={{ backgroundColor: STATUS_COLOR[status || null] }}
                        title={status || 'No data'}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 p-3 border-t border-warm-100 justify-center">
        {[['green', 'Good'], ['yellow', 'Neutral'], ['red', 'Hard'], [null, 'No data']].map(([s, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
            <span className="text-xs text-warm-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartView({ chartData }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-warm-600 mb-4">Overall wellbeing score</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#bfaa8e' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#bfaa8e' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#faf9f6',
              border: '1px solid #e8e0d2',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(v) => v !== null ? [`${v}%`, 'Score'] : ['No data', '']}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.score === null ? '#e8e0d2'
                  : entry.score >= 70 ? '#4e8f50'
                  : entry.score >= 40 ? '#f59e0b'
                  : '#ef4444'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
