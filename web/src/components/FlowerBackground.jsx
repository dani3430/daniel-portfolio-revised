// Each flower: where it starts, how big, how fast, how far it sways, and its color
const flowers = [
  { left: '4%', size: 46, duration: 28, delay: -6, sway: 40, tone: 'a', opacity: 0.32 },
  { left: '14%', size: 30, duration: 22, delay: -22, sway: -50, tone: 'b', opacity: 0.3 },
  { left: '27%', size: 54, duration: 34, delay: -14, sway: 60, tone: 'a', opacity: 0.28 },
  { left: '41%', size: 34, duration: 25, delay: -30, sway: -40, tone: 'b', opacity: 0.32 },
  { left: '58%', size: 48, duration: 31, delay: -9, sway: 50, tone: 'a', opacity: 0.3 },
  { left: '72%', size: 32, duration: 24, delay: -26, sway: -60, tone: 'b', opacity: 0.32 },
  { left: '90%', size: 52, duration: 32, delay: -18, sway: -45, tone: 'a', opacity: 0.28 },
  // Extra flowers, shown only on larger screens
  { left: '9%', size: 26, duration: 21, delay: -12, sway: 35, tone: 'b', opacity: 0.26, extra: true },
  { left: '21%', size: 40, duration: 29, delay: -35, sway: -55, tone: 'a', opacity: 0.24, extra: true },
  { left: '34%', size: 28, duration: 22, delay: -3, sway: 45, tone: 'a', opacity: 0.28, extra: true },
  { left: '49%', size: 44, duration: 35, delay: -28, sway: -35, tone: 'b', opacity: 0.24, extra: true },
  { left: '65%', size: 30, duration: 23, delay: -16, sway: 55, tone: 'a', opacity: 0.28, extra: true },
  { left: '80%', size: 42, duration: 29, delay: -38, sway: 40, tone: 'b', opacity: 0.26, extra: true },
  { left: '96%', size: 28, duration: 25, delay: -8, sway: -40, tone: 'b', opacity: 0.28, extra: true },
]

const petalAngles = [0, 72, 144, 216, 288]

export default function FlowerBackground() {
  return (
    <div className="flower-layer" aria-hidden="true">
      {flowers.map((f, i) => (
        <span
          key={i}
          className={`flower flower-${f.tone} ${f.extra ? 'hidden md:block' : ''}`}
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            '--sway': `${f.sway}px`,
            '--o': f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <g fill="currentColor">
              {petalAngles.map((angle) => (
                <ellipse key={angle} cx="50" cy="28" rx="13" ry="22" transform={`rotate(${angle} 50 50)`} />
              ))}
            </g>
            <circle cx="50" cy="50" r="9" fill="var(--bg)" />
          </svg>
        </span>
      ))}
    </div>
  )
}