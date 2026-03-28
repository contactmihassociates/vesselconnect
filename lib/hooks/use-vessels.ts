'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Vessel } from '../types'
import { inferRegionFromPort, inferVesselType } from '../utils'

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected'

function enrichVessel(v: Vessel): Vessel {
  return {
    ...v,
    region: v.region ?? inferRegionFromPort(v.open_port),
    vessel_type: inferVesselType(v.dwt) as Vessel['vessel_type'],
  }
}

export function useVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')

  const fetchVessels = useCallback(async () => {
    try {
      const { supabase } = await import('../supabase')
      const today = new Date().toISOString().split('T')[0]
      const { data, error: fetchError } = await supabase
        .from('vessels')
        .select('*')
        .gte('open_date', today)
        .order('open_date', { ascending: true })

      if (fetchError) throw fetchError
      setVessels((data ?? []).map(enrichVessel))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vessels')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVessels()

    let channel: ReturnType<typeof import('../supabase').supabase.channel> | null = null
    let pollInterval: NodeJS.Timeout | null = null

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
                const newVessel = enrichVessel(payload.new as Vessel)
                const today = new Date().toISOString().split('T')[0]
                if (!newVessel.open_date || newVessel.open_date < today) return prev
                const exists = prev.some((v) => v.id === newVessel.id)
                if (exists) return prev
                return [newVessel, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              setVessels((prev) =>
                prev.map((v) =>
                  v.id === (payload.new as Vessel).id ? enrichVessel(payload.new as Vessel) : v
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setVessels((prev) => prev.filter((v) => v.id !== (payload.old as Vessel).id))
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected')
            if (pollInterval) {
              clearInterval(pollInterval)
              pollInterval = null
            }
          } else if (status === 'CLOSED') {
            setRealtimeStatus('disconnected')
          }
        })

      // Polling fallback if realtime doesn't connect within 5s
      const realtimeTimeout = setTimeout(() => {
        setRealtimeStatus('connected')
        pollInterval = setInterval(() => {
          fetchVessels()
        }, 30000)
      }, 5000)

      return () => clearTimeout(realtimeTimeout)
    }

    setupRealtime()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [fetchVessels])

  return { vessels, loading, error, realtimeStatus, refetch: fetchVessels }
}
