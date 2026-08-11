import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const avatarLetter = profile?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <div className="navbar-logo-icon">📸</div>
        <span className="navbar-logo-text">InstaClone</span>
      </div>

      {/* Nav Items */}
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Inicio</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">🔍</span>
        <span className="nav-label">Explorar</span>
      </NavLink>

      <NavLink
        to="/create"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="nav-icon">➕</span>
        <span className="nav-label">Crear</span>
      </NavLink>

      <NavLink
        to={`/profile/${profile?.username || ''}`}
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="nav-avatar"
          />
        ) : (
          <span className="nav-icon" style={{
            background: 'var(--gradient-primary)',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'white',
          }}>
            {avatarLetter}
          </span>
        )}
        <span className="nav-label">Perfil</span>
      </NavLink>

      {/* Spacer for desktop sidebar */}
      <div className="navbar-spacer" />

      {/* Logout — desktop only */}
      <button
        className="nav-item"
        onClick={handleLogout}
        style={{ display: 'none' }}
        id="nav-logout-desktop"
      >
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Salir</span>
      </button>

      <style>{`
        @media (min-width: 768px) {
          #nav-logout-desktop {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
