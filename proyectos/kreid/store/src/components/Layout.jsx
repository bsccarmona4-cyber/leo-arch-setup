import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Sparkles, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import DarkModeToggle from './DarkModeToggle'
import './Layout.css'

function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="announcement-scroll">
        <span>✨ ENVÍO GRATIS EN PEDIDOS +$999 MXN</span>
        <span className="sep">•</span>
        <span>📦 ENTREGA 3-7 DÍAS HÁBILES</span>
        <span className="sep">•</span>
        <span>🎉 GARANTÍA DE FELICIDAD 30 DÍAS</span>
        <span className="sep">•</span>
        <span>💳 PAGA CON TARJETA O TRANSFERENCIA</span>
        <span className="sep">•</span>
        <span>✨ ENVÍO GRATIS EN PEDIDOS +$999 MXN</span>
        <span className="sep">•</span>
        <span>📦 ENTREGA 3-7 DÍAS HÁBILES</span>
        <span className="sep">•</span>
        <span>🎉 GARANTÍA DE FELICIDAD 30 DÍAS</span>
      </div>
    </div>
  )
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const { items, totalItems, totalPrice } = useCart()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (items.length > 0) {
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 300)
    }
  }, [items.length])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const formatMXN = (price) => {
    return `$${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="layout">
      <AnnouncementBar />

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo">
            <Sparkles size={20} className="logo-icon" />
            <span className="logo-text">KREID</span>
          </Link>

          <div className="nav-links-desktop">
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>Tienda</Link>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Inicio</Link>
          </div>

          <div className="nav-actions">
            <Link to="/account" className="nav-account-icon" title="Mi Cuenta">
              <User size={20} />
            </Link>
            <DarkModeToggle />
            <Link to="/cart" className="cart-link">
              <div className={`cart-icon ${cartBounce ? 'bounce' : ''}`}>
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="cart-count-badge">{totalItems}</span>
                )}
              </div>
              {totalPrice > 0 && (
                <span className="cart-total">{formatMXN(totalPrice)}</span>
              )}
            </Link>
            <button
              className="menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <div className="container">
              <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
              <Link to="/products" onClick={() => setMenuOpen(false)}>Tienda</Link>
              <Link to="/account" onClick={() => setMenuOpen(false)}>Mi Cuenta</Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Carrito {totalItems > 0 && `(${totalItems})`}</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Sparkles size={18} className="logo-icon" />
            <span>KREID</span>
          </div>
          <div className="footer-links">
            <Link to="/products">Tienda</Link>
            <Link to="/account">Mi Cuenta</Link>
            <Link to="/cart">Carrito</Link>
            <Link to="/">Inicio</Link>
          </div>
          <p className="footer-text">Dispositivos de belleza y bienestar. Envíos a todo México.</p>
          <p className="footer-copy">&copy; 2026 KREID. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
