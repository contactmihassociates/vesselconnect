export type VesselSource = 'email' | 'whatsapp' | 'teams'

export type VesselType =
  | 'Handy Size'
  | 'Handymax'
  | 'Supramax'
  | 'Ultramax'
  | 'Panamax'
  | 'Kamsarmax'
  | 'Mini Bulkers'
  | 'Mini Cape'
  | 'Capesize'
  | 'VLOC'
  | 'Tanker'
  | 'Other'

export interface Vessel {
  id: string
  vessel_name: string
  dwt: number | null
  grt: number | null
  nrt: number | null
  built_year: number | null
  flag: string | null
  loa: number | null
  beam: number | null
  grain_capacity: number | null
  crane_details: string | null
  speed_laden_knots: number | null
  speed_ballast_knots: number | null
  consumption_laden_vlsfo: number | null
  consumption_ballast_vlsfo: number | null
  port_consumption_working_vlsfo: number | null
  port_consumption_idle_vlsfo: number | null
  open_port: string | null
  open_date: string | null
  last_5_cargoes: string | null
  owner_manager: string | null
  vetting_status: string | null
  scrubber_fitted: boolean | null
  special_features: string | null
  commercial_status: string | null
  source: VesselSource
  source_identifier: string | null
  first_seen_at: string
  last_seen_at: string
  region: string | null
  vessel_type: VesselType | null
  created_at?: string
}

export interface FilterState {
  search: string
  vesselTypes: VesselType[]
  regions: string[]
  dwtMin: number
  dwtMax: number
  openDateFrom: string
  openDateTo: string
  sources: VesselSource[]
}

export interface VesselStats {
  total: number
  newToday: number
  newThisWeek: number
  byType: Record<string, number>
  byRegion: Record<string, number>
  bySource: Record<string, number>
  dwtDistribution: { range: string; count: number }[]
}

export const VESSEL_TYPES: VesselType[] = [
  'Handy Size',
  'Handymax',
  'Supramax',
  'Ultramax',
  'Panamax',
  'Kamsarmax',
  'Mini Bulkers',
  'Mini Cape',
  'Capesize',
  'VLOC',
  'Tanker',
  'Other',
]

export const REGIONS: string[] = [
  'AG',
  'CA',
  'CARIB',
  'Caribbean',
  'CHN',
  'CJK',
  'E. Africa',
  'EA',
  'EAF',
  'EAFR',
  'East Asia',
  'ECH',
  'ECI',
  'ECSA',
  'EMED',
  'FE',
  'Indian Ocean',
  'JPN',
  'KOR',
  'MED',
  'NOPAC',
  'SE Asia',
  'WCI',
  'WC Africa',
  'Other',
]

export const SOURCES: { value: VesselSource; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'teams', label: 'Teams' },
]
