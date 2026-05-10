import Logo from './Logo'

export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #faf9f6 0%, #f0f5f0 60%, #e8f0e8 100%)' }}
    >
      <Logo size={80} className="mb-5" />
      <h1 className="text-2xl font-semibold text-sage-700 mb-1">Innermark</h1>
      <p className="text-sm text-warm-400 mb-6">Your daily life check-in</p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-sage-400 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
