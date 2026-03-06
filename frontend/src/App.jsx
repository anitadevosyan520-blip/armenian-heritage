import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

/* ─── Constants ──────────────────────────────────────────────────── */
const API = 'http://localhost:8000'
const COLORS = ['#8B1A2B','#C9A574','#5C0F1C','#D4C4B0','#3D2B1F','#EDD9A3','#A83248','#8A6A2E']
const STATE_COLORS = { 'Կանգուն':'#2E7D32', 'Ավերված':'#B71C1C', 'Կիսավեր':'#F57F17', 'Չկան տեղեկություններ':'#757575' }
const STATE_CLASSES = { 'Կանգուն':'tag-standing', 'Ավերված':'tag-ruined', 'Կիսավեր':'tag-semi', 'Չկան տեղեկություններ':'tag-unknown' }
const TABS = [
  { id:'catalog',   label:'Կատալոգ' },
  { id:'map',       label:'Քարտեզ' },
  { id:'timeline',  label:'Ժամանակագրություն' },
  { id:'stats',     label:'Վիճակագրություն' },
  { id:'chat',      label:'Զրուցարան'},
  { id:'submit',    label:'Ավելացնել'},
]

/* ─── Helpers ────────────────────────────────────────────────────── */
const stateClass = s => STATE_CLASSES[s] || 'tag-unknown'

function ArmenianCross({ size = 40, color = '#8B1A2B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="42" y="10" width="16" height="80" rx="3" fill={color}/>
      <rect x="10" y="42" width="80" height="16" rx="3" fill={color}/>
      <rect x="30" y="30" width="16" height="16" rx="2" fill={color} opacity="0.4"/>
      <rect x="54" y="30" width="16" height="16" rx="2" fill={color} opacity="0.4"/>
      <rect x="30" y="54" width="16" height="16" rx="2" fill={color} opacity="0.4"/>
      <rect x="54" y="54" width="16" height="16" rx="2" fill={color} opacity="0.4"/>
    </svg>
  )
}

function OrnamentDivider({ label }) {
  return (
    <div className="ornamental-divider" style={{ fontSize: '1.1rem', userSelect: 'none' }}>
      ✦ {label} ✦
    </div>
  )
}

/* ─── Church Card ────────────────────────────────────────────────── */
function ChurchCard({ church, onClick }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className="card" style={{ cursor:'pointer' }} onClick={() => onClick(church)}>
      <div style={{ height: 160, overflow:'hidden', position:'relative', background:'#EDE0CC' }}>
        {church.picture && !imgErr ? (
          <img
            src={church.picture}
            alt={church.name}
            onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.4 }}>
            <ArmenianCross size={64} color="#8B1A2B" />
          </div>
        )}
        <div style={{
          position:'absolute', top:10, right:10,
          background: 'rgba(26,10,5,0.75)', color:'#EDD9A3',
          borderRadius: 4, padding:'2px 8px',
          fontSize:'0.7rem', fontFamily:'Cinzel, serif', letterSpacing:'0.06em'
        }}>
          {church.type}
        </div>
      </div>
      <div style={{ padding:'14px 16px' }}>
        <h3 style={{ fontFamily:'Cinzel, serif', fontSize:'0.92rem', color:'var(--crimson)', marginBottom:6, lineHeight:1.3 }}>
          {church.name || '—'}
        </h3>
        <p style={{ fontSize:'0.82rem', color:'var(--text-medium)', marginBottom:8 }}>
          {[church.city, church.country].filter(Boolean).join(', ')}
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span className={`tag ${stateClass(church.state)}`}>{church.state || '—'}</span>
          <span style={{ fontSize:'0.78rem', color:'var(--text-light)', fontFamily:'Cinzel,serif' }}>
            {church.building_year || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Church Drawer (slide from right) ──────────────────────────── */
function ChurchDrawer({ church, onClose }) {
  const [imgErr, setImgErr] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (church) {
      // tiny delay so the CSS transition fires
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [church])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  if (!church) return null

  const details = [
    { icon: '🏛️', label: 'Տեսակ',               value: church.type },
    { icon: '🌍', label: 'Երկիր',               value: church.country },
    { icon: '📍', label: 'Քաղաք / Գյուղ',       value: church.city },
    { icon: '📅', label: 'Կառուցման տարեթիվ',   value: church.building_year },
    { icon: '🗺️', label: 'Տեղագրություն',        value: church.location },
  ].filter(d => d.value)

  return (
    <>
      {/* dim backdrop */}
      <div
        onClick={handleClose}
        style={{
          position:'fixed', inset:0, zIndex:200,
          background: visible ? 'rgba(26,10,5,0.45)' : 'rgba(26,10,5,0)',
          backdropFilter: visible ? 'blur(3px)' : 'none',
          transition:'background 0.32s, backdrop-filter 0.32s',
        }}
      />

      {/* drawer panel */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:201,
        width: '50%',
        minWidth: 420,
        background:'var(--cream)',
        boxShadow:'-8px 0 40px rgba(26,10,5,0.25)',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        display:'flex', flexDirection:'column',
        overflowY:'auto',
      }}>

        {/* close button — top-right corner of drawer */}
        <button onClick={handleClose} style={{
          position:'absolute', top:14, right:14, zIndex:202,
          width:38, height:38, borderRadius:'50%',
          background:'rgba(26,10,5,0.6)', border:'none', cursor:'pointer',
          color:'#EDD9A3', fontSize:'1.1rem',
          display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(6px)',
          boxShadow:'0 2px 12px rgba(0,0,0,0.3)',
        }}>✕</button>

        {/* inner centering wrapper */}
        <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

        {/* Hero image */}
        <div style={{ position:'relative', height:340, flexShrink:0, background:'var(--parchment)' }}>
          {church.picture && !imgErr ? (
            <img
              src={church.picture} alt={church.name}
              onError={() => setImgErr(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
            />
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.35 }}>
              <ArmenianCross size={120} color="#8B1A2B" />
            </div>
          )}
          {/* gradient scrim */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:100,
            background:'linear-gradient(transparent, var(--cream))',
          }}/>
        </div>

        {/* Content */}
        <div style={{ padding:'0 28px 36px', flex:1 }}>

          {/* Badges */}
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            <span style={{
              background:'var(--crimson)', color:'var(--cream)',
              padding:'3px 14px', borderRadius:20,
              fontFamily:'Cinzel,serif', fontSize:'0.7rem', letterSpacing:'0.08em'
            }}>{church.type}</span>
            <span className={`tag ${stateClass(church.state)}`}>{church.state || '—'}</span>
          </div>

          {/* Name */}
          <h2 style={{
            fontFamily:'Cinzel Decorative,serif', fontSize:'1.15rem',
            color:'var(--crimson)', lineHeight:1.35, marginBottom:20,
          }}>
            {church.name}
          </h2>

          {/* Ornament */}
          <div style={{
            height:1,
            background:'linear-gradient(to right, transparent, var(--gold), transparent)',
            margin:'0 0 20px',
          }}/>

          {/* Detail rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
            {details.map(({ icon, label, value }) => (
              <div key={label} style={{
                display:'flex', alignItems:'flex-start', gap:12,
                background:'var(--warm-white)', borderRadius:8, padding:'10px 14px',
                border:'1px solid var(--parchment)',
              }}>
                <span style={{ fontSize:'1rem', marginTop:1, flexShrink:0 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.65rem', color:'var(--text-light)', letterSpacing:'0.1em', marginBottom:2 }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize:'0.9rem', color:'var(--text-dark)', fontWeight:500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Info block */}
          {church.info && church.info !== '-' && (
            <>
              <div style={{
                height:1,
                background:'linear-gradient(to right, transparent, var(--gold), transparent)',
                margin:'0 0 16px',
              }}/>
              <p style={{
                fontFamily:'Cinzel,serif', fontSize:'0.65rem', color:'var(--gold)',
                letterSpacing:'0.12em', marginBottom:10,
              }}>
                ✦ ՀԱՎԵԼՅԱԼ ՏԵՂԵԿՈՒԹՅՈՒՆ ✦
              </p>
              <p style={{
                fontSize:'0.92rem', color:'var(--text-medium)', lineHeight:1.8,
                fontFamily:'Cormorant Garamond, serif',
              }}>
                {church.info}
              </p>
            </>
          )}
        </div>
        </div> {/* end inner wrapper */}
      </div>
    </>
  )
}

/* ─── Catalog Tab ────────────────────────────────────────────────── */
function CatalogTab({ filters }) {
  const [churches, setChurches] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ country:'', type:'', state:'' })
  const [page, setPage] = useState(1)
  const searchRef = useRef(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, per_page: 24 })
      if (search) params.set('search', search)
      if (filter.country) params.set('country', filter.country)
      if (filter.type) params.set('type', filter.type)
      if (filter.state) params.set('state', filter.state)
      const r = await fetch(`${API}/api/churches?${params}`)
      const d = await r.json()
      setChurches(d.data)
      setTotal(d.total)
      setPage(p)
    } catch {
      setChurches(DEMO_CHURCHES)
      setTotal(DEMO_CHURCHES.length)
    }
    setLoading(false)
  }, [search, filter])

  useEffect(() => { load(1) }, [load])

  return (
    <div>
      {/* Filter Bar */}
      <div style={{
        background:'var(--warm-white)', border:'1px solid var(--parchment)',
        borderRadius:8, padding:'16px 20px', marginBottom:24,
        display:'grid', gridTemplateColumns:'1fr repeat(3,auto)', gap:12, alignItems:'center'
      }}>
        <input
          ref={searchRef}
          placeholder="🔍  Որոնել անունով, քաղաքով, երկրով…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth:0 }}
        />
        <select value={filter.country} onChange={e => setFilter(f => ({ ...f, country: e.target.value }))}>
          <option value="">🌍 Բոլոր երկրները</option>
          {(filters.countries || []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="">🏛️ Բոլոր տեսակները</option>
          {(filters.types || []).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filter.state} onChange={e => setFilter(f => ({ ...f, state: e.target.value }))}>
          <option value="">📌 Բոլոր վիճակները</option>
          {(filters.states || []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', color:'var(--text-light)', marginBottom:20, letterSpacing:'0.06em' }}>
        Գտնված {total} կառույց
      </p>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--gold)' }}>
          <div style={{ fontSize:'2rem', animation:'ornament-spin 2s linear infinite', display:'inline-block' }}>✦</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
          {(churches || []).map((c, i) => (
            <div key={c.id || i} className="slide-up" style={{ animationDelay:`${i*0.04}s` }}>
              <ChurchCard church={c} onClick={setSelected} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:32 }}>
          <button className="btn btn-outline" onClick={() => load(page - 1)} disabled={page === 1}>← Prev</button>
          <span style={{ alignSelf:'center', fontFamily:'Cinzel,serif', fontSize:'0.8rem', color:'var(--text-medium)' }}>
            Էջ {page}
          </span>
          <button className="btn btn-outline" onClick={() => load(page + 1)} disabled={churches.length < 24}>Next →</button>
        </div>
      )}

      {selected && <ChurchDrawer church={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ─── Timeline Tab ───────────────────────────────────────────────── */
function TimelineTab() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/api/stats`)
      .then(r => r.json())
      .then(d => { setData(d.timeline || []); setLoading(false) })
      .catch(() => { setData(DEMO_TIMELINE); setLoading(false) })
  }, [])

  const byCentury = {}
  data.forEach(c => {
    const cent = c.century || Math.ceil(c.year / 100)
    if (!byCentury[cent]) byCentury[cent] = []
    byCentury[cent].push(c)
  })
  const centuries = Object.keys(byCentury).sort((a, b) => +b - +a)

  const stateColor = s => STATE_COLORS[s] || '#9E9E9E'

  if (loading) return (
    <div style={{ textAlign:'center', padding:'80px 0', color:'var(--gold)', fontSize:'2rem' }}>
      <div style={{ animation:'ornament-spin 2s linear infinite', display:'inline-block' }}>✦</div>
    </div>
  )

  return (
    <div ref={containerRef} style={{ position:'relative', paddingLeft: 8 }}>
      <div style={{
        fontFamily:'Cinzel,serif', fontSize:'0.78rem', color:'var(--text-light)',
        letterSpacing:'0.08em', marginBottom:28, textAlign:'center'
      }}>
        ՆԵՐՔԵՎԻՑ ՎԵՐ ↓ ԱՄԵՆԱՀԻՆԸ ↓ — ՆՈՐԱԳՈՒՅՆԸ ↑
      </div>

      <div style={{ position:'absolute', left:'50%', top:60, bottom:0, width:2, background:'linear-gradient(to bottom, var(--gold), var(--crimson), var(--gold))', transform:'translateX(-50%)', zIndex:0 }} />

      {centuries.map((cent, ci) => (
        <div key={cent} style={{ position:'relative', zIndex:1, marginBottom:40 }}>
          <div style={{
            position:'sticky', top:80, zIndex:10,
            display:'flex', justifyContent:'center', marginBottom:24
          }}>
            <div style={{
              background:'linear-gradient(135deg, var(--crimson), var(--dark-crimson))',
              color:'var(--pale-gold)', padding:'6px 28px',
              borderRadius:20, fontFamily:'Cinzel,serif', fontSize:'0.82rem',
              letterSpacing:'0.12em', boxShadow:'0 4px 16px var(--shadow-strong)',
              border:'1px solid var(--gold)'
            }}>
              ✦ {cent}-ԻՆ ԴԱՐ ✦
            </div>
          </div>

          {byCentury[cent].map((church, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={church.id} className="fade-in"
                style={{
                  display:'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end',
                  animationDelay: `${i * 0.06}s`,
                  marginBottom: 16,
                  paddingLeft: isLeft ? 0 : '52%',
                  paddingRight: isLeft ? '52%' : 0,
                }}
              >
                <div className="card" style={{
                  padding:'14px 18px', maxWidth:320, position:'relative',
                  borderLeft: `3px solid ${stateColor(church.state)}`
                }}>
                  <div style={{
                    position:'absolute',
                    [isLeft ? 'right' : 'left']: -52,
                    top:'50%', transform:'translateY(-50%)',
                    background:'var(--gold)', color:'var(--warm-dark)',
                    borderRadius:'50%', width:40, height:40,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.62rem', fontFamily:'Cinzel,serif', textAlign:'center',
                    fontWeight:700, boxShadow:'0 2px 8px var(--shadow)'
                  }}>
                    {church.year}
                  </div>

                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.82rem', color:'var(--crimson)', marginBottom:4, lineHeight:1.3 }}>
                    {church.name}
                  </div>
                  <div style={{ fontSize:'0.76rem', color:'var(--text-medium)', display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span>{church.type}</span>
                    {church.city && <span>📍 {church.city}</span>}
                    {church.country && <span>🌍 {church.country}</span>}
                  </div>
                  <div style={{ marginTop:6 }}>
                    <span className={`tag ${stateClass(church.state)}`} style={{ fontSize:'0.65rem' }}>{church.state}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ─── Statistics Tab ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'var(--warm-white)', border:'1px solid var(--gold)',
      borderRadius:6, padding:'10px 14px', fontFamily:'Cormorant Garamond,serif',
      boxShadow:'0 4px 16px var(--shadow)'
    }}>
      <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', color:'var(--crimson)', marginBottom:4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || 'var(--brown)' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function StatCard({ label, value, icon, color = 'var(--crimson)' }) {
  return (
    <div className="card" style={{ padding:'20px 24px', textAlign:'center' }}>
      <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:'Cinzel Decorative,serif', fontSize:'2rem', color, fontWeight:900 }}>{value}</div>
      <div style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', marginTop:4 }}>{label}</div>
    </div>
  )
}

function StatsTab() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetch(`${API}/api/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(DEMO_STATS))
  }, [])

  if (!stats) return (
    <div style={{ textAlign:'center', padding:'80px 0', color:'var(--gold)', fontSize:'2rem' }}>
      <div style={{ animation:'ornament-spin 2s linear infinite', display:'inline-block' }}>✦</div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
        <StatCard label="ԸՆԴԱՄԵՆԸ"  value={stats.total} />
        <StatCard label="ԿԱՆԳՈՒՆ"   value={stats.standing}   color="#2E7D32" />
        <StatCard label="ԱՎԵՐՎԱԾ"   value={stats.ruined}     color="#B71C1C" />
        <StatCard label="ԿԻՍԱՎԵՐ"   value={stats.semi_ruined} color="#F57F17" />
        <StatCard label="ԵՐԿՐՆԵՐ"   value={stats.countries}  color="var(--dark-gold)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', color:'var(--crimson)', marginBottom:16, letterSpacing:'0.08em' }}>
            ՏԵՍԱԿՆԵՐԻ ԲԱՇԽՈՒՄ
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.by_type} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={{ stroke:'var(--gold)' }}>
                {stats.by_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', color:'var(--crimson)', marginBottom:16, letterSpacing:'0.08em' }}>
            ՖԻԶԻԿԱԿԱՆ ՎԻՃԱԿ
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.by_state} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {stats.by_state.map((s, i) => <Cell key={i} fill={STATE_COLORS[s.name] || COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding:20 }}>
        <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', color:'var(--crimson)', marginBottom:16, letterSpacing:'0.08em' }}>
          ԿԱՌՈՒՑՈՒՄՆ ԸՍՏ ԴԱՐԵՐԻ
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.by_century} margin={{ top:5, right:20, bottom:40, left:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--stone)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} angle={-35} textAnchor="end" />
            <YAxis tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="var(--crimson)" radius={[4,4,0,0]} name="Կառույց">
              {stats.by_century.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? 'var(--crimson)' : 'var(--gold)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', color:'var(--crimson)', marginBottom:16, letterSpacing:'0.08em' }}>
            ԸՍՏ ԵՐԿՐԻ (ԹՈՓ 10)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={stats.by_country.slice(0,10)} margin={{ left:10, right:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--stone)" horizontal={false} />
              <XAxis type="number" tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="var(--crimson)" radius={[0,4,4,0]} name="Կառույց" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'0.88rem', color:'var(--crimson)', marginBottom:16, letterSpacing:'0.08em' }}>
            ԱՄԵՆԱՏԱՐԱԾՎԱԾ ԱՆՈՒՆՆԵՐԸ
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={stats.top_names.slice(0,10)} margin={{ left:10, right:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--stone)" horizontal={false} />
              <XAxis type="number" tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontFamily:'Cinzel,serif', fontSize:10, fill:'var(--text-medium)' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="var(--dark-gold)" radius={[0,4,4,0]} name="Հանդիպումների քանակ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ─── Chatbot Tab ────────────────────────────────────────────────── */
function ChatbotTab() {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Բարեւ Ձեզ։ Ես «Հայկական Ժառանգություն» նախաձեռնության թվային օգնականն եմ։ Կարող եք հարցնել ցանկացած կառույցի, դարաշրջանի կամ ճարտարապետական ոճի մասին։ 🏛️' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role:'user', content: input.trim() }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const d = await r.json()
      setMessages(m => [...m, { role:'assistant', content: d.response }])
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'Ցավոք, կապ չկա սերվերի հետ։ Խնդրում ենք կրկին փորձել։' }])
    }
    setLoading(false)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const suggestions = [
    'Ո՞ւմ է կառուցել Վիեննայի Մխիթարյան վանքը',
    'Ո՞ր կառույցն է ԱՄՆ-ի ամենահին հայկական եկեղեցին',
    'Ադրբեջանի հայկական եկեղեցիները ի՞նչ վիճակում են',
    'Ո՞ր դարի կառույցները ամենաշատն են',
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 260px)', minHeight:500 }}>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 0', display:'flex', flexDirection:'column', gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-in" style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ marginRight:10, marginTop:4 }}>
                <ArmenianCross size={28} color="var(--crimson)" />
              </div>
            )}
            <div style={{
              maxWidth:'72%',
              background: m.role === 'user'
                ? 'linear-gradient(135deg,var(--crimson),var(--dark-crimson))'
                : 'var(--warm-white)',
              color: m.role === 'user' ? 'var(--cream)' : 'var(--text-dark)',
              padding:'12px 16px', borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              border: m.role === 'assistant' ? '1px solid var(--parchment)' : 'none',
              fontSize:'0.92rem', lineHeight:1.65,
              boxShadow:'0 2px 8px var(--shadow)'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ArmenianCross size={28} color="var(--crimson)" />
            <div style={{ display:'flex', gap:4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:7, height:7, borderRadius:'50%', background:'var(--gold)',
                  animation:`float 1.2s ease-in-out ${i*0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length < 3 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} className="btn btn-outline" style={{ fontSize:'0.72rem', padding:'6px 12px' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10, background:'var(--warm-white)', borderRadius:8, padding:12, border:'1px solid var(--parchment)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Հարցրեք հայկական կրոնական ճարտարապետության մասին…"
          style={{ flex:1, border:'none', background:'transparent', fontSize:'1rem' }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ minWidth:80 }}>
          Ուղարկել →
        </button>
      </div>
    </div>
  )
}

/* ─── Submit Tab ─────────────────────────────────────────────────── */
function SubmitTab({ filters }) {
  const [form, setForm] = useState({
    name:'', type:'Եկեղեցի', country:'', city:'',
    building_year:'', state:'Կանգուն', location:'',
    info:'', submitter_name:'', submitter_email:''
  })
  const [picture, setPicture] = useState(null)       // File object
  const [preview, setPreview] = useState(null)       // Object URL for preview
  const [status, setStatus] = useState(null)
  const fileRef = useRef(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicture(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setPicture(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.country) return alert('Անունը և երկիրը պարտադիր դաշտեր են')
    setStatus('sending')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''))
      if (picture) fd.append('picture', picture)

      const r = await fetch(`${API}/api/submit`, { method:'POST', body: fd })
      if (!r.ok) throw new Error()
      setStatus('success')
      setForm({ name:'', type:'Եկեղեցի', country:'', city:'', building_year:'', state:'Կանգուն', location:'', info:'', submitter_name:'', submitter_email:'' })
      removeImage()
    } catch { setStatus('error') }
  }

  const field = (label, key, type = 'text', required = false, hint = '') => (
    <div>
      <label style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
        {label} {required && <span style={{ color:'var(--crimson)' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea rows={3} value={form[key]} onChange={e => set(key, e.target.value)} style={{ resize:'vertical' }} />
      ) : (
        <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
      )}
      {hint && <p style={{ fontSize:'0.76rem', color:'var(--text-light)', marginTop:4 }}>{hint}</p>}
    </div>
  )

  return (
    <div style={{ maxWidth:640, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <ArmenianCross size={48} />
        <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'1.1rem', color:'var(--crimson)', marginTop:16, letterSpacing:'0.1em' }}>
          ԱՎԵԼԱՑՆԵԼ ՆՈՐ ԿԱՌՈՒՅՑ
        </h2>
        <p style={{ color:'var(--text-medium)', fontSize:'0.92rem', marginTop:8 }}>
          Եթե գիտեք կառույց, որ բացակայում է, ուղարկեք Ձեր հայտը՝ հետևյալ ձևաչափով․
        </p>
      </div>

      {status === 'success' ? (
        <div style={{
          background:'#E8F5E9', border:'2px solid #4CAF50', borderRadius:8,
          padding:28, textAlign:'center', animation:'slideUp 0.4s ease'
        }}>
          <div style={{ fontSize:'3rem' }}>✅</div>
          <h3 style={{ fontFamily:'Cinzel,serif', color:'#2E7D32', margin:'12px 0 8px' }}>Շնորհակալություն։ Ձեր հայտն ընդունվել է։</h3>
          <p style={{ color:'#388E3C' }}>Այն կվերանայվի մեր թիմի կողմից առավելագույնը 48 ժամվա ընթացքում։</p>
          <button className="btn btn-outline" onClick={() => setStatus(null)} style={{ marginTop:16 }}>Ավելացնել մեկ այլ հայտ</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Basic info */}
            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="ՀԻՄՆԱԿԱՆ ՏԵՂԵԿՈՒԹՅՈՒՆ" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                {field('Անվանում', 'name', 'text', true)}
                <div>
                  <label style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
                    Տեսակ <span style={{ color:'var(--crimson)' }}>*</span>
                  </label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {['Եկեղեցի','Վանք','Մատուռ','Տաճար','Վանական համալիր'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {field('Երկիր', 'country', 'text', true)}
                {field('Քաղաք / Գյուղ', 'city')}
                {field('Կառուցման դար/տարեթիվ', 'building_year')}
                <div>
                  <label style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Կարգավիճակ</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}>
                    {['Կանգուն','Կիսավեր','Ավերված','Չկան տեղեկություններ'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {field('Տեղագրություն', 'location', 'text', false, 'Օր.՝ 40.1234°N 44.5678°E')}
            </div>

            {/* Image upload */}
            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="ՆԿԱՐ" />
              <div style={{ marginTop:16 }}>
                {preview ? (
                  <div style={{ position:'relative', borderRadius:8, overflow:'hidden', height:200 }}>
                    <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <div style={{
                      position:'absolute', inset:0,
                      background:'linear-gradient(transparent 55%, rgba(26,10,5,0.65))',
                    }}/>
                    <div style={{ position:'absolute', bottom:12, left:14, right:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'#EDD9A3', fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.06em' }}>
                        {picture?.name}
                      </span>
                      <button type="button" onClick={removeImage} style={{
                        background:'rgba(139,26,43,0.85)', border:'none', borderRadius:6,
                        color:'#fff', fontSize:'0.78rem', padding:'4px 12px',
                        cursor:'pointer', fontFamily:'Cinzel,serif', letterSpacing:'0.06em',
                      }}>
                        ✕ Հեռ.
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border:'2px dashed var(--stone)', borderRadius:8,
                      padding:'32px 20px', textAlign:'center', cursor:'pointer',
                      transition:'border-color 0.2s, background 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.background='rgba(201,165,116,0.06)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor='var(--stone)'; e.currentTarget.style.background='transparent' }}
                  >
                    <div style={{ fontSize:'2.2rem', marginBottom:8, opacity:0.5 }}>📷</div>
                    <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.78rem', color:'var(--text-medium)', letterSpacing:'0.06em' }}>
                      Սեղմեք նկար ընտրելու համար
                    </p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-light)', marginTop:4 }}>
                      JPG, PNG, WEBP · Մաքս. 5 MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFile}
                  style={{ display:'none' }}
                />
              </div>
            </div>

            {/* Extra info */}
            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="Հավելյալ տեղեկություն" />
              <div style={{ marginTop:16 }}>
                {field('Պատմեզ մեզ, թե ինչ է Ձեզ հայտնի այս կառույցի մասին', 'info', 'textarea', false)}
              </div>
            </div>

            {/* Submitter */}
            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="Ձեր մասին" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                {field('Անուն, ազգանուն', 'submitter_name')}
                {field('Էլեկտրոնային հասցե', 'submitter_email', 'email')}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding:'14px 32px', fontSize:'0.85rem', letterSpacing:'0.12em' }} disabled={status === 'sending'}>
              {status === 'sending' ? '✦ Ուղարկվում է...' : 'ՈՒՂԱՐԿԵԼ ՀԱՅՏ →'}
            </button>

            {status === 'error' && (
              <p style={{ color:'var(--crimson)', fontSize:'0.88rem', textAlign:'center' }}>
                Հայտնաբերվել է սխալ։ Փորձեք կրկին․
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

/* ─── Map Tab ────────────────────────────────────────────────────── */

function parseCoords(locationStr) {
  if (!locationStr) return null
  const m = locationStr.match(/(-?\d+\.?\d*)[°\s,]+[NS]?\s*(-?\d+\.?\d*)[°\s]*[EW]?/i)
  if (m) {
    const lat = parseFloat(m[1])
    const lng = parseFloat(m[2])
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng]
  }
  return null
}

const STATE_MARKER_COLORS = {
  'Կանգուն':              '#2E7D32',
  'Ավերված':              '#B71C1C',
  'Կիսավեր':              '#F57F17',
  'Չկան տեղեկություններ': '#757575',
}

function MapTab() {
  const [churches, setChurches] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState(null)
  const mapRef    = useRef(null)   // Leaflet map instance
  const mapElRef  = useRef(null)   // DOM div
  const markersRef = useRef([])

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }
  }, [])

  // Fetch churches
  useEffect(() => {
    fetch(`${API}/api/churches?per_page=9999`)
      .then(r => r.json())
      .then(d => { setChurches(d.data || []); setLoading(false) })
      .catch(() => { setChurches(DEMO_CHURCHES); setLoading(false) })
  }, [])

  // Init Leaflet map once
  useEffect(() => {
    if (loading || !mapElRef.current || mapRef.current) return

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => {
      const L = window.L
      const map = L.map(mapElRef.current, { zoomControl: true }).setView([40, 20], 3)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      mapRef.current = map
      renderMarkers(filter)
    }
    if (window.L) {
      // already loaded
      const L = window.L
      const map = L.map(mapElRef.current, { zoomControl: true }).setView([40, 20], 3)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      mapRef.current = map
      renderMarkers(filter)
    } else {
      document.head.appendChild(script)
    }
  }, [loading])

  const renderMarkers = (activeFilter) => {
    const L = window.L
    if (!L || !mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const points = churches
      .map(c => ({ ...c, coords: parseCoords(c.location) }))
      .filter(c => c.coords)
      .filter(c => !activeFilter || c.state === activeFilter)

    if (points.length === 0) return

    const bounds = []
    points.forEach(c => {
      const color = STATE_MARKER_COLORS[c.state] || '#8B1A2B'
      const icon = L.divIcon({
        className: '',
        html: `<svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 0C5.82 0 0 5.82 0 13c0 9 13 23 13 23S26 22 26 13C26 5.82 20.18 0 13 0z"
            fill="${color}" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>
          <circle cx="13" cy="13" r="5" fill="rgba(255,255,255,0.9)"/>
        </svg>`,
        iconSize: [26, 36],
        iconAnchor: [13, 36],
        popupAnchor: [0, -38],
      })

      const marker = L.marker(c.coords, { icon }).addTo(mapRef.current)
      marker.bindPopup(`
        <div style="font-family:'Cinzel',serif; min-width:170px; padding:2px 0">
          <strong style="color:#8B1A2B; font-size:0.82rem; display:block; margin-bottom:4px">${c.name}</strong>
          <span style="font-size:0.7rem; color:#555">${[c.type, c.city, c.country].filter(Boolean).join(' · ')}</span>
          ${c.building_year ? `<span style="display:block; font-size:0.68rem; color:#888; margin-top:2px">${c.building_year}</span>` : ''}
          <span style="display:inline-block; margin-top:6px; padding:1px 8px; border-radius:10px; font-size:0.65rem; background:${color}; color:#fff">${c.state || '—'}</span>
          <div style="margin-top:8px">
            <button onclick="window.__openDrawer('${c.id}')" style="font-family:'Cinzel',serif; font-size:0.68rem; background:#8B1A2B; color:#fff; border:none; padding:4px 12px; border-radius:4px; cursor:pointer; letter-spacing:0.06em">
              Մանրամասն →
            </button>
          </div>
        </div>
      `)
      markersRef.current.push(marker)
      bounds.push(c.coords)
    })

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
    }
  }

  // Re-render markers when filter changes
  useEffect(() => {
    if (mapRef.current) renderMarkers(filter)
  }, [filter, churches])

  // Global handler for popup button
  useEffect(() => {
    window.__openDrawer = (id) => {
      const church = churches.find(c => c.id === id)
      if (church) setSelected(church)
    }
    return () => { delete window.__openDrawer }
  }, [churches])

  const stateFilters = [
    { value: '',                      label: 'Բոլորը',   color: '#8B1A2B' },
    { value: 'Կանգուն',               label: 'Կանգուն',  color: '#2E7D32' },
    { value: 'Կիսավեր',               label: 'Կիսավեր',  color: '#F57F17' },
    { value: 'Ավերված',               label: 'Ավերված',  color: '#B71C1C' },
    { value: 'Չկան տեղեկություններ',  label: 'Անհայտ',   color: '#757575' },
  ]

  const visibleCount = churches
    .filter(c => parseCoords(c.location))
    .filter(c => !filter || c.state === filter).length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

      {/* Top bar */}
      <div style={{
        background:'var(--warm-white)', border:'1px solid var(--parchment)',
        borderRadius:8, padding:'12px 18px', marginBottom:12,
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
      }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {stateFilters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding:'5px 14px', borderRadius:20, cursor:'pointer',
              fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.06em',
              border:`2px solid ${f.color}`,
              background: filter === f.value ? f.color : 'transparent',
              color: filter === f.value ? '#fff' : f.color,
              transition:'all 0.18s',
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.75rem', color:'var(--text-light)', letterSpacing:'0.06em' }}>
          {loading ? '…' : `${visibleCount} կառույց քարտեզի վրա`}
        </span>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:12, paddingLeft:4 }}>
        {stateFilters.slice(1).map(f => (
          <div key={f.value} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:11, height:11, borderRadius:'50%', background:f.color }}/>
            <span style={{ fontFamily:'Cinzel,serif', fontSize:'0.68rem', color:'var(--text-medium)', letterSpacing:'0.04em' }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ height:560, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', fontSize:'2rem' }}>
          <div style={{ animation:'ornament-spin 2s linear infinite' }}>✦</div>
        </div>
      ) : (
        <div
          ref={mapElRef}
          style={{
            height:'calc(100vh - 320px)', minHeight:500,
            borderRadius:10, overflow:'hidden',
            border:'2px solid var(--parchment)',
            boxShadow:'0 4px 24px rgba(26,10,5,0.12)',
            zIndex:0,
          }}
        />
      )}

      {selected && <ChurchDrawer church={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}


const DEMO_CHURCHES = [
  {
    id: '1',
    type: 'Եկեղեցի',
    name: 'Սուրբ Աստվածածին',
    building_year: '1797',
    country: 'Ադրբեջան',
    city: 'Բաքու',
    state: 'Կիսավեր',
    picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Views_of_Ichery_Sheher_1987.jpg/960px-Views_of_Ichery_Sheher_1987.jpg',
    info: 'Կառույցը գտնվում է Իչերի Շեհեր պատմական թաղամասում։'
  },
  {
    id: '7',
    type: 'Եկեղեցի',
    name: 'Սուրբ Հովհաննես',
    building_year: '1633',
    country: 'Ադրբեջան',
    city: 'Գյանջա',
    state: 'Կանգուն',
    picture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Saint_Iohann_church_in_Ganja_1.jpg/960px-Saint_Iohann_church_in_Ganja_1.jpg',
    info: ''
  },
  {
    id: '175',
    type: 'Եկեղեցի',
    name: 'Սուրբ Փրկիչ',
    building_year: '1891',
    country: 'ԱՄՆ',
    city: 'Վուսթեր',
    state: 'Կանգուն',
    picture: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Worcester_Armenian_church.png',
    info: 'ԱՄՆ-ի ամենահին հայկական եկեղեցիներից մեկը։'
  },
]

const DEMO_TIMELINE = [
  { id: 'a27', name: 'Սուրբ Բարդուղիմեոս',       year: 1308, century: 14, type: 'Եկեղեցի', country: 'Իրան',    city: 'Ջուղա',   state: 'Կանգուն', picture: null },
  { id: 'a29', name: 'Սուրբ Խաչ վանք',            year: 1688, century: 17, type: 'Եկեղեցի', country: 'Իրան',    city: 'Վան',     state: 'Կանգուն', picture: null },
  { id: 'a2',  name: 'Վիեննայի Մխիթարյան վանք',   year: 1810, century: 19, type: 'Վանք',    country: 'Ավստրիա', city: 'Վիեննա',  state: 'Կանգուն', picture: null },
  { id: '175', name: 'Սուրբ Փրկիչ',               year: 1891, century: 19, type: 'Եկեղեցի', country: 'ԱՄՆ',     city: 'Վուսթեր', state: 'Կանգուն', picture: null },
]

const DEMO_STATS = {
  total: 63,
  standing: 55,
  ruined: 4,
  semi_ruined: 3,
  countries: 18,
  by_type: [
    { name: 'Եկեղեցի', value: 54 },
    { name: 'Տաճար',   value: 5  },
    { name: 'Մատուռ',  value: 2  },
    { name: 'Վանք',    value: 2  },
  ],
  by_state: [
    { name: 'Կանգուն',              value: 55 },
    { name: 'Ավերված',              value: 4  },
    { name: 'Կիսավեր',              value: 3  },
    { name: 'Չկան տեղեկություններ', value: 1  },
  ],
  by_country: [
    { name: 'ԱՄՆ',      value: 20 },
    { name: 'Ֆրանսիա',  value: 13 },
    { name: 'Բրազիլիա', value: 9  },
    { name: 'Կանադա',   value: 7  },
  ],
  by_century: [
    { name: '13-ին դար', value: 1,  century: 13 },
    { name: '14-ին դար', value: 1,  century: 14 },
    { name: '17-ին դար', value: 3,  century: 17 },
    { name: '19-ին դար', value: 12, century: 19 },
    { name: '20-ին դար', value: 31, century: 20 },
    { name: '21-ին դար', value: 3,  century: 21 },
  ],
  top_names: [
    { name: 'Սուրբ Գրիգոր Լուսավորիչ', value: 12 },
    { name: 'Սուրբ Աստվածածին',         value: 9  },
    { name: 'Սուրբ Հովհաննես',           value: 8  },
    { name: 'Սուրբ Կարապետ',             value: 6  },
    { name: 'Սուրբ Սարգիս',              value: 5  },
  ],
  timeline: DEMO_TIMELINE,
}

/* ─── Header ─────────────────────────────────────────────────────── */
function Header() {
  return (
    <header style={{
      background:'linear-gradient(135deg, var(--dark-crimson) 0%, var(--crimson) 50%, var(--dark-crimson) 100%)',
      color:'var(--cream)',
      position:'relative',
      overflow:'hidden',
    }}>
      <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A574' fill-opacity='1'%3E%3Cpath d='M27 3h6v14h14v6H33v14h-6V23H13v-6h14z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize:'60px 60px' }} />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 32px 28px', position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:24 }}>
        <div style={{ animation:'float 4s ease-in-out infinite' }}>
          <ArmenianCross size={56} color="var(--pale-gold)" />
        </div>
        <div>
          <h1 className="cinzel-deco" style={{ fontSize:'clamp(1.4rem,3vw,2.2rem)', letterSpacing:'0.08em', color:'var(--pale-gold)', textShadow:'0 2px 12px rgba(0,0,0,0.4)', lineHeight:1.1 }}>
            ՀԱՅԿԱԿԱՆ ԺԱՌԱՆԳՈՒԹՅՈՒՆ
          </h1>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'rgba(237,217,163,0.8)', letterSpacing:'0.2em', marginTop:4, fontStyle:'italic' }}>
            Կրոնական Ճարտարապետության Կատալոգ
          </p>
        </div>
      </div>
    </header>
  )
}

/* ─── App Root ───────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState('catalog')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetch(`${API}/api/filters`)
      .then(r => r.json())
      .then(setFilters)
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Header />

      <nav style={{
        background:'var(--warm-white)',
        borderBottom:'2px solid var(--parchment)',
        position:'sticky', top:0, zIndex:100,
        boxShadow:'0 2px 16px var(--shadow)'
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 32px', display:'flex', gap:0, overflowX:'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                fontFamily:'Cinzel,serif', fontSize:'0.75rem', letterSpacing:'0.1em',
                padding:'16px 20px', border:'none', cursor:'pointer',
                background:'transparent', color: tab === t.id ? 'var(--crimson)' : 'var(--text-medium)',
                borderBottom: tab === t.id ? '3px solid var(--crimson)' : '3px solid transparent',
                transition:'all 0.2s', whiteSpace:'nowrap',
                display:'flex', alignItems:'center', gap:8,
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ flex:1, maxWidth:1200, margin:'0 auto', width:'100%', padding:'32px 32px 60px' }}>
        <div key={tab} className="fade-in">
          {tab === 'catalog'  && <CatalogTab   filters={filters} />}
          {tab === 'map'      && <MapTab />}
          {tab === 'timeline' && <TimelineTab />}
          {tab === 'stats'    && <StatsTab />}
          {tab === 'chat'     && <ChatbotTab />}
          {tab === 'submit'   && <SubmitTab filters={filters} />}
        </div>
      </main>

      <footer style={{
        background:'var(--warm-dark)', color:'rgba(237,217,163,0.6)',
        textAlign:'center', padding:'24px 32px',
        fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.1em'
      }}>
        <ArmenianCross size={24} color="var(--gold)" />
        <p style={{ marginTop:8 }}>ՀԱՅԿԱԿԱՆ ԺԱՌԱՆԳՈՒԹՅՈՒՆ © {new Date().getFullYear()} · Բոլոր իրավունքները պաշտպանված են</p>
      </footer>
    </div>
  )
}