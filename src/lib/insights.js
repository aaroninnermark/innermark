import { INSIGHTS } from './mockData'

/**
 * Picks an insight message based on the current check-in's results and recent history.
 */
export function getInsightMessage(topicEntries, recentHistory = []) {
  if (!topicEntries || topicEntries.length === 0) return null

  const statuses = topicEntries.map(e => e.status)
  const greenCount = statuses.filter(s => s === 'green').length
  const redCount = statuses.filter(s => s === 'red').length
  const total = statuses.length

  // All green
  if (greenCount === total) {
    return pick(INSIGHTS.allGreen)
  }

  // Mostly green
  if (greenCount / total >= 0.6) {
    return pick(INSIGHTS.mostlyGreen)
  }

  // Mostly red
  if (redCount / total >= 0.6) {
    return pick(INSIGHTS.mostlyRed)
  }

  return pick(INSIGHTS.mixed)
}

/**
 * Checks if a topic has had 3+ red entries in the past 7 days.
 * Returns an array of topic IDs that need a coaching prompt.
 */
export function getCoachingPromptTopics(recentHistory, topics) {
  const alertTopics = []
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  topics.forEach(topic => {
    const recentEntries = recentHistory
      .filter(entry => new Date(entry.date) >= sevenDaysAgo)
      .flatMap(entry => entry.topic_entries || [])
      .filter(te => te.topic_id === topic.id && te.status === 'red')

    if (recentEntries.length >= 3) {
      alertTopics.push(topic.id)
    }
  })

  return alertTopics
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
