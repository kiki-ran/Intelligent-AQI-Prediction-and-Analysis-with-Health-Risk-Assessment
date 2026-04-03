import { useState } from 'react'
import { getHealthRisk, getCurrentAqi } from '../api/apiService'

const DISEASES = ['Asthma', 'COPD', 'Heart Disease', 'Diabetes', 'Allergies', 'Hypertension', 'Lung Disease']
const PROFESSIONS = ['office', 'outdoor', 'driver', 'farmer', 'teacher', 'student', 'healthcare', 'other']

export default function HealthRisk() {
  const [form, setForm] = useState({
    age: 30, gender: 'Male', profession: 'office', smoker: false, diseases: [],
  })
  const [customAqi, setCustomAqi] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function toggleDisease(d) {
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      let aqi = parseFloat(customAqi)
      if (isNaN(aqi)) {
        const aqiData = await getCurrentAqi()
        aqi = aqiData.aqi
      }
      const res = await getHealthRisk({ ...form, aqi, diseases: form.diseases.map(d => d.toLowerCase()) })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🫀 Health Risk Assessment</h2>
        <p>Get personalized AQI-based health risk evaluation and actionable precautions</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Form */}
        <div className="card">
          <div className="card-title">👤 Your Profile</div>
          <form onSubmit={handleSubmit} className="health-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" min={1} max={120}
                  value={form.age} onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 30 }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Profession</label>
                <select className="form-select" value={form.profession}
                  onChange={e => setForm(f => ({ ...f, profession: e.target.value }))}>
                  {PROFESSIONS.map(p => (
                    <option key={p} value={p} style={{ textTransform: 'capitalize' }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Custom AQI (optional)</label>
                <input type="number" className="form-input" placeholder="Auto-detect if empty"
                  value={customAqi} onChange={e => setCustomAqi(e.target.value)} min={0} max={500} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Smoker</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                {[true, false].map(v => (
                  <label key={String(v)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14
                  }}>
                    <input type="radio" checked={form.smoker === v}
                      onChange={() => setForm(f => ({ ...f, smoker: v }))}
                      style={{ accentColor: 'var(--green)' }} />
                    {v ? 'Yes 🚬' : 'No ✅'}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Existing Conditions</label>
              <div className="checkbox-group">
                {DISEASES.map(d => (
                  <div key={d}
                    className={`disease-chip${form.diseases.includes(d) ? ' selected' : ''}`}
                    onClick={() => toggleDisease(d)}>
                    {form.diseases.includes(d) ? '✓ ' : ''}{d}
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="error-banner" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Analyzing…' : '🔍 Assess My Risk'}
            </button>
          </form>
        </div>

        {/* Result */}
        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 30px' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready to Assess</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Fill in your profile on the left and click "Assess My Risk" to get personalized health advice based on current Chennai AQI levels.
              </p>
            </div>
          )}

          {loading && (
            <div className="card loading-overlay">
              <div className="spinner" />
              <p>Analyzing health risk…</p>
            </div>
          )}

          {result && (
            <div className="risk-result" style={{
              borderColor: result.risk_color,
              background: `${result.risk_color}10`,
              '--accent': result.risk_color,
            }}>
              {/* Risk Badge */}
              <div className="risk-level-badge" style={{ background: `${result.risk_color}20`, color: result.risk_color }}>
                <span style={{ fontSize: 28 }}>
                  {result.risk_level === 'Low' ? '✅' : result.risk_level === 'Medium' ? '⚠️' : '🚨'}
                </span>
                {result.risk_level} Risk
              </div>

              {/* AQI Info */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{
                  background: `${result.aqi_color}20`, border: `1px solid ${result.aqi_color}50`,
                  borderRadius: 8, padding: '8px 16px', fontSize: 13,
                }}>
                  <span style={{ color: '#8b97b8' }}>Current AQI: </span>
                  <strong style={{ color: result.aqi_color }}>{result.aqi}</strong>
                  <span style={{ color: result.aqi_color, marginLeft: 6 }}>({result.aqi_category})</span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13,
                }}>
                  <span style={{ color: '#8b97b8' }}>Vulnerability Score: </span>
                  <strong>{result.vulnerability_score}/10</strong>
                </div>
              </div>

              {result.has_asthma && (
                <div style={{
                  background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff6666',
                  marginBottom: 14, fontWeight: 600,
                }}>
                  ⚠️ Asthma detected — Enhanced monitoring recommended
                </div>
              )}

              {/* Precautions */}
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Personalized Precautions:
              </div>
              <ul className="precautions-list">
                {result.precautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">📋 AQI Health Reference Guide</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          {[
            { cat: 'Good', range: '0–50', color: '#00e400', tip: 'Safe for all' },
            { cat: 'Satisfactory', range: '51–100', color: '#92d400', tip: 'Acceptable' },
            { cat: 'Moderate', range: '101–150', color: '#ffff00', tip: 'Sensitive groups' },
            { cat: 'Poor', range: '151–200', color: '#ff7e00', tip: 'Wear mask outdoors' },
            { cat: 'Very Poor', range: '201–300', color: '#ff0000', tip: 'Stay indoors' },
            { cat: 'Severe', range: '301+', color: '#7e0023', tip: 'Emergency caution' },
          ].map(item => (
            <div key={item.cat} style={{
              background: `${item.color}15`, border: `1px solid ${item.color}40`,
              borderRadius: 8, padding: '12px', textAlign: 'center',
            }}>
              <div style={{ color: item.color, fontWeight: 800, fontSize: 13 }}>{item.cat}</div>
              <div style={{ color: '#4a5578', fontSize: 11, marginTop: 2 }}>{item.range}</div>
              <div style={{ color: '#8b97b8', fontSize: 12, marginTop: 6 }}>{item.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
