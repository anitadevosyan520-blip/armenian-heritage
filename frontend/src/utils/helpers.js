export function parseYear(yearStr) {
  if (!yearStr || yearStr === '-' || yearStr === '') return null
  
  // Armenian century notation: "4-րդ դար", "17-րդ դար"
  const centuryMatch = yearStr.match(/(\d+)-(?:րդ|ին|ամ)/)
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1])
    return { century, year: (century - 1) * 100 + 50, isApprox: true, display: `${century}${getOrdinal(century)} դ.` }
  }
  
  // Numeric year
  const yearMatch = yearStr.match(/\b(\d{3,4})\b/)
  if (yearMatch) {
    const year = parseInt(yearMatch[0])
    const century = Math.ceil(year / 100)
    return { century, year, isApprox: false, display: year.toString() }
  }
  
  return null
}

function getOrdinal(n) {
  if (n === 1) return 'ին'
  if (n === 2) return 'րդ'
  return 'րդ'
}

export function getStateBadge(state) {
  if (!state) return { label: 'Անհայտ', cls: 'badge-unknown', color: 'var(--unknown)' }
  if (state.includes('Կանգուն')) return { label: 'Կանգուն', cls: 'badge-standing', color: 'var(--standing)' }
  if (state.includes('Ավեր')) return { label: 'Ավերված', cls: 'badge-destroyed', color: 'var(--destroyed)' }
  if (state.includes('Կիսավ')) return { label: 'Կիսավեր', cls: 'badge-semiruined', color: 'var(--semiruined)' }
  if (state.includes('Չկ')) return { label: 'Անհայտ', cls: 'badge-unknown', color: 'var(--unknown)' }
  return { label: state, cls: 'badge-unknown', color: 'var(--unknown)' }
}

export function getTypeIcon(type) {
  if (!type) return '⛪'
  if (type.includes('Վանք')) return '🏛️'
  if (type.includes('Տաճ')) return '⛩️'
  if (type.includes('Մատ')) return '⛪'
  return '⛪'
}

export function getCenturyLabel(century) {
  const labels = {
    1: 'Ա դ. · I c.', 2: 'Բ դ. · II c.', 3: 'Գ դ. · III c.', 4: 'Դ դ. · IV c.',
    5: 'Ե դ. · V c.', 6: 'Զ դ. · VI c.', 7: 'Է դ. · VII c.', 8: 'Ը դ. · VIII c.',
    9: 'Թ դ. · IX c.', 10: 'Ժ դ. · X c.', 11: 'ԺԱ դ. · XI c.', 12: 'ԺԲ դ. · XII c.',
    13: 'ԺԳ դ. · XIII c.', 14: 'ԺԴ դ. · XIV c.', 15: 'ԺԵ դ. · XV c.',
    16: 'ԺԶ դ. · XVI c.', 17: 'ԺԷ դ. · XVII c.', 18: 'ԺԸ դ. · XVIII c.',
    19: 'ԺԹ դ. · XIX c.', 20: 'Ի դ. · XX c.', 21: 'ԻԱ դ. · XXI c.',
  }
  return labels[century] || `${century}c.`
}
