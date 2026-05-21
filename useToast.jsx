import { useMemo } from 'react'
import { Clock, TrendingUp, Users, CalendarCheck, Plus } from 'lucide-react'
import { Avatar, LeaveBadge, SectionCard } from '../components/UI'
import { TEAM } from '../data/team'
import { todayISO, leavesOnDate, dayCount, isOnLeaveToday, fmtDate } from '../utils'

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-semibold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-white/25 mt-1.5">{sub}</div>}
    </div>
  )
}

function AvailBar({ leaves }) {
  const today = new Date()
  const bars = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dk = d.toISOString().slice(0, 10)
    const cnt = leavesOnDate(leaves, dk).length
    const pct = (cnt / TEAM.length) * 100
    const col = pct > 20 ? '#f85149' : pct > 10 ? '#d29922' : '#3fb950'
    return { dk, cnt, pct, col, day: d.getDate() }
  })
  return (
    <div>
      <div className="flex items-end gap-1 h-16">
        {bars.map(b => (
          <div key={b.dk} className="flex-1 rounded-t-[3px] transition-all"
            style={{ height: `${Math.max(6, b.pct * 0.64)}px`, background: b.col }}
            title={`${b.dk}: ${b.cnt} on leave`} />
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {bars.map(b => (
          <div key={b.dk} className="flex-1 text-center text-[9px] font-mono text-white/25">{b.day}</div>
        ))}
      </div>
      <div className="flex gap-3 mt-3 text-[11px] text-white/30">
        {[['#3fb950','Low'],['#d29922','Medium'],['#f85149','High']].map(([c,l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px]" style={{background:c}} />{l}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ leaves, onLogLeave }) {
  const today = todayISO()
  const total = TEAM.length
  const onLeaveToday = useMemo(() => TEAM.filter(m => isOnLeaveToday(leaves, m.name)), [leaves])
  const avail = total - onLeaveToday.length
  const totalDays = leaves.reduce((a, l) => a + dayCount(l), 0)

  const upcoming = useMemo(() =>
    [...leaves]
      .filter(l => new Date(l.from + 'T00:00:00') > new Date())
      .sort((a, b) => new Date(a.from) - new Date(b.from))
      .slice(0, 7),
    [leaves])

  const topByDays = useMemo(() => {
    const map = {}
    leaves.forEach(l => { map[l.emp] = (map[l.emp] || 0) + dayCount(l) })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [leaves])

  const recent = useMemo(() => [...leaves].slice(0, 5), [leaves])

  return (
    <div className="animate-fade-in space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total employees" value={total} sub="Claims1 · PI2 2026" />
        <StatCard label="Available today" value={avail} color="text-green-400"
          sub={`${Math.round((avail/total)*100)}% of team`} />
        <StatCard label="On leave today" value={onLeaveToday.length} color={onLeaveToday.length ? 'text-red-400' : 'text-white'}
          sub="Across all teams" />
        <StatCard label="Total entries" value={leaves.length} sub={`${totalDays} days logged`} />
      </div>

      {/* Today strip */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3">
        <div className="text-[11px] font-medium text-brand-400 mb-2">
          Today — {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {onLeaveToday.length
            ? onLeaveToday.map(m => (
                <span key={m.name} className="px-2.5 py-0.5 rounded-full text-[11px]
                  bg-red-500/10 text-red-400 font-medium">
                  {m.name.split(' ').slice(0,2).join(' ')}
                </span>
              ))
            : <span className="text-[12px] text-green-400">Everyone is available today</span>
          }
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-3">

        {/* Upcoming — 3 cols */}
        <div className="col-span-3">
          <SectionCard title="Upcoming leaves" icon={Clock}
            action={<span className="badge bg-white/5 text-white/30">{upcoming.length}</span>}>
            <div className="divide-y divide-white/[0.04]">
              {upcoming.length ? upcoming.map(l => (
                <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                  <Avatar name={l.emp} size={28} fontSize={10} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white/80 truncate">{l.emp}</div>
                    <div className="text-[11px] text-white/30">
                      {fmtDate(l.from)}{l.to !== l.from ? ` → ${fmtDate(l.to)}` : ''} · {dayCount(l)} day{dayCount(l) > 1 ? 's' : ''}
                    </div>
                  </div>
                  <LeaveBadge type={l.type} />
                </div>
              )) : (
                <div className="py-8 text-center text-[13px] text-white/20">No upcoming leaves</div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right col — 2 cols */}
        <div className="col-span-2 space-y-3">

          {/* Top by days */}
          <SectionCard title="Top leave-takers" icon={TrendingUp}>
            <div className="divide-y divide-white/[0.04]">
              {topByDays.map(([name, days], i) => (
                <div key={name} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02]">
                  <span className="text-[10px] font-mono text-white/20 w-4 text-right">{i+1}</span>
                  <Avatar name={name} size={22} fontSize={8} />
                  <span className="flex-1 text-[12px] text-white/70 truncate">{name}</span>
                  <span className="text-[12px] font-semibold font-mono text-white/50">
                    {days}<span className="text-[10px] font-normal text-white/20">d</span>
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recently added */}
          <SectionCard title="Recently added" icon={CalendarCheck}>
            <div className="divide-y divide-white/[0.04]">
              {recent.map(l => (
                <div key={l.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02]">
                  <Avatar name={l.emp} size={22} fontSize={8} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-white/70 truncate">{l.emp.split(' ')[0]}</div>
                    <div className="text-[10px] text-white/25 font-mono">{fmtDate(l.from)}</div>
                  </div>
                  <LeaveBadge type={l.type} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Availability heatmap */}
      <SectionCard title="Availability — next 14 days" icon={Users}>
        <div className="px-4 py-4">
          <AvailBar leaves={leaves} />
        </div>
      </SectionCard>
    </div>
  )
}
