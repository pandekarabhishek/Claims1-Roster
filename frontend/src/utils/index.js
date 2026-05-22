const PALETTE = ['#f97316','#3b82f6','#8b5cf6','#10b981','#ec4899','#14b8a6','#f59e0b','#6366f1']

export const isoDate  = d => d.toISOString().slice(0, 10)
export const todayISO = () => isoDate(new Date())

export function datesInRange(from, to) {
  const r = []; let d = new Date(from + 'T00:00:00')
  const e = new Date(to + 'T00:00:00')
  while (d <= e) { r.push(isoDate(d)); d.setDate(d.getDate() + 1) }
  return r
}

export const dayCount       = l => datesInRange(l.from, l.to).length
export const leavesOnDate   = (ls, dk) => ls.filter(l => datesInRange(l.from, l.to).includes(dk))
export const isOnLeaveToday = (ls, emp) => leavesOnDate(ls, todayISO()).some(l => l.emp === emp)
export const fmtShort       = s => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

export function initials(name) {
  const p = name.trim().split(' ')
  return ((p[0]||'')[0]||'').toUpperCase() + ((p[1]||'')[0]||'').toUpperCase()
}
export function avatarColor(name) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length
  return PALETTE[h]
}
