import { LayoutDashboard, Calendar, Users, List, Table2, Plus } from 'lucide-react'
import { DBStatusPill } from './UI'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard, section: 'Overview' },
  { id: 'calendar',     label: 'Calendar',     icon: Calendar },
  { id: 'availability', label: 'Availability', icon: Users, section: 'Manage' },
  { id: 'leaves',       label: 'All leaves',   icon: List,  badge: true },
  { id: 'roster',       label: 'Roster',       icon: Table2 },
]

export default function Sidebar({ active, onNav, leaveCount, dbStatus, onLogLeave }) {
  return (
    <aside className="w-[220px] shrink-0 flex flex-col bg-surface-1 border-r border-white/[0.06] overflow-hidden">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-[9px] bg-brand-500 flex items-center justify-center
          text-[13px] font-bold text-white shrink-0">TP</div>
        <div>
          <div className="text-[14px] font-semibold text-white leading-tight">TeamPulse</div>
          <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">Claims1 · PI2 2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        {NAV.map((item, i) => {
          const Icon = item.icon
          const showSection = item.section && (i === 0 || NAV[i-1].section !== item.section)
          return (
            <div key={item.id}>
              {showSection && (
                <div className="text-[10px] font-medium text-white/20 uppercase tracking-[0.7px]
                  px-2 py-1.5 mt-1">{item.section}</div>
              )}
              <button onClick={() => onNav(item.id)}
                className={`nav-item w-full ${active === item.id ? 'active' : ''}`}>
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge && leaveCount > 0 && (
                  <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold
                    px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {leaveCount}
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </nav>

      {/* PI badge */}
      <div className="mx-2 mb-2 px-3 py-2 rounded-md bg-brand-500/[0.08] border border-brand-500/[0.15]">
        <div className="text-[10px] text-brand-400 font-medium">Current sprint</div>
        <div className="text-[12px] text-white/70 mt-0.5">PI2 · Apr – Jun 2026</div>
      </div>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-white/[0.06] pt-2 space-y-1.5">
        <DBStatusPill status={dbStatus} />
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-default">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center
            text-[10px] font-bold text-white shrink-0">YB</div>
          <div>
            <div className="text-[12px] font-medium text-white/80">Yvette Bobcik</div>
            <div className="text-[10px] text-white/25">Manager · Claims1</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
