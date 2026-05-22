import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react'
import { Avatar, LeaveBadge, DayChip } from './UI'
import { TEAM, TEAMS, STACKS, TYPE_LABELS, TYPE_CFG, MONTHS } from '../data/team'
import { isoDate, todayISO, datesInRange, leavesOnDate, isOnLeaveToday, dayCount, fmtShort } from '../utils'

/* ═══════════════════════════════════
   CALENDAR
═══════════════════════════════════ */
export function CalendarView({ leaves }) {
  const [year,  setYear]  = useState(2026)
  const [month, setMonth] = useState(3)
  const [fEmp,  setFEmp]  = useState('')
  const [fType, setFType] = useState('')
  const [sel,   setSel]   = useState(null)
  const today = todayISO()

  function move(d) { let m=month+d,y=year; if(m>11){m=0;y++} if(m<0){m=11;y--} setMonth(m);setYear(y);setSel(null) }

  const first = new Date(year, month, 1)
  const start = new Date(first); start.setDate(1 - first.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d })

  const dl = (dk) => {
    let r = leavesOnDate(leaves, dk)
    if (fEmp)  r = r.filter(l => l.emp  === fEmp)
    if (fType) r = r.filter(l => l.type === fType)
    return r
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button className="btn-ghost !p-1.5" onClick={() => move(-1)}><ChevronLeft size={16}/></button>
        <span className="text-[16px] font-semibold min-w-[150px]">{MONTHS[month]} {year}</span>
        <button className="btn-ghost !p-1.5" onClick={() => move(1)}><ChevronRight size={16}/></button>
        <div className="ml-auto flex gap-2">
          <select className="input !w-[180px] !py-1.5 text-xs" value={fEmp} onChange={e=>setFEmp(e.target.value)}>
            <option value="">All employees</option>
            {TEAM.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
          <select className="input !w-[130px] !py-1.5 text-xs" value={fType} onChange={e=>setFType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-3">
        <div className="grid grid-cols-7 mb-1.5">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d} className="text-center text-[10px] font-medium text-white/25 uppercase tracking-wider py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const dk = isoDate(d); const inM = d.getMonth()===month
            const isT = dk===today; const isW = d.getDay()===0||d.getDay()===6
            const dayLeaves = dl(dk); const isSel = sel===dk
            return (
              <div key={i} onClick={() => inM && setSel(isSel ? null : dk)}
                className={`rounded-md min-h-[64px] p-1.5 cursor-pointer transition-all border text-left
                  ${!inM?'opacity-20 pointer-events-none':''} ${isW?'bg-white/[0.02]':'bg-surface-2'}
                  ${isT?'border-brand-500 bg-brand-500/5':'border-white/[0.06]'}
                  ${isSel?'!border-white/20 !bg-surface-3':''}
                  ${!isSel&&!isT?'hover:border-white/10 hover:bg-surface-3':''}`}>
                <div className={`text-[11px] font-mono mb-1 ${isT?'text-brand-400 font-bold':'text-white/25'}`}>{d.getDate()}</div>
                {dayLeaves.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {dayLeaves.slice(0,6).map((l,j)=><div key={j} className="w-[5px] h-[5px] rounded-full" style={{background:TYPE_CFG[l.type]?.dot||'#f85149'}} title={`${l.emp}`}/>)}
                    {dayLeaves.length>6&&<span className="text-[9px] text-white/25">+{dayLeaves.length-6}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {sel && (
        <div className="card animate-slide-up">
          <div className="sec-hdr">
            <span className="text-[13px] font-medium">{new Date(sel+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</span>
            <span className="badge bg-white/5 text-white/30">{dl(sel).length} on leave</span>
          </div>
          {dl(sel).length ? dl(sel).map(l=>(
            <div key={l.id} className="prow">
              <Avatar name={l.emp}/>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white/80">{l.emp}</div>
                <div className="text-[11px] text-white/30">{TYPE_LABELS[l.type]}{l.note?` · ${l.note}`:''} · {fmtShort(l.from)}{l.to!==l.from?` → ${fmtShort(l.to)}`:''}</div>
              </div>
              <LeaveBadge type={l.type}/>
            </div>
          )) : <div className="py-6 text-center text-[13px] text-white/20">Everyone available</div>}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   AVAILABILITY
═══════════════════════════════════ */
export function Availability({ leaves }) {
  const [month, setMonth] = useState(3)
  const today = new Date()
  const daysInMonth = new Date(2026, month+1, 0).getDate()

  const heatmap = useMemo(() => Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate()+i); const dk = isoDate(d)
    const cnt = leavesOnDate(leaves, dk).length; const pct = cnt / TEAM.length
    return { dk, cnt, pct, day: d.getDate(), col: pct>.2?'#f85149':pct>.1?'#d29922':'#3fb950' }
  }), [leaves])

  const teams = useMemo(() => {
    const raw = [...new Set(TEAM.map(m=>m.team.split('/')[0].trim()))].sort().slice(0,8)
    return raw.map(team => {
      const members = TEAM.filter(m=>m.team.includes(team))
      const dOff = leaves.filter(l=>members.some(m=>m.name===l.emp))
        .reduce((a,l)=>a+datesInRange(l.from,l.to).filter(d=>new Date(d+'T00:00:00').getMonth()===month).length, 0)
      const pct = members.length ? Math.min(100, Math.round(dOff/(members.length*22)*100)) : 0
      return { team, members:members.length, dOff, pct }
    })
  }, [leaves, month])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="sec-hdr"><span className="text-[13px] font-medium text-white/80">Availability — next 21 days</span></div>
          <div className="p-4">
            <div className="flex items-end gap-0.5 h-14">
              {heatmap.map(b=><div key={b.dk} className="flex-1 rounded-t-[2px] min-h-[4px]" style={{height:`${Math.max(4,b.pct*56)}px`,background:b.col}} title={`${b.dk}: ${b.cnt} on leave`}/>)}
            </div>
            <div className="flex gap-0.5 mt-1">{heatmap.map(b=><div key={b.dk} className="flex-1 text-center text-[8px] font-mono text-white/20">{b.day}</div>)}</div>
            <div className="flex gap-4 mt-3 text-[11px] text-white/30">
              {[['#3fb950','Low'],['#d29922','Medium'],['#f85149','High']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-[2px]" style={{background:c}}/>{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="sec-hdr">
            <span className="text-[13px] font-medium text-white/80">By team</span>
            <select className="input !w-[90px] !py-1 text-xs" value={month} onChange={e=>setMonth(+e.target.value)}>
              {[3,4,5].map(m=><option key={m} value={m}>{['April','May','June'][m-3]}</option>)}
            </select>
          </div>
          <div className="p-4 space-y-3">
            {teams.map(t=>(
              <div key={t.team}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-white/50 truncate max-w-[160px]">{t.team}</span>
                  <span className="text-white/25 font-mono">{t.members}p · {t.dOff}d</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${t.pct}%`,background:t.pct>30?'#f85149':t.pct>15?'#d29922':'#3fb950'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-hdr">
          <span className="text-[13px] font-medium text-white/80">Individual availability</span>
          <select className="input !w-[90px] !py-1 text-xs" value={month} onChange={e=>setMonth(+e.target.value)}>
            {[3,4,5].map(m=><option key={m} value={m}>{['April','May','June'][m-3]}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{tableLayout:'fixed'}}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[['Employee','22%'],['Team','18%'],['Stack','8%'],['Supervisor','16%'],['Leave days',''],['Total','8%']].map(([h,w])=>(
                  <th key={h} style={{width:w||'auto'}} className="px-4 py-2.5 text-left text-[10px] font-medium text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {TEAM.map(m => {
                const ml = leaves.filter(l=>l.emp===m.name&&datesInRange(l.from,l.to).some(d=>new Date(d+'T00:00:00').getMonth()===month))
                const days = [...new Set(ml.flatMap(l=>datesInRange(l.from,l.to).filter(d=>new Date(d+'T00:00:00').getMonth()===month)))].sort()
                return (
                  <tr key={m.name} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Avatar name={m.name} size={24} fontSize={8}/><span className="text-[13px] font-medium text-white/80 truncate">{m.name}</span></div></td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate">{m.team}</td>
                    <td className="px-4 py-2.5"><span className="badge bg-white/5 text-white/40 text-[10px]">{m.stack}</span></td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate">{m.sup}</td>
                    <td className="px-4 py-2.5"><div className="flex flex-wrap gap-0.5">{days.slice(0,16).map(d=>{const t=(ml.find(l=>datesInRange(l.from,l.to).includes(d))||{}).type||'planned';return <DayChip key={d} date={d} type={t}/>})}{days.length>16&&<span className="text-[10px] text-white/25">+{days.length-16}</span>}</div></td>
                    <td className="px-4 py-2.5"><span className={`text-[13px] font-semibold font-mono ${days.length>5?'text-red-400':days.length>2?'text-amber-400':'text-white/50'}`}>{days.length}</span><span className="text-[10px] text-white/20">/{daysInMonth}</span></td>
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

/* ═══════════════════════════════════
   ALL LEAVES
═══════════════════════════════════ */
export function AllLeaves({ leaves, onDelete }) {
  const [search, setSearch] = useState('')
  const [typeF,  setTypeF]  = useState('')
  const [monthF, setMonthF] = useState('')
  const [sortF,  setSortF]  = useState('date-desc')
  const [deleting, setDeleting] = useState(null)

  const filtered = useMemo(() => {
    let r = [...leaves]
    if (search) r = r.filter(l => l.emp.toLowerCase().includes(search.toLowerCase()))
    if (typeF)  r = r.filter(l => l.type === typeF)
    if (monthF) { const mo = +monthF; r = r.filter(l => datesInRange(l.from,l.to).some(d=>new Date(d+'T00:00:00').getMonth()===mo)) }
    if (sortF === 'date-desc') r.sort((a,b)=>new Date(b.from)-new Date(a.from))
    else if (sortF === 'date-asc') r.sort((a,b)=>new Date(a.from)-new Date(b.from))
    else r.sort((a,b)=>a.emp.localeCompare(b.emp))
    return r
  }, [leaves, search, typeF, monthF, sortF])

  async function handleDel(id) { setDeleting(id); await onDelete(id); setDeleting(null) }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-[2] min-w-[150px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25"/>
          <input className="input !pl-7" placeholder="Search employee…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input flex-1 min-w-[120px]" value={typeF} onChange={e=>setTypeF(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input flex-1 min-w-[100px]" value={monthF} onChange={e=>setMonthF(e.target.value)}>
          <option value="">All months</option>
          <option value="3">April</option><option value="4">May</option><option value="5">June</option>
        </select>
        <select className="input flex-1 min-w-[120px]" value={sortF} onChange={e=>setSortF(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="name">By name</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0
          ? <div className="py-10 text-center text-[13px] text-white/20">No records match your filters</div>
          : <div className="divide-y divide-white/[0.04]">
              {filtered.map(l => {
                const n = dayCount(l)
                return (
                  <div key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] group transition-colors">
                    <Avatar name={l.emp} size={32} fontSize={11}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-white/80">{l.emp}</div>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <LeaveBadge type={l.type}/>
                        <span className="text-[11px] text-white/25">·</span>
                        <span className="text-[11px] text-white/40">{fmtShort(l.from)}{l.to!==l.from?` → ${fmtShort(l.to)}`:''}</span>
                        {l.note&&<><span className="text-[11px] text-white/25">·</span><span className="text-[11px] text-white/35 italic">{l.note}</span></>}
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold font-mono text-white/40 shrink-0">{n}<span className="text-[10px] font-normal text-white/20">d</span></span>
                    <button onClick={()=>handleDel(l.id)} disabled={deleting===l.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-md flex items-center justify-center bg-transparent hover:bg-red-500/10 text-white/25 hover:text-red-400 border border-transparent hover:border-red-500/20">
                      {deleting===l.id?<span className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"/>:<Trash2 size={13}/>}
                    </button>
                  </div>
                )
              })}
            </div>
        }
      </div>
      <div className="text-center text-[11px] text-white/20">{filtered.length} of {leaves.length} entries</div>
    </div>
  )
}

/* ═══════════════════════════════════
   ROSTER
═══════════════════════════════════ */
export function Roster({ leaves, searchOverride = '' }) {
  const [search, setSearch] = useState(searchOverride)
  const [teamF,  setTeamF]  = useState('')
  const [stackF, setStackF] = useState('')
  const [month,  setMonth]  = useState(3)

  const q = search || searchOverride
  const filtered = useMemo(() => TEAM.filter(m => {
    if (q && !m.name.toLowerCase().includes(q.toLowerCase()) && !m.sup.toLowerCase().includes(q.toLowerCase()) && !m.team.toLowerCase().includes(q.toLowerCase())) return false
    if (teamF  && m.team  !== teamF)  return false
    if (stackF && m.stack !== stackF) return false
    return true
  }), [q, teamF, stackF])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-[2] min-w-[150px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25"/>
          <input className="input !pl-7" placeholder="Search name, supervisor, team…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input flex-1 min-w-[120px]" value={teamF} onChange={e=>setTeamF(e.target.value)}>
          <option value="">All teams</option>
          {TEAMS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input flex-1 min-w-[110px]" value={stackF} onChange={e=>setStackF(e.target.value)}>
          <option value="">All stacks</option>
          {STACKS.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input flex-1 min-w-[90px]" value={month} onChange={e=>setMonth(+e.target.value)}>
          <option value={3}>April</option><option value={4}>May</option><option value={5}>June</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{tableLayout:'fixed'}}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[['Employee','22%'],['Team','20%'],['Stack','8%'],['Supervisor','16%'],['Leave days',''],['Total','8%']].map(([h,w])=>(
                  <th key={h} style={{width:w||'auto'}} className="px-4 py-2.5 text-left text-[10px] font-medium text-white/25 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(m => {
                const ml = leaves.filter(l=>l.emp===m.name&&datesInRange(l.from,l.to).some(d=>new Date(d+'T00:00:00').getMonth()===month))
                const days = [...new Set(ml.flatMap(l=>datesInRange(l.from,l.to).filter(d=>new Date(d+'T00:00:00').getMonth()===month)))].sort()
                const total = leaves.filter(l=>l.emp===m.name).reduce((a,l)=>a+dayCount(l),0)
                const onL = isOnLeaveToday(leaves, m.name)
                return (
                  <tr key={m.name} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} size={28} fontSize={10}/>
                        <div>
                          <div className="text-[13px] font-medium text-white/80 truncate">{m.name}</div>
                          {onL && <div className="text-[10px] text-red-400">On leave today</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate" title={m.team}>{m.team}</td>
                    <td className="px-4 py-2.5"><span className="badge bg-white/5 text-white/40 text-[10px]">{m.stack}</span></td>
                    <td className="px-4 py-2.5 text-[11px] text-white/30 truncate" title={m.sup}>{m.sup}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-0.5">
                        {days.slice(0,20).map(d=>{const t=(ml.find(l=>datesInRange(l.from,l.to).includes(d))||{}).type||'planned';return <DayChip key={d} date={d} type={t}/>})}
                        {days.length>20&&<span className="text-[10px] text-white/25">+{days.length-20}</span>}
                        {!days.length&&<span className="text-[11px] text-white/20">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[13px] font-semibold font-mono ${total>8?'text-red-400':total>3?'text-amber-400':'text-white/40'}`}>{total}</span>
                      <span className="text-[10px] text-white/20"> days</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.06] text-[11px] text-white/20">{filtered.length} of {TEAM.length} employees</div>
      </div>
    </div>
  )
}
