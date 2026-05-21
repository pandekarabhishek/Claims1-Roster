import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { TEAM, TEAMS, STACKS } from '../data/team'
import { Avatar, DayChip } from './UI'
import { datesInRange, isOnLeaveToday, totalDaysForEmp } from '../utils'

export default function Roster({ leaves }) {
  const [search,  setSearch]  = useState('')
  const [teamF,   setTeamF]   = useState('')
  const [stackF,  setStackF]  = useState('')
  const [month,   setMonth]   = useState(3)

  const daysInMonth = new Date(2026, month + 1, 0).getDate()

  const filtered = useMemo(() => {
    return TEAM.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) &&
          !m.sup.toLowerCase().includes(search.toLowerCase()) &&
          !m.team.toLowerCase().includes(search.toLowerCase())) return false
      if (teamF  && m.team  !== teamF)  return false
      if (stackF && m.stack !== stackF) return false
      return true
    })
  }, [search, teamF, stackF])

  return (
    <div className="animate-fade-in space-y-4">

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-[2] min-w-[160px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input className="input-base !pl-7" placeholder="Search name, supervisor, team…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base flex-1 min-w-[120px]" value={teamF} onChange={e => setTeamF(e.target.value)}>
          <option value="">All teams</option>
          {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input-base flex-1 min-w-[110px]" value={stackF} onChange={e => setStackF(e.target.value)}>
          <option value="">All stacks</option>
          {STACKS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-base flex-1 min-w-[90px]" value={month} onChange={e => setMonth(+e.target.value)}>
          <option value={3}>April</option>
          <option value={4}>May</option>
          <option value={5}>June</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{tableLayout:'fixed'}}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[['Employee','22%'],['Team','20%'],['Stack','8%'],['Supervisor','16%'],['Leave days this month',''],['Total','8%']].map(([h,w]) => (
                  <th key={h} style={{width:w||'auto'}}
                    className="px-4 py-2.5 text-left text-[10px] font-medium text-white/25 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(m => {
                const mLeaves = leaves.filter(l => l.emp === m.name &&
                  datesInRange(l.from, l.to).some(d => new Date(d+'T00:00:00').getMonth() === month))
                const days = [...new Set(mLeaves.flatMap(l =>
                  datesInRange(l.from, l.to).filter(d => new Date(d+'T00:00:00').getMonth() === month)
                ))].sort()
                const total = totalDaysForEmp(leaves, m.name)
                const onLeave = isOnLeaveToday(leaves, m.name)

                return (
                  <tr key={m.name} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} size={28} fontSize={10} />
                        <div>
                          <div className="text-[13px] font-medium text-white/80 truncate">{m.name}</div>
                          {onLeave && (
                            <div className="text-[10px] text-red-400">On leave today</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate" title={m.team}>{m.team}</td>
                    <td className="px-4 py-2.5">
                      <span className="badge bg-white/5 text-white/40 text-[10px]">{m.stack}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate" title={m.sup}>{m.sup}</td>
                    <td className="px-4 py-2.5">
                      {days.length ? (
                        <div className="flex flex-wrap gap-0.5 items-center">
                          {days.slice(0, 20).map(d => {
                            const t = (mLeaves.find(l => datesInRange(l.from, l.to).includes(d)) || {}).type || 'planned'
                            return <DayChip key={d} date={d} type={t} />
                          })}
                          {days.length > 20 && (
                            <span className="text-[10px] text-white/25">+{days.length-20}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[13px] font-semibold font-mono
                        ${total > 8 ? 'text-red-400' : total > 3 ? 'text-amber-400' : 'text-white/40'}`}>
                        {total}
                      </span>
                      <span className="text-[10px] text-white/20"> days</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-white/20">
          {filtered.length} of {TEAM.length} employees
        </div>
      </div>
    </div>
  )
}
