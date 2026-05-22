import { useMemo } from 'react'
import { Clock, TrendingUp, CalendarCheck } from 'lucide-react'
import { Avatar, LeaveBadge } from './UI'
import { TEAM } from '../data/team'
import { todayISO, leavesOnDate, dayCount, isOnLeaveToday, fmtShort, isoDate } from '../utils'

export default function Dashboard({ leaves }) {
  const today = todayISO()
  const onLeaveToday = useMemo(() => TEAM.filter(m => isOnLeaveToday(leaves, m.name)), [leaves])
  const avail = TEAM.length - onLeaveToday.length
  const totalDays = leaves.reduce((a, l) => a + dayCount(l), 0)

  const upcoming = useMemo(() =>
    [...leaves].filter(l => new Date(l.from + 'T00:00:00') > new Date())
      .sort((a, b) => new Date(a.from) - new Date(b.from)).slice(0, 7), [leaves])

  const topByDays = useMemo(() => {
    const m = {}; leaves.forEach(l => { m[l.emp] = (m[l.emp] || 0) + dayCount(l) })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [leaves])

  const recent = useMemo(() => [...leaves].slice(0, 5), [leaves])

  const heatmap = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    const dk = isoDate(d); const cnt = leavesOnDate(leaves, dk).length
    const pct = cnt / TEAM.length
    return { dk, cnt, pct, day: d.getDate(), col: pct > .2 ? '#f85149' : pct > .1 ? '#d29922' : '#3fb950' }
  }), [leaves])

  const Stat = ({ label, val, sub, valColor = 'text-white' }) => (
    <div className="stat-card animate-fade-in">
      <div className="text-[10px] font-medium text-white/25 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-semibold tracking-tight ${valColor}`}>{val}</div>
      {sub && <div className="text-[11px] text-white/25 mt-1">{sub}</div>}
    </div>
  )

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Total employees" val={TEAM.length}             sub="Claims1 · PI2 2026" />
        <Stat label="Available today" val={avail}                   sub={`${Math.round(avail/TEAM.length*100)}% of team`}  valColor="text-green-400" />
        <Stat label="On leave today"  val={onLeaveToday.length}     sub="Across all teams"   valColor={onLeaveToday.length ? 'text-red-400' : 'text-white'} />
        <Stat label="Total entries"   val={leaves.length}           sub={`${totalDays} days logged`} />
      </div>

      {/* Today strip */}
      <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3">
        <div className="text-[11px] font-medium text-brand-400 mb-2">
          Today — {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {onLeaveToday.length
            ? onLeaveToday.map(m => <span key={m.name} className="px-2.5 py-0.5 rounded-full text-[11px] bg-red-500/10 text-red-400 font-medium">{m.name.split(' ').slice(0,2).join(' ')}</span>)
            : <span className="text-[12px] text-green-400">Everyone is available today</span>}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {/* Upcoming — 3 cols */}
        <div className="col-span-3 card">
          <div className="sec-hdr"><span className="text-[13px] font-medium text-white/80 flex items-center gap-2"><Clock size={14} className="text-white/30"/>Upcoming leaves</span><span className="badge bg-white/5 text-white/30">{upcoming.length}</span></div>
          <div className="divide-y divide-white/[0.04]">
            {upcoming.length ? upcoming.map(l => (
              <div key={l.id} className="prow">
                <Avatar name={l.emp} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white/80 truncate">{l.emp}</div>
                  <div className="text-[11px] text-white/30">{fmtShort(l.from)}{l.to !== l.from ? ` → ${fmtShort(l.to)}` : ''} · {dayCount(l)} day{dayCount(l) > 1 ? 's' : ''}</div>
                </div>
                <LeaveBadge type={l.type} />
              </div>
            )) : <div className="py-8 text-center text-[13px] text-white/20">No upcoming leaves</div>}
          </div>
        </div>

        {/* Side cards — 2 cols */}
        <div className="col-span-2 space-y-3">
          <div className="card">
            <div className="sec-hdr"><span className="text-[13px] font-medium text-white/80 flex items-center gap-2"><TrendingUp size={14} className="text-white/30"/>Top leave-takers</span></div>
            {topByDays.map(([n, d], i) => (
              <div key={n} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02]">
                <span className="text-[10px] font-mono text-white/20 w-4 text-right">{i+1}</span>
                <Avatar name={n} size={22} fontSize={8} />
                <span className="flex-1 text-[12px] text-white/60 truncate">{n}</span>
                <span className="text-[12px] font-semibold font-mono text-white/50">{d}<span className="text-[10px] font-normal text-white/20">d</span></span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="sec-hdr"><span className="text-[13px] font-medium text-white/80 flex items-center gap-2"><CalendarCheck size={14} className="text-white/30"/>Recently added</span></div>
            {recent.map(l => (
              <div key={l.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.02]">
                <Avatar name={l.emp} size={22} fontSize={8} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-white/60 truncate">{l.emp.split(' ')[0]}</div>
                  <div className="text-[10px] text-white/25 font-mono">{fmtShort(l.from)}</div>
                </div>
                <LeaveBadge type={l.type} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="sec-hdr"><span className="text-[13px] font-medium text-white/80">Availability — next 14 days</span></div>
        <div className="px-4 py-4">
          <div className="flex items-end gap-0.5 h-14">
            {heatmap.map(b => <div key={b.dk} className="flex-1 rounded-t-[2px] min-h-[4px]" style={{ height: `${Math.max(4, b.pct * 56)}px`, background: b.col }} title={`${b.dk}: ${b.cnt} on leave`} />)}
          </div>
          <div className="flex gap-0.5 mt-1">
            {heatmap.map(b => <div key={b.dk} className="flex-1 text-center text-[8px] font-mono text-white/20">{b.day}</div>)}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-white/30">
            {[['#3fb950','Low'],['#d29922','Medium'],['#f85149','High']].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px]" style={{background:c}} />{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
