'use client'

import { Ship, TrendingUp, Calendar, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { VesselStats } from '@/lib/types'

interface StatsCardsProps {
  stats: VesselStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const topType = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]

  const cards = [
    {
      icon: <Ship className="h-5 w-5 text-sky-400" />,
      label: 'Total Vessels',
      value: stats.total.toString(),
      sub: 'in market',
      accent: 'border-sky-500/20',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      label: 'New Today',
      value: stats.newToday.toString(),
      sub: `${stats.newThisWeek} this week`,
      accent: 'border-emerald-500/20',
    },
    {
      icon: <Layers className="h-5 w-5 text-amber-400" />,
      label: 'Most Common Type',
      value: topType ? topType[0] : '—',
      sub: topType ? `${topType[1]} vessels` : '',
      accent: 'border-amber-500/20',
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-400" />,
      label: 'Sources',
      value: `${stats.bySource['email'] ?? 0}E / ${stats.bySource['whatsapp'] ?? 0}W / ${stats.bySource['teams'] ?? 0}T`,
      sub: 'Email / WhatsApp / Teams',
      accent: 'border-purple-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`bg-slate-800/30 border-slate-700/50 ${card.accent} backdrop-blur-sm`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-slate-100 leading-none mb-1">{card.value}</p>
            <p className="text-xs text-slate-500">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
