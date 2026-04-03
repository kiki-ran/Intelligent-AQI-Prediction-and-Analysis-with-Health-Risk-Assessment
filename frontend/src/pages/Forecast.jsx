import { useEffect, useState } from 'react'
import { getForecast, predictAqi, getDashboardData } from '../api/apiService'
import ForecastChart from '../components/ForecastChart'
import { getAqiColor } from '../utils/helpers'

export default function Forecast() {
  const [forecast, setForecast] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [selectedArea, setSelectedArea] = useState('')
  const [areas, setAreas] = useState([])
  const [hours, setHours] = useState(24)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboardData()
      .then(d => { setAreas(d.areas || []); setMetrics(d.model_metrics) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getForecast(selectedArea || null),
      predictAqi(hours, selectedArea || null),
    ])
      .then(([fData, pData]) => {
        setForecast(fData.forecast)
        setPredictions(pData.predictions)
        setError(null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedArea, hours])

  return (
    <div>
      <div className="page-header">
        <h2>🔮 AQI Forecast</h2>
        <p>7-day forecast and 24–72 hour predictions powered by ML models</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group">
            <label className="form-label">Select Area</label>
            <select className="form-select" value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)} style={{ minWidth: 200 }}>
              <option value="">All Chennai</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Prediction Horizon</label>
            <select className="form-select" value={hours}
              onChange={e => setHours(Number(e.target.value))} style={{ minWidth: 140 }}>
              <option value={24}>24 Hours</option>
              <option value={48}>48 Hours</option>
              <option value={72}>72 Hours</option>
            </select>
          </div>
          {metrics?.best_model && (
            <div style={{
              background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 8, padding: '8px 16px', fontSize: 13,
            }}>
              <span style={{ color: '#4a5578' }}>Best Model: </span>
              <strong style={{ color: '#00ff88' }}>{metrics.best_model}</strong>
              {metrics[metrics.best_model] && (
                <span style={{ color: '#4a5578', marginLeft: 8 }}>
                  R² = {metrics[metrics.best_model].r2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* 7-Day Forecast Cards */}
      {forecast && (
        <>
          <div className="forecast-strip">
            {forecast.map((day, i) => {
              const color = day.color || getAqiColor(day.avg_aqi)
              return (
                <div key={i} className="forecast-day">
                  <div className="day-name">{day.date_short}</div>
                  <div className="day-aqi" style={{ color }}>{Math.round(day.avg_aqi)}</div>
                  <div className="day-cat" style={{ color }}>{day.category}</div>
                  <div className="day-range">
                    <span style={{ color: '#00ff88' }}>↓{Math.round(day.min_aqi)}</span>
                    {' '}/{' '}
                    <span style={{ color: '#ff4444' }}>↑{Math.round(day.max_aqi)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card chart-full">
            <div className="card-title">📅 7-Day AQI Forecast Chart</div>
            <ForecastChart data={forecast} />
          </div>
        </>
      )}

      {/* Short-term Predictions */}
      {predictions && (
        <div className="card">
          <div className="card-title">⏱️ {hours}-Hour Hourly Predictions</div>
          {loading ? (
            <div className="loading-overlay" style={{ padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hour</th>
                    <th>Date / Time</th>
                    <th>Predicted AQI</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => {
                    const color = p.color || getAqiColor(p.predicted_aqi)
                    return (
                      <tr key={i}>
                        <td style={{ color: '#4a5578' }}>+{p.hour}h</td>
                        <td>{p.datetime}</td>
                        <td>
                          <span className="aqi-pill" style={{ background: color, color: p.predicted_aqi > 100 ? '#fff' : '#000' }}>
                            {p.predicted_aqi}
                          </span>
                        </td>
                        <td style={{ color, fontWeight: 600, fontSize: 13 }}>{p.category}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Model Metrics */}
      {metrics && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">📐 ML Model Evaluation Metrics</div>
          <div className="metrics-grid">
            {['Random Forest', 'XGBoost', 'Gradient Boosting'].map(m => {
              const met = metrics[m]
              const isBest = metrics.best_model === m
              return (
                <div key={m} className={`metric-card${isBest ? ' best' : ''}`}>
                  <h4>{m}{isBest && <span className="best-badge">BEST</span>}</h4>
                  {met ? (
                    <>
                      <div className="metric-row"><span>RMSE</span><span>{met.rmse}</span></div>
                      <div className="metric-row"><span>MAE</span><span>{met.mae}</span></div>
                      <div className="metric-row">
                        <span>R² Score</span>
                        <span style={{ color: met.r2 > 0.8 ? 'var(--green)' : met.r2 > 0.6 ? 'var(--yellow)' : 'var(--red)' }}>
                          {met.r2}
                        </span>
                      </div>
                    </>
                  ) : <p style={{ color: '#4a5578', fontSize: 13 }}>Loading…</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
