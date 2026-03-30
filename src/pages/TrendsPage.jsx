import { useState, useMemo } from 'react'
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'
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

export default function TrendsPage() {
  const { topics, history, isPremium, historyLoaded } = useAppStore()
  const [selectedRange, setSelectedRange] = useState('7')
  const [viewMode, setViewMode] = useState('grid')
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)

  const range = RANGES.find(r => r.id === selectedRange)

  // Date range — endDate is today, startDate goes back N days inclusive
  const endDate = new Date()
  const startDate = range.days
    ? subDays(endDate, range.days - 1)
    : history.length > 0
      ? parseISO(history[history.length - 1].date)
      : subDays(endDate, 29)

  // All days in range, oldest → newest
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

  // Per-topic totals across selected range
  const topicTotals = useMemo(() => {
    const totals = {}
    topics.forEach(t => {
      totals[t.id] = { green: 0, yellow: 0, red: 0, total: 0 }
    })
    allDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = dataMap[dateStr] || {}
      topics.forEach(t => {
        const status = dayData[t.id]
        if (status) {
          totals[t.id][status]++
          totals[t.id].total++
        }
      })
    })
    return totals
  }, [allDays, dataMap, topics])

  // Streak calculation (all-green days in a row going back from yesterday)
  const streaks = useMemo(() => {
    let currentStreak = 0
    for (let i = 1; i < 365; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
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

  // Bar chart data — use all days in range
  const chartData = useMemo(() => {
    return allDays.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayData = dataMap[dateStr] || {}
      const statuses = Object.values(dayData)
      if (statuses.length === 0) return { date: format(day, 'M/d'), score: null, dateStr }
      const greenCount = statuses.filter(s => s === 'green').length
      const score = Math.round((greenCount / statuses.length) * 100)
      return { date: format(day, 'M/d'), score, dateStr }
    })
  }, [allDays, dataMap])

  function handleRangeSelect(r) {
    if (r.premium && !isPremium) {
      setShowPremiumPrompt(true)
      return
    }
    setSelectedRange(r.id)
  }

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
            {r.label}{r.premium && !isPremium && ' ✨'}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard value={streaks} label="day streak" icon="🔥" highlight={streaks >= 3} />
        <StatCard
          value={history.filter(h => {
            const s = h.topic_entries?.map(e => e.status) || []
            return s.length > 0 && s.every(s => s === 'green')
          }).length}
          label="all-green days"
          icon="🌿"
        />
        <StatCard value={history.length} label="check-ins" icon="✅" />
      </div>

      {viewMode === 'grid' ? (
        <GridView topics={topics} allDays={allDays} dataMap={dataMap} topicTotals={topicTotals} />
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

function GridView({ topics, allDays, dataMap, topicTotals }) {
  // For the scrollable grid, show most recent days (up to 14 columns for readability)
  // Full totals are shown in the ratio column regardless of visible window
  const maxCols = 14
  const gridDays = allDays.slice(-maxCols)

  return (
    <div className="space-y-3">
      {/* Scrollable day grid */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-warm-100">
                <th className="text-left p-3 text-warm-400 font-medium sticky left-0 bg-white z-10 min-w-[100px]">
                  Topic
                </th>
                {gridDays.map(day => (
                  <th key={day.toISOString()} className="p-1.5 text-warm-400 font-medium text-center min-w-[2rem]">
                    <div>{format(day, 'EEE')[0]}</div>
                    <div>{format(day, 'd')}</div>
                  </th>
                ))}
                <th className="p-2 text-warm-400 font-medium text-center min-w-[80px] sticky right-0 bg-white z-10">
                  Totals
                </th>
              </tr>
            </thead>
            <tbody>
              {topics.map(topic => {
                const totals = topicTotals[topic.id] || { green: 0, yellow: 0, red: 0, total: 0 }
                return (
                  <tr key={topic.id} className="border-b border-warm-50">
                    <td className="p-3 text-warm-700 font-medium sticky left-0 bg-white z-10 whitespace-nowrap">
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
                    {/* Totals column */}
                    <td className="p-2 sticky right-0 bg-white z-10">
                      <div className="flex flex-col gap-0.5 items-center text-xs">
                        {totals.total > 0 ? (
                          <>
                            <span className="text-green-600 font-medium">🟢 {totals.green}</span>
                            <span className="text-yellow-500 font-medium">🟡 {totals.yellow}</span>
                            <span className="text-red-500 font-medium">🔴 {totals.red}</span>
                            <span className="text-warm-300 mt-0.5">{totals.total}d</span>
                          </>
                        ) : (
                          <span className="text-warm-200">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex gap-4 p-3 border-t border-warm-100 justify-center">
          {[['green', 'Good'], ['yellow', 'Neutral'], ['red', 'Hard'], [null, 'No data']].map(([s, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
              <span className="text-xs text-warm-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-topic ratio bars */}
      {topics.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-warm-600 mb-3">Overall breakdown</h3>
          <div className="space-y-3">
            {topics.map(topic => {
              const t = topicTotals[topic.id] || { green: 0, yellow: 0, red: 0, total: 0 }
              if (t.total === 0) return null
              const gPct = Math.round((t.green / t.total) * 100)
              const yPct = Math.round((t.yellow / t.total) * 100)
              const rPct = 100 - gPct - yPct
              return (
                <div key={topic.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-warm-700">
                      {topic.emoji} {topic.name}
                    </span>
                    <span className="text-xs text-warm-400">
                      🟢{t.green} 🟡{t.yellow} 🔴{t.red}
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    {gPct > 0 && <div style={{ width: `${gPct}%`, backgroundColor: STATUS_COLOR.green }} />}
                    {yPct > 0 && <div style={{ width: `${yPct}%`, backgroundColor: STATUS_COLOR.yellow }} />}
                    {rPct > 0 && <div style={{ width: `${rPct}%`, backgroundColor: STATUS_COLOR.red }} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
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
            interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
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
