'use client'

import { cn } from '@/lib/utils'
import type { RealtimeStatus } from '@/lib/hooks/use-vessels'

interface LiveIndicatorProps {
  status: RealtimeStatus
}

export function LiveIndicator({ status }: LiveIndicatorProps) {
  const config = {
    connected: {
      dot: 'bg-[#0E9F6E]',
      ping: 'bg-[#0E9F6E]',
      textColor: '#0E9F6E',
      label: 'Live',
    },
    connecting: {
      dot: 'bg-[#D97706]',
      ping: 'bg-[#D97706]',
      textColor: '#D97706',
      label: 'Connecting...',
    },
    disconnected: {
      dot: 'bg-[#EF4444]',
      ping: '',
      textColor: '#EF4444',
      label: 'Offline',
    },
  }[status]

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E5DF] rounded-xl shadow-sm">
      <span className="relative flex h-2 w-2">
        {(status === 'connected' || status === 'connecting') && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              config.ping
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.dot)} />
      </span>
      <span className="text-xs font-medium" style={{ color: config.textColor }}>
        {config.label}
      </span>
    </div>
  )
}
