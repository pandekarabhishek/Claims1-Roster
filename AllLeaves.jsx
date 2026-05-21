import { initials, avatarColor } from '../utils'
import { TYPE_COLORS, TYPE_LABELS } from '../data/team'
import { Wifi, WifiOff, Loader2, HardDrive } from 'lucide-react'

export function Avatar({ name, size = 28, fontSize = 10 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarColor(name), color: '#fff',
      fontSize, fontWeight: 700, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {initials(name)}
    </div>
  )
}

export function LeaveBadge({ type }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.planned
  return (
    <span className={`badge ${c.bg} ${c.text}`}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

export function DayChip({ date, type = 'planned' }) {
  const colorMap = {
    planned: 'bg-red-500/10 text-red-400',
    sick:    'bg-amber-500/10 text-amber-400',
    wfh:     'bg-blue-500/10 text-blue-400',
    holiday: 'bg-purple-500/10 text-purple-400',
    personal:'bg-brand-500/10 text-brand-400',
  }
  const d = new Date(date + 'T00:00:00')
  return (
    <div title={d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
      className={`inline-flex items-center justify-center w-[22px] h-[22px]
        rounded-[4px] text-[10px] font-medium font-mono ${colorMap[type] || colorMap.planned}`}>
      {d.getDate()}
    </div>
  )
}

export function DBStatusPill({ status }) {
  const map = {
    idle:       { label: 'Initialising', icon: <Loader2 size={11} className="animate-spin" />, cls: 'bg-white/5 text-white/30 border-white/10' },
    connecting: { label: 'Connecting…',  icon: <Loader2 size={11} className="animate-spin" />, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    connected:  { label: 'Live DB',      icon: <Wifi    size={11} />, cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    local:      { label: 'Local storage',icon: <HardDrive size={11}/>, cls: 'bg-white/5 text-white/40 border-white/10' },
    error:      { label: 'DB error — local fallback', icon: <WifiOff size={11}/>, cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  const m = map[status] || map.idle
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      text-[10px] font-medium border transition-all ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  )
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-white/20">
      {Icon && <Icon size={32} strokeWidth={1} />}
      <p className="text-sm">{message}</p>
    </div>
  )
}

export function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="flex items-center gap-2 text-[13px] font-medium text-white/80">
          {Icon && <Icon size={14} className="text-white/40" />}
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}
