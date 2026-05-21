import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TEAM, TYPE_COLORS } from '../data/team'
import { Avatar, LeaveBadge } from './UI'
import { isoDate, todayISO, leavesOnDate, fmtDate } from '../utils'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const DOWS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Calendar({ leaves, onLogLeave }) {
  const [year,  setYear]  = useState(2026)
  const [month, setMonth] = useState(3)
  const [filterEmp,  setFilterEmp]  = useState('')
  const [filterType, setFilterType] = useState('')
  const [selected,   setSelected]   = useState(null)

  const today = todayISO()

  function move(d) {
    let m = month + d, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonth(m); setYear(y); setSelected(null)
  }

  const first = new Date(year, month, 1)
  const startCell = new Date(first)
  startCell.setDate(1 - first.getDay())

  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startCell)
    d.setDate(startCell.getDate() + i)
    return d
  })

  function dayLeaves(dk) {
    let dl = leavesOnDate(leaves, dk)
    if (filterEmp)  dl = dl.filter(l => l.emp === filterEmp)
    if (filterType) dl = dl.filter(l => l.type === filterType)
    return dl
  }

  const selLeaves = selected ? dayLeaves(selected) : []

  return (
    <div className="animate-fade-in space-y-4">

      {/* Nav */}
      <div className="flex items-center gap-3">
        <button className="btn-ghost !p-1.5" onClick={() => move(-1)}><ChevronLeft size={16}/></button>
        <span className="text-[16px] font-semibold text-white min-w-[150px]">
          {MONTHS[month]} {year}
        </span>
        <button className="btn-ghost !p-1.5" onClick={() => move(1)}><ChevronRight size={16}/></button>

        <div className="ml-auto flex gap-2">
          <select className="input-base !w-[180px] !py-1.5 text-xs"
            value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
            <option value="">All employees</option>
            {TEAM.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
          <select className="input-base !w-[130px] !py-1.5 text-xs"
            value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All types</option>
            <option value="planned">Planned</option>
            <option value="sick">Sick</option>
            <option value="wfh">WFH</option>
            <option value="holiday">Holiday</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card p-3">
        {/* DOW header */}
        <div className="grid grid-cols-7 mb-1.5">
          {DOWS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-white/25 uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const dk = isoDate(d)
            const inMonth  = d.getMonth() === month
            const isToday  = dk === today
            const isWknd   = d.getDay() === 0 || d.getDay() === 6
            const dl       = dayLeaves(dk)
            const isSelected = selected === dk

            return (
              <div key={i} onClick={() => setSelected(isSelected ? null : dk)}
                className={`
                  rounded-md min-h-[68px] p-1.5 cursor-pointer transition-all text-left
                  border
                  ${!inMonth  ? 'opacity-25 pointer-events-none' : ''}
                  ${isWknd    ? 'bg-white/[0.02]' : 'bg-surface-2'}
                  ${isToday   ? 'border-brand-500 bg-brand-500/5' : 'border-white/[0.06]'}
                  ${isSelected? '!border-white/20 !bg-surface-3' : ''}
                  ${!isSelected && !isToday ? 'hover:border-white/10 hover:bg-surface-3' : ''}
                `}>
                <div className={`text-[11px] font-mono mb-1
                  ${isToday ? 'text-brand-400 font-bold' : 'text-white/25'}`}>
                  {d.getDate()}
                </div>
                {dl.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {dl.slice(0, 6).map((l, j) => (
                      <div key={j} className="w-[5px] h-[5px] rounded-full"
                        style={{ background: TYPE_COLORS[l.type]?.dot || '#f85149' }}
                        title={`${l.emp}: ${l.type}`} />
                    ))}
                    {dl.length > 6 && (
                      <span className="text-[9px] text-white/25">+{dl.length - 6}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail */}
      {selected && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[13px] font-medium text-white/80">
              {new Date(selected + 'T00:00:00').toLocaleDateString('en-IN',
                { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className="badge bg-white/5 text-white/30">{selLeaves.length} on leave</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {selLeaves.length ? selLeaves.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
                <Avatar name={l.emp} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-white/80">{l.emp}</div>
                  <div className="text-[11px] text-white/30">
                    {l.type === 'wfh' ? 'Working from home' : l.type}
                    {l.note ? ` · ${l.note}` : ''}
                    {' · '}{fmtDate(l.from)}{l.to !== l.from ? ` → ${fmtDate(l.to)}` : ''}
                  </div>
                </div>
                <LeaveBadge type={l.type} />
              </div>
            )) : (
              <div className="py-6 text-center text-[13px] text-white/20">
                Everyone available on this day
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
