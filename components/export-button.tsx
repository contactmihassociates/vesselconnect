'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Vessel } from '@/lib/types'
import { exportToCSV } from '@/lib/utils'
import { format } from 'date-fns'

interface ExportButtonProps {
  vessels: Vessel[]
}

export function ExportButton({ vessels }: ExportButtonProps) {
  const handleExport = () => {
    const filename = `vessels_${format(new Date(), 'yyyy-MM-dd')}.csv`
    exportToCSV(vessels, filename)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={vessels.length === 0}
      className="border-slate-700 bg-slate-800/50 text-slate-300 hover:text-slate-100 hover:bg-slate-700 gap-2"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  )
}
