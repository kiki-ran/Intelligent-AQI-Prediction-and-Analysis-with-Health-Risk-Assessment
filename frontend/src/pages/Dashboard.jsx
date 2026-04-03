import { useEffect, useState } from 'react'
import { getDashboardData } from '../api/apiService'
import KPICard from '../components/KPICard'
import AQITrendChart from '../components/AQITrendChart'
import PollutantPieChart from '../components/PollutantPieChart'
import PredictedVsActualChart from '../components/PredictedVsActualChart'
import CorrelationHeatmap from '../components/CorrelationHeatmap'
import AQICategoryDonut from '../components/AQICategoryDonut'
import { formatNum, getAqiColor } from '../utils/helpers'

function FeatureImportanceBar({ data = [] }) {
  const max = Math.max(...data.map(d => d.importance), 0.001)
  return (
    <div>
      {data.slice(0, 8).map((d, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#8b97b8' }}>{d.feature.toUpperCase()}</span>
            <span style={{ color: '#f0f4ff', fontWeight: 600 }}>{(d.importance * 100).toFixed(1)}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${(d.importance / max) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg,#00ff88,#0088ff)',
              borderRadius: 4,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
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
      <p>Loading dashboard data &amp; training ML models…<br /><span style={{ fontSize: 12, opacity: 0.6 }}>This may take 30–60 seconds on first load</span></p>
    </div>
  )
  if (error) return <div className="error-banner">⚠️ Backend error: {error}. Make sure Flask backend is running on port 5000.</div>
  if (!data) return null

  const { kpi, aqi_trend, pollutant_pie, aqi_category_dist, correlation,
    predicted_vs_actual, area_stats, model_metrics, feature_importances } = data

  const aqiColor = getAqiColor(kpi.current_aqi)

  return (
    <div>
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p>Real-time AQI monitoring, pollutant analysis, and ML predictions for Chennai</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard label="Current AQI" value={kpi.current_aqi} icon="💨"
          accentColor={aqiColor} colored
          sub={<span style={{ color: aqiColor, fontWeight: 700 }}>{kpi.aqi_category}</span>} />
        <KPICard label="Avg AQI (30 days)" value={formatNum(kpi.avg_30_days)} icon="📈"
          accentColor="var(--blue)" sub="Rolling 30-day average" />
        <KPICard label="Max AQI Recorded" value={formatNum(kpi.max_aqi)} icon="🔴"
          accentColor="var(--red)" sub="Peak pollution" />
        <KPICard label="Predicted Tomorrow" value={formatNum(kpi.predicted_tomorrow)} icon="🔮"
          accentColor="var(--purple)"
          sub={<span style={{ color: getAqiColor(kpi.predicted_tomorrow), fontWeight: 600 }}>
            {kpi.predicted_tomorrow <= 100 ? '✅ Safe' : kpi.predicted_tomorrow <= 200 ? '⚠️ Caution' : '🚨 Alert'}
          </span>} />
        <KPICard label="% Change from Yesterday" icon="📊"
          accentColor={kpi.pct_change_yesterday >= 0 ? 'var(--red)' : 'var(--green)'}
          value={`${kpi.pct_change_yesterday >= 0 ? '+' : ''}${kpi.pct_change_yesterday}%`}
          sub={<span className={kpi.pct_change_yesterday >= 0 ? 'negative' : 'positive'}>
            {kpi.pct_change_yesterday >= 0 ? '▲ Worsening' : '▼ Improving'}
          </span>} />
        <KPICard label="AQI Category" value={kpi.aqi_category} icon="🟢"
          accentColor={aqiColor} colored
          sub="Current air quality level" />
      </div>

      {/* Row 2: AQI Trend + Pollutant Pie */}
      <div className="chart-grid-3">
        <div className="card">
          <div className="card-title">📈 AQI Historical Trend (90 Days)</div>
          <AQITrendChart data={aqi_trend} />
        </div>
        <div className="card">
          <div className="card-title">🧪 Pollutant Contribution</div>
          <PollutantPieChart data={pollutant_pie} />
        </div>
      </div>

      {/* Row 3: Predicted vs Actual + Category Donut */}
      <div className="chart-grid-2">
        <div className="card">
          <div className="card-title">🤖 Predicted vs Actual AQI</div>
          <PredictedVsActualChart data={predicted_vs_actual} />
        </div>
        <div className="card">
          <div className="card-title">🍩 AQI Category Distribution</div>
          <AQICategoryDonut data={aqi_category_dist} />
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="card chart-full">
        <div className="card-title">🔥 Feature Correlation Heatmap</div>
        <CorrelationHeatmap labels={correlation?.labels || []} matrix={correlation?.matrix || []} />
      </div>

      {/* Model Performance + Feature Importances */}
      <div className="chart-grid-2">
        <div className="card">
          <div className="card-title">📐 Model Performance Metrics</div>
          <div className="metrics-grid" style={{ gridTemplateColumns: '1fr' }}>
            {['Random Forest', 'XGBoost', 'Gradient Boosting'].map(m => {
              const met = model_metrics?.[m]
              const isBest = model_metrics?.best_model === m
              return (
                <div key={m} className={`metric-card${isBest ? ' best' : ''}`}>
                  <h4>{m}{isBest && <span className="best-badge">BEST</span>}</h4>
                  {met ? (
                    <>
                      <div className="metric-row"><span>RMSE</span><span>{met.rmse}</span></div>
                      <div className="metric-row"><span>MAE</span><span>{met.mae}</span></div>
                      <div className="metric-row"><span>R² Score</span><span style={{ color: 'var(--green)' }}>{met.r2}</span></div>
                    </>
                  ) : <p style={{ color: '#4a5578', fontSize: 13 }}>Loading…</p>}
                </div>
              )
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">🔬 Feature Importances (Explainable AI)</div>
          <FeatureImportanceBar data={feature_importances || []} />
        </div>
      </div>

      {/* Top Polluted Areas */}
      <div className="card">
        <div className="card-title">🏙️ Area AQI Rankings — Chennai</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Area</th>
                <th>Avg AQI</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>NO₂</th>
                <th>Temperature</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(area_stats || []).map((a, i) => {
                const color = getAqiColor(a.aqi)
                const bgColor = i < 5 ? 'rgba(255,68,68,0.06)' : i >= 15 ? 'rgba(0,255,136,0.06)' : 'transparent'
                return (
                  <tr key={a.area} style={{ background: bgColor }}>
                    <td>
                      <span className="rank-badge" style={{
                        background: i < 5 ? 'rgba(255,68,68,0.2)' : i >= 15 ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.06)',
                        color: i < 5 ? '#ff4444' : i >= 15 ? '#00ff88' : '#8b97b8',
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.area}</td>
                    <td>
                      <span className="aqi-pill" style={{ background: color, color: a.aqi > 100 ? '#fff' : '#000' }}>
                        {formatNum(a.aqi)}
                      </span>
                    </td>
                    <td>{formatNum(a.pm25)}</td>
                    <td>{formatNum(a.pm10)}</td>
                    <td>{formatNum(a.no2)}</td>
                    <td>{formatNum(a.temperature)}°C</td>
                    <td style={{ color: i < 5 ? '#ff4444' : i >= 15 ? '#00ff88' : '#ffaa00', fontSize: 12, fontWeight: 600 }}>
                      {i < 5 ? '🔴 Hotspot' : i >= 15 ? '🟢 Clean' : '🟡 Moderate'}
                    </td>
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
