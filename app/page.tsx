'use client'

import { useMemo, useState } from 'react'
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
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { vessels, loading, realtimeStatus, refetch } = useVessels()
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
  const [enriching, setEnriching] = useState(false)
  const [enrichResult, setEnrichResult] = useState<string | null>(null)

  const handleEnrichAll = async () => {
    setEnriching(true)
    setEnrichResult(null)
    try {
      const resp = await fetch('/api/enrich-bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await resp.json()
      setEnrichResult(data.message ?? 'Enrichment complete')
      refetch()
    } catch {
      setEnrichResult('Enrichment failed — check console')
    } finally {
      setEnriching(false)
      setTimeout(() => setEnrichResult(null), 6000)
    }
  }

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
        <Button
          size="sm"
          onClick={handleEnrichAll}
          disabled={enriching || vessels.length === 0}
          className="bg-[#0D0D0D] text-white hover:bg-[#1A1A1A] gap-2 rounded-xl shadow-sm font-medium disabled:opacity-50"
        >
          {enriching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {enriching ? 'Enriching...' : 'Enrich All'}
        </Button>
        <LiveIndicator status={realtimeStatus} />
      </div>

      {/* Enrich result notification */}
      {enrichResult && (
        <div className="text-xs text-[#0E9F6E] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2 font-medium">
          {enrichResult}
        </div>
      )}

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
