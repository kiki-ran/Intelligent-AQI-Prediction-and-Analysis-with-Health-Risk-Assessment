import { RadialBarChart, RadialBar, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AQICategoryDonut({ data = [] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return <div style={{ color: '#4a5578', padding: 20, textAlign: 'center' }}>No data</div>

  const chartData = data
    .filter(d => d.count > 0)
    .map(d => ({ ...d, pct: Math.round(d.count / total * 100) }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadialBarChart
        cx="50%" cy="55%"
        innerRadius="25%" outerRadius="80%"
        data={chartData}
        startAngle={90} endAngle={-270}
      >
        <RadialBar
          dataKey="pct"
          background={{ fill: 'rgba(255,255,255,0.02)' }}
          label={{ position: 'insideStart', fill: '#000', fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip
          contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }}
          formatter={(v, name, { payload }) => [`${v}% (${payload.count} records)`, payload.category]}
        />
        <Legend
          iconSize={10} iconType="circle"
          formatter={(v, { payload }) => (
            <span style={{ color: '#8b97b8', fontSize: 11 }}>{payload.category}</span>
          )}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
