// Innermark logo — three overlapping leaves forming an upward mark
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Innermark"
    >
      {/* Stem */}
      <path d="M60 95 Q60 70 60 55" stroke="#4e8f50" strokeWidth="3" strokeLinecap="round"/>
      {/* Main leaf */}
      <path d="M60 55 C45 45 30 30 38 15 C46 5 62 10 68 25 C74 40 70 50 60 55Z" fill="#4e8f50" opacity="0.9"/>
      {/* Second leaf */}
      <path d="M60 68 C72 58 88 50 90 35 C92 25 80 18 72 28 C64 38 62 55 60 68Z" fill="#6baf6d" opacity="0.75"/>
      {/* Third leaf */}
      <path d="M60 80 C50 72 38 68 35 56 C33 48 42 42 50 50 C57 57 59 68 60 80Z" fill="#3a7a3c" opacity="0.6"/>
    </svg>
  )
}

// Watermark version — large, centered, low opacity for page backgrounds
export function LogoWatermark() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
      aria-hidden="true"
    >
      <Logo size={280} className="opacity-[0.06]" />
    </div>
  )
}
