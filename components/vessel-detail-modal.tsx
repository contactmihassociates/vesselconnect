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
import { Ship, Anchor, Gauge, Package, Building2, Calendar, MapPin } from 'lucide-react'
import type { Vessel } from '@/lib/types'
import { formatDate, formatDWT, getSourceLabel, getSourceColor, inferVesselType } from '@/lib/utils'

interface VesselDetailModalProps {
  vessel: Vessel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VesselDetailModal({ vessel, open, onOpenChange }: VesselDetailModalProps) {
  if (!vessel) return null

  const vesselType = vessel.vessel_type ?? inferVesselType(vessel.dwt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-slate-100 p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-white tracking-wide">
                {vessel.vessel_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
                  {vesselType}
                </Badge>
                {vessel.flag && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    {vessel.flag}
                  </Badge>
                )}
                {vessel.built_year && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                    Built {vessel.built_year}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-xs border ${getSourceColor(vessel.source)}`}
                >
                  {getSourceLabel(vessel.source)}
                </Badge>
                {vessel.scrubber_fitted && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    Scrubber
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-slate-700/50" />

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Position */}
            <Section icon={<MapPin className="h-4 w-4 text-sky-400" />} title="Current Position">
              <Grid>
                <Field label="Open Port" value={vessel.open_port} />
                <Field label="Open Date" value={formatDate(vessel.open_date)} />
                <Field label="Region" value={vessel.region} />
                <Field label="Commercial Status" value={vessel.commercial_status} />
              </Grid>
            </Section>

            {/* Dimensions */}
            <Section icon={<Ship className="h-4 w-4 text-sky-400" />} title="Dimensions">
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
            <Section icon={<Anchor className="h-4 w-4 text-sky-400" />} title="Equipment">
              <Grid>
                <Field label="Cranes" value={vessel.crane_details} />
                <Field label="Special Features" value={vessel.special_features} />
                <Field label="Vetting Status" value={vessel.vetting_status} />
              </Grid>
            </Section>

            {/* Performance */}
            <Section icon={<Gauge className="h-4 w-4 text-sky-400" />} title="Performance">
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
            {vessel.last_5_cargoes && (
              <Section icon={<Package className="h-4 w-4 text-sky-400" />} title="Last 5 Cargoes">
                <p className="text-sm text-slate-300">{vessel.last_5_cargoes}</p>
              </Section>
            )}

            {/* Ownership */}
            <Section icon={<Building2 className="h-4 w-4 text-sky-400" />} title="Ownership">
              <Grid>
                <Field label="Owner / Manager" value={vessel.owner_manager} />
              </Grid>
            </Section>

            {/* Market History */}
            <Section icon={<Calendar className="h-4 w-4 text-sky-400" />} title="Market Activity">
              <Grid>
                <Field label="First Seen" value={formatDate(vessel.first_seen_at)} />
                <Field label="Last Seen" value={formatDate(vessel.last_seen_at)} />
                <Field label="Source Channel" value={getSourceLabel(vessel.source)} />
              </Grid>
            </Section>
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
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-2">{children}</div>
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  )
}
