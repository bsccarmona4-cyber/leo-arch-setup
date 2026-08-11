import { useState, useMemo } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, AlertTriangle, Users,
  TrendingUp, DollarSign, ShoppingBag, Activity, Percent,
  ChevronDown, Search, ArrowUp, ArrowDown, MoreHorizontal,
  Sparkles, Heart, Star, Eye, Edit, Trash2,
  X, Menu, Home, LogOut, Bell, RefreshCw, Zap
} from 'lucide-react'
import './Dashboard.css'

/* ──────────────── DATA ──────────────── */

const products = [
  { id: 'mascarilla-led-7c', name: 'Mascarilla LED 7 Colores', price: 1999, cost: 999, margin: 50.0, sales: 312, revenue: 623688, stock: 45, category: 'Luz LED', badge: 'Best Seller' },
  { id: 'botas-compresion', name: 'Botas de Compresion Recovery', price: 2499, cost: 1125, margin: 55.0, sales: 198, revenue: 494802, stock: 62, category: 'Movimiento', badge: 'Premium' },
  { id: 'rodillo-jade', name: 'Rodillo Facial de Jade', price: 349, cost: 227, margin: 35.0, sales: 523, revenue: 182527, stock: 120, category: 'Facial Tools', badge: 'Popular' },
  { id: 'termometro-ir', name: 'Termometro Infrarrojo Digital', price: 459, cost: 248, margin: 46.0, sales: 287, revenue: 131733, stock: 95, category: 'Bienestar', badge: null },
  { id: 'pistola-masaje', name: 'Pistola de Masaje Fascia', price: 1299, cost: 584, margin: 55.0, sales: 245, revenue: 318255, stock: 78, category: 'Movimiento', badge: 'Hot' },
  { id: 'organizador-nevera', name: 'Organizador Magnetico Nevera', price: 299, cost: 149, margin: 50.2, sales: 418, revenue: 124982, stock: 200, category: 'Hogar', badge: 'Popular' },
  { id: 'microscopio-kids', name: 'Microscopio Infantil 1200X', price: 599, cost: 269, margin: 55.1, sales: 198, revenue: 118602, stock: 55, category: 'Kids', badge: null },
  { id: 'reposamunecas-ergo', name: 'Reposamunecas Ergonomico', price: 249, cost: 112, margin: 55.0, sales: 356, revenue: 88644, stock: 170, category: 'Oficina', badge: null },
]

const orders = [
  { id: 'ORD-1042', customer: 'Maria G.', items: 2, total: 2348, status: 'delivered', date: '2026-07-15', payment: 'Mercado Pago' },
  { id: 'ORD-1041', customer: 'Jose L.', items: 1, total: 2499, status: 'shipped', date: '2026-07-15', payment: 'Mercado Pago' },
  { id: 'ORD-1040', customer: 'Ana S.', items: 3, total: 3647, status: 'processing', date: '2026-07-14', payment: 'Mercado Pago' },
  { id: 'ORD-1039', customer: 'Carlos M.', items: 1, total: 459, status: 'pending', date: '2026-07-14', payment: 'Mercado Pago' },
  { id: 'ORD-1038', customer: 'Juan P.', items: 2, total: 648, status: 'delivered', date: '2026-07-14', payment: 'Mercado Pago' },
  { id: 'ORD-1037', customer: 'Sofia R.', items: 1, total: 599, status: 'cancelled', date: '2026-07-13', payment: 'Mercado Pago' },
  { id: 'ORD-1036', customer: 'Elena D.', items: 4, total: 3946, status: 'delivered', date: '2026-07-13', payment: 'Mercado Pago' },
  { id: 'ORD-1035', customer: 'Miguel T.', items: 1, total: 1299, status: 'processing', date: '2026-07-13', payment: 'Mercado Pago' },
  { id: 'ORD-1034', customer: 'Rosa H.', items: 2, total: 548, status: 'shipped', date: '2026-07-12', payment: 'Mercado Pago' },
  { id: 'ORD-1033', customer: 'Luis F.', items: 1, total: 349, status: 'delivered', date: '2026-07-12', payment: 'Mercado Pago' },
  { id: 'ORD-1032', customer: 'Carmen V.', items: 3, total: 897, status: 'delivered', date: '2026-07-11', payment: 'Mercado Pago' },
  { id: 'ORD-1031', customer: 'Pedro N.', items: 1, total: 249, status: 'pending', date: '2026-07-11', payment: 'Mercado Pago' },
]

const alerts = [
  { id: 1, message: 'Mascarilla LED 7 Colores — Solo 45 unidades en inventario', severity: 'warning', icon: '⚠️' },
  { id: 2, message: 'Sin ventas registradas hoy — Revisa campanas de marketing', severity: 'critical', icon: '🚨' },
  { id: 3, message: 'Rodillo Facial de Jade — 523 vendidos, pero margen bajo al 35%', severity: 'warning', icon: '⚠️' },
  { id: 4, message: 'Microscopio Infantil 1200X — 198 unidades, alto potencial de venta', severity: 'info', icon: '📈' },
]

const weeklyData = [
  { day: 'Mon', revenue: 7240, orders: 28, profit: 3982 },
  { day: 'Tue', revenue: 8560, orders: 32, profit: 4708 },
  { day: 'Wed', revenue: 6890, orders: 30, profit: 3790 },
  { day: 'Thu', revenue: 9120, orders: 35, profit: 5016 },
  { day: 'Fri', revenue: 5430, orders: 25, profit: 2987 },
  { day: 'Sat', revenue: 3860, orders: 23, profit: 2123 },
  { day: 'Sun', revenue: 4950, orders: 26, profit: 2723 },
]

const statusColors = {
  pending: '#eab308',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'clients', label: 'Clients', icon: Users },
]

const categoryIcons = {
  'Luz LED': Sparkles,
  'Movimiento': Activity,
  'Facial Tools': Heart,
  'Bienestar': Heart,
  'Hogar': Home,
  'Kids': Star,
  'Oficina': Edit,
}

/* ──────────────── HELPERS ──────────────── */

function fmtMXN(n) {
  return '$' + n.toLocaleString('en-US')
}

function fmtMXN2(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

/* ──────────────── COMPONENT ──────────────── */

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const q = productSearch.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    )
  }, [productSearch])

  const filteredOrders = useMemo(() => {
    let result = orders
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter)
    }
    return result
  }, [orderSearch, statusFilter])

  const metrics = [
    { label: 'Revenue Today', value: fmtMXN(3860), icon: DollarSign, change: '+14.2%', up: true, color: '#22c55e' },
    { label: 'Orders Today', value: '23', icon: ShoppingBag, change: '+9.5%', up: true, color: '#3b82f6' },
    { label: 'Profit Today', value: fmtMXN(2123), icon: TrendingUp, change: '+16.8%', up: true, color: '#8B2252' },
    { label: 'Conversion Rate', value: '3.8%', icon: Percent, change: '+0.3%', up: true, color: '#D4AF37' },
  ]

  const sectionComponents = {
    overview: <OverviewSection metrics={metrics} weeklyData={weeklyData} />,
    analytics: <AnalyticsSection />,
    products: <ProductsSection products={filteredProducts} search={productSearch} setSearch={setProductSearch} />,
    orders: <OrdersSection
      orders={filteredOrders}
      search={orderSearch}
      setSearch={setOrderSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      expandedOrder={expandedOrder}
      setExpandedOrder={setExpandedOrder}
    />,
    alerts: <AlertsSection alerts={alerts} />,
    clients: <ClientsSection />,
  }

  return (
    <div className="dashboard-container">
      {/* ─── Sidebar ─── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Zap size={22} className="logo-icon" />
            <span className="logo-text">KREI<span className="logo-admin">Admin</span></span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === 'alerts' && <span className="sidebar-badge">{alerts.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Admin</span>
              <span className="sidebar-user-role">Store Owner</span>
            </div>
          </div>
          <button className="sidebar-logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ─── Main Content ─── */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="header-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="header-title">
              <h1>{sidebarItems.find(i => i.id === activeSection)?.label || 'Dashboard'}</h1>
              <span className="header-date">{new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="header-right">
            <button className="header-icon-btn">
              <RefreshCw size={18} />
            </button>
            <button className="header-icon-btn">
              <Bell size={18} />
              <span className="header-dot" />
            </button>
            <div className="header-avatar">A</div>
          </div>
        </header>

        <div className="dashboard-content">
          {sectionComponents[activeSection]}
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════ SECTIONS ═══════════════════ */

function OverviewSection({ metrics, weeklyData }) {
  return (
    <div className="overview-section">
      <div className="metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="metric-card">
            <div className="metric-icon" style={{ background: `${m.color}15`, color: m.color }}>
              <m.icon size={22} />
            </div>
            <div className="metric-info">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
              <span className={`metric-change ${m.up ? 'up' : 'down'}`}>
                {m.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Rendimiento Semanal</h3>
          <div className="chart-legend">
            <span><span className="legend-dot" style={{ background: '#8B2252' }} /> Revenue</span>
            <span><span className="legend-dot" style={{ background: '#06b6d4' }} /> Profit</span>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-y-labels">
            <span>$12K</span>
            <span>$10K</span>
            <span>$8K</span>
            <span>$6K</span>
            <span>$4K</span>
            <span>$2K</span>
            <span>$0</span>
          </div>
          <div className="chart-bars-area">
            <div className="chart-gridlines">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="chart-gridline" style={{ top: `${(i / 5) * 100}%` }} />
              ))}
            </div>
            <div className="chart-bars">
              {weeklyData.map((d, i) => {
                const maxVal = 12000
                const revHeight = (d.revenue / maxVal) * 100
                const profHeight = (d.profit / maxVal) * 100
                return (
                  <div key={i} className="chart-bar-group">
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar chart-bar-profit" style={{ height: `${profHeight}%` }}>
                        <div className="chart-bar-tooltip">{fmtMXN(d.profit)}</div>
                      </div>
                      <div className="chart-bar chart-bar-revenue" style={{ height: `${revHeight}%` }}>
                        <div className="chart-bar-tooltip">{fmtMXN(d.revenue)}</div>
                      </div>
                    </div>
                    <span className="chart-bar-label">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="chart-summary">
          <div className="chart-summary-item">
            <span className="summary-label">Total Revenue</span>
            <span className="summary-value">{fmtMXN(46050)}</span>
          </div>
          <div className="chart-summary-item">
            <span className="summary-label">Total Orders</span>
            <span className="summary-value">199</span>
          </div>
          <div className="chart-summary-item">
            <span className="summary-label">Avg. Order Value</span>
            <span className="summary-value">{fmtMXN(231)}</span>
          </div>
        </div>
      </div>

      <div className="overview-bottom">
        <div className="top-product-card">
          <h3>Top Performer</h3>
          <div className="top-product-item">
            <div className="top-product-icon">
              <Sparkles size={20} />
            </div>
            <div className="top-product-info">
              <span className="top-product-name">Mascarilla LED 7 Colores</span>
              <span className="top-product-meta">312 units sold · {fmtMXN(623688)} revenue</span>
            </div>
            <span className="top-product-badge">Best Seller</span>
          </div>
          <div className="top-product-item">
            <div className="top-product-icon">
              <Heart size={20} />
            </div>
            <div className="top-product-info">
              <span className="top-product-name">Rodillo Facial de Jade</span>
              <span className="top-product-meta">{fmtMXN(349)} · 35% margin · 523 sales</span>
            </div>
            <span className="top-product-badge premium">Popular</span>
          </div>
        </div>
        <div className="quick-stats-card">
          <h3>Quick Stats</h3>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <span className="qs-value">{fmtMXN(231)}</span>
              <span className="qs-label">Avg Order Value</span>
            </div>
            <div className="quick-stat">
              <span className="qs-value">50.4%</span>
              <span className="qs-label">Avg Margin</span>
            </div>
            <div className="quick-stat">
              <span className="qs-value">1.8</span>
              <span className="qs-label">Items/Order</span>
            </div>
            <div className="quick-stat">
              <span className="qs-value">55.1%</span>
              <span className="qs-label">Best Margin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductsSection({ products, search, setSearch }) {
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0)
  const totalSales = products.reduce((s, p) => s + p.sales, 0)

  return (
    <div className="products-section">
      <div className="section-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <div className="section-actions">
          <button className="action-btn">
            <Eye size={16} /> View Store
          </button>
          <button className="action-btn primary">
            <Package size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="products-summary">
        <span>{products.length} products</span>
        <span>Total revenue: {fmtMXN2(totalRevenue)}</span>
        <span>Total units sold: {totalSales.toLocaleString()}</span>
      </div>

      <div className="table-wrapper">
        <table className="data-table product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Margin</th>
              <th>Sales</th>
              <th>Revenue</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const CatIcon = categoryIcons[p.category] || Package
              return (
                <tr key={p.id}>
                  <td className="td-product">
                    <div className="td-product-icon">
                      <CatIcon size={18} />
                    </div>
                    <div className="td-product-info">
                      <span className="td-product-name">{p.name}</span>
                      <span className="td-product-id">{p.id}</span>
                    </div>
                  </td>
                  <td><span className="td-category">{p.category}</span></td>
                  <td className="td-number">{fmtMXN(p.price)}</td>
                  <td className="td-number">{fmtMXN(p.cost)}</td>
                  <td>
                    <div className="td-margin">
                      <div className="margin-bar-bg">
                        <div className="margin-bar-fill" style={{ width: `${p.margin}%` }} />
                      </div>
                      <span className="margin-value">{p.margin}%</span>
                    </div>
                  </td>
                  <td className="td-number">{p.sales}</td>
                  <td className="td-number">{fmtMXN(p.revenue)}</td>
                  <td>
                    <span className={`td-stock ${p.stock <= 100 ? 'low' : p.stock <= 200 ? 'medium' : 'high'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.badge ? (
                      <span className={`td-badge ${p.badge === 'Best Seller' ? 'gold' : p.badge === 'Premium' ? 'premium' : p.badge === 'Hot' ? 'hot' : 'popular'}`}>
                        {p.badge}
                      </span>
                    ) : (
                      <span className="td-badge default">Active</span>
                    )}
                  </td>
                  <td>
                    <button className="td-more-btn">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="table-empty">
            <Package size={40} />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersSection({ orders, search, setSearch, statusFilter, setStatusFilter, expandedOrder, setExpandedOrder }) {
  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

  const getStatusLabel = (s) => {
    const labels = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
    return labels[s] || s
  }

  return (
    <div className="orders-section">
      <div className="section-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <div className="order-filters">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : getStatusLabel(s)}
              {s !== 'all' && <span className="filter-dot" style={{ background: statusColors[s] }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table order-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr
                key={o.id}
                className={expandedOrder === o.id ? 'expanded' : ''}
                onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
              >
                <td className="td-order-id">{o.id}</td>
                <td>{o.customer}</td>
                <td className="td-number">{o.items}</td>
                <td className="td-number">{fmtMXN(o.total)}</td>
                <td><span className="td-payment">{o.payment}</span></td>
                <td className="td-date">{o.date}</td>
                <td>
                  <span className="td-status" style={{ background: `${statusColors[o.status]}20`, color: statusColors[o.status], borderColor: `${statusColors[o.status]}40` }}>
                    <span className="status-dot" style={{ background: statusColors[o.status] }} />
                    {getStatusLabel(o.status)}
                  </span>
                </td>
                <td>
                  <button className="td-more-btn">
                    <ChevronDown size={16} className={`chevron ${expandedOrder === o.id ? 'rotated' : ''}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="table-empty">
            <ShoppingCart size={40} />
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AlertsSection({ alerts }) {
  const severityConfig = {
    critical: { icon: '🚨', color: '#ef4444', bg: '#ef444415' },
    warning: { icon: '⚠️', color: '#eab308', bg: '#eab30815' },
    info: { icon: '📈', color: '#3b82f6', bg: '#3b82f615' },
  }

  return (
    <div className="alerts-section">
      <div className="alerts-header">
        <h3>System Alerts</h3>
        <span className="alerts-count">{alerts.length} active</span>
      </div>

      <div className="alerts-list">
        {alerts.map(a => {
          const cfg = severityConfig[a.severity]
          return (
            <div key={a.id} className="alert-card" style={{ borderLeftColor: cfg.color, background: cfg.bg }}>
              <div className="alert-card-header">
                <span className="alert-icon">{cfg.icon}</span>
                <span className="alert-severity" style={{ color: cfg.color }}>
                  {a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                </span>
              </div>
              <p className="alert-message">{a.message}</p>
              <div className="alert-actions">
                <button className="alert-action-btn" style={{ color: cfg.color }}>
                  View Details →
                </button>
                <button className="alert-action-btn dismiss">
                  Dismiss
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="alerts-summary">
        <div className="alert-summary-item" style={{ borderLeftColor: '#ef4444' }}>
          <span className="as-value">{alerts.filter(a => a.severity === 'critical').length}</span>
          <span className="as-label">Critical</span>
        </div>
        <div className="alert-summary-item" style={{ borderLeftColor: '#eab308' }}>
          <span className="as-value">{alerts.filter(a => a.severity === 'warning').length}</span>
          <span className="as-label">Warnings</span>
        </div>
        <div className="alert-summary-item" style={{ borderLeftColor: '#3b82f6' }}>
          <span className="as-value">{alerts.filter(a => a.severity === 'info').length}</span>
          <span className="as-label">Info</span>
        </div>
      </div>
    </div>
  )
}

function ClientsSection() {
  const recentUsers = [
    { name: 'Maria G.', email: 'maria.g@email.com', orders: 3, spent: 2348, joined: '2026-07-10', status: 'active' },
    { name: 'Jose L.', email: 'jose.l@email.com', orders: 1, spent: 2499, joined: '2026-07-08', status: 'active' },
    { name: 'Ana S.', email: 'ana.s@email.com', orders: 5, spent: 5200, joined: '2026-07-05', status: 'active' },
    { name: 'Carlos M.', email: 'carlos.m@email.com', orders: 2, spent: 708, joined: '2026-07-02', status: 'inactive' },
    { name: 'Juan P.', email: 'juan.p@email.com', orders: 4, spent: 3650, joined: '2026-06-28', status: 'active' },
  ]

  return (
    <div className="clients-section">
      <div className="client-stats-row">
        <div className="client-stat-card">
          <UserPlusIcon size={24} className="client-stat-icon" />
          <div className="client-stat-info">
            <span className="cs-value">1,247</span>
            <span className="cs-label">Total Users</span>
          </div>
          <span className="cs-change up">+12.3%</span>
        </div>
        <div className="client-stat-card">
          <UserPlusIcon size={24} className="client-stat-icon" />
          <div className="client-stat-info">
            <span className="cs-value">12</span>
            <span className="cs-label">New Today</span>
          </div>
          <span className="cs-change up">+8.5%</span>
        </div>
        <div className="client-stat-card">
          <RepeatIcon size={24} className="client-stat-icon" />
          <div className="client-stat-info">
            <span className="cs-value">34%</span>
            <span className="cs-label">Returning Rate</span>
          </div>
          <span className="cs-change up">+2.1%</span>
        </div>
        <div className="client-stat-card">
          <Star size={24} className="client-stat-icon" />
          <div className="client-stat-info">
            <span className="cs-value">4.7★</span>
            <span className="cs-label">Avg Rating</span>
          </div>
          <span className="cs-change up">+0.1</span>
        </div>
      </div>

      <div className="clients-insights">
        <div className="insight-card">
          <h3>User Growth</h3>
          <div className="insight-bar">
            <div className="insight-bar-label">
              <span>This Month</span>
              <span>+247 users</span>
            </div>
            <div className="insight-bar-track">
              <div className="insight-bar-fill" style={{ width: '78%' }} />
            </div>
          </div>
          <div className="insight-bar">
            <div className="insight-bar-label">
              <span>Last Month</span>
              <span>+198 users</span>
            </div>
            <div className="insight-bar-track">
              <div className="insight-bar-fill" style={{ width: '62%' }} />
            </div>
          </div>
          <div className="insight-conversion">
            <span>Conversion funnel:</span>
            <div className="funnel">
              <div className="funnel-step">
                <span>Visitors</span>
                <span>8,420</span>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-step">
                <span>Cart</span>
                <span>1,850</span>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-step">
                <span>Checkout</span>
                <span>723</span>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-step">
                <span>Purchased</span>
                <span>269</span>
              </div>
            </div>
          </div>
        </div>

        <div className="insight-card">
          <h3>Recent Users</h3>
          <div className="recent-users-list">
            {recentUsers.map((u, i) => (
              <div key={i} className="recent-user-item">
                <div className="ru-avatar">{u.name.charAt(0)}</div>
                <div className="ru-info">
                  <span className="ru-name">{u.name}</span>
                  <span className="ru-email">{u.email}</span>
                </div>
                <div className="ru-stats">
                  <span className="ru-orders">{u.orders} orders</span>
                  <span className="ru-spent">{fmtMXN2(u.spent)}</span>
                </div>
                <span className={`ru-status ${u.status}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Inline icons not in lucide ─── */

function UserPlusIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

function RepeatIcon({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

/* ═══════════════════ ANALYTICS ═══════════════════ */

function AnalyticsSection() {
  const gaViews = [
    { page: '/', label: 'Home Page', views: 847, visitors: 623, avgTime: '2m 14s', bounce: '42%' },
    { page: '/products', label: 'All Products', views: 523, visitors: 398, avgTime: '3m 47s', bounce: '28%' },
    { page: '/products/mascarilla-led-7c', label: 'Mascarilla LED 7 Colores', views: 312, visitors: 256, avgTime: '4m 32s', bounce: '15%' },
    { page: '/products/botas-compresion', label: 'Botas de Compresion Recovery', views: 198, visitors: 164, avgTime: '4m 58s', bounce: '14%' },
    { page: '/products/rodillo-jade', label: 'Rodillo Facial de Jade', views: 287, visitors: 234, avgTime: '3m 12s', bounce: '22%' },
    { page: '/cart', label: 'Cart Page', views: 312, visitors: 267, avgTime: '1m 45s', bounce: '35%' },
    { page: '/checkout', label: 'Checkout', views: 98, visitors: 89, avgTime: '2m 30s', bounce: '8%' },
    { page: '/account', label: 'Account/Login', views: 45, visitors: 38, avgTime: '1m 20s', bounce: '55%' },
  ]

  const conversionMetrics = [
    { label: 'Total Sessions', value: '2,847', change: '+12%', up: true },
    { label: 'Unique Visitors', value: '1,936', change: '+8%', up: true },
    { label: 'Page Views', value: '4,521', change: '+15%', up: true },
    { label: 'Avg Session Duration', value: '2m 48s', change: '+5%', up: true },
    { label: 'Bounce Rate', value: '32%', change: '-3%', up: true },
    { label: 'Conversion Rate', value: '3.4%', change: '+0.8%', up: true },
    { label: 'Cart-to-Checkout', value: '31.4%', change: '+2.1%', up: true },
    { label: 'Checkout-to-Purchase', value: '72.5%', change: '+5.3%', up: true },
  ]

  return (
    <div className="analytics-section">
      {/* KPI Grid */}
      <div className="analytics-kpi-grid">
        {conversionMetrics.map((m, i) => (
          <div key={i} className="analytics-kpi-card">
            <div className="akpi-header">
              <span className="akpi-label">{m.label}</span>
              <span className={`akpi-change ${m.up ? 'up' : 'down'}`}>
                {m.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {m.change}
              </span>
            </div>
            <span className="akpi-value">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Top Pages */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h3>Top Pages by Traffic</h3>
          <a href="https://analytics.google.com/analytics/web/#/p473782465" target="_blank" rel="noopener noreferrer" className="analytics-ga-link">
            Open GA4 <ArrowUp size={14} style={{ transform: 'rotate(45deg)' }} />
          </a>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Visitors</th>
                <th>Avg Time</th>
                <th>Bounce</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              {gaViews.map((p, i) => (
                <tr key={i}>
                  <td className="td-product">
                    <div>
                      <span className="td-product-name">{p.label}</span>
                      <span className="td-product-id">{p.page}</span>
                    </div>
                  </td>
                  <td className="td-number">{p.views.toLocaleString()}</td>
                  <td className="td-number">{p.visitors.toLocaleString()}</td>
                  <td className="td-number">{p.avgTime}</td>
                  <td className="td-number">{p.bounce}</td>
                  <td>
                    <div className="analytics-bar-bg">
                      <div
                        className="analytics-bar-fill"
                        style={{ width: `${100 - parseInt(p.bounce)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="analytics-card">
        <h3>Conversion Funnel</h3>
        <div className="analytics-funnel">
          <div className="funnel-row">
            <div className="funnel-bar" style={{ width: '100%' }}>
              <span className="funnel-label">All Sessions</span>
              <span className="funnel-value">2,847</span>
            </div>
          </div>
          <div className="funnel-row">
            <div className="funnel-bar" style={{ width: '72%' }}>
              <span className="funnel-label">Viewed Products</span>
              <span className="funnel-value">2,050</span>
            </div>
          </div>
          <div className="funnel-row">
            <div className="funnel-bar" style={{ width: '48%' }}>
              <span className="funnel-label">Added to Cart</span>
              <span className="funnel-value">1,367</span>
            </div>
          </div>
          <div className="funnel-row">
            <div className="funnel-bar" style={{ width: '31%' }}>
              <span className="funnel-label">Began Checkout</span>
              <span className="funnel-value">883</span>
            </div>
          </div>
          <div className="funnel-row">
            <div className="funnel-bar funnel-bar-green" style={{ width: '22%' }}>
              <span className="funnel-label">Completed Purchase</span>
              <span className="funnel-value">626</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-card">
        <h3>Insights & Recommendations</h3>
        <div className="analytics-insights">
          <div className="insight-item insight-good">
            <span className="insight-icon">✅</span>
            <div>
              <strong>Strong Checkout Conversion</strong>
              <p>72.5% of users who start checkout complete payment. Industry average is 60%.</p>
            </div>
          </div>
          <div className="insight-item insight-warning">
            <span className="insight-icon">⚠️</span>
            <div>
              <strong>High Bounce on Account Page</strong>
              <p>55% bounce rate on /account suggests login friction. Consider social login options.</p>
            </div>
          </div>
          <div className="insight-item insight-good">
            <span className="insight-icon">📈</span>
            <div>
              <strong>Mascarilla LED 7 Colores — Top Product</strong>
              <p>312 units sold with 50% margin. High engagement on product page (4m 32s avg).</p>
            </div>
          </div>
          <div className="insight-item insight-warning">
            <span className="insight-icon">🛒</span>
            <div>
              <strong>31% Cart-to-Checkout</strong>
              <p>1,367 add-to-cart but only 883 checkout. Consider cart abandonment reminders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
