import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentAqi } from '../api/apiService'
import { getAqiColor } from '../utils/helpers'

const FEATURES = [
  { icon: '📊', title: 'Live Dashboard', desc: 'Real-time AQI monitoring with 7 interactive charts' },
  { icon: '🤖', title: 'ML Predictions', desc: 'Random Forest, XGBoost & Gradient Boosting models' },
  { icon: '📅', title: '7-Day Forecast', desc: 'Daily min/avg/max AQI forecast with confidence bands' },
  { icon: '🫀', title: 'Health Risk', desc: 'Personalized risk assessment for asthma patients' },
  { icon: '🏙️', title: 'City Insights', desc: 'Pollution hotspots across 20 Chennai monitoring zones' },
  { icon: '🔬', title: 'Explainable AI', desc: 'Feature importance visualization for model transparency' },
]

export default function Home() {
  const [liveAqi, setLiveAqi] = useState(null)

  useEffect(() => {
    getCurrentAqi()
      .then(setLiveAqi)
      .catch(() => {})
  }, [])

  return (
    <div className="hero">
      <div className="hero-emoji">🌿</div>
      <h1>
        <span className="grad">BreatheSafe</span><br />Chennai
      </h1>
      <p>
        AI-powered air quality monitoring, ML predictions, and personalized health risk assessment for the people of Chennai.
      </p>

      {/* Live AQI Badge */}
      {liveAqi && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: `${getAqiColor(liveAqi.aqi)}15`,
          border: `1px solid ${getAqiColor(liveAqi.aqi)}40`,
          borderRadius: 12, padding: '10px 20px',
          marginBottom: 28, fontSize: 15,
        }}>
          <span style={{ fontSize: 22 }}>💨</span>
          <span style={{ color: '#8b97b8' }}>Chennai AQI Right Now:</span>
          <strong style={{ color: getAqiColor(liveAqi.aqi), fontSize: 22 }}>{liveAqi.aqi}</strong>
          <span style={{ color: getAqiColor(liveAqi.aqi) }}>({liveAqi.category})</span>
        </div>
      )}

      <div className="hero-cta">
        <Link to="/dashboard" className="btn-primary">📊 View Dashboard →</Link>
        <Link to="/health-risk" className="btn-secondary">🫀 Check My Risk</Link>
      </div>

      <div className="feature-cards">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
