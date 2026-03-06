import { useState, useMemo } from 'react'

function ChurchCard({ church, onClick }) {
  const badge = church._badge || {}
  const img = church['Picture URL']
  const name = church['Name'] || '—'
  const country = church['Country'] || ''
  const city = church['City/Village'] || ''
  const year = church['Building year'] || ''
  const type = church['Type'] || ''

  return (
    <div className="card" onClick={() => onClick(church)} style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 140, background: 'var(--parchment-dark)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {img && img !== '-' && img.startsWith('http') ? (
          <img src={img} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onError={e => { e.target.style.display = 'none' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 40, opacity: 0.3 }}>⛪</div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className={`badge-${badge.class || 'unknown'}`} style={{ fontSize: 10 }}>{badge.label || '?'}</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <h4 style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.4 }}>{name}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(city || country) && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Nunito', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📍</span> {[city, country].filter(Boolean).join(', ')}
            </div>
          )}
          {year && year !== '-' && (
            <div style={{ fontSize: 11, color: 'var(--vordan)', fontFamily: 'Nunito', fontWeight: 600 }}>🕐 {year}</div>
          )}
          {type && (
            <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'Noto Serif Armenian, serif', marginTop: 2 }}>{type}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function Modal({ church, onClose }) {
  if (!church) return null
  const badge = church._badge || {}
  const img = church['Picture URL']

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--cream)', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        {img && img !== '-' && img.startsWith('http') && (
          <div style={{ height: 240, overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
            <img src={img} alt={church['Name']} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.parentNode.style.display = 'none'} />
          </div>
        )}
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{church['Name'] || '—'}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
          </div>
          <span className={`badge-${badge.class || 'unknown'}`} style={{ marginBottom: 20, display: 'inline-block' }}>{badge.label || '?'}</span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginTop: 16 }}>
            {[
              ['Տեսակ', 'Type', church['Type']],
              ['Կառուցման թվական', 'Built', church['Building year']],
              ['Երկիր', 'Country', church['Country']],
              ['Քաղաք/Գյուղ', 'City/Village', church['City/Village']],
              ['Վիճակ', 'State', church['State']],
              ['ID', 'ID', church['ID']],
            ].filter(([, , v]) => v && v !== '-').map(([hy, en, v]) => (
              <div key={en}>
                <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'Noto Serif Armenian', textTransform: 'uppercase', letterSpacing: 1 }}>{hy}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {church['Location'] && church['Location'] !== '-' && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'Noto Serif Armenian', textTransform: 'uppercase', letterSpacing: 1 }}>Տեղագրություն · Location</div>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(church['Location'])}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--vordan)', fontFamily: 'Nunito', marginTop: 4, display: 'block', textDecoration: 'none' }}>
                📍 {church['Location']} ↗
              </a>
            </div>
          )}

          {church['Other info'] && church['Other info'] !== '-' && (
            <div style={{ marginTop: 16, padding: '14px', background: 'var(--parchment)', borderRadius: 8, borderLeft: '3px solid var(--vordan-light)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'Noto Serif Armenian', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Այլ տեղեկություններ · Notes</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Nunito', margin: 0, lineHeight: 1.6 }}>{church['Other info']}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 24

export default function Explorer({ churches, stats }) {
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterState, setFilterState] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('name')

  const countries = useMemo(() => [...new Set(churches.map(c => c['Country']).filter(Boolean))].sort(), [churches])
  const types = useMemo(() => [...new Set(churches.map(c => c['Type']).filter(Boolean))].sort(), [churches])
  const states = useMemo(() => [...new Set(churches.map(c => c['State']).filter(Boolean))].sort(), [churches])

  const filtered = useMemo(() => {
    let res = churches
    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(c =>
        (c['Name'] || '').toLowerCase().includes(q) ||
        (c['Country'] || '').toLowerCase().includes(q) ||
        (c['City/Village'] || '').toLowerCase().includes(q)
      )
    }
    if (filterCountry) res = res.filter(c => c['Country'] === filterCountry)
    if (filterType) res = res.filter(c => c['Type'] === filterType)
    if (filterState) res = res.filter(c => c['State'] === filterState)

    // Sort
    if (sortBy === 'name') res = [...res].sort((a, b) => (a['Name'] || '').localeCompare(b['Name'] || ''))
    else if (sortBy === 'year') res = [...res].sort((a, b) => {
      const ay = a._parsedYear?.year || (a._parsedYear?.century ? a._parsedYear.century * 100 : 9999)
      const by = b._parsedYear?.year || (b._parsedYear?.century ? b._parsedYear.century * 100 : 9999)
      return ay - by
    })
    else if (sortBy === 'country') res = [...res].sort((a, b) => (a['Country'] || '').localeCompare(b['Country'] || ''))

    return res
  }, [churches, search, filterCountry, filterType, filterState, sortBy])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => { setSearch(''); setFilterCountry(''); setFilterType(''); setFilterState(''); setPage(1) }

  const selectStyle = {
    padding: '8px 12px', borderRadius: 8, border: '1px solid var(--stone-light)',
    background: 'var(--cream)', color: 'var(--text)', fontFamily: 'Nunito, sans-serif',
    fontSize: 13, cursor: 'pointer', outline: 'none', minWidth: 140
  }

  return (
    <section id="explorer" style={{ background: 'var(--parchment-dark)', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, letterSpacing: 3, color: 'var(--vordan)', textTransform: 'uppercase', marginBottom: 12 }}>Ուսումնասիրել</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Կառույցների Ուղեցույց</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Nunito, sans-serif' }}>Browse and filter the complete database of Armenian sacred structures</p>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text" placeholder="Որոնել... Search..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ ...selectStyle, flex: '1 1 200px', padding: '8px 14px' }}
            />
            <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="">Բոլոր երկրները · All countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="">Բոլոր տեսակները · All types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1) }} style={selectStyle}>
              <option value="">Բոլոր վիճակները · All states</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
              <option value="name">Sort: Name</option>
              <option value="year">Sort: Year</option>
              <option value="country">Sort: Country</option>
            </select>
            {(search || filterCountry || filterType || filterState) && (
              <button onClick={resetFilters} style={{ ...selectStyle, background: 'var(--vordan-pale)', color: 'var(--vordan)', border: '1px solid var(--vordan-light)', fontWeight: 600 }}>
                ✕ Clear
              </button>
            )}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Nunito' }}>
            Showing {filtered.length} of {churches.length} structures
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {paged.map((church, i) => (
            <ChurchCard key={church._id || i} church={church} onClick={setSelected} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--stone-light)', background: 'var(--cream)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontFamily: 'Nunito' }}>
              ← Նախորդ էջ
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p
              if (totalPages <= 7) p = i + 1
              else if (page <= 4) p = i + 1
              else if (page >= totalPages - 3) p = totalPages - 6 + i
              else p = page - 3 + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid', borderColor: page === p ? 'var(--vordan)' : 'var(--stone-light)', background: page === p ? 'var(--vordan)' : 'var(--cream)', color: page === p ? 'white' : 'var(--text)', cursor: 'pointer', fontFamily: 'Nunito', fontSize: 13 }}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--stone-light)', background: 'var(--cream)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontFamily: 'Nunito' }}>
              Հաջորջ էջ →
            </button>
          </div>
        )}
      </div>

      {selected && <Modal church={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
