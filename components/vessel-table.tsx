'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, ChevronsUpDown, Ship, Circle } from 'lucide-react'
import type { Vessel } from '@/lib/types'
import { formatDate, formatDWT, getSourceColor, getSourceLabel, inferVesselType } from '@/lib/utils'
import { VesselDetailModal } from './vessel-detail-modal'

interface VesselTableProps {
  vessels: Vessel[]
  loading?: boolean
}

type SortKey = 'vessel_name' | 'dwt' | 'open_date' | 'open_port' | 'region' | 'built_year'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 20

export function VesselTable({ vessels, loading }: VesselTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('open_date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const sorted = [...vessels].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const openDetail = (vessel: Vessel) => {
    setSelectedVessel(vessel)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#B5B0A5]">
        <Ship className="h-10 w-10 animate-pulse" />
        <p className="text-sm font-medium">Loading vessels...</p>
      </div>
    )
  }

  if (vessels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#B5B0A5]">
        <Ship className="h-10 w-10" />
        <p className="text-sm font-medium">No vessels match the current filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-[#E8E5DF] overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8E5DF] hover:bg-transparent bg-[#F7F6F3]">
              <SortHead label="Vessel Name" sortKey="vessel_name" current={sortKey} dir={sortDir} onSort={handleSort} primary />
              <SortHead label="DWT" sortKey="dwt" current={sortKey} dir={sortDir} onSort={handleSort} primary />
              <TableHead className="text-[#0D0D0D] text-xs font-bold uppercase tracking-widest">Type</TableHead>
              <SortHead label="Open Date" sortKey="open_date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHead label="Open Port" sortKey="open_port" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHead label="Region" sortKey="region" current={sortKey} dir={sortDir} onSort={handleSort} />
              <TableHead className="text-[#9C9891] text-xs font-semibold uppercase tracking-widest">Source</TableHead>
              <SortHead label="Built" sortKey="built_year" current={sortKey} dir={sortDir} onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((vessel) => (
              <TableRow
                key={vessel.id}
                className="border-[#F0EEE9] hover:bg-[#F7F6F3] cursor-pointer transition-colors group"
                onClick={() => openDetail(vessel)}
              >
                <TableCell className="font-bold text-[#0D0D0D] text-[0.92rem] group-hover:text-[#1A56DB] transition-colors py-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  <div className="flex items-center gap-2">
                    <MatchDot confidence={vessel.match_confidence ?? null} />
                    {vessel.vessel_name ?? <span className="text-[#B5B0A5] italic font-normal text-sm">(Unknown)</span>}
                  </div>
                </TableCell>
                <TableCell className="text-[#1A56DB] text-sm font-semibold tabular-nums py-4">
                  {formatDWT(vessel.dwt)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold px-2.5 py-0.5"
                  >
                    {inferVesselType(vessel.dwt)}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#4B4B4B] text-sm tabular-nums">
                  {formatDate(vessel.open_date)}
                </TableCell>
                <TableCell className="text-[#4B4B4B] text-sm">{vessel.open_port ?? '—'}</TableCell>
                <TableCell className="text-[#757575] text-sm">{vessel.region ?? '—'}</TableCell>
                <TableCell>
                  <SourceBadge source={vessel.source} />
                </TableCell>
                <TableCell className="text-[#757575] text-sm tabular-nums">
                  {vessel.built_year ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-[#9C9891]">
          Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} vessels
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs border-[#E8E5DF] bg-white text-[#757575] hover:text-[#0D0D0D] hover:bg-[#F0EEE9] disabled:opacity-30"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-xs text-[#9C9891] px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs border-[#E8E5DF] bg-white text-[#757575] hover:text-[#0D0D0D] hover:bg-[#F0EEE9] disabled:opacity-30"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <VesselDetailModal
        vessel={selectedVessel}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}

function MatchDot({ confidence }: { confidence: string | null }) {
  const configs: Record<string, { color: string; label: string }> = {
    imo:        { color: '#0E9F6E', label: 'Master-matched (IMO)' },
    exact_name: { color: '#1A56DB', label: 'Master-matched (name)' },
    fuzzy:      { color: '#D97706', label: 'Fuzzy match' },
  }
  const cfg = confidence ? configs[confidence] : null
  return (
    <span
      title={cfg ? cfg.label : 'Unmatched — scraped data only'}
      className="inline-flex shrink-0 cursor-help"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: cfg ? cfg.color : '#D4D0C8' }}
      />
    </span>
  )
}

function SourceBadge({ source }: { source: string | null | undefined }) {
  const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
    email:    { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Email' },
    whatsapp: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'WhatsApp' },
    teams:    { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', label: 'Teams' },
  }
  const c = config[source ?? ''] ?? { bg: '#F5F5F5', text: '#6B7280', border: '#E5E7EB', label: source ?? 'Unknown' }
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium px-2 py-0.5"
      style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
    >
      {c.label}
    </Badge>
  )
}

function SortHead({
  label,
  sortKey,
  current,
  dir,
  onSort,
  primary,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  primary?: boolean
}) {
  const isActive = current === sortKey
  return (
    <TableHead className={primary ? 'text-[#0D0D0D] text-xs font-bold uppercase tracking-widest' : 'text-[#9C9891] text-xs font-semibold uppercase tracking-widest'}>
      <button
        className="flex items-center gap-1 hover:text-[#0D0D0D] transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive ? (
          dir === 'asc' ? (
            <ChevronUp className={primary ? 'h-4 w-4' : 'h-3 w-3'} />
          ) : (
            <ChevronDown className={primary ? 'h-4 w-4' : 'h-3 w-3'} />
          )
        ) : (
          <ChevronsUpDown className={primary ? 'h-4 w-4 opacity-30' : 'h-3 w-3 opacity-30'} />
        )}
      </button>
    </TableHead>
  )
}
