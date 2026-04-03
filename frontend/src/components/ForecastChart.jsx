import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#131929', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ color: '#8b97b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Number(p.value).toFixed(1)}
        </p>
      ))}
    </div>
  )
}

export default function ForecastChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ff4444" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ff4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0088ff" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0088ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date_short" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8}
          formatter={(v) => <span style={{ color: '#8b97b8', fontSize: 12 }}>{v}</span>} />
        <ReferenceLine y={100} stroke="#ffaa00" strokeDasharray="4 4" label={{ value: 'Moderate', fill: '#ffaa00', fontSize: 11 }} />
        <ReferenceLine y={200} stroke="#ff4444" strokeDasharray="4 4" label={{ value: 'Poor', fill: '#ff4444', fontSize: 11 }} />
        <Area type="monotone" dataKey="max_aqi" name="Max AQI" stroke="#ff4444" strokeWidth={1.5} fill="url(#maxGrad)" dot={false} />
        <Area type="monotone" dataKey="avg_aqi" name="Avg AQI" stroke="#0088ff" strokeWidth={2} fill="url(#avgGrad)" dot={{ r: 5, fill: '#0088ff' }} />
        <Area type="monotone" dataKey="min_aqi" name="Min AQI" stroke="#00ff88" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
