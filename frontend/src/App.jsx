import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

/* ─── Constants ──────────────────────────────────────────────────── */
const API = 'http://localhost:8000'
const COLORS = ['#8B1A2B','#C9A574','#5C0F1C','#D4C4B0','#3D2B1F','#EDD9A3','#A83248','#8A6A2E']
const STATE_COLORS = { 'Կանգուն':'#2E7D32', 'Ավերված':'#B71C1C', 'Կիսավեր':'#F57F17', 'Չկան տեղեկություններ':'#757575' }
const STATE_CLASSES = { 'Կանգուն':'tag-standing', 'Ավերված':'tag-ruined', 'Կիսավեր':'tag-semi', 'Չկան տեղեկություններ':'tag-unknown' }
const TABS = [
  { id:'catalog',   label:'Կատալոգ',        icon:'⛪' },
  { id:'timeline',  label:'Ժամանակագր.',     icon:'📅' },
  { id:'stats',     label:'Վիճակագրություն', icon:'📊' },
  { id:'chat',      label:'Զրուցարան',       icon:'💬' },
  { id:'submit',    label:'Ավելացնել',        icon:'➕' },
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

/* ─── Church Detail Modal ────────────────────────────────────────── */
function ChurchModal({ church, onClose }) {
  const [imgErr, setImgErr] = useState(false)
  if (!church) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ position:'relative' }}>
          <div style={{ height: 260, overflow:'hidden', background:'var(--parchment)' }}>
            {church.picture && !imgErr ? (
              <img src={church.picture} alt={church.name}
                onError={() => setImgErr(true)}
                style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
                <ArmenianCross size={100} color="#8B1A2B" />
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            position:'absolute', top:12, right:12,
            background:'rgba(26,10,5,0.6)', border:'none', borderRadius:'50%',
            width:36, height:36, cursor:'pointer', color:'#EDD9A3', fontSize:'1.1rem',
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>✕</button>
        </div>
        <div style={{ padding:'24px 28px 28px' }}>
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <span style={{
              background:'var(--crimson)', color:'var(--cream)',
              padding:'3px 12px', borderRadius:4,
              fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.07em'
            }}>{church.type}</span>
            <span className={`tag ${stateClass(church.state)}`}>{church.state || '—'}</span>
          </div>
          <h2 style={{ fontFamily:'Cinzel Decorative,serif', fontSize:'1.25rem', color:'var(--crimson)', marginBottom:6, lineHeight:1.3 }}>
            {church.name}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px', margin:'16px 0', fontSize:'0.88rem' }}>
            {[
              ['🏛️ Տեսակ', church.type],
              ['🌍 Երկիր', church.country],
              ['📍 Քաղաք', church.city],
              ['📅 Կառ. թ.', church.building_year],
              ['🗺️ Կոորդ.', church.location],
              ['🔢 Դার', church.century ? `${church.century}-ին դ.` : '—'],
            ].map(([k, v]) => v && (
              <div key={k}>
                <span style={{ color:'var(--text-light)', fontFamily:'Cinzel,serif', fontSize:'0.72rem' }}>{k}</span>
                <p style={{ color:'var(--text-dark)', fontWeight:500 }}>{v}</p>
              </div>
            ))}
          </div>
          {church.info && church.info !== '-' && (
            <div style={{
              borderTop:'1px solid var(--parchment)', paddingTop:16, marginTop:8,
              fontSize:'0.9rem', color:'var(--text-medium)', lineHeight:1.7
            }}>
              <p style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--gold)', letterSpacing:'0.1em', marginBottom:8 }}>
                ԾԱՆՈԹ. ՏԵՂԵԿՈՒԹՅՈՒՆ
              </p>
              {church.info}
            </div>
          )}
        </div>
      </div>
    </div>
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
      // Use demo data if API unavailable
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

      {selected && <ChurchModal church={selected} onClose={() => setSelected(null)} />}
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

  // Group by century
  const byCentury = {}
  data.forEach(c => {
    const cent = c.century || Math.ceil(c.year / 100)
    if (!byCentury[cent]) byCentury[cent] = []
    byCentury[cent].push(c)
  })
  const centuries = Object.keys(byCentury).sort((a, b) => +b - +a) // desc → newest at top

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
        ՆԵՐՔԵՎԻՑ ՎԵՐ ↓ ԱՄԵՆԱՀԻՆԸ ↓ — ԱՄԵՆԱԺԱՄԱՆԱԿԱԿԻՑԸ ↑
      </div>

      {/* Central timeline line */}
      <div style={{ position:'absolute', left:'50%', top:60, bottom:0, width:2, background:'linear-gradient(to bottom, var(--gold), var(--crimson), var(--gold))', transform:'translateX(-50%)', zIndex:0 }} />

      {centuries.map((cent, ci) => (
        <div key={cent} style={{ position:'relative', zIndex:1, marginBottom:40 }}>
          {/* Century label */}
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
                  {/* Year badge */}
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
      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
        <StatCard label="ԸՆԴԱՄԵՆԸ" value={stats.total} icon="🏛️" />
        <StatCard label="ԿԱՆԳՈՒՆ" value={stats.standing} icon="✅" color="#2E7D32" />
        <StatCard label="ԱՎԵՐՎԱԾ" value={stats.ruined} icon="💔" color="#B71C1C" />
        <StatCard label="ԿԻՍԱՎԵՐ" value={stats.semi_ruined} icon="⚠️" color="#F57F17" />
        <StatCard label="ԵՐԿՐՆԵՐ" value={stats.countries} icon="🌍" color="var(--dark-gold)" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* By type */}
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

        {/* By state */}
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

      {/* By century */}
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

      {/* Top countries + Top names */}
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
              <Bar dataKey="value" fill="var(--dark-gold)" radius={[0,4,4,0]} name="Հանդիպ." />
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
    { role:'assistant', content:'Բարեւ Ձեզ։ Ես «Հայկական Ժառանգություն» նախաձեռնության թվային օգնականն եմ։ Կարող եք հարցնել ցանկացած կառույցի, դարաշրջանի կամ ճարտ. ոճի մասին։ 🏛️' }
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
    'Ո՞ւմ է կառուցել Վիեննայի Մխ. վ-ն',
    'Ո՞ր կառույցն է ԱՄՆ-ի ամ. հինը',
    'Ադրբ-ի ա. ե-ն ի՞նչ վ-ում են',
    'Ո՞ր դարի կ-ն ամ. շատ են',
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 260px)', minHeight:500 }}>
      {/* Messages */}
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

      {/* Suggestions */}
      {messages.length < 3 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setInput(s)} className="btn btn-outline" style={{ fontSize:'0.72rem', padding:'6px 12px' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display:'flex', gap:10, background:'var(--warm-white)', borderRadius:8, padding:12, border:'1px solid var(--parchment)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Հարցրեք հայկական կրոնական ճարտ-ի մասին…"
          style={{ flex:1, border:'none', background:'transparent', fontSize:'1rem' }}
        />
        <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ minWidth:80 }}>
          Ուղ. →
        </button>
      </div>
    </div>
  )
}

/* ─── Submit Tab ─────────────────────────────────────────────────── */
function SubmitTab({ filters }) {
  const [form, setForm] = useState({ name:'', type:'Եկեղեցի', country:'', city:'', building_year:'', state:'Կանգուն', location:'', info:'', submitter_name:'', submitter_email:'' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.country) return alert('Անհրաժեշտ դաշտերը պարտադիր են')
    setStatus('sending')
    try {
      const r = await fetch(`${API}/api/submit`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(form)
      })
      const d = await r.json()
      setStatus('success')
      setForm({ name:'', type:'Եկեղեցի', country:'', city:'', building_year:'', state:'Կանգուն', location:'', info:'', submitter_name:'', submitter_email:'' })
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
          Եթե գիտեք կառույց, որ բացակայում է, ուղ. ձ. հայտն ու մ. թ-ն կդ.
        </p>
      </div>

      {status === 'success' ? (
        <div style={{
          background:'#E8F5E9', border:'2px solid #4CAF50', borderRadius:8,
          padding:28, textAlign:'center', animation:'slideUp 0.4s ease'
        }}>
          <div style={{ fontSize:'3rem' }}>✅</div>
          <h3 style={{ fontFamily:'Cinzel,serif', color:'#2E7D32', margin:'12px 0 8px' }}>Շնորհ. Ձ. հ. ստ.!</h3>
          <p style={{ color:'#388E3C' }}>Մ. թ-ն կդ. մ. 48 ժ-ի ընթ-ք.</p>
          <button className="btn btn-outline" onClick={() => setStatus(null)} style={{ marginTop:16 }}>Ավ. մ. հ.</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="ՀԻՄՆԱԿԱՆ ՏԵՂԵԿՈՒԹՅՈՒՆ" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                {field('Անվանում', 'name', 'text', true)}
                <div>
                  <label style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>
                    ՏԵՍԱԿ <span style={{ color:'var(--crimson)' }}>*</span>
                  </label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {['Եկեղեցի','Վանք','Մատուռ','Տաճար','Վանական համ.'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {field('Երկիր', 'country', 'text', true)}
                {field('Քաղաք / Գյուղ', 'city')}
                {field('Կառ. թ. / Դ.', 'building_year', 'text', false, 'Օր.՝ 1648, 17-ին դ.')}
                <div>
                  <label style={{ fontFamily:'Cinzel,serif', fontSize:'0.72rem', color:'var(--text-light)', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>ՎԻՃԱԿ</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}>
                    {['Կանգուն','Կիսավեր','Ավերված','Չկան տ.'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {field('Կոոր. (GPS)', 'location', 'text', false, 'Օր.՝ 40.1234°N 44.5678°E')}
            </div>

            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="ԼՐԱՑ. ՏԵՂ." />
              <div style={{ marginTop:16 }}>
                {field('Ծ. Տ.', 'info', 'textarea', false, 'Ա., հ. ե. կ. մ. ժ.')}
              </div>
            </div>

            <div style={{ background:'var(--warm-white)', border:'1px solid var(--parchment)', borderRadius:8, padding:24 }}>
              <OrnamentDivider label="ԴՐ. ՄԱUԻՆ" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
                {field('Ձ. Ա-Ա.', 'submitter_name')}
                {field('Էլ-փ.', 'submitter_email', 'email')}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding:'14px 32px', fontSize:'0.85rem', letterSpacing:'0.12em' }} disabled={status === 'sending'}>
              {status === 'sending' ? '✦ Ուղ. կ-ի...' : 'ՈՒՂԱՐԿ. ՀԱՅՏ →'}
            </button>

            {status === 'error' && (
              <p style={{ color:'var(--crimson)', fontSize:'0.88rem', textAlign:'center' }}>
                Սխ. Խ. կ.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

/* ─── Demo data (fallback when API offline) ──────────────────────── */
const DEMO_CHURCHES = [
  { id:'1', type:'Եկեղեցի', name:'Սուրբ Աստվածածին', building_year:'1797', country:'Ադրբեջան', city:'Բաքու', state:'Կիսավեր', picture:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Views_of_Ichery_Sheher_1987.jpg/960px-Views_of_Ichery_Sheher_1987.jpg', info:'Վ. Ա. Ա.' },
  { id:'7', type:'Եկեղեցի', name:'Սուրբ Հովհաննես', building_year:'1633', country:'Ադրբ.', city:'Գ.', state:'Կ.', picture:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Saint_Iohann_church_in_Ganja_1.jpg/960px-Saint_Iohann_church_in_Ganja_1.jpg', info:'' },
  { id:'175', type:'Եկ.', name:'Սուրբ Փրկիչ', building_year:'1891', country:'ԱՄ.', city:'Ո.', state:'Կ.', picture:'https://upload.wikimedia.org/wikipedia/commons/4/43/Worcester_Armenian_church.png', info:'' },
]
const DEMO_TIMELINE = [
  { id:'a27', name:'Ս.Բ. Ջ.', year:1308, century:14, type:'Ե.', country:'Ի.', city:'Ջ.', state:'Կ.', picture:null },
  { id:'a29', name:'Ս.Խ. Վ.', year:1688, century:17, type:'Ե.', country:'Ի.', city:'Վ.', state:'Կ.', picture:null },
  { id:'a2', name:'Վ.Մ.Վ.', year:1810, century:19, type:'Վ.', country:'Ա.', city:'Վ.', state:'Կ.', picture:null },
  { id:'175', name:'Ս.Փ.', year:1891, century:19, type:'Ե.', country:'ԱՄ.', city:'Ո.', state:'Կ.', picture:null },
]
const DEMO_STATS = {
  total:63, standing:55, ruined:4, semi_ruined:3, countries:18,
  by_type:[{name:'Եկ.',value:54},{name:'Տ.',value:5},{name:'Մ.',value:2},{name:'Վ.',value:2}],
  by_state:[{name:'Կ.',value:55},{name:'Ա.',value:4},{name:'Կ.',value:3},{name:'Չ.Տ.',value:1}],
  by_country:[{name:'ԱՄՆ',value:20},{name:'Ա.',value:13},{name:'Բ.',value:9},{name:'Կ.',value:7}],
  by_century:[{name:'13-ին',value:1,century:13},{name:'14-ին',value:1,century:14},{name:'17-ին',value:3,century:17},{name:'19-ին',value:12,century:19},{name:'20-ին',value:31,century:20},{name:'21-ին',value:3,century:21}],
  top_names:[{name:'Ս.Գ.Լ.',value:12},{name:'Ս.Ա.',value:9},{name:'Ս.Հ.',value:8},{name:'Ս.Կ.',value:6},{name:'Ս.Ս.',value:5}],
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
      {/* Background ornaments */}
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
          <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
            {[['🏛️','Եկ. Վ. Մ. Տ.'],['🌍','20+ Երկ.'],['📅','VIII – XXI դդ.'],['🔬','Ընթ. Է']].map(([e,l]) => (
              <span key={l} style={{ fontSize:'0.72rem', fontFamily:'Cinzel,serif', letterSpacing:'0.06em', color:'rgba(237,217,163,0.7)', display:'flex', alignItems:'center', gap:4 }}>
                {e} {l}
              </span>
            ))}
          </div>
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

      {/* Navigation */}
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

      {/* Main content */}
      <main style={{ flex:1, maxWidth:1200, margin:'0 auto', width:'100%', padding:'32px 32px 60px' }}>
        <div key={tab} className="fade-in">
          {tab === 'catalog'  && <CatalogTab   filters={filters} />}
          {tab === 'timeline' && <TimelineTab />}
          {tab === 'stats'    && <StatsTab />}
          {tab === 'chat'     && <ChatbotTab />}
          {tab === 'submit'   && <SubmitTab filters={filters} />}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background:'var(--warm-dark)', color:'rgba(237,217,163,0.6)',
        textAlign:'center', padding:'24px 32px',
        fontFamily:'Cinzel,serif', fontSize:'0.72rem', letterSpacing:'0.1em'
      }}>
        <ArmenianCross size={24} color="var(--gold)" />
        <p style={{ marginTop:8 }}>ՀԱՅԿԱԿԱՆ ԺԱՌԱՆԳՈՒԹՅՈՒՆ © {new Date().getFullYear()} · Ընթ. Է · Բ. Ա. Է Ա.</p>
      </footer>
    </div>
  )
}