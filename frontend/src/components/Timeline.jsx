import { useEffect, useRef, useState } from 'react'

const CENTURY_LABELS_HY = {
  4: 'Դ դ.', 5: 'Ե դ.', 6: 'Զ դ.', 7: 'Է դ.', 8: 'Ը դ.', 9: 'Թ դ.', 10: 'Ժ դ.',
  11: 'ԺԱ դ.', 12: 'ԺԲ դ.', 13: 'ԺԳ դ.', 14: 'ԺԴ դ.', 15: 'ԺԵ դ.', 16: 'ԺԶ դ.',
  17: 'ԺԷ դ.', 18: 'ԺԸ դ.', 19: 'ԺԹ դ.', 20: 'Ի դ.', 21: 'ԻԱ դ.'
}
const CENTURY_LABELS_LATIN = {
  4: 'IV c.', 5: 'V c.', 6: 'VI c.', 7: 'VII c.', 8: 'VIII c.', 9: 'IX c.', 10: 'X c.',
  11: 'XI c.', 12: 'XII c.', 13: 'XIII c.', 14: 'XIV c.', 15: 'XV c.', 16: 'XVI c.',
  17: 'XVII c.', 18: 'XVIII c.', 19: 'XIX c.', 20: 'XX c.', 21: 'XXI c.'
}

function TimelineCard({ church, side, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const badge = church._badge || {}
  const year = church['Building year']
  const img = church['Picture URL']
  const country = church['Country'] || ''
  const city = church['City/Village'] || ''
  const name = church['Name'] || church['NameARM'] || '—'

  return (
    <div ref={ref} style={{
      display: 'flex', justifyContent: side === 'left' ? 'flex-end' : 'flex-start',
      padding: '0 calc(50% + 20px) 0 0',
      ...(side === 'right' ? { padding: '0 0 0 calc(50% + 20px)' } : {}),
      marginBottom: 20,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : `translateX(${side === 'left' ? '-30px' : '30px'})`,
      transition: `opacity 0.5s ease ${(index % 4) * 0.08}s, transform 0.5s ease ${(index % 4) * 0.08}s`
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 340, padding: 0, overflow: 'hidden', cursor: 'default' }}>
        {img && img !== '-' && img.startsWith('http') && (
          <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
            <img
              src={img} alt={name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.parentNode.style.display = 'none' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))' }} />
          </div>
        )}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <h4 style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>{name}</h4>
            <span className={`badge-${badge.class || 'unknown'}`} style={{ flexShrink: 0, fontSize: 10 }}>{badge.label || '?'}</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {year && year !== '-' && (
              <span style={{ fontSize: 11, color: 'var(--vordan)', fontFamily: 'Nunito', fontWeight: 700 }}>🕐 {year}</span>
            )}
            {(city || country) && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Nunito' }}>📍 {[city, country].filter(Boolean).join(', ')}</span>
            )}
          </div>
          {church['Type'] && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Nunito' }}>
              {church['Type']}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Timeline({ churches }) {
  const [filter, setFilter] = useState('all')

  // Group by century
  const grouped = {}
  churches.forEach(c => {
    const p = c._parsedYear || {}
    let century = p.century
    if (!century && p.year) century = Math.ceil(p.year / 100)
    if (!century) century = 0
    if (!grouped[century]) grouped[century] = []
    grouped[century].push(c)
  })

  const sortedCenturies = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const unknown = grouped[0] || []
  const known = sortedCenturies.filter(c => c > 0)

  // Filter options
  const filteredChurches = filter === 'all' ? churches : churches.filter(c => {
    if (filter === 'standing') return c.State === 'Կանգուն'
    if (filter === 'destroyed') return c.State === 'Ավերված'
    if (filter === 'semi') return c.State === 'Կիսավեր'
    return true
  })

  const filteredGrouped = {}
  filteredChurches.forEach(c => {
    const p = c._parsedYear || {}
    let century = p.century
    if (!century && p.year) century = Math.ceil(p.year / 100)
    if (!century) century = 0
    if (!filteredGrouped[century]) filteredGrouped[century] = []
    filteredGrouped[century].push(c)
  })

  const filteredCenturies = Object.keys(filteredGrouped).map(Number).sort((a, b) => a - b).filter(c => c > 0)
  const filteredUnknown = filteredGrouped[0] || []

  return (
    <section id="timeline" style={{ background: 'var(--cream)', padding: '80px 0 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, letterSpacing: 3, color: 'var(--vordan)', textTransform: 'uppercase', marginBottom: 12 }}>Ժամանակագիծ</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Պատմության Ընթացքով</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Nunito, sans-serif', maxWidth: 500, margin: '12px auto 0' }}>Journey through centuries of Armenian sacred architecture</p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {[['all', 'Բոլորը', 'All'], ['standing', 'Կանգուն', 'Standing'], ['destroyed', 'Ավերված', 'Destroyed'], ['semi', 'Կիսավեր', 'Semi-ruined']].map(([val, hy, en]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 20px', borderRadius: 20, border: '1px solid',
              borderColor: filter === val ? 'var(--vordan)' : 'var(--stone-light)',
              background: filter === val ? 'var(--vordan)' : 'transparent',
              color: filter === val ? 'white' : 'var(--text-muted)',
              fontFamily: 'Nunito, sans-serif', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <span style={{ fontFamily: 'Noto Serif Armenian, serif' }}>{hy}</span> · {en}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Center line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, transparent, var(--stone-light) 5%, var(--vordan-light) 50%, var(--stone-light) 95%, transparent)', transform: 'translateX(-50%)' }} />

          {filteredCenturies.map((century, ci) => {
            const items = filteredGrouped[century] || []
            if (!items.length) return null
            return (
              <div key={century} style={{ marginBottom: 48, position: 'relative' }}>
                {/* Century marker */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 2, marginBottom: 24 }}>
                  <div style={{
                    background: 'var(--parchment-dark)', border: '2px solid var(--vordan-light)',
                    borderRadius: 30, padding: '8px 24px', textAlign: 'center', boxShadow: 'var(--shadow-md)'
                  }}>
                    <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 15, fontWeight: 700, color: 'var(--vordan)' }}>{CENTURY_LABELS_HY[century] || `${century}dC`}</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, color: 'var(--text-muted)' }}>{CENTURY_LABELS_LATIN[century] || `${century}th c.`} · {items.length} {items.length === 1 ? 'church' : 'churches'}</div>
                  </div>
                </div>

                {/* Cards alternating left/right */}
                {items.map((church, idx) => (
                  <TimelineCard key={church._id || idx} church={church} side={idx % 2 === 0 ? 'left' : 'right'} index={idx} />
                ))}
              </div>
            )
          })}

          {/* Unknown date section */}
          {filteredUnknown.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ background: 'var(--stone-pale)', border: '2px solid var(--stone-light)', borderRadius: 30, padding: '8px 24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, color: 'var(--text-muted)' }}>Անհայտ ժամկետ · Unknown date</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'Nunito' }}>{filteredUnknown.length} churches</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {filteredUnknown.slice(0, 12).map((church, idx) => {
                  const badge = church._badge || {}
                  return (
                    <div key={church._id || idx} className="card" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>{church['Name'] || '—'}</h4>
                        <span className={`badge-${badge.class || 'unknown'}`} style={{ fontSize: 10, flexShrink: 0 }}>{badge.label || '?'}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Nunito' }}>
                        📍 {[church['City/Village'], church['Country']].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  )
                })}
              </div>
              {filteredUnknown.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Nunito' }}>
                  and {filteredUnknown.length - 12} more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
