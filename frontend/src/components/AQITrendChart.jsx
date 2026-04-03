import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#131929', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ color: '#8b97b8', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#00ff88', fontWeight: 700 }}>AQI: {payload[0]?.value}</p>
    </div>
  )
}

export default function AQITrendChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="aqi" stroke="#00ff88" strokeWidth={2}
          fill="url(#aqiGrad)" dot={false} activeDot={{ r: 5, fill: '#00ff88' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
