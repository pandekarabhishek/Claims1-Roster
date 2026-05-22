import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export function useLeaves() {
  const [leaves,   setLeaves]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [dbStatus, setDbStatus] = useState('connecting')

  const fetchLeaves = useCallback(async () => {
    try {
      setError(null)
      const data = await api.getLeaves()
      setLeaves(data)
      setDbStatus('connected')
    } catch (err) {
      setError(err.message)
      setDbStatus('error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const addLeave = useCallback(async (data) => {
    try {
      const entry = await api.addLeave(data)
      setLeaves(prev => [entry, ...prev])
      return { success: true, entry }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const deleteLeave = useCallback(async (id) => {
    const snapshot = [...leaves]
    setLeaves(prev => prev.filter(l => l.id !== id))   // optimistic
    try {
      await api.deleteLeave(id)
      return { success: true }
    } catch (err) {
      setLeaves(snapshot)                                // rollback
      return { success: false, error: err.message }
    }
  }, [leaves])

  return { leaves, loading, error, dbStatus, addLeave, deleteLeave, refetch: fetchLeaves }
}
