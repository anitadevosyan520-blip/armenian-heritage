import { useEffect, useRef } from 'react'

function AnimatedNumber({ value, duration = 1500 }) {
  const ref = useRef(null)
  const startRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!ref.current || !value) return
    const start = () => {
      startRef.current = null
      const animate = (ts) => {
        if (!startRef.current) startRef.current = ts
        const progress = Math.min((ts - startRef.current) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        ref.current.textContent = Math.floor(eased * value).toLocaleString()
        if (progress < 1) frameRef.current = requestAnimationFrame(animate)
        else ref.current.textContent = value.toLocaleString()
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); observer.disconnect() }}, { threshold: 0.3 })
    observer.observe(ref.current)
    return () => { observer.disconnect(); if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [value, duration])

  return <span ref={ref}>0</span>
}

export default function Stats({ stats, churches }) {
  if (!stats) return null

  const standing = Object.entries(stats.by_state || {}).find(([k]) => k === 'Կանգուն')?.[1] || 0
  const destroyed = Object.entries(stats.by_state || {}).find(([k]) => k === 'Ավերված')?.[1] || 0
  const countries = Object.keys(stats.by_country || {}).length
  const centuries = Object.keys(stats.by_century || {}).length

  const topCountry = Object.entries(stats.by_country || {}).sort((a, b) => b[1] - a[1])[0]

  const cards = [
    { label: 'Ընդհանուր կառույց', sublabel: 'Total structures', value: stats.total || 0, icon: '⛪', accent: 'var(--vordan)' },
    { label: 'Երկրներ', sublabel: 'Countries', value: countries, icon: '🌍', accent: 'var(--gold)' },
    { label: 'Կանգուն', sublabel: 'Still standing', value: standing, icon: '✦', accent: '#4a7c59' },
    { label: 'Ավերված', sublabel: 'Destroyed', value: destroyed, icon: '◈', accent: '#8B1A1A' },
    { label: 'Դարեր', sublabel: 'Centuries covered', value: centuries, icon: '⏳', accent: '#6B4F3A' },
    { label: topCountry?.[0] || '—', sublabel: 'Most churches', value: topCountry?.[1] || 0, icon: '🏆', accent: 'var(--gold)' },
  ]

  return (
    <section id="stats" style={{ background: 'var(--parchment-dark)', padding: '80px 0', borderTop: '1px solid var(--stone-light)', borderBottom: '1px solid var(--stone-light)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, letterSpacing: 3, color: 'var(--vordan)', textTransform: 'uppercase', marginBottom: 12 }}>Թվեր</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Ժառանգության Ամփոփ Պատկեր</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Nunito, sans-serif' }}>A snapshot of Armenia's architectural legacy across the globe</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          {cards.map((card, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '32px 20px', position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.1}s` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.accent, borderRadius: '12px 12px 0 0' }} />
              <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: card.accent, lineHeight: 1 }}>
                <AnimatedNumber value={card.value} />
              </div>
              <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{card.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
