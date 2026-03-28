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
      className="border-[#E8E5DF] bg-white text-[#4B4B4B] hover:text-[#0D0D0D] hover:bg-[#F0EEE9] gap-2 rounded-xl shadow-sm font-medium"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  )
}
