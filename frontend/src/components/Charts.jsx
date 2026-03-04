import { useEffect, useRef, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS_STATE = {
  'Կանգուն': '#4a7c59',
  'Ավերված': '#8B1A1A',
  'Կիսավեր': '#B8862E',
  'Անհայտ': '#9e9e9e',
}

const CENTURY_LABELS = {
  4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI',
  17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--stone-light)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontFamily: 'Nunito, sans-serif' }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '4px 0 0', color: p.color || 'var(--vordan)', fontSize: 12 }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="card" style={{ padding: '28px 24px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>{title}</h3>
      {subtitle && <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>{subtitle}</p>}
      {children}
    </div>
  )
}

export default function Charts({ stats }) {
  if (!stats) return null

  // By century
  const centuryData = Object.entries(stats.by_century || {})
    .map(([k, v]) => ({ century: CENTURY_LABELS[parseInt(k)] || k, count: v, raw: parseInt(k) }))
    .filter(d => d.raw > 0)
    .sort((a, b) => a.raw - b.raw)

  // By state
  const stateData = Object.entries(stats.by_state || {}).map(([k, v]) => ({ name: k, value: v }))

  // Top countries
  const countryData = Object.entries(stats.by_country || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([k, v]) => ({ country: k.length > 12 ? k.slice(0, 12) + '…' : k, count: v, fullName: k }))

  // Top names
  const nameData = (stats.top_names || []).slice(0, 10).map(([k, v]) => ({ name: k.length > 18 ? k.slice(0, 18) + '…' : k, count: v }))

  const pieColors = ['#4a7c59', '#8B1A1A', '#B8862E', '#9e9e9e', '#6B4F3A']

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.06) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
        {(percent * 100).toFixed(0)}%
      </text>
    )
  }

  return (
    <section id="charts" style={{ background: 'var(--parchment)', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 13, letterSpacing: 3, color: 'var(--vordan)', textTransform: 'uppercase', marginBottom: 12 }}>Վիճակագրություն</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Տվյալների Վերլուծություն</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Nunito, sans-serif' }}>Data analysis of Armenian sacred architecture</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 24 }}>
          {/* Century chart */}
          <ChartCard title="Կառույցներ ըստ դարերի" subtitle="Structures by century">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={centuryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-light)" />
                <XAxis dataKey="century" tick={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Structures" fill="var(--vordan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* State pie chart */}
          <ChartCard title="Կառույցների Վիճակը" subtitle="Current condition of structures">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stateData} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false} label={<CustomPieLabel />}>
                  {stateData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS_STATE[entry.name] || pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ fontFamily: 'Noto Serif Armenian, serif', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
          {/* Countries */}
          <ChartCard title="Կառույցներ ըստ երկրների" subtitle="Top 15 countries by number of churches">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-light)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="country" width={60} tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: 'var(--text)' }} />
                <Tooltip content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: 'var(--cream)', border: '1px solid var(--stone-light)', borderRadius: 8, padding: '8px 12px', fontFamily: 'Nunito' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{payload[0]?.payload?.fullName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--vordan)' }}>{payload[0]?.value} structures</p>
                  </div>
                ) : null} />
                <Bar dataKey="count" name="Structures" fill="var(--gold)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top names */}
          {nameData.length > 0 && (
            <ChartCard title="Ամենատարածված Անվանումները" subtitle="Most common church names">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={nameData} layout="vertical" margin={{ top: 5, right: 20, left: 90, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--stone-light)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fontFamily: 'Noto Serif Armenian, sans-serif', fill: 'var(--text)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" fill="var(--vordan-light)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      </div>
    </section>
  )
}
