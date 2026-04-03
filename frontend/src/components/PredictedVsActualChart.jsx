import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#131929', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13, minWidth: 130
    }}>
      <p style={{ color: '#8b97b8', marginBottom: 6 }}>Sample #{label + 1}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Number(p.value).toFixed(1)}
        </p>
      ))}
    </div>
  )
}

export default function PredictedVsActualChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="index" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(v) => <span style={{ color: '#8b97b8', fontSize: 12 }}>{v}</span>}
        />
        <Line type="monotone" dataKey="actual"    name="Actual"    stroke="#00ff88" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#0088ff" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  )
}
