import { useState, useEffect, useCallback } from 'react'
import { supabase, DB_ENABLED } from '../supabase'
import { SEED_LEAVES } from '../data/team'
import { uid } from '../utils'

const LS_KEY = 'teampulse_v4'

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function lsSave(d) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch {}
}

export function useLeaves() {
  const [leaves,  setLeaves]  = useState([])
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState('idle') // idle | connecting | connected | local | error

  // ── Load ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (DB_ENABLED) {
        setDbStatus('connecting')
        const { data, error } = await supabase
          .from('leaves')
          .select('*')
          .order('from_date', { ascending: false })

        if (error) {
          console.error('Supabase load error:', error)
          setDbStatus('error')
          const local = lsLoad()
          setLeaves(local.length ? local : SEED_LEAVES)
        } else {
          const mapped = data.map(r => ({
            id:   r.id,
            emp:  r.emp,
            type: r.type,
            from: r.from_date,
            to:   r.to_date,
            note: r.note || '',
          }))
          setLeaves(mapped)
          setDbStatus('connected')
        }
      } else {
        setDbStatus('local')
        const local = lsLoad()
        setLeaves(local.length ? local : SEED_LEAVES)
        if (!lsLoad().length) lsSave(SEED_LEAVES)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Real-time subscription ────────────────────
  useEffect(() => {
    if (!DB_ENABLED) return
    const channel = supabase
      .channel('leaves-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaves' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new
          setLeaves(prev => [{
            id: r.id, emp: r.emp, type: r.type,
            from: r.from_date, to: r.to_date, note: r.note || '',
          }, ...prev])
        }
        if (payload.eventType === 'DELETE') {
          setLeaves(prev => prev.filter(l => l.id !== payload.old.id))
        }
        if (payload.eventType === 'UPDATE') {
          const r = payload.new
          setLeaves(prev => prev.map(l => l.id === r.id
            ? { id: r.id, emp: r.emp, type: r.type, from: r.from_date, to: r.to_date, note: r.note || '' }
            : l
          ))
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ── Add ───────────────────────────────────────
  const addLeave = useCallback(async ({ emp, type, from, to, note }) => {
    const entry = { id: uid(), emp, type, from, to, note: note || '' }

    if (DB_ENABLED) {
      const { error } = await supabase.from('leaves').insert({
        id: entry.id, emp, type,
        from_date: from, to_date: to, note: note || '',
      })
      if (error) {
        console.error('Insert error:', error)
        return { success: false, error: error.message }
      }
      // real-time will add to state
    } else {
      setLeaves(prev => {
        const next = [entry, ...prev]
        lsSave(next)
        return next
      })
    }
    return { success: true, entry }
  }, [])

  // ── Delete ────────────────────────────────────
  const deleteLeave = useCallback(async (id) => {
    if (DB_ENABLED) {
      const { error } = await supabase.from('leaves').delete().eq('id', id)
      if (error) return { success: false, error: error.message }
      // real-time removes from state
    } else {
      setLeaves(prev => {
        const next = prev.filter(l => l.id !== id)
        lsSave(next)
        return next
      })
    }
    return { success: true }
  }, [])

  return { leaves, loading, dbStatus, addLeave, deleteLeave }
}
