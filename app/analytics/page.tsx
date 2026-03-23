'use client'

import { useVessels } from '@/lib/hooks/use-vessels'
import { useStats } from '@/lib/hooks/use-stats'
import { StatsCards } from '@/components/stats-cards'
import { Charts } from '@/components/charts'
import { LiveIndicator } from '@/components/live-indicator'

export default function AnalyticsPage() {
  const { vessels, realtimeStatus } = useVessels()
  const stats = useStats(vessels)

  return (
    <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-200">Analytics</h1>
        <LiveIndicator status={realtimeStatus} />
      </div>

      <StatsCards stats={stats} />
      <Charts stats={stats} />
    </main>
  )
}
