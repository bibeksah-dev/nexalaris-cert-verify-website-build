"use client"

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-[#12E8D5]/20 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-[#8E2DE2]/20 blur-3xl animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 h-96 w-96 animate-pulse rounded-full bg-[#12E8D5]/10 blur-3xl animation-delay-4000" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(18, 232, 213, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18, 232, 213, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  )
}
