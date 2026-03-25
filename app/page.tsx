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
    <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 space-y-5">
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
            <h2 className="text-sm font-semibold text-slate-300">
              Vessel List
              <span className="ml-2 text-slate-500 font-normal">
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

      {/* Stats — secondary info at the bottom */}
      <StatsCards stats={stats} />
    </main>
  )
}
