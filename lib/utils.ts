import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday, isThisWeek } from 'date-fns'
import type { Vessel, FilterState } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'dd-MM-yyyy')
  } catch {
    return dateStr
  }
}

export function formatDWT(dwt: number | null): string {
  if (!dwt) return '—'
  return dwt.toLocaleString()
}

export function inferVesselType(dwt: number | null): string {
  if (!dwt) return 'Other'
  if (dwt < 20000) return 'Mini Bulkers'
  if (dwt < 40000) return 'Handy Size'
  if (dwt < 55000) return 'Handymax'
  if (dwt < 65000) return 'Supramax'
  if (dwt < 82000) return 'Ultramax'
  if (dwt < 100000) return 'Panamax'
  if (dwt < 120000) return 'Kamsarmax'
  if (dwt < 180000) return 'Mini Cape'
  if (dwt < 400000) return 'Capesize'
  return 'VLOC'
}

export function getSourceLabel(source: string): string {
  const map: Record<string, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    teams: 'Teams',
  }
  return map[source] ?? source
}

export function getSourceColor(source: string): string {
  const map: Record<string, string> = {
    email: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    whatsapp: 'bg-green-500/20 text-green-400 border-green-500/30',
    teams: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }
  return map[source] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

export function exportToCSV(vessels: Vessel[], filename = 'vessels.csv') {
  const headers = [
    'Vessel Name',
    'DWT',
    'Type',
    'Open Date',
    'Open Port',
    'Region',
    'Source',
    'Built Year',
    'Flag',
    'GRT',
    'NRT',
    'LOA',
    'Speed (Laden)',
    'Speed (Ballast)',
    'Owner/Manager',
    'Scrubber Fitted',
    'Last Seen',
  ]

  const rows = vessels.map((v) => [
    v.vessel_name,
    v.dwt ?? '',
    inferVesselType(v.dwt),
    v.open_date ? formatDate(v.open_date) : '',
    v.open_port ?? '',
    v.region ?? '',
    getSourceLabel(v.source),
    v.built_year ?? '',
    v.flag ?? '',
    v.grt ?? '',
    v.nrt ?? '',
    v.loa ?? '',
    v.speed_laden_knots ?? '',
    v.speed_ballast_knots ?? '',
    v.owner_manager ?? '',
    v.scrubber_fitted ? 'Yes' : v.scrubber_fitted === false ? 'No' : '',
    v.last_seen_at ? formatDate(v.last_seen_at) : '',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function inferRegionFromPort(port: string | null): string | null {
  if (!port) return null
  const p = port.toLowerCase()
  if (/mumbai|kandla|mundra|goa|dahej|hazira|navlakhi|pipavav|okha/.test(p)) return 'WCI'
  if (/vizag|visakhapatnam|kakinada|gangavaram|krishnapatnam|paradip|haldia|kolkata|dhamra/.test(p)) return 'ECI'
  if (/singapore|johor|port klang|klang|penang|lumut|pasir gudang/.test(p)) return 'SE Asia'
  if (/shanghai|qingdao|tianjin|ningbo|guangzhou|guangdong|dalian|zhanjiang|lianyungang|yangpu/.test(p)) return 'CHN'
  if (/busan|ulsan|incheon|pyeongtaek/.test(p)) return 'KOR'
  if (/tokyo|osaka|nagoya|yokohama|kobe/.test(p)) return 'JPN'
  if (/jebel ali|dubai|fujairah|muscat|jeddah|dammam|ras al khaimah|abu dhabi|sohar|salalah|karachi|port qasim/.test(p)) return 'AG'
  if (/durban|richards bay|maputo|dar es salaam|mombasa|beira|nacala/.test(p)) return 'E. Africa'
  if (/santos|paranagua|rio grande|recife|fortaleza|itaqui|praia mole/.test(p)) return 'ECSA'
  if (/rotterdam|amsterdam|antwerp|hamburg|ghent|bremen|dunkirk|le havre/.test(p)) return 'EMED'
  if (/chittagong|mongla/.test(p)) return 'ECI'
  if (/bangkok|laem chabang|songkhla|thailand/.test(p)) return 'SE Asia'
  if (/manila|subic|cebu|philippines/.test(p)) return 'SE Asia'
  if (/jakarta|surabaya|kalimantan|indonesia/.test(p)) return 'SE Asia'
  if (/ho chi minh|haiphong|vietnam/.test(p)) return 'SE Asia'
  if (/colombo|sri lanka/.test(p)) return 'ECI'
  if (/yangon|myanmar/.test(p)) return 'SE Asia'
  if (/taiwan|kaohsiung|keelung/.test(p)) return 'CJK'
  if (/vladivostok|nakhodka|vostochny/.test(p)) return 'NOPAC'
  if (/west africa|dakar|tema|lomé|lome|abidjan|lagos|port harcourt|apapa/.test(p)) return 'WC Africa'
  if (/bunbury|port hedland|dampier|geraldton|fremantle|newcastle|port kembla|wollongong|brisbane|gladstone|hay point|abbot point/.test(p)) return 'NOPAC'
  if (/vancouver|prince rupert|portland|seattle/.test(p)) return 'NOPAC'
  if (/fareast|far east/.test(p)) return 'FE'
  return null
}

export function applyFilters(vessels: Vessel[], filters: FilterState): Vessel[] {
  return vessels.filter((v) => {
    if (
      filters.search &&
      !(v.vessel_name ?? '').toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
    if (filters.vesselTypes.length > 0) {
      const type = inferVesselType(v.dwt)
      if (!filters.vesselTypes.includes(type as never)) return false
    }
    if (filters.regions.length > 0) {
      if (!v.region || !filters.regions.includes(v.region)) return false
    }
    if (filters.sources.length > 0) {
      if (!filters.sources.includes(v.source)) return false
    }
    if (v.dwt !== null) {
      if (filters.dwtMin > 0 && v.dwt < filters.dwtMin) return false
      if (filters.dwtMax > 0 && v.dwt > filters.dwtMax) return false
    }
    if (filters.openDateFrom && v.open_date && v.open_date < filters.openDateFrom) {
      return false
    }
    if (filters.openDateTo && v.open_date && v.open_date > filters.openDateTo) {
      return false
    }
    return true
  })
}

export function isNewToday(dateStr: string): boolean {
  try {
    return isToday(parseISO(dateStr))
  } catch {
    return false
  }
}

export function isNewThisWeek(dateStr: string): boolean {
  try {
    return isThisWeek(parseISO(dateStr))
  } catch {
    return false
  }
}
