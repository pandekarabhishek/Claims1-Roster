import { useState } from 'react'
import { Plus, Search, LayoutDashboard, Calendar, Users, List, Table2 } from 'lucide-react'
import { useLeaves }   from './hooks/useLeaves'
import { TYPE_LABELS } from './data/team'
import { dayCount }    from './utils'
import Dashboard       from './components/Dashboard'
import { CalendarView, Availability, AllLeaves, Roster } from './components/Screens'
import { LogLeaveModal, Toast, DBStatus } from './components/UI'

const NAV = [
  { id:'dashboard',    label:'Dashboard',    Icon:LayoutDashboard, section:'Overview' },
  { id:'calendar',     label:'Calendar',     Icon:Calendar },
  { id:'availability', label:'Availability', Icon:Users,  section:'Manage' },
  { id:'leaves',       label:'All leaves',   Icon:List,   badge:true },
  { id:'roster',       label:'Roster',       Icon:Table2 },
]
const TITLES = { dashboard:'Dashboard', calendar:'Calendar', availability:'Availability', leaves:'All leaves', roster:'Roster' }

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [modal,  setModal]  = useState(false)
  const [toast,  setToast]  = useState(null)
  const [search, setSearch] = useState('')

  const { leaves, loading, error, dbStatus, addLeave, deleteLeave } = useLeaves()

  async function handleSave(data) {
    const r = await addLeave(data)
    if (r.success) {
      const n = dayCount(r.entry)
      setToast({ msg:`${n} day${n>1?'s':''} of ${TYPE_LABELS[data.type]} saved for ${data.emp.split(' ')[0]}`, type:'success', id:Date.now() })
    } else {
      setToast({ msg:'Failed to save: '+r.error, type:'error', id:Date.now() })
    }
  }

  async function handleDelete(id) {
    const r = await deleteLeave(id)
    if (r.success) setToast({ msg:'Leave entry removed', type:'info', id:Date.now() })
    else setToast({ msg:'Delete failed: '+r.error, type:'error', id:Date.now() })
  }

  if (loading) return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-sm font-bold text-white animate-pulse">TP</div>
        <div className="text-sm text-white/30">Loading TeamPulse…</div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col bg-surface-1 border-r border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-[9px] bg-brand-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0">TP</div>
          <div>
            <div className="text-[14px] font-semibold text-white">TeamPulse</div>
            <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">Claims1 · PI2 2026</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV.map((item, i) => {
            const prev = NAV[i-1]
            return (
              <div key={item.id}>
                {item.section && item.section !== prev?.section && (
                  <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.7px] px-2 py-1.5 mt-1">{item.section}</div>
                )}
                <button onClick={() => { setScreen(item.id); if (item.id !== 'roster') setSearch('') }}
                  className={`nav-link ${screen===item.id?'active':''}`}>
                  <item.Icon size={14} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && leaves.length > 0 && (
                    <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{leaves.length}</span>
                  )}
                </button>
              </div>
            )
          })}
        </nav>
        <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-brand-500/[0.08] border border-brand-500/[0.15]">
          <div className="text-[10px] text-brand-400 font-medium">Current sprint</div>
          <div className="text-[12px] text-white/60 mt-0.5">PI2 · Apr – Jun 2026</div>
        </div>
        <div className="px-2 pb-3 pt-2 border-t border-white/[0.06] space-y-1.5">
          <DBStatus status={dbStatus} />
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">YB</div>
            <div>
              <div className="text-[12px] font-medium text-white/80">Yvette Bobcik</div>
              <div className="text-[10px] text-white/25">Manager · Claims1</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <div className="h-[52px] shrink-0 flex items-center gap-3 px-6 bg-surface-1 border-b border-white/[0.06]">
          <div>
            <div className="text-[15px] font-semibold text-white">{TITLES[screen]}</div>
            <div className="text-[11px] text-white/25">Claims1 · PI2 2026</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"/>
              <input className="input !pl-7 !py-1.5 text-xs w-44" placeholder="Quick search…"
                value={search}
                onChange={e=>{ setSearch(e.target.value); if(e.target.value) setScreen('roster') }}/>
            </div>
            <button className="btn-pri" onClick={() => setModal(true)}>
              <Plus size={13}/> Log leave
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              API error: {error}
            </div>
          )}
          {screen==='dashboard'    && <Dashboard    leaves={leaves} />}
          {screen==='calendar'     && <CalendarView leaves={leaves} />}
          {screen==='availability' && <Availability leaves={leaves} />}
          {screen==='leaves'       && <AllLeaves    leaves={leaves} onDelete={handleDelete} />}
          {screen==='roster'       && <Roster       leaves={leaves} searchOverride={search} />}
        </div>
      </div>

      <LogLeaveModal open={modal} onClose={() => setModal(false)} onSave={handleSave} />
      {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  )
}
