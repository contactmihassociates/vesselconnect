'use client'

import { useState, useCallback } from 'react'
import type { FilterState, VesselType, VesselSource } from '../types'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  vesselTypes: [],
  regions: [],
  dwtMin: 0,
  dwtMax: 0,
  openDateFrom: '',
  openDateTo: '',
  sources: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  const toggleVesselType = useCallback((type: VesselType) => {
    setFilters((prev) => ({
      ...prev,
      vesselTypes: prev.vesselTypes.includes(type)
        ? prev.vesselTypes.filter((t) => t !== type)
        : [...prev.vesselTypes, type],
    }))
  }, [])

  const toggleRegion = useCallback((region: string) => {
    setFilters((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }, [])

  const toggleSource = useCallback((source: VesselSource) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }))
  }, [])

  const setDwtRange = useCallback((min: number, max: number) => {
    setFilters((prev) => ({ ...prev, dwtMin: min, dwtMax: max }))
  }, [])

  const setDateRange = useCallback((from: string, to: string) => {
    setFilters((prev) => ({ ...prev, openDateFrom: from, openDateTo: to }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasActiveFilters =
    filters.search !== '' ||
    filters.vesselTypes.length > 0 ||
    filters.regions.length > 0 ||
    filters.sources.length > 0 ||
    filters.dwtMin > 0 ||
    filters.dwtMax > 0 ||
    filters.openDateFrom !== '' ||
    filters.openDateTo !== ''

  return {
    filters,
    setSearch,
    toggleVesselType,
    toggleRegion,
    toggleSource,
    setDwtRange,
    setDateRange,
    clearFilters,
    hasActiveFilters,
  }
}
