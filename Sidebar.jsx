import { useMemo, useState } from 'react'
import { TEAM } from '../data/team'
import { Avatar, DayChip } from './UI'
import { isoDate, datesInRange, leavesOnDate, isOnLeaveToday } from '../utils'

export default function Availability({ leaves }) {
  const [month, setMonth] = useState(3)
  const today = new Date()
  const daysInMonth = new Date(2026, month + 1, 0).getDate()
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // 21-day heatmap
  const heatmap = useMemo(() =>
    Array.from({ length: 21 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dk = isoDate(d)
      const cnt = leavesOnDate(leaves, dk).length
      const pct = cnt / TEAM.length
      return { dk, cnt, pct, day: d.getDate(),
        col: pct > 0.2 ? '#f85149' : pct > 0.1 ? '#d29922' : '#3fb950' }
    }), [leaves])

  // Team breakdown
  const teams = useMemo(() => {
    const raw = [...new Set(TEAM.map(m => m.team.split('/')[0].trim()))].sort().slice(0, 8)
    return raw.map(team => {
      const members = TEAM.filter(m => m.team.includes(team))
      const daysOff = leaves.filter(l => members.some(m => m.name === l.emp))
        .reduce((a, l) => a + datesInRange(l.from, l.to)
          .filter(d => new Date(d + 'T00:00:00').getMonth() === month).length, 0)
      const pct = members.length ? Math.min(100, Math.round((daysOff / (members.length * 22)) * 100)) : 0
      return { team, members: members.length, daysOff, pct }
    })
  }, [leaves, month])

  return (
    <div className="animate-fade-in space-y-4">

      {/* Top row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Heatmap */}
        <div className="card">
          <div className="px-4 py-3 border-b border-white/[0.06] text-[13px] font-medium text-white/80">
            Team availability — next 21 days
          </div>
          <div className="p-4">
            <div className="flex items-end gap-0.5 h-16">
              {heatmap.map(b => (
                <div key={b.dk} className="flex-1 rounded-t-[2px] min-h-[4px] transition-all"
                  style={{ height: `${Math.max(4, b.pct * 64)}px`, background: b.col }}
                  title={`${b.dk}: ${b.cnt} on leave`} />
              ))}
            </div>
            <div className="flex gap-0.5 mt-1">
              {heatmap.map(b => (
                <div key={b.dk} className="flex-1 text-center text-[8px] font-mono text-white/20">{b.day}</div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[11px] text-white/30">
              {[['#3fb950','Low'],['#d29922','Medium'],['#f85149','High']].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-[2px]" style={{background:c}} />{l} absence
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* By team */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[13px] font-medium text-white/80">By team</span>
            <select className="input-base !w-[90px] !py-1 text-xs"
              value={month} onChange={e => setMonth(+e.target.value)}>
              {[3,4,5].map(m => <option key={m} value={m}>{MONTHS[m]}</option>)}
            </select>
          </div>
          <div className="p-4 space-y-3">
            {teams.map(t => (
              <div key={t.team}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-white/50 truncate max-w-[160px]">{t.team}</span>
                  <span className="text-white/25 font-mono">{t.members}p · {t.daysOff}d</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${t.pct}%`,
                      background: t.pct > 30 ? '#f85149' : t.pct > 15 ? '#d29922' : '#3fb950' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual table */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-[13px] font-medium text-white/80">Individual availability</span>
          <select className="input-base !w-[90px] !py-1 text-xs"
            value={month} onChange={e => setMonth(+e.target.value)}>
            {[3,4,5].map(m => <option key={m} value={m}>{['April','May','June'][m-3]}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{tableLayout:'fixed'}}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[['Employee','22%'],['Team','20%'],['Stack','9%'],['Supervisor','18%'],['Leave days',''],['Total',`9%`]].map(([h,w]) => (
                  <th key={h} style={{width:w||'auto'}}
                    className="px-4 py-2.5 text-left text-[10px] font-medium text-white/25 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {TEAM.map(m => {
                const mLeaves = leaves.filter(l => l.emp === m.name &&
                  datesInRange(l.from, l.to).some(d => new Date(d+'T00:00:00').getMonth() === month))
                const days = [...new Set(mLeaves.flatMap(l =>
                  datesInRange(l.from, l.to).filter(d => new Date(d+'T00:00:00').getMonth() === month)
                ))].sort()
                const onLeave = isOnLeaveToday(leaves, m.name)

                return (
                  <tr key={m.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} size={26} fontSize={9} />
                        <div>
                          <div className="text-[13px] font-medium text-white/80 truncate">{m.name}</div>
                          {onLeave && <div className="text-[10px] text-red-400">On leave today</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate">{m.team}</td>
                    <td className="px-4 py-2.5">
                      <span className="badge bg-white/5 text-white/40 text-[10px]">{m.stack}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate">{m.sup}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-0.5">
                        {days.slice(0, 16).map(d => {
                          const t = (mLeaves.find(l => datesInRange(l.from, l.to).includes(d)) || {}).type || 'planned'
                          return <DayChip key={d} date={d} type={t} />
                        })}
                        {days.length > 16 && (
                          <span className="text-[10px] text-white/25 ml-0.5">+{days.length-16}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[13px] font-semibold font-mono
                        ${days.length > 5 ? 'text-red-400' : days.length > 2 ? 'text-amber-400' : 'text-white/50'}`}>
                        {days.length}
                      </span>
                      <span className="text-[10px] text-white/20">/{daysInMonth}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
