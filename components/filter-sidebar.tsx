'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { VESSEL_TYPES, REGIONS, SOURCES, type VesselType, type VesselSource } from '@/lib/types'
import type { FilterState } from '@/lib/types'

interface FilterSidebarProps {
  filters: FilterState
  onToggleVesselType: (type: VesselType) => void
  onToggleRegion: (region: string) => void
  onToggleSource: (source: VesselSource) => void
  onClear: () => void
  hasActiveFilters: boolean
  totalCount: number
  filteredCount: number
}

export function FilterSidebar({
  filters,
  onToggleVesselType,
  onToggleRegion,
  onToggleSource,
  onClear,
  hasActiveFilters,
  totalCount,
  filteredCount,
}: FilterSidebarProps) {
  return (
    <aside className="w-60 shrink-0 rounded-2xl border border-[#E8E5DF] bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#9C9891]" />
          <span className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Filters
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#1A56DB] text-white text-[10px] font-bold">
              ·
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9C9891]">
            {filteredCount}/{totalCount}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#9C9891] hover:text-[#0D0D0D] hover:bg-[#F0EEE9]"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-[#E8E5DF]" />

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-4 space-y-5">
          {/* Source */}
          <FilterSection title="Source">
            {SOURCES.map(({ value, label }) => (
              <FilterCheckbox
                key={value}
                id={`source-${value}`}
                label={label}
                checked={filters.sources.includes(value)}
                onCheckedChange={() => onToggleSource(value)}
                accentColor={
                  value === 'email'
                    ? '#1D4ED8'
                    : value === 'whatsapp'
                    ? '#15803D'
                    : '#6D28D9'
                }
              />
            ))}
          </FilterSection>

          <Separator className="bg-[#F0EEE9]" />

          {/* Vessel Type */}
          <FilterSection title="Vessel Type">
            {VESSEL_TYPES.map((type) => (
              <FilterCheckbox
                key={type}
                id={`type-${type}`}
                label={type}
                checked={filters.vesselTypes.includes(type)}
                onCheckedChange={() => onToggleVesselType(type)}
              />
            ))}
          </FilterSection>

          <Separator className="bg-[#F0EEE9]" />

          {/* Region */}
          <FilterSection title="Region">
            {REGIONS.map((region) => (
              <FilterCheckbox
                key={region}
                id={`region-${region}`}
                label={region}
                checked={filters.regions.includes(region)}
                onCheckedChange={() => onToggleRegion(region)}
              />
            ))}
          </FilterSection>
        </div>
      </ScrollArea>
    </aside>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9C9891]">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  accentColor,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: () => void
  accentColor?: string
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer group"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="border-[#D4D0C8] data-[state=checked]:bg-[#0D0D0D] data-[state=checked]:border-[#0D0D0D]"
      />
      <span
        className="text-sm transition-colors"
        style={{
          color: checked ? (accentColor ?? '#0D0D0D') : '#757575',
          fontWeight: checked ? 500 : 400,
        }}
      >
        {label}
      </span>
    </label>
  )
}
