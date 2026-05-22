import { useState, useEffect } from 'react'
import { X, Check, Info, XCircle, Wifi, WifiOff, Loader2, HardDrive, Plus } from 'lucide-react'
import { initials, avatarColor } from '../utils'
import { TEAM, TYPE_CFG, TYPE_LABELS } from '../data/team'

// ── Avatar ────────────────────────────────────────────
export function Avatar({ name, size = 28, fontSize = 10 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: avatarColor(name), color: '#fff', fontSize, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {initials(name)}
    </div>
  )
}

// ── LeaveBadge ────────────────────────────────────────
export function LeaveBadge({ type }) {
  const c = TYPE_CFG[type] || TYPE_CFG.planned
  return <span className={`badge ${c.chip}`}>{TYPE_LABELS[type] || type}</span>
}

// ── DayChip ───────────────────────────────────────────
export function DayChip({ date, type = 'planned' }) {
  const c = TYPE_CFG[type] || TYPE_CFG.planned
  return (
    <div title={new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
      className={`inline-flex items-center justify-center w-[20px] h-[20px] rounded-[4px] text-[10px] font-medium font-mono ${c.chip}`}>
      {new Date(date + 'T00:00:00').getDate()}
    </div>
  )
}

// ── DBStatus pill ─────────────────────────────────────
export function DBStatus({ status }) {
  const map = {
    connecting: { label: 'Connecting…', Icon: Loader2, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', spin: true },
    connected:  { label: 'PostgreSQL',  Icon: Wifi,    cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    error:      { label: 'DB error',    Icon: WifiOff, cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }
  const m = map[status] || map.connecting
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${m.cls}`}>
      <m.Icon size={10} className={m.spin ? 'animate-spin' : ''} />
      {m.label}
    </span>
  )
}

// ── Toast ─────────────────────────────────────────────
export function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  const cfg = { success: { Icon: Check, col: 'text-green-400' }, error: { Icon: XCircle, col: 'text-red-400' }, info: { Icon: Info, col: 'text-blue-400' } }
  const { Icon, col } = cfg[type] || cfg.success
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up flex items-center gap-2.5 bg-surface-3 border border-white/10 rounded-lg px-4 py-3 text-sm shadow-xl max-w-xs">
      <Icon size={14} className={col} />
      <span className="text-white/80">{msg}</span>
    </div>
  )
}

// ── LogLeaveModal ─────────────────────────────────────
export function LogLeaveModal({ open, onClose, onSave }) {
  const [emp,    setEmp]    = useState(TEAM[0].name)
  const [type,   setType]   = useState('planned')
  const [from,   setFrom]   = useState('')
  const [to,     setTo]     = useState('')
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) { const t = new Date().toISOString().slice(0, 10); setFrom(t); setTo(t); setNote('') }
  }, [open])

  const days = from && to && from <= to
    ? Math.floor((new Date(to) - new Date(from)) / 86400000) + 1 : 0

  async function save() {
    if (!from || !to || from > to) return
    setSaving(true)
    await onSave({ emp, type, from, to, note })
    setSaving(false)
    onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-scale-in bg-surface-1 border border-white/10 rounded-2xl w-[460px] max-w-[92vw] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="text-[15px] font-semibold">Log leave</span>
          <button className="btn-ghost !p-1.5" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">Employee</label>
              <select className="input" value={emp} onChange={e => setEmp(e.target.value)}>
                {TEAM.map(m => <option key={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">Leave type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">From date</label>
              <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">To date</label>
              <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5">Note <span className="text-white/20">(optional)</span></label>
            <input type="text" className="input" placeholder="e.g. Travel, Conference, Medical…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          {days > 0 && <p className="text-[11px] text-white/30 font-mono">{days} day{days > 1 ? 's' : ''} selected</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button className="btn-sec" onClick={onClose}>Cancel</button>
          <button className="btn-pri" onClick={save} disabled={saving || !from || !to || from > to}>
            {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={13} />}
            Save leave
          </button>
        </div>
      </div>
    </div>
  )
}
