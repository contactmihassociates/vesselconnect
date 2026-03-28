'use client'

import { useMemo } from 'react'
import { useVessels } from '@/lib/hooks/use-vessels'
import { useFilters } from '@/lib/hooks/use-filters'
import { useStats } from '@/lib/hooks/use-stats'
import { applyFilters } from '@/lib/utils'
import { VesselTable } from '@/components/vessel-table'
import { FilterSidebar } from '@/components/filter-sidebar'
import { SearchBar } from '@/components/search-bar'
import { ExportButton } from '@/components/export-button'
import { LiveIndicator } from '@/components/live-indicator'
import { StatsCards } from '@/components/stats-cards'

export default function HomePage() {
  const { vessels, loading, realtimeStatus } = useVessels()
  const {
    filters,
    setSearch,
    toggleVesselType,
    toggleRegion,
    toggleSource,
    clearFilters,
    hasActiveFilters,
  } = useFilters()

  const filteredVessels = useMemo(
    () => applyFilters(vessels, filters),
    [vessels, filters]
  )

  const stats = useStats(vessels)

  return (
    <main className="flex-1 max-w-[1600px] mx-auto w-full px-8 py-7 space-y-6">
      {/* Page heading */}
      <div>
        <h1
          className="text-2xl font-bold text-[#0D0D0D] tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Vessel Market
        </h1>
        <p className="text-sm text-[#9C9891] mt-1">
          Live availability feed — bulk carriers open for charter
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar value={filters.search} onChange={setSearch} />
        </div>
        <ExportButton vessels={filteredVessels} />
        <LiveIndicator status={realtimeStatus} />
      </div>

      {/* Main content — vessel list + filters */}
      <div className="flex gap-5 items-start">
        {/* Table */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-sm font-semibold text-[#0D0D0D]"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Vessel List
              <span className="ml-2 text-[#9C9891] font-normal">
                {filteredVessels.length} vessels
              </span>
            </h2>
          </div>
          <VesselTable vessels={filteredVessels} loading={loading} />
        </div>

        {/* Filters */}
        <FilterSidebar
          filters={filters}
          onToggleVesselType={toggleVesselType}
          onToggleRegion={toggleRegion}
          onToggleSource={toggleSource}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          totalCount={vessels.length}
          filteredCount={filteredVessels.length}
        />
      </div>
    </main>
  )
}
