'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Ship, Anchor, Gauge, Package, Building2, Calendar, MapPin, Award, Wrench, Factory } from 'lucide-react'
import type { Vessel } from '@/lib/types'
import { formatDate, formatDWT, getSourceLabel, inferVesselType } from '@/lib/utils'

interface VesselDetailModalProps {
  vessel: Vessel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String)
  } catch {
    // plain comma-separated string
  }
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

function sourceStyle(source: string | null | undefined) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    email:    { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    whatsapp: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    teams:    { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  }
  return map[source ?? ''] ?? { bg: '#F5F5F5', text: '#6B7280', border: '#E5E7EB' }
}

export function VesselDetailModal({ vessel, open, onOpenChange }: VesselDetailModalProps) {
  if (!vessel) return null

  const vesselType = inferVesselType(vessel.dwt)
  const src = sourceStyle(vessel.source)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-[#E8E5DF] text-[#0D0D0D] p-0 gap-0 rounded-2xl shadow-xl">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle
                className="text-2xl font-bold text-[#0D0D0D] tracking-tight"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {vessel.vessel_name ?? '(Vessel Name Unknown)'}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <Badge className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold">
                  {vesselType}
                </Badge>
                {vessel.flag && (
                  <Badge variant="outline" className="border-[#E8E5DF] text-[#757575] text-xs">
                    {vessel.flag}
                  </Badge>
                )}
                {vessel.built_year && (
                  <Badge variant="outline" className="border-[#E8E5DF] text-[#757575] text-xs">
                    Built {vessel.built_year}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs font-medium"
                  style={{ backgroundColor: src.bg, color: src.text, borderColor: src.border }}
                >
                  {getSourceLabel(vessel.source)}
                </Badge>
                {vessel.scrubber_fitted && (
                  <Badge className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs">
                    Scrubber
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-[#E8E5DF]" />

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Position */}
            <Section icon={<MapPin className="h-4 w-4 text-[#1A56DB]" />} title="Current Position">
              <Grid>
                <Field label="Open Port" value={vessel.open_port} />
                <Field label="Open Date" value={formatDate(vessel.open_date)} />
                <Field label="Region" value={vessel.region} />
                <Field label="Commercial Status" value={vessel.commercial_status} />
              </Grid>
            </Section>

            {/* Dimensions */}
            <Section icon={<Ship className="h-4 w-4 text-[#1A56DB]" />} title="Dimensions">
              <Grid>
                <Field label="DWT" value={vessel.dwt ? `${formatDWT(vessel.dwt)} MT` : null} />
                <Field label="GRT" value={vessel.grt ? formatDWT(vessel.grt) : null} />
                <Field label="NRT" value={vessel.nrt ? formatDWT(vessel.nrt) : null} />
                <Field label="LOA" value={vessel.loa ? `${vessel.loa}m` : null} />
                <Field label="Beam" value={vessel.beam ? `${vessel.beam}m` : null} />
                <Field
                  label="Grain Capacity"
                  value={vessel.grain_capacity ? `${formatDWT(vessel.grain_capacity)} CBM` : null}
                />
              </Grid>
            </Section>

            {/* Equipment */}
            <Section icon={<Anchor className="h-4 w-4 text-[#1A56DB]" />} title="Equipment">
              <Grid>
                <Field label="Cranes" value={vessel.crane_details} />
                <Field label="Vetting Status" value={vessel.vetting_status} />
              </Grid>
              {vessel.special_features && vessel.special_features !== '[]' && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parseJsonArray(vessel.special_features).map((feat, i) => (
                    <Badge key={i} variant="outline" className="border-[#E8E5DF] text-[#757575] text-xs">
                      {feat}
                    </Badge>
                  ))}
                </div>
              )}
            </Section>

            {/* Performance */}
            <Section icon={<Gauge className="h-4 w-4 text-[#1A56DB]" />} title="Performance">
              <Grid>
                <Field
                  label="Speed (Laden)"
                  value={vessel.speed_laden_knots ? `${vessel.speed_laden_knots} kn` : null}
                />
                <Field
                  label="Speed (Ballast)"
                  value={vessel.speed_ballast_knots ? `${vessel.speed_ballast_knots} kn` : null}
                />
                <Field
                  label="Consumption Laden (VLSFO)"
                  value={vessel.consumption_laden_vlsfo ? `${vessel.consumption_laden_vlsfo} MT/day` : null}
                />
                <Field
                  label="Consumption Ballast (VLSFO)"
                  value={vessel.consumption_ballast_vlsfo ? `${vessel.consumption_ballast_vlsfo} MT/day` : null}
                />
                <Field
                  label="Port Working (VLSFO)"
                  value={vessel.port_consumption_working_vlsfo ? `${vessel.port_consumption_working_vlsfo} MT/day` : null}
                />
                <Field
                  label="Port Idle (VLSFO)"
                  value={vessel.port_consumption_idle_vlsfo ? `${vessel.port_consumption_idle_vlsfo} MT/day` : null}
                />
              </Grid>
            </Section>

            {/* Cargo History */}
            {vessel.last_5_cargoes && vessel.last_5_cargoes !== '[]' && (
              <Section icon={<Package className="h-4 w-4 text-[#1A56DB]" />} title="Last 5 Cargoes">
                <div className="flex flex-wrap gap-1.5">
                  {parseJsonArray(vessel.last_5_cargoes).map((cargo, i) => (
                    <Badge key={i} variant="outline" className="border-[#E8E5DF] text-[#4B4B4B] text-xs font-medium">
                      {cargo}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {/* Ownership */}
            <Section icon={<Building2 className="h-4 w-4 text-[#1A56DB]" />} title="Ownership">
              <Grid>
                <Field label="Owner / Manager" value={vessel.owner_manager} />
                <Field label="Commercial Operator" value={vessel.commercial_operator} />
              </Grid>
            </Section>

            {/* Classification & CII — only shown if master-enriched */}
            {(vessel.classification || vessel.cii_ranking_last_year || vessel.eexi) && (
              <Section icon={<Award className="h-4 w-4 text-[#1A56DB]" />} title="Classification">
                <Grid>
                  <Field label="Classification Society" value={vessel.classification} />
                  <Field label="CII Ranking (Last Year)" value={vessel.cii_ranking_last_year} />
                  <Field label="CII Ranking (YTD)" value={vessel.cii_ranking_ytd} />
                  <Field label="EEXI" value={vessel.eexi} />
                </Grid>
              </Section>
            )}

            {/* Build details — only shown if master-enriched */}
            {(vessel.shipyard_built || vessel.country_built || vessel.design_model) && (
              <Section icon={<Factory className="h-4 w-4 text-[#1A56DB]" />} title="Build Details">
                <Grid>
                  <Field label="Shipyard" value={vessel.shipyard_built} />
                  <Field label="Country Built" value={vessel.country_built} />
                  <Field label="Design Model" value={vessel.design_model} />
                </Grid>
              </Section>
            )}

            {/* Market History */}
            <Section icon={<Calendar className="h-4 w-4 text-[#1A56DB]" />} title="Market Activity">
              <Grid>
                <Field label="First Seen" value={formatDate(vessel.first_seen_at)} />
                <Field label="Last Seen" value={formatDate(vessel.last_seen_at)} />
                <Field label="Source Channel" value={getSourceLabel(vessel.source)} />
                {vessel.imo && <Field label="IMO Number" value={vessel.imo} />}
              </Grid>
            </Section>

            {/* Data source indicator */}
            <div className="pt-1">
              {vessel.match_confidence ? (
                <p className="text-xs text-[#0E9F6E] font-medium flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0E9F6E]" />
                  Data enriched from vessel master database
                  {vessel.match_confidence === 'imo' ? ' (IMO match)' : vessel.match_confidence === 'exact_name' ? ' (name match)' : ' (fuzzy match)'}
                </p>
              ) : (
                <p className="text-xs text-[#9C9891] flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D4D0C8]" />
                  Data from scraped source only
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-bold text-[#9C9891] uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9C9891] mb-0.5">{label}</p>
      <p className="text-sm text-[#0D0D0D] font-medium">{value}</p>
    </div>
  )
}
