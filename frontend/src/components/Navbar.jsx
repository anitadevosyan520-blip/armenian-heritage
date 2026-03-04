import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { id: 'home', label: 'Գլխավոր', en: 'Home' },
  { id: 'timeline', label: 'Ժամանակագիծ', en: 'Timeline' },
  { id: 'charts', label: 'Վիճակագրություն', en: 'Analytics' },
  { id: 'explorer', label: 'Ուսումնասիրել', en: 'Explore' },
  { id: 'submit', label: 'Ավելացնել', en: 'Submit' },
]

export default function Navbar({ activeSection, scrollTo }) {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(250,246,238,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--parchment-deep)',
      boxShadow: '0 2px 16px rgba(30,13,5,0.08)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div
          onClick={() => scrollTo('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--vordan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '18px', fontFamily: "'Cormorant Garamond', serif",
            fontWeight: '700', flexShrink: 0,
          }}>Հ</div>
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '17px', fontWeight: '700',
              color: 'var(--text)', lineHeight: '1.1',
            }}>Հայկական Ժառանգություն</div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Armenian Heritage
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              style={{ border: 'none', background: 'none' }}
              title={item.en}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile menu */}
        <button
          onClick={() => setOpen(!open)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
          className="mobile-menu-btn"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          background: 'var(--cream)', borderTop: '1px solid var(--parchment-deep)',
          padding: '12px 24px',
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { scrollTo(item.id); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 0', borderBottom: '1px solid var(--parchment-deep)',
                fontFamily: "'Nunito', sans-serif", fontSize: '15px',
                color: activeSection === item.id ? 'var(--vordan)' : 'var(--text)',
                fontWeight: '600',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
