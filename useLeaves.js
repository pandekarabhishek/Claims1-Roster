import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { TEAM, TYPE_LABELS } from '../data/team'
import { datesInRange } from '../utils'

export default function LogLeaveModal({ open, onClose, onSave, defaultEmp = '' }) {
  const [emp,  setEmp]  = useState(defaultEmp || TEAM[0].name)
  const [type, setType] = useState('planned')
  const [from, setFrom] = useState('')
  const [to,   setTo]   = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const t = new Date().toISOString().slice(0, 10)
      setFrom(t); setTo(t); setNote('')
      if (defaultEmp) setEmp(defaultEmp)
    }
  }, [open, defaultEmp])

  const days = from && to && from <= to ? datesInRange(from, to).length : 0

  async function handleSave() {
    if (!from || !to || from > to) return
    setSaving(true)
    await onSave({ emp, type, from, to, note })
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="animate-scale-in bg-surface-1 border border-white/10 rounded-2xl
        w-[460px] max-w-[92vw] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <span className="text-[15px] font-semibold text-white">Log leave</span>
          <button onClick={onClose} className="btn-ghost !p-1.5 rounded-lg">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">Employee</label>
              <select className="input-base" value={emp} onChange={e => setEmp(e.target.value)}>
                {TEAM.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">Leave type</label>
              <select className="input-base" value={type} onChange={e => setType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) =>
                  <option key={k} value={k}>{v}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">From date</label>
              <input type="date" className="input-base" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/40 mb-1.5">To date</label>
              <input type="date" className="input-base" value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/40 mb-1.5">
              Note <span className="text-white/20">(optional)</span>
            </label>
            <input type="text" className="input-base" placeholder="e.g. Travel, Conference, Medical…"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>

          {days > 0 && (
            <div className="text-[12px] text-white/30 font-mono">
              {days} day{days > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-solid" onClick={handleSave} disabled={saving || !from || !to || from > to}>
            {saving
              ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
              : <Check size={13} />}
            Save leave
          </button>
        </div>
      </div>
    </div>
  )
}
