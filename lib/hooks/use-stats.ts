'use client'

import { useMemo } from 'react'
import type { Vessel, VesselStats } from '../types'
import { inferVesselType, isNewToday, isNewThisWeek } from '../utils'

export function useStats(vessels: Vessel[]): VesselStats {
  return useMemo(() => {
    const byType: Record<string, number> = {}
    const byRegion: Record<string, number> = {}
    const bySource: Record<string, number> = { email: 0, whatsapp: 0, teams: 0 }

    let newToday = 0
    let newThisWeek = 0

    vessels.forEach((v) => {
      const type = v.vessel_type ?? inferVesselType(v.dwt)
      byType[type] = (byType[type] ?? 0) + 1

      if (v.region) {
        byRegion[v.region] = (byRegion[v.region] ?? 0) + 1
      }

      bySource[v.source] = (bySource[v.source] ?? 0) + 1

      if (isNewToday(v.first_seen_at)) newToday++
      if (isNewThisWeek(v.first_seen_at)) newThisWeek++
    })

    // DWT distribution buckets
    const buckets = [
      { range: '<20k', min: 0, max: 20000 },
      { range: '20-40k', min: 20000, max: 40000 },
      { range: '40-55k', min: 40000, max: 55000 },
      { range: '55-65k', min: 55000, max: 65000 },
      { range: '65-82k', min: 65000, max: 82000 },
      { range: '82-120k', min: 82000, max: 120000 },
      { range: '120-180k', min: 120000, max: 180000 },
      { range: '>180k', min: 180000, max: Infinity },
    ]

    const dwtDistribution = buckets.map(({ range, min, max }) => ({
      range,
      count: vessels.filter((v) => v.dwt !== null && v.dwt >= min && v.dwt < max).length,
    }))

    return {
      total: vessels.length,
      newToday,
      newThisWeek,
      byType,
      byRegion,
      bySource,
      dwtDistribution,
    }
  }, [vessels])
}
