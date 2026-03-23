'use client'

import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
    <aside className="w-64 shrink-0 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-sky-500/20 text-sky-400 text-xs px-1.5 py-0">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {filteredCount}/{totalCount}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-200"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

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
                accent={
                  value === 'email'
                    ? 'text-blue-400'
                    : value === 'whatsapp'
                    ? 'text-green-400'
                    : 'text-purple-400'
                }
              />
            ))}
          </FilterSection>

          <Separator className="bg-slate-700/30" />

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

          <Separator className="bg-slate-700/30" />

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
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  accent,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: () => void
  accent?: string
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
        className="border-slate-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
      />
      <span
        className={`text-sm transition-colors ${
          checked
            ? accent ?? 'text-slate-200'
            : 'text-slate-400 group-hover:text-slate-300'
        }`}
      >
        {label}
      </span>
    </label>
  )
}
