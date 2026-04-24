export const DAILY_PROMPTS = [
  // Self-Compassion
  "What would you say to a close friend who was struggling the way you are right now?",
  "Where are you holding yourself to a standard you would never impose on someone you love?",
  "What part of yourself have you been trying hardest to fix — and what if it didn't need fixing?",
  "What's one thing you did today, no matter how small, that deserves acknowledgment?",
  "If your inner critic had a name, what would it be — and what is it actually afraid of?",
  "What does rest feel like for you, without guilt?",
  "What are you carrying right now that isn't yours to carry?",
  // Shame & Healing
  "What's something you've been afraid to say out loud, even to yourself?",
  "Where does shame live in your body? What does it feel like physically?",
  "What story have you been telling about yourself that began with someone else's words?",
  "What would it mean to stop earning your worth and simply have it?",
  "What part of your story are you most ashamed of — and what did it teach you?",
  "Who taught you that you were too much, or not enough? Do you still believe them?",
  "What would healing look like for you — not as a destination, but as a direction?",
  // Integration
  "What insight have you had that you haven't yet put into action?",
  "What has life been trying to show you lately that you've been resisting?",
  "Where is the gap between who you know you can be and how you're currently living?",
  "What experience changed you — and have you fully honored what it asked of you?",
  "What does your body know that your mind hasn't caught up to yet?",
  "If your life were trying to teach you something right now, what would it be?",
  "What pattern keeps repeating — and what might it be asking you to look at?",
  // Growth & Change
  "What's one thing you've been putting off that, if you did it, would change everything?",
  "Where are you choosing comfort over growth right now?",
  "What does the version of you that you're becoming actually look like?",
  "What would you do today if you knew you couldn't fail?",
  "What old version of yourself are you holding onto that no longer serves you?",
  "What does growth cost you — and are you willing to pay it?",
  "Where in your life are you playing it safe when you know you're meant for more?",
  // Forgiveness
  "Who are you still punishing — yourself or someone else — by holding onto this?",
  "What would it cost you to forgive? What would it give you?",
  "Is there something you've done that you haven't yet forgiven yourself for?",
  "What resentment is taking up space that could be used for something better?",
  "Forgiveness isn't saying it was okay. What did it teach you that nothing else could?",
  // Presence & Awareness
  "What is actually happening right now — separate from your story about it?",
  "When did you last feel fully alive? What was present in that moment?",
  "What are you not seeing because you're too busy thinking about what already happened?",
  "Where is your mind right now — and where would you like it to be?",
  "What would change if you brought 10% more attention to what's in front of you today?",
  // Intention & Direction
  "What do you most want your life to feel like — not look like, but feel like?",
  "What are you moving toward right now, and is that actually where you want to go?",
  "What would you have to let go of to become who you're meant to be?",
  "If you knew this was the only year you had, what would you stop tolerating?",
  "What is your life asking of you right now?",
  // Relationships
  "Where are you showing up fully in your relationships — and where are you hiding?",
  "What do the people closest to you need from you that you haven't been giving?",
  "What boundary have you been avoiding that you know you need to set?",
  "Who in your life brings out the best version of you — and how often do you prioritize them?",
  "Where are you seeking validation instead of connection?",
]

export function getTodaysPrompt() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start) / 86400000)
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length]
}
