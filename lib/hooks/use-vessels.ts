'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Vessel } from '../types'
import { inferRegionFromPort, inferVesselType } from '../utils'
import { normalizeVesselName } from '../enrichment'

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected'

// Match confidence cache — keyed by vessel id
const masterConfidenceCache = new Map<string, { confidence: string | null; score: number }>()

// Client-side fallback enrichment (region + type inference)
function enrichVesselLocal(v: Vessel): Vessel {
  return {
    ...v,
    region: v.region ?? inferRegionFromPort(v.open_port),
    vessel_type: inferVesselType(v.dwt) as Vessel['vessel_type'],
  }
}

// Enrich one vessel from the vessel_master table via Supabase client
async function enrichFromMaster(vessel: Vessel): Promise<Vessel> {
  try {
    const { supabase } = await import('../supabase')
    let masterRow: Record<string, unknown> | null = null

    // Tier 1: IMO match
    if (vessel.imo) {
      const { data } = await supabase
        .from('vessel_master')
        .select('*')
        .eq('imo', vessel.imo)
        .single()
      masterRow = data
    }

    // Tier 2: Exact name match
    if (!masterRow && vessel.vessel_name) {
      const normalizedName = normalizeVesselName(vessel.vessel_name)
      const { data } = await supabase
        .from('vessel_master')
        .select('*')
        .eq('vessel_name_upper', normalizedName)
        .single()
      masterRow = data
    }

    if (!masterRow) return vessel

    const fillNum = (cur: number | null | undefined, val: unknown): number | null =>
      cur == null && val != null ? (Number(val) || null) : cur ?? null
    const fillStr = (cur: string | null | undefined, val: unknown): string | null =>
      cur == null && val != null ? String(val) : cur ?? null

    return {
      ...vessel,
      dwt: fillNum(vessel.dwt, masterRow.dwt),
      grt: fillNum(vessel.grt, masterRow.grt),
      nrt: fillNum(vessel.nrt, masterRow.nrt),
      loa: fillNum(vessel.loa, masterRow.loa),
      beam: fillNum(vessel.beam, masterRow.beam),
      grain_capacity: fillNum(vessel.grain_capacity, masterRow.grain_capacity),
      built_year: fillNum(vessel.built_year, masterRow.built_year),
      flag: fillStr(vessel.flag, masterRow.flag),
      crane_details: fillStr(vessel.crane_details, masterRow.gear_details),
      owner_manager: fillStr(vessel.owner_manager, masterRow.head_owner),
      scrubber_fitted:
        vessel.scrubber_fitted == null && masterRow.scrubbers != null
          ? (masterRow.scrubbers as string).toLowerCase() === 'yes'
          : vessel.scrubber_fitted,
      imo: vessel.imo == null && masterRow.imo != null ? Number(masterRow.imo) : vessel.imo ?? null,
      classification: fillStr(vessel.classification, masterRow.classification),
      design_model: fillStr(vessel.design_model, masterRow.design_model),
      country_built: fillStr(vessel.country_built, masterRow.country_built),
      shipyard_built: fillStr(vessel.shipyard_built, masterRow.shipyard_built),
      bale_capacity: vessel.bale_capacity == null && masterRow.bale_capacity != null ? Number(masterRow.bale_capacity) : vessel.bale_capacity ?? null,
      summer_draught: vessel.summer_draught == null && masterRow.summer_draught != null ? Number(masterRow.summer_draught) : vessel.summer_draught ?? null,
      commercial_operator: fillStr(vessel.commercial_operator, masterRow.commercial_operator),
    }
  } catch {
    return vessel
  }
}

export function useVessels() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')
  const masterEnrichedRef = useRef(false)

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

      const localEnriched = (data ?? []).map(enrichVesselLocal)
      setVessels(localEnriched)
      setError(null)

      // Master enrichment — run once after first fetch, non-blocking
      if (!masterEnrichedRef.current) {
        masterEnrichedRef.current = true
        enrichAllFromMaster(localEnriched)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vessels')
    } finally {
      setLoading(false)
    }
  }, [])

  // Run master enrichment in background, update state progressively
  const enrichAllFromMaster = useCallback(async (vesselList: Vessel[]) => {
    for (const vessel of vesselList) {
      const enriched = await enrichFromMaster(vessel)
      setVessels((prev) =>
        prev.map((v) => (v.id === enriched.id ? enrichVesselLocal(enriched) : v))
      )
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
                const newVessel = enrichVesselLocal(payload.new as Vessel)
                const today = new Date().toISOString().split('T')[0]
                if (!newVessel.open_date || newVessel.open_date < today) return prev
                const exists = prev.some((v) => v.id === newVessel.id)
                if (exists) return prev
                // Enrich new vessel from master in background
                enrichFromMaster(newVessel).then((enriched) =>
                  setVessels((p) =>
                    p.map((v) => (v.id === enriched.id ? enrichVesselLocal(enriched) : v))
                  )
                )
                return [newVessel, ...prev]
              })
            } else if (payload.eventType === 'UPDATE') {
              setVessels((prev) =>
                prev.map((v) =>
                  v.id === (payload.new as Vessel).id
                    ? enrichVesselLocal(payload.new as Vessel)
                    : v
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
