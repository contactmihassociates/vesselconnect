import { createClient } from '@supabase/supabase-js'
import type { Vessel } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (used in API routes)
function getServerSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

const MV_PREFIX = /^(?:M\/?V\.?|M\.V\.?|MT|M\/T)\s*/i

export function normalizeVesselName(name: string): string {
  return name
    .replace(MV_PREFIX, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

export interface VesselMasterRow {
  id: number
  full_vessel_name: string | null
  vessel_name: string
  vessel_name_upper: string
  vessel_class: string | null
  dwt: number | null
  built_year: number | null
  geared: string | null
  gear_details: string | null
  commercial_operator: string | null
  head_owner: string | null
  flag: string | null
  imo: number | null
  grt: number | null
  nrt: number | null
  loa: number | null
  beam: number | null
  grain_capacity: number | null
  bale_capacity: number | null
  grabs: string | null
  holds: number | null
  hatches: number | null
  scrubbers: string | null
  classification: string | null
  summer_draught: number | null
  summer_tpc: number | null
  design_model: string | null
  country_built: string | null
  shipyard_built: string | null
  cii_last_year: number | null
  cii_ytd: number | null
  cii_ranking_last_year: string | null
  cii_ranking_ytd: string | null
  eexi: number | null
}

export interface MatchResult {
  match: VesselMasterRow | null
  confidence: 'imo' | 'exact_name' | 'fuzzy' | null
  score: number
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

export async function findVesselMatch(
  vesselName: string,
  dwt?: number | null,
  imo?: number | null
): Promise<MatchResult> {
  const db = getServerSupabase()

  // Tier 1: IMO exact match
  if (imo) {
    const { data } = await db
      .from('vessel_master')
      .select('*')
      .eq('imo', imo)
      .single()
    if (data) return { match: data as VesselMasterRow, confidence: 'imo', score: 100 }
  }

  // Tier 2: Exact name match
  const normalizedName = normalizeVesselName(vesselName)
  const { data: exactData } = await db
    .from('vessel_master')
    .select('*')
    .eq('vessel_name_upper', normalizedName)
    .single()
  if (exactData) return { match: exactData as VesselMasterRow, confidence: 'exact_name', score: 95 }

  // Tier 3: Fuzzy — keyword search + DWT range
  // Use first significant word (≥4 chars) as the keyword
  const keywords = normalizedName.split(' ').filter((w) => w.length >= 4)
  if (keywords.length === 0) return { match: null, confidence: null, score: 0 }

  const keyword = keywords[0]
  let query = db
    .from('vessel_master')
    .select('*')
    .ilike('vessel_name_upper', `%${keyword}%`)

  if (dwt) {
    query = query
      .gte('dwt', Math.floor(dwt * 0.92))
      .lte('dwt', Math.ceil(dwt * 1.08))
  }

  const { data: fuzzyData } = await query.limit(10)

  if (fuzzyData && fuzzyData.length > 0) {
    // Pick best by Levenshtein distance
    let best: VesselMasterRow | null = null
    let bestDist = Infinity

    for (const row of fuzzyData as VesselMasterRow[]) {
      const dist = levenshtein(normalizedName, row.vessel_name_upper)
      if (dist < bestDist) {
        bestDist = dist
        best = row
      }
    }

    // Only accept if edit distance is reasonable (≤ 4 chars different)
    if (best && bestDist <= 4) {
      return { match: best, confidence: 'fuzzy', score: Math.max(60, 80 - bestDist * 5) }
    }
  }

  return { match: null, confidence: null, score: 0 }
}

export async function findPortRegion(
  portName: string
): Promise<{ region: string | null; country: string | null; regionFullName: string | null }> {
  const db = getServerSupabase()
  const upperPort = portName.trim().toUpperCase()

  // Exact match
  const { data: exact } = await db
    .from('port_regions')
    .select('region, country, region_full_name')
    .eq('port_name_upper', upperPort)
    .single()

  if (exact) {
    return {
      region: exact.region,
      country: exact.country,
      regionFullName: exact.region_full_name,
    }
  }

  // Partial match — port name contains the search term
  const { data: partial } = await db
    .from('port_regions')
    .select('region, country, region_full_name')
    .ilike('port_name_upper', `%${upperPort}%`)
    .limit(1)
    .single()

  if (partial) {
    return {
      region: partial.region,
      country: partial.country,
      regionFullName: partial.region_full_name,
    }
  }

  // Reverse — our port name contains the DB port name
  const { data: contains } = await db
    .from('port_regions')
    .select('region, country, region_full_name')
    .filter('port_name_upper', 'ilike', `%${upperPort.split(' ')[0]}%`)
    .limit(1)
    .single()

  if (contains) {
    return {
      region: contains.region,
      country: contains.country,
      regionFullName: contains.region_full_name,
    }
  }

  return { region: null, country: null, regionFullName: null }
}

export async function enrichVesselFromMaster(vessel: Partial<Vessel>): Promise<{
  enrichedVessel: Partial<Vessel>
  matchConfidence: 'imo' | 'exact_name' | 'fuzzy' | null
  matchScore: number
  fieldsEnriched: string[]
}> {
  const result = await findVesselMatch(
    vessel.vessel_name ?? '',
    vessel.dwt,
    vessel.imo
  )

  const enriched: Partial<Vessel> = { ...vessel }
  const fieldsEnriched: string[] = []

  if (result.match) {
    const m = result.match

    const fill = <K extends keyof Vessel>(
      field: K,
      value: Vessel[K] | null | undefined
    ) => {
      if ((enriched[field] === null || enriched[field] === undefined) && value != null) {
        enriched[field] = value
        fieldsEnriched.push(field as string)
      }
    }

    fill('dwt', m.dwt)
    fill('grt', m.grt)
    fill('nrt', m.nrt)
    fill('loa', m.loa)
    fill('beam', m.beam)
    fill('grain_capacity', m.grain_capacity)
    fill('built_year', m.built_year)
    fill('flag', m.flag)
    fill('crane_details', m.gear_details)
    fill('owner_manager', m.head_owner)
    fill('imo', m.imo)
    fill('classification', m.classification)
    fill('design_model', m.design_model)
    fill('country_built', m.country_built)
    fill('shipyard_built', m.shipyard_built)
    fill('bale_capacity', m.bale_capacity)
    fill('summer_draught', m.summer_draught)
    fill('commercial_operator', m.commercial_operator)

    if (enriched.scrubber_fitted === null || enriched.scrubber_fitted === undefined) {
      if (m.scrubbers != null) {
        enriched.scrubber_fitted = m.scrubbers.toLowerCase() === 'yes'
        fieldsEnriched.push('scrubber_fitted')
      }
    }

    // Vessel type from vessel_class if missing
    if (!enriched.vessel_type && m.vessel_class) {
      enriched.vessel_type = m.vessel_class as Vessel['vessel_type']
      fieldsEnriched.push('vessel_type')
    }

    enriched.match_confidence = result.confidence
    enriched.match_score = result.score
    enriched.enriched_at = new Date().toISOString()
  }

  // Port region lookup if region still missing
  if (!enriched.region && enriched.open_port) {
    const portResult = await findPortRegion(enriched.open_port)
    if (portResult.region) {
      enriched.region = portResult.region
      fieldsEnriched.push('region')
    }
  }

  return {
    enrichedVessel: enriched,
    matchConfidence: result.confidence,
    matchScore: result.score,
    fieldsEnriched,
  }
}
