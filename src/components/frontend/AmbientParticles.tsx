import type { CSSProperties } from 'react'

interface ParticleConfig {
  left: string
  top: string
  dx: string
  dy: string
  dx2: string
  dy2: string
  duration: string
  delay: string
  size: string
  peakOpacity: string
}

const PARTICLES: ParticleConfig[] = [
  { left: '12%', top: '35%', dx: '25px', dy: '-80px', dx2: '-15px', dy2: '-160px', duration: '22s', delay: '0s', size: '3px', peakOpacity: '0.10' },
  { left: '75%', top: '25%', dx: '-30px', dy: '-50px', dx2: '10px', dy2: '-130px', duration: '19s', delay: '4s', size: '2px', peakOpacity: '0.12' },
  { left: '45%', top: '60%', dx: '15px', dy: '-70px', dx2: '-25px', dy2: '-140px', duration: '24s', delay: '8s', size: '4px', peakOpacity: '0.08' },
  { left: '88%', top: '50%', dx: '-20px', dy: '-90px', dx2: '5px', dy2: '-170px', duration: '20s', delay: '2s', size: '2px', peakOpacity: '0.11' },
  { left: '30%', top: '75%', dx: '35px', dy: '-60px', dx2: '-10px', dy2: '-120px', duration: '26s', delay: '12s', size: '3px', peakOpacity: '0.09' },
  { left: '60%', top: '15%', dx: '-15px', dy: '-45px', dx2: '20px', dy2: '-110px', duration: '21s', delay: '6s', size: '2px', peakOpacity: '0.10' },
]

export function AmbientParticles() {
  return (
    <div aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            '--dx': p.dx,
            '--dy': p.dy,
            '--dx2': p.dx2,
            '--dy2': p.dy2,
            '--particle-duration': p.duration,
            '--particle-delay': p.delay,
            '--particle-size': p.size,
            '--particle-peak-opacity': p.peakOpacity,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
