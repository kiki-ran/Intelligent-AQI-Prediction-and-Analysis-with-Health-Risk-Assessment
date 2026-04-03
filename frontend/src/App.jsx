import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import HealthRisk from './pages/HealthRisk'
import CityInsights from './pages/CityInsights'
import About from './pages/About'

const PAGE_TITLES = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/forecast': 'Forecast',
  '/health-risk': 'Health Risk',
  '/city-insights': 'City Insights',
  '/about': 'About',
}

function TopBar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'BreatheSafe'

  // Get current time (Chennai IST)
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

  return (
    <header className="topbar">
      <div className="topbar-title">BreatheSafe Chennai — {title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{now} IST</span>
        <div className="topbar-badge">
          <div className="dot" />
          Live Monitoring
        </div>
      </div>
    </header>
  )
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <TopBar />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/forecast"      element={<Forecast />} />
          <Route path="/health-risk"   element={<HealthRisk />} />
          <Route path="/city-insights" element={<CityInsights />} />
          <Route path="/about"         element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
