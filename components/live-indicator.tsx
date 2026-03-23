'use client'

import { cn } from '@/lib/utils'
import type { RealtimeStatus } from '@/lib/hooks/use-vessels'

interface LiveIndicatorProps {
  status: RealtimeStatus
}

export function LiveIndicator({ status }: LiveIndicatorProps) {
  const config = {
    connected: {
      dot: 'bg-emerald-400',
      ping: 'bg-emerald-400',
      text: 'text-emerald-400',
      label: 'Live',
    },
    connecting: {
      dot: 'bg-amber-400',
      ping: 'bg-amber-400',
      text: 'text-amber-400',
      label: 'Connecting...',
    },
    disconnected: {
      dot: 'bg-red-400',
      ping: '',
      text: 'text-red-400',
      label: 'Offline',
    },
    mock: {
      dot: 'bg-sky-400',
      ping: '',
      text: 'text-sky-400',
      label: 'Demo Mode',
    },
  }[status]

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {(status === 'connected' || status === 'connecting') && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.ping
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', config.dot)} />
      </span>
      <span className={cn('text-xs font-medium', config.text)}>{config.label}</span>
    </div>
  )
}
