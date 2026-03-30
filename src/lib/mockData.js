import { subDays, format } from 'date-fns'

export const MOCK_USER = {
  id: 'mock-user-001',
  email: 'demo@innermark.app',
  user_metadata: { full_name: 'Demo User' },
}

export const MOCK_TOPICS = [
  { id: '1', user_id: 'mock-user-001', name: 'Relationships', emoji: '💛', position: 0, archived: false, created_at: new Date().toISOString() },
  { id: '2', user_id: 'mock-user-001', name: 'Work', emoji: '💼', position: 1, archived: false, created_at: new Date().toISOString() },
  { id: '3', user_id: 'mock-user-001', name: 'Body & Health', emoji: '🌿', position: 2, archived: false, created_at: new Date().toISOString() },
]

export const STATUS_VALUES = {
  red: 'red',
  yellow: 'yellow',
  green: 'green',
}

// Generate mock check-in history for the last 30 days
export function generateMockHistory(topics = MOCK_TOPICS) {
  const history = []
  const statuses = ['red', 'yellow', 'green', 'green', 'green', 'yellow']

  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (i === 0) continue // Today not yet checked in (mock)

    const entry = {
      id: `entry-${i}`,
      user_id: 'mock-user-001',
      date,
      day_note: i % 7 === 0 ? 'Had a good reflection today.' : null,
      created_at: subDays(new Date(), i).toISOString(),
    }

    entry.topic_entries = topics.map(topic => ({
      id: `te-${i}-${topic.id}`,
      checkin_id: entry.id,
      topic_id: topic.id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      note: Math.random() > 0.7 ? 'Feeling okay about this today.' : null,
    }))

    history.push(entry)
  }

  return history
}

export const MOCK_HISTORY = generateMockHistory()

export const INSIGHTS = {
  allGreen: [
    "Today you showed up for yourself in every area. That's not luck — it's practice.",
    "All green today. Let yourself feel that.",
    "A full green day. You're building something real here.",
  ],
  mostlyGreen: [
    "Most things are going well. Notice what's working and carry that forward.",
    "You're doing better than you think. The evidence is right here.",
    "Growth isn't always dramatic. Sometimes it looks exactly like this.",
  ],
  mixed: [
    "Some areas are thriving while others need attention. That's honest — and human.",
    "You showed up today. That matters more than the colors.",
    "Balance isn't about everything being perfect. It's about staying aware.",
  ],
  mostlyRed: [
    "Hard days are data, not verdicts. What is this one trying to tell you?",
    "You checked in even on a hard day. That takes courage.",
    "Naming what's hard is the first step to moving through it.",
  ],
  redStreak: [
    "You've had a rough stretch in this area. Would it help to talk to someone?",
    "Patterns like this are worth paying attention to. Be gentle with yourself — and consider reaching out.",
    "This topic has been difficult lately. You don't have to carry this alone.",
  ],
}

export const TEACHINGS = [
  {
    id: 't1',
    theme: 'Self-Compassion',
    title: 'Treating Yourself Like a Good Friend',
    preview: 'We often speak to ourselves in ways we would never speak to someone we love...',
    content: `We often speak to ourselves in ways we would never speak to someone we love. Self-compassion begins with noticing that inner critic and gently asking: would I say this to a friend going through the same thing?

Research by Dr. Kristin Neff shows that self-compassion — treating ourselves with kindness in moments of struggle — is more powerful for resilience and growth than self-esteem or positive thinking.

The three components of self-compassion:
1. **Self-kindness** — being warm toward yourself instead of harshly critical
2. **Common humanity** — recognizing that suffering is part of shared human experience
3. **Mindfulness** — holding painful thoughts in balanced awareness rather than over-identifying with them

Try this: next time you notice a red day, place one hand on your heart and say: "This is a moment of struggle. Struggle is part of being human. May I be kind to myself right now."`,
    readTime: '3 min',
  },
  {
    id: 't2',
    theme: 'Shame & Growth',
    title: 'The Difference Between Guilt and Shame',
    preview: 'Guilt says "I did something bad." Shame says "I am bad." Only one of them helps you grow...',
    content: `Guilt says "I did something bad." Shame says "I am bad." These feel similar but they work very differently.

Guilt can motivate change. When we feel guilty about an action, we can correct it, apologize, do better. Guilt is about behavior — and behavior can be changed.

Shame, on the other hand, attacks identity. When we feel shame, we want to hide, withdraw, disappear. It doesn't motivate change — it paralyzes us.

Brené Brown's research shows that shame is correlated with depression, anxiety, addiction, and aggression. It is never a useful tool for growth.

**How to shift from shame to guilt:**
- Instead of "I'm a terrible person," try "I did something I'm not proud of"
- Instead of "I always mess this up," try "I struggled with this today"
- Ask yourself: what would I need to do differently, rather than who am I wrong for being?

Your check-ins are data. Red days aren't evidence that you're broken. They're information about what needs care.`,
    readTime: '4 min',
  },
  {
    id: 't3',
    theme: 'Patience',
    title: 'The Long Game: Why Change Takes Time',
    preview: 'Real change is rarely linear. Understanding this protects you from giving up...',
    content: `Most meaningful change in a human life is nonlinear. There are setbacks, plateaus, and unexpected leaps forward. If we expect smooth progress, we'll give up at the first setback.

Neuroscience tells us that lasting behavioral change requires the gradual rewiring of neural pathways. This takes months, not days. The fact that you're checking in regularly — even on hard days — is literally changing your brain.

**What patience in practice looks like:**
- Showing up even when nothing seems to be changing
- Interpreting setbacks as normal, not as failure
- Measuring progress over months, not days
- Celebrating consistency, not just outcomes

The trends tab in Innermark is designed for this. Look at a month, not a day. Look at a season, not a week. You'll see things you can't see up close.

Growth is happening whether you can see it or not.`,
    readTime: '3 min',
  },
  {
    id: 't4',
    theme: 'Forgiveness',
    title: 'Forgiving Yourself: A Practice, Not a Feeling',
    preview: 'Self-forgiveness isn\'t a feeling that arrives. It\'s a practice you return to...',
    content: `Many people wait to feel forgiveness before they extend it — to others or themselves. But forgiveness isn't a feeling. It's a decision, repeated over and over, until it becomes real.

Self-forgiveness is particularly hard because we're the only ones we can never escape. Every reminder of a mistake follows us. This is why self-forgiveness requires not just a decision, but a practice.

**A simple self-forgiveness practice:**
1. Name what happened clearly, without minimizing or catastrophizing
2. Acknowledge the harm — to yourself or others
3. Identify what you've learned or what you'd do differently
4. Explicitly release yourself: "I forgive myself for this."
5. Return to this as many times as you need to

You don't need to feel it to do it. You don't need to have "earned" it. You need to practice it — which is exactly what returning to these check-ins is. A practice of honest accounting, day after day.`,
    readTime: '4 min',
  },
]

export const MUSIC_LINKS = {
  difficult: [
    { title: 'Grounding Meditation Music', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'For hard days' },
    { title: 'Comfort & Calm', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'Soft, warm sounds' },
  ],
  grounding: [
    { title: 'Focus & Presence', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'Helps you return to now' },
    { title: 'Nature Sounds', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'Rain, forest, water' },
  ],
  positive: [
    { title: 'Morning Energy', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'Start the day well' },
    { title: 'Joy & Movement', artist: 'Various', url: 'https://open.spotify.com/playlist/placeholder', note: 'Celebrate good days' },
  ],
}
