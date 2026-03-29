import { NextRequest, NextResponse } from 'next/server'
import { enrichVesselFromMaster } from '@/lib/enrichment'
import type { Vessel } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const vessel = body as Partial<Vessel>

    if (!vessel.vessel_name) {
      return NextResponse.json({ error: 'vessel_name is required' }, { status: 400 })
    }

    const result = await enrichVesselFromMaster(vessel)

    return NextResponse.json({
      enrichedVessel: result.enrichedVessel,
      matchConfidence: result.matchConfidence,
      matchScore: result.matchScore,
      fieldsEnriched: result.fieldsEnriched,
    })
  } catch (err) {
    console.error('[/api/enrich]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Enrichment failed' },
      { status: 500 }
    )
  }
}
