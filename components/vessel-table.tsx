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
import { ChevronUp, ChevronDown, ChevronsUpDown, Ship } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Ship className="h-10 w-10 animate-pulse" />
        <p className="text-sm">Loading vessels...</p>
      </div>
    )
  }

  if (vessels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Ship className="h-10 w-10" />
        <p className="text-sm">No vessels match the current filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-800/20">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-transparent">
              <SortHead label="Vessel Name" sortKey="vessel_name" current={sortKey} dir={sortDir} onSort={handleSort} primary />
              <SortHead label="DWT" sortKey="dwt" current={sortKey} dir={sortDir} onSort={handleSort} primary />
              <TableHead className="text-sky-400 text-sm font-bold uppercase tracking-wider">Type</TableHead>
              <SortHead label="Open Date" sortKey="open_date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHead label="Open Port" sortKey="open_port" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortHead label="Region" sortKey="region" current={sortKey} dir={sortDir} onSort={handleSort} />
              <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Source</TableHead>
              <SortHead label="Built" sortKey="built_year" current={sortKey} dir={sortDir} onSort={handleSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((vessel) => (
              <TableRow
                key={vessel.id}
                className="border-slate-700/30 hover:bg-sky-950/40 cursor-pointer transition-colors group"
                onClick={() => openDetail(vessel)}
              >
                <TableCell className="font-bold text-white text-base group-hover:text-sky-300 transition-colors py-4">
                  {vessel.vessel_name}
                </TableCell>
                <TableCell className="text-sky-200 text-base font-semibold tabular-nums py-4">
                  {formatDWT(vessel.dwt)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className="bg-sky-500/20 border border-sky-500/40 text-sky-300 text-sm font-semibold px-3 py-1"
                  >
                    {vessel.vessel_type ?? inferVesselType(vessel.dwt)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300 text-sm tabular-nums">
                  {formatDate(vessel.open_date)}
                </TableCell>
                <TableCell className="text-slate-300 text-sm">{vessel.open_port ?? '—'}</TableCell>
                <TableCell className="text-slate-400 text-sm">{vessel.region ?? '—'}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs border ${getSourceColor(vessel.source)}`}
                  >
                    {getSourceLabel(vessel.source)}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 text-sm tabular-nums">
                  {vessel.built_year ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} vessels
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200 disabled:opacity-30"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-xs text-slate-500 px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200 disabled:opacity-30"
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
    <TableHead className={primary ? 'text-sky-400 text-sm font-bold uppercase tracking-wider' : 'text-slate-400 text-xs font-semibold uppercase tracking-wider'}>
      <button
        className="flex items-center gap-1 hover:text-white transition-colors"
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
          <ChevronsUpDown className={primary ? 'h-4 w-4 opacity-50' : 'h-3 w-3 opacity-40'} />
        )}
      </button>
    </TableHead>
  )
}
