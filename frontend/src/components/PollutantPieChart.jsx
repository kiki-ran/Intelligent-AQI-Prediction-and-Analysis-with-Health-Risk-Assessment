import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0088ff', '#00ff88', '#ffaa00', '#ff4444', '#9955ff', '#00ccff', '#ff6600']

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 18
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#8b97b8" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function PollutantPieChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={36}
          dataKey="value"
          nameKey="name"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }}
          formatter={(v) => [v.toFixed(2), 'µg/m³']}
        />
        <Legend iconType="circle" iconSize={8}
          formatter={(v) => <span style={{ color: '#8b97b8', fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
