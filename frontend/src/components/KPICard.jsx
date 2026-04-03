// KPI Card component — displays a single metric
export default function KPICard({ label, value, sub, icon, accentColor, colored = false }) {
  return (
    <div className="kpi-card" style={{ '--accent-color': accentColor || 'var(--green)' }}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value${colored ? ' colored' : ''}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
