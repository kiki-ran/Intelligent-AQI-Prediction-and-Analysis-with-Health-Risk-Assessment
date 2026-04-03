import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',              icon: '🏠', label: 'Home' },
  { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
  { to: '/forecast',      icon: '🔮', label: 'Forecast' },
  { to: '/health-risk',   icon: '🫀', label: 'Health Risk' },
  { to: '/city-insights', icon: '🏙️', label: 'City Insights' },
  { to: '/about',         icon: 'ℹ️', label: 'About' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🌿</div>
        <h1>BreatheSafe<br />Chennai</h1>
        <p>AQI &amp; Health Platform</p>
      </div>

      <ul className="nav-links">
        {links.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="navbar-footer">
        <div>Chennai, Tamil Nadu</div>
        <div style={{ marginTop: 4, color: 'var(--green)', opacity: 0.8 }}>● Live Monitoring</div>
      </div>
    </nav>
  )
}
