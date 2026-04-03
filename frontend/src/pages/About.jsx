const TECH = [
  { icon: '⚛️',  name: 'React 18',        desc: 'Frontend UI' },
  { icon: '⚡',  name: 'Vite',            desc: 'Dev server' },
  { icon: '🐍',  name: 'Flask',           desc: 'Backend API' },
  { icon: '🐼',  name: 'Pandas',          desc: 'Data pipeline' },
  { icon: '🌲',  name: 'Random Forest',   desc: 'ML model' },
  { icon: '🚀',  name: 'XGBoost',         desc: 'ML model' },
  { icon: '📈',  name: 'Gradient Boost',  desc: 'ML model' },
  { icon: '📊',  name: 'Recharts',        desc: 'Visualizations' },
]

export default function About() {
  return (
    <div>
      <div className="about-hero card">
        <div style={{ fontSize: 56, marginBottom: 12 }}>🌿</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>BreatheSafe Chennai</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6, fontSize: 15 }}>
          An intelligent air quality monitoring and health advisory platform that combines machine learning,
          data analytics, and personalized healthcare insights to improve urban living in Chennai.
        </p>
      </div>

      <div className="chart-grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">🎯 Mission</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Predict AQI using ensemble ML models',
              'Analyze historical AQI trends and pollutants',
              'Identify pollution hotspots across 20 Chennai zones',
              'Provide personalized health risk assessment',
              'Prioritize asthma patients and vulnerable groups',
              'Deliver actionable, science-based precautions',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--green)' }}>✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-title">👥 Target Users</div>
          {[
            { icon: '🧑‍🤝‍🧑', group: 'General Public',   desc: 'Daily outdoor planning' },
            { icon: '🫁',      group: 'Asthma Patients', desc: 'High-priority alerts' },
            { icon: '👴',      group: 'Elderly',          desc: 'Extra-sensitive risk analysis' },
            { icon: '👶',      group: 'Children',         desc: 'School outdoor activity guidance' },
            { icon: '🏃',      group: 'Outdoor Workers',  desc: 'Exposure-aware scheduling' },
          ].map(u => (
            <div key={u.group} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22 }}>{u.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.group}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-title">🛠️ Technology Stack</div>
        <div className="tech-grid">
          {TECH.map(t => (
            <div key={t.name} className="tech-card">
              <div className="icon">{t.icon}</div>
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">🔮 Future Roadmap</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {[
            { icon: '📡', title: 'Live AQI API', desc: 'Real-time CPCB data integration' },
            { icon: '📱', title: 'Mobile App', desc: 'iOS & Android companion app' },
            { icon: '🔔', title: 'SMS Alerts', desc: 'Automated AQI threshold notifications' },
            { icon: '🗺️', title: 'Geo Heatmaps', desc: 'Interactive pollution maps' },
          ].map(r => (
            <div key={r.title} style={{
              background: 'rgba(0,136,255,0.05)', border: '1px solid rgba(0,136,255,0.15)',
              borderRadius: 10, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Built with ❤️ for Chennai | BreatheSafe Chennai v1.0
      </div>
    </div>
  )
}
