'use client'

import { Ship, TrendingUp, Calendar, Layers } from 'lucide-react'
import type { VesselStats } from '@/lib/types'

interface StatsCardsProps {
  stats: VesselStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const topType = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]

  const cards = [
    {
      icon: <Ship className="h-4 w-4" />,
      label: 'Total Vessels',
      value: stats.total.toString(),
      sub: 'in market',
      accentColor: '#1A56DB',
      iconBg: '#EFF6FF',
      iconColor: '#1A56DB',
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'New Today',
      value: stats.newToday.toString(),
      sub: `${stats.newThisWeek} this week`,
      accentColor: '#0E9F6E',
      iconBg: '#F0FDF4',
      iconColor: '#0E9F6E',
    },
    {
      icon: <Layers className="h-4 w-4" />,
      label: 'Most Common Type',
      value: topType ? topType[0] : '—',
      sub: topType ? `${topType[1]} vessels` : '',
      accentColor: '#D97706',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Sources',
      value: `${stats.bySource['email'] ?? 0}E / ${stats.bySource['whatsapp'] ?? 0}W / ${stats.bySource['teams'] ?? 0}T`,
      sub: 'Email / WhatsApp / Teams',
      accentColor: '#7C3AED',
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-[#E8E5DF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          style={{ borderTopWidth: '3px', borderTopColor: card.accentColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9C9891]">
              {card.label}
            </p>
            <div
              className="flex items-center justify-center h-7 w-7 rounded-lg"
              style={{ backgroundColor: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
          </div>
          <p
            className="text-3xl font-bold text-[#0D0D0D] leading-none mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {card.value}
          </p>
          <p className="text-xs text-[#9C9891] mt-1.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
