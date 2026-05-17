import confetti from 'canvas-confetti'

export function fireConfetti(type = 'default') {
  try {
    if (type === 'allGreen') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#4e8f50', '#72ab73', '#a3c9a3', '#fbbf24', '#f59e0b'],
        zIndex: 9999,
      })
      // Second burst for impact
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.4, x: 0.3 },
          colors: ['#4e8f50', '#72ab73', '#fbbf24'],
          zIndex: 9999,
        })
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.4, x: 0.7 },
          colors: ['#4e8f50', '#a3c9a3', '#f59e0b'],
          zIndex: 9999,
        })
      }, 200)
    } else if (type === 'streak') {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#4e8f50', '#72ab73', '#a3c9a3'],
        zIndex: 9999,
      })
    } else {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        zIndex: 9999,
      })
    }
  } catch (e) {
    console.warn('Confetti failed:', e)
  }
}
