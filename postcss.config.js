const AVATAR_PALETTE = [
  '#f97316','#3b82f6','#8b5cf6','#10b981',
  '#ec4899','#14b8a6','#f59e0b','#6366f1',
]

export function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

export function todayISO() {
  return isoDate(new Date())
}

export function datesInRange(from, to) {
  const res = []
  let d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    res.push(isoDate(d))
    d.setDate(d.getDate() + 1)
  }
  return res
}

export function dayCount(leave) {
  return datesInRange(leave.from, leave.to).length
}

export function fmtDate(s, opts = {}) {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', ...opts,
  })
}

export function fmtDateFull(s) {
  return fmtDate(s, { year: 'numeric' })
}

export function initials(name) {
  const p = name.trim().split(' ')
  return ((p[0] || '')[0] || '').toUpperCase() +
         ((p[1] || '')[0] || '').toUpperCase()
}

export function avatarColor(name) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[h]
}

export function uid() {
  return 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function leavesOnDate(leaves, dateStr) {
  return leaves.filter(l => datesInRange(l.from, l.to).includes(dateStr))
}

export function totalDaysForEmp(leaves, emp, month) {
  return leaves
    .filter(l => l.emp === emp)
    .reduce((acc, l) => {
      const days = datesInRange(l.from, l.to).filter(d => {
        const mo = new Date(d + 'T00:00:00').getMonth()
        return month === undefined || mo === month
      })
      return acc + days.length
    }, 0)
}

export function isOnLeaveToday(leaves, emp) {
  return leavesOnDate(leaves, todayISO()).some(l => l.emp === emp)
}
