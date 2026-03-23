'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VesselStats } from '@/lib/types'

interface ChartsProps {
  stats: VesselStats
}

const COLORS = ['#38bdf8', '#34d399', '#a78bfa', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80']

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
}

export function Charts({ stats }: ChartsProps) {
  const typeData = Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const regionData = Object.entries(stats.byRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))

  const sourceData = [
    { name: 'Email', value: stats.bySource['email'] ?? 0 },
    { name: 'WhatsApp', value: stats.bySource['whatsapp'] ?? 0 },
    { name: 'Teams', value: stats.bySource['teams'] ?? 0 },
  ].filter((d) => d.value > 0)

  const dwtData = stats.dwtDistribution.filter((d) => d.count > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vessels by Type */}
      <ChartCard title="Vessels by Type">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={typeData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b80' }} />
            <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} name="Vessels" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Source Breakdown */}
      <ChartCard title="Source Breakdown">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {sourceData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Vessels by Region */}
      <ChartCard title="Top Regions">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={regionData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b80' }} />
            <Bar dataKey="value" fill="#34d399" radius={[0, 4, 4, 0]} name="Vessels" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* DWT Distribution */}
      <ChartCard title="DWT Distribution">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dwtData} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#1e293b80' }} />
            <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Vessels" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">{children}</CardContent>
    </Card>
  )
}
