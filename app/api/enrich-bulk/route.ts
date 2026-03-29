import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enrichVesselFromMaster } from '@/lib/enrichment'
import type { Vessel } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const vessel_ids: string[] | undefined = body.vessel_ids

    // Fetch vessels to enrich
    let query = supabase.from('vessels').select('*')
    if (vessel_ids && vessel_ids.length > 0) {
      query = query.in('id', vessel_ids)
    } else {
      // Enrich all that haven't been enriched or have missing core fields
      query = query.or(
        'enriched_at.is.null,match_confidence.is.null'
      )
    }

    const { data: vessels, error: fetchError } = await query
    if (fetchError) throw fetchError

    const results = {
      enriched: 0,
      unmatched: 0,
      errors: 0,
      details: [] as { id: string; name: string; confidence: string | null; fieldsEnriched: string[] }[],
    }

    for (const vessel of (vessels ?? []) as Vessel[]) {
      try {
        const { enrichedVessel, matchConfidence, matchScore, fieldsEnriched } =
          await enrichVesselFromMaster(vessel)

        if (fieldsEnriched.length > 0) {
          // Only update fields that were actually enriched
          const updatePayload: Record<string, unknown> = {}
          for (const field of fieldsEnriched) {
            updatePayload[field] = (enrichedVessel as Record<string, unknown>)[field] ?? null
          }
          updatePayload.match_confidence = matchConfidence
          updatePayload.match_score = matchScore
          updatePayload.enriched_at = new Date().toISOString()

          await supabase.from('vessels').update(updatePayload).eq('id', vessel.id)
          results.enriched++
        } else {
          results.unmatched++
        }

        results.details.push({
          id: vessel.id,
          name: vessel.vessel_name,
          confidence: matchConfidence,
          fieldsEnriched,
        })
      } catch (err) {
        results.errors++
        results.details.push({
          id: vessel.id,
          name: vessel.vessel_name,
          confidence: null,
          fieldsEnriched: [],
        })
      }
    }

    return NextResponse.json({
      ...results,
      total: vessels?.length ?? 0,
      message: `Enriched ${results.enriched}/${(vessels?.length ?? 0)} vessels. ${results.unmatched} unmatched. ${results.errors} errors.`,
    })
  } catch (err) {
    console.error('[/api/enrich-bulk]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bulk enrichment failed' },
      { status: 500 }
    )
  }
}
