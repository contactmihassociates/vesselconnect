'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Vessel } from '../types'
import { MOCK_VESSELS } from '../mock-data'

const USE_MOCK =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url'

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'mock'

export function useVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')

  const fetchVessels = useCallback(async () => {
    if (USE_MOCK) {
      setVessels(MOCK_VESSELS)
      setLoading(false)
      setRealtimeStatus('mock')
      return
    }

    try {
      const { supabase } = await import('../supabase')
      const { data, error: fetchError } = await supabase
        .from('vessels')
        .select('*')
        .order('last_seen_at', { ascending: false })

      if (fetchError) throw fetchError
      setVessels(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vessels')
      setVessels(MOCK_VESSELS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVessels()

    if (USE_MOCK) return

    let channel: ReturnType<typeof import('../supabase').supabase.channel> | null = null

    const setupRealtime = async () => {
      const { supabase } = await import('../supabase')

      channel = supabase
        .channel('vessels-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vessels' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setVessels((prev) => {
                const exists = prev.some((v) => v.id === (payload.new as Vessel).id)
                if (exists) return prev
                return [payload.new as Vessel, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              setVessels((prev) =>
                prev.map((v) =>
                  v.id === (payload.new as Vessel).id ? (payload.new as Vessel) : v
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setVessels((prev) => prev.filter((v) => v.id !== (payload.old as Vessel).id))
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
          else if (status === 'CLOSED') setRealtimeStatus('disconnected')
          else setRealtimeStatus('connecting')
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [fetchVessels])

  return { vessels, loading, error, realtimeStatus, refetch: fetchVessels }
}
