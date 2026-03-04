import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

const armenianPattern = `
  <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 5 L35 20 L50 20 L38 29 L43 44 L30 35 L17 44 L22 29 L10 20 L25 20 Z" 
          fill="none" stroke="rgba(184,134,46,0.15)" stroke-width="1"/>
    <circle cx="30" cy="30" r="3" fill="rgba(184,134,46,0.1)"/>
  </svg>
`

export default function Hero({ stats, loading, scrollTo }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw animated khachkar-inspired pattern
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    let animFrame
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y -= p.speed
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184,134,46,${p.opacity})`
        ctx.fill()
      })
      animFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1E0D05 0%, #3D1A10 40%, #5C2A18 70%, #2D1A0E 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      paddingTop: '64px',
    }}>
      {/* Animated canvas */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6,
      }} />

      {/* Decorative cross pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(armenianPattern)}")`,
        backgroundSize: '60px 60px',
        opacity: 0.4,
      }} />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
        background: 'linear-gradient(to top, var(--parchment), transparent)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center', padding: '80px 24px 120px',
        maxWidth: '900px',
      }}>
        {/* Armenian ornamental header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '16px', marginBottom: '32px',
        }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, var(--gold))' }} />
          <span style={{ color: 'var(--gold)', fontSize: '20px', letterSpacing: '4px' }}>✦</span>
          <span style={{ color: 'rgba(245,237,224,0.5)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            Armenian Heritage
          </span>
          <span style={{ color: 'var(--gold)', fontSize: '20px', letterSpacing: '4px' }}>✦</span>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, var(--gold))' }} />
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif Armenian', serif",
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: '700',
          color: 'var(--parchment)',
          lineHeight: '1.1',
          marginBottom: '16px',
          animation: 'fadeUp 0.8s ease forwards',
        }}>
          Հայկական
          <br />
          <span style={{ color: 'var(--gold)' }}>Ժառանգություն</span>
        </h1>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(18px, 2.5vw, 26px)',
          color: 'rgba(245,237,224,0.7)',
          fontStyle: 'italic',
          marginBottom: '48px',
          animation: 'fadeUp 0.8s ease 0.2s both',
        }}>
          Աշխարհի հայկական եկեղեցիների, վանքերի, մատուռների ու տաճարների ամբողջական գրանցամատյան
        </p>

        {/* Stats row */}
        {!loading && stats && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap',
            marginBottom: '64px',
            animation: 'fadeUp 0.8s ease 0.4s both',
          }}>
            {[
              { value: stats.total, label: 'Կառույց' },
              { value: Object.keys(stats.by_country || {}).length, label: 'Երկիր' },
              { value: Object.keys(stats.by_century || {}).length, label: 'Դար' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: '700',
                  color: 'var(--gold)',
                  lineHeight: '1',
                }}>{s.value}+</div>
                <div style={{ fontSize: '12px', color: 'rgba(245,237,224,0.6)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeUp 0.8s ease 0.6s both',
        }}>
          <button onClick={() => scrollTo('explorer')} style={{
            background: 'var(--vordan)', color: 'white',
            border: 'none', padding: '14px 32px', borderRadius: '8px',
            fontFamily: "'Nunito', sans-serif", fontWeight: '700', fontSize: '15px',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(139,26,26,0.4)',
          }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'none'}
          >
            Ուսումնասիրել
          </button>
          <button onClick={() => scrollTo('timeline')} style={{
            background: 'transparent', color: 'var(--parchment)',
            border: '1.5px solid rgba(245,237,224,0.4)', padding: '14px 32px', borderRadius: '8px',
            fontFamily: "'Nunito', sans-serif", fontWeight: '700', fontSize: '15px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)' }}
            onMouseOut={e => { e.target.style.borderColor = 'rgba(245,237,224,0.4)'; e.target.style.color = 'var(--parchment)' }}
          >
            Ժամանակագիծ
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button onClick={() => scrollTo('stats-section')} style={{
        position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(245,237,224,0.5)', animation: 'float 2s ease infinite',
        zIndex: 10,
      }}>
        <ChevronDown size={32} />
      </button>

      <style>{`
        @keyframes float { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
