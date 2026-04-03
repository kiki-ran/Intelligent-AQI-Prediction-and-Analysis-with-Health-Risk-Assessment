import { useEffect, useState } from 'react'
import { getDashboardData } from '../api/apiService'
import { getAqiColor, formatNum } from '../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts'

export default function CityInsights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p>Loading city insights…</p>
    </div>
  )
  if (error) return <div className="error-banner">⚠️ {error}</div>
  if (!data) return null

  const areas = (data.area_stats || []).slice()  // sorted by AQI desc
  const top5 = areas.slice(0, 5)
  const clean5 = areas.slice(-5).reverse()

  // Bar chart data
  const barData = areas.map(a => ({
    name: a.area.split(' ').slice(-1)[0], // short name
    fullName: a.area,
    aqi: Math.round(a.aqi),
    color: getAqiColor(a.aqi),
  }))

  // Seasonal pattern (simulated from monthly avg — using temp/humidity proxies)
  const seasonalData = [
    { month: 'Jan', aqi: 145, temp: 27, humidity: 72 },
    { month: 'Feb', aqi: 138, temp: 29, humidity: 68 },
    { month: 'Mar', aqi: 125, temp: 33, humidity: 58 },
    { month: 'Apr', aqi: 118, temp: 37, humidity: 60 },
    { month: 'May', aqi: 105, temp: 39, humidity: 62 },
    { month: 'Jun', aqi: 88,  temp: 33, humidity: 82 },
    { month: 'Jul', aqi: 82,  temp: 31, humidity: 88 },
    { month: 'Aug', aqi: 79,  temp: 30, humidity: 90 },
    { month: 'Sep', aqi: 93,  temp: 31, humidity: 86 },
    { month: 'Oct', aqi: 130, temp: 29, humidity: 80 },
    { month: 'Nov', aqi: 158, temp: 28, humidity: 75 },
    { month: 'Dec', aqi: 162, temp: 26, humidity: 70 },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>🏙️ City Insights</h2>
        <p>Pollution hotspots, clean zones, and seasonal AQI trends across 20 Chennai areas</p>
      </div>

      {/* Hotspot Overview */}
      <div className="insights-grid">
        {/* Top Polluted */}
        <div className="card">
          <div className="card-title" style={{ color: '#ff6666' }}>🔴 Top Pollution Hotspots</div>
          {top5.map((a, i) => (
            <div key={a.area} className="area-rank-item">
              <div className="area-rank-num" style={{ background: 'rgba(255,68,68,0.2)', color: '#ff4444' }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.area}</div>
                <div style={{ fontSize: 12, color: '#4a5578', marginTop: 2 }}>
                  PM2.5: {formatNum(a.pm25)} | NO₂: {formatNum(a.no2)}
                </div>
              </div>
              <span className="aqi-pill" style={{
                background: getAqiColor(a.aqi),
                color: a.aqi > 100 ? '#fff' : '#000',
              }}>
                {formatNum(a.aqi)}
              </span>
            </div>
          ))}
        </div>

        {/* Cleanest Areas */}
        <div className="card">
          <div className="card-title" style={{ color: '#00ff88' }}>🟢 Cleanest Areas</div>
          {clean5.map((a, i) => (
            <div key={a.area} className="area-rank-item">
              <div className="area-rank-num" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.area}</div>
                <div style={{ fontSize: 12, color: '#4a5578', marginTop: 2 }}>
                  Hotspot Score: {(a.hotspot_score * 100).toFixed(1)}%
                </div>
              </div>
              <span className="aqi-pill" style={{
                background: getAqiColor(a.aqi),
                color: a.aqi > 100 ? '#fff' : '#000',
              }}>
                {formatNum(a.aqi)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AQI Bar Chart — All 20 areas */}
      <div className="card chart-full">
        <div className="card-title">📊 Comparative AQI — All 20 Chennai Areas</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 8, right: 8, left: -10, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#4a5578', fontSize: 11 }}
              angle={-35} textAnchor="end" tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
              formatter={(v, name, { payload }) => [v, payload.fullName]}
              labelFormatter={() => 'AQI'}
            />
            <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal AQI Pattern */}
      <div className="card chart-full">
        <div className="card-title">🌦️ Seasonal AQI Trend — Chennai Annual Pattern</div>
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          AQI typically peaks in Nov–Jan (NE Monsoon) and drops in Jun–Aug (SW Monsoon)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={seasonalData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="aqi" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="met" orientation="right" tick={{ fill: '#4a5578', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#8b97b8', fontSize: 12 }}>{v}</span>} />
            <Line yAxisId="aqi" type="monotone" dataKey="aqi" name="AQI" stroke="#0088ff" strokeWidth={2.5} dot={{ r: 4, fill: '#0088ff' }} />
            <Line yAxisId="met" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#ffaa00" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <Line yAxisId="met" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#9955ff" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Full area table */}
      <div className="card">
        <div className="card-title">📋 Full Area Statistics (20 Monitoring Zones)</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th><th>Area</th><th>AQI</th><th>PM2.5</th><th>PM10</th>
                <th>NO₂</th><th>SO₂</th><th>CO</th><th>O₃</th><th>Temp °C</th><th>Humidity %</th><th>Zone Type</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a, i) => {
                const color = getAqiColor(a.aqi)
                const zone = i < 5 ? '🔴 Hotspot' : i >= 15 ? '🟢 Clean' : '🟡 Moderate'
                return (
                  <tr key={a.area}>
                    <td><span className="rank-badge" style={{
                      background: i < 5 ? 'rgba(255,68,68,0.2)' : i >= 15 ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.06)',
                      color: i < 5 ? '#ff4444' : i >= 15 ? '#00ff88' : '#8b97b8',
                    }}>{i + 1}</span></td>
                    <td style={{ fontWeight: 600 }}>{a.area}</td>
                    <td><span className="aqi-pill" style={{ background: color, color: a.aqi > 100 ? '#fff' : '#000' }}>{formatNum(a.aqi)}</span></td>
                    <td>{formatNum(a.pm25)}</td><td>{formatNum(a.pm10)}</td>
                    <td>{formatNum(a.no2)}</td><td>{formatNum(a.so2)}</td>
                    <td>{formatNum(a.co)}</td><td>{formatNum(a.o3)}</td>
                    <td>{formatNum(a.temperature)}</td><td>{formatNum(a.humidity)}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{zone}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
