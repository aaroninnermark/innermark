import confetti from 'canvas-confetti'

export function fireConfetti(type = 'default') {
  if (type === 'allGreen') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4e8f50', '#72ab73', '#a3c9a3', '#fbbf24', '#f59e0b'],
    })
  } else if (type === 'streak') {
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#4e8f50', '#72ab73', '#a3c9a3'],
    })
  } else {
    confetti({
      particleCount: 40,
      spread: 40,
      origin: { y: 0.7 },
    })
  }
}
