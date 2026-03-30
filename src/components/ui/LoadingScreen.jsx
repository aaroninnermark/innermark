export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center">
      <div className="text-5xl mb-4">🌿</div>
      <h1 className="text-2xl font-semibold text-sage-700 mb-2">Innermark</h1>
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
