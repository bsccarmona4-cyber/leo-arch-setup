import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Package, LogOut, Mail, Lock, Phone, Copy,
  Check, Gift, Edit3, Save, Sparkles, Trophy,
  ShoppingBag, Clock, MapPinHouse
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  supabase, getMyOrdersWithTracking, signUp, signIn, signOut,
  getProfile, updateProfile, getLoyaltyStatus, claimLoyaltyReward
} from '../lib/supabase'
import '../styles/Account.css'

export default function Account() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])

  // ─── Auth state ───
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authSuccess, setAuthSuccess] = useState(false)

  // ─── Profile state ───
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', address: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileToast, setProfileToast] = useState(null)

  // ─── Loyalty state ───
  const [loyalty, setLoyalty] = useState({ loyalty_points: 0, loyalty_rewards_claimed: 0 })
  const [claimingReward, setClaimingReward] = useState(false)

  // ─── Referral state ───
  const [copied, setCopied] = useState(false)

  // ─── Toast timer ref (para cleanup) ───
  const toastTimer = useRef(null)

  // ═══ LOAD DATA ═══
  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }

    let cancelled = false

    async function loadAll() {
      try {
        const [profileData, ordersData, loyaltyData] = await Promise.all([
          getProfile(user.id).catch(() => null),
          getMyOrdersWithTracking(user.id).catch(() => []),
          getLoyaltyStatus(user.id).catch(() => ({ loyalty_points: 0, loyalty_rewards_claimed: 0 }))
        ])

        if (cancelled) return
        setProfile(profileData)
        setOrders(ordersData)
        setLoyalty(loyaltyData)
        if (profileData) {
          setEditForm({
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            address: profileData.address ? formatAddress(profileData.address) : ''
          })
        }
      } catch {
        // silent — user will see empty states
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [user])

  // ═══ HELPERS ═══
  function formatAddress(addr) {
    if (typeof addr === 'string') return addr
    if (!addr || typeof addr !== 'object') return ''
    const parts = []
    if (addr.street) parts.push(addr.street)
    if (addr.neighborhood) parts.push(addr.neighborhood)
    const cityState = [addr.city, addr.state].filter(Boolean).join(', ')
    if (cityState) parts.push(cityState)
    if (addr.zip) parts.push('CP ' + addr.zip)
    return parts.join('\n')
  }

  function showToast(msg, type = 'success') {
    setProfileToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setProfileToast(null), 3500)
  }

  // Limpiar toast timer al desmontar
  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  // ═══ AUTH HANDLERS ═══
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setAuthSuccess(true)
      }
    } catch (err) {
      setAuthError(err.message)
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  // ═══ PROFILE HANDLERS ═══
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const updates = {
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim()
      }
      const updated = await updateProfile(user.id, updates)
      setProfile(updated)
      setEditing(false)
      showToast('Perfil actualizado correctamente')
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error')
    }
    setSavingProfile(false)
  }

  // ═══ LOYALTY HANDLER ═══
  const handleClaimReward = async () => {
    setClaimingReward(true)
    try {
      const result = await claimLoyaltyReward(user.id)
      if (result.success) {
        setLoyalty({
          loyalty_points: result.total_points,
          loyalty_rewards_claimed: result.rewards_claimed
        })
        showToast(`🎉 ¡Premio nivel ${result.card_size} círculos reclamado! Revisa tu correo para los detalles.`)
      } else {
        showToast(result.error, 'error')
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error')
    }
    setClaimingReward(false)
  }

  // ═══ REFERRAL HANDLER ═══
  const handleCopyCode = () => {
    if (!profile?.referral_code) return
    navigator.clipboard.writeText(profile.referral_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      showToast('No se pudo copiar el código. Intenta de nuevo.', 'error')
    })
  }

  // ═══ RENDER: LOADING ═══
  if (loading || profileLoading) {
    return (
      <div className="account-page">
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--gray-400)' }}>
          Cargando...
        </div>
      </div>
    )
  }

  // ═══ RENDER: NO AUTENTICADO ═══
  if (!user) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-auth-box">
            <div className="account-auth-icon">
              <User size={36} />
            </div>
            <h2>{isLogin ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}</h2>
            <p className="account-auth-sub">
              {isLogin
                ? 'Inicia sesión para ver tus pedidos, promos y tu tarjeta de fidelidad.'
                : 'Regístrate para acumular puntos, obtener descuentos y seguir tus envíos.'}
            </p>

            <form onSubmit={handleAuth} className="account-auth-form">
              <div className="auth-input-wrap">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Contraseña (mín. 6 caracteres)"
                  aria-label="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              {authSuccess && (
                <p className="auth-success">
                  ✅ ¡Cuenta creada! Revisa tu correo para confirmar. También puedes intentar iniciar sesión.
                </p>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={authLoading}>
                {authLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            <p className="auth-toggle">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button onClick={() => { setIsLogin(!isLogin); setAuthError(''); setAuthSuccess(false) }}>
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>

            <Link to="/" className="auth-back-link">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  // ═══ RENDER: AUTENTICADO ═══
  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'fecha desconocida'
  const displayName = profile?.full_name || user.email
  const avatarLetter = (profile?.full_name?.[0] || user.email[0]).toUpperCase()
  // ─── Loyalty card: sistema escalonado 5→6→7→8→9→10 círculos ───
  const rewardsClaimed = loyalty.loyalty_rewards_claimed || 0
  const totalPoints = loyalty.loyalty_points || 0
  const cardSize = Math.min(5 + rewardsClaimed, 10)
  // Puntos consumidos por reclamos anteriores: sum(min(5+i,10)) para i=0..rewardsClaimed-1
  const consumed = rewardsClaimed <= 5
    ? rewardsClaimed * (rewardsClaimed + 9) / 2
    : 35 + (rewardsClaimed - 5) * 10
  const pointsOnCard = Math.min(totalPoints - consumed, cardSize)
  const loyaltyCircles = Array.from({ length: cardSize }, (_, i) => i < pointsOnCard)
  const canClaimReward = (totalPoints - consumed) >= cardSize && cardSize > 0

  return (
    <div className="account-page">
      <div className="container">
        {/* Toast */}
        {profileToast && (
          <div className={`account-toast ${profileToast.type}`}>
            {profileToast.msg}
          </div>
        )}

        {/* ─── Header ─── */}
        <div className="account-header">
          <div className="account-avatar">{avatarLetter}</div>
          <div className="account-user-info">
            <h1>{displayName}</h1>
            <p><Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Miembro desde {createdDate}
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleSignOut}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* ─── Grid ─── */}
        <div className="account-grid">

          {/* ═══ CARD: Perfil Personal ═══ */}
          <div className="account-card">
            <div className="account-card-header">
              <User size={20} />
              <h2>Perfil Personal</h2>
              {!editing && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => setEditing(true)}
                >
                  <Edit3 size={14} /> Editar
                </button>
              )}
            </div>

            {editing ? (
              <div className="profile-edit-form">
                <div className="profile-field">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div className="profile-field">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="profile-field">
                  <label>Dirección de envío</label>
                  <textarea
                    placeholder="Calle, número, colonia, ciudad, estado, CP"
                    value={editForm.address}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="profile-save-row">
                  <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={savingProfile}>
                    <Save size={14} /> {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="account-detail-row">
                  <span><Mail size={14} style={{ marginRight: 8 }} />Correo</span>
                  <span>{user.email}</span>
                </div>
                <div className="account-detail-row">
                  <span><User size={14} style={{ marginRight: 8 }} />Nombre</span>
                  <span>{profile?.full_name || '—'}</span>
                </div>
                <div className="account-detail-row">
                  <span><Phone size={14} style={{ marginRight: 8 }} />Teléfono</span>
                  <span>{profile?.phone || '—'}</span>
                </div>
                <div className="account-detail-row">
                  <span><MapPinHouse size={14} style={{ marginRight: 8 }} />Dirección</span>
                  <span style={{ whiteSpace: 'pre-line', textAlign: 'right' }}>
                    {profile?.address ? formatAddress(profile.address) : 'Sin dirección guardada'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ═══ CARD: Código de Invitación ═══ */}
          <div className="account-card referral-card">
            <h2><Gift size={20} /> Tu Código de Invitación</h2>
            <p className="referral-sub">
              Comparte este código con amigas. Cuando hagan su primera compra,
              <strong> ambas reciben 15% de descuento.</strong>
            </p>
            <div className="referral-code-display">
              <div className="referral-code-box">
                {profile?.referral_code ?? 'CARGANDO'}
              </div>
              <button className="referral-copy-btn" onClick={handleCopyCode}>
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
            {profile?.referral_used && (
              <div className="promo-banner" style={{ marginTop: 16, marginBottom: 0 }}>
                <Check size={16} /> Usaste el código de una amiga — ¡ya tienes tu descuento activo!
              </div>
            )}
          </div>

          {/* ═══ CARD: Tarjeta de Fidelidad — full width ═══ */}
          <div className="account-card account-card-full">
            <div className="account-card-header">
              <Trophy size={20} />
              <h2>Tarjeta de Fidelidad KREID</h2>
              <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>
                Nivel {rewardsClaimed + 1} — {cardSize} círculos
              </span>
            </div>
            <div className="loyalty-card">
              <p className="loyalty-title">
                {pointsOnCard === 0
                  ? <>Cada compra llena un círculo. <strong>¡Al completar {cardSize}, te regalamos un premio sorpresa!</strong></>
                  : canClaimReward
                    ? <strong>¡Completaste los {cardSize} círculos! Reclama tu premio.</strong>
                    : <>{pointsOnCard} de {cardSize} círculos llenos. <strong>¡Te faltan {cardSize - pointsOnCard}!</strong></>
                }
              </p>

              <div className="loyalty-circles">
                {loyaltyCircles.map((filled, i) => (
                  <div key={i} className={`loyalty-circle ${filled ? 'filled' : 'empty'}`}>
                    <span className="circle-num">{filled ? '✓' : i + 1}</span>
                  </div>
                ))}
              </div>

              {canClaimReward && (
                <div className="loyalty-reward-badge">
                  <Sparkles size={16} /> ¡Premio disponible!
                </div>
              )}

              {rewardsClaimed > 0 && (
                <p className="loyalty-reward-desc">
                  🎁 Has reclamado <strong>{rewardsClaimed}</strong> premio{rewardsClaimed > 1 ? 's' : ''}.
                  {rewardsClaimed < 5 && <> Tu próxima tarjeta tendrá <strong>{Math.min(5 + rewardsClaimed + 1, 10)} círculos</strong>.</>}
                  {rewardsClaimed >= 5 && <> Todas tus tarjetas ahora tienen <strong>10 círculos</strong>.</>}
                </p>
              )}

              {canClaimReward && (
                <button
                  className="btn-claim"
                  onClick={handleClaimReward}
                  disabled={claimingReward}
                >
                  <Gift size={18} />
                  {claimingReward ? 'Reclamando...' : '¡Reclamar mi premio sorpresa!'}
                </button>
              )}

              {!canClaimReward && totalPoints > 0 && (
                <p className="loyalty-reward-desc" style={{ marginTop: 8 }}>
                  Te faltan <strong>{cardSize - pointsOnCard}</strong> compra{cardSize - pointsOnCard !== 1 ? 's' : ''} más para tu premio.
                </p>
              )}
            </div>
          </div>

          {/* ═══ CARD: Historial de Pedidos ═══ */}
          <div className="account-card account-card-full">
            <div className="account-card-header">
              <ShoppingBag size={20} />
              <h2>Historial de Pedidos</h2>
            </div>
            {orders.length === 0 ? (
              <div className="account-empty">
                <Package size={40} style={{ color: 'var(--gray-300)', marginBottom: 12 }} />
                <p>Aún no tienes pedidos</p>
                <Link to="/products" className="btn btn-primary btn-sm">
                  <Sparkles size={14} /> Explorar Tienda
                </Link>
              </div>
            ) : (
              <div className="account-orders">
                {orders.map(order => {
                  const cj = order.cj_orders?.[0]
                  const trackingUrl = cj?.tracking_url || (cj?.tracking_number
                    ? `https://track.cjdropshipping.com?trackNumber=${cj.tracking_number}`
                    : null)
                  const statusLabels = {
                    pending: 'Pendiente',
                    processing: 'Procesando',
                    shipped: 'Enviado',
                    delivered: 'Entregado',
                    cancelled: 'Cancelado'
                  }
                  return (
                    <div key={order.id} className="account-order-item">
                      <div>
                        <p className="order-id">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="order-date">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span className={`order-status ${order.status}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                        {!cj?.tracking_number && cj && (cj.cj_status === 'processing' || cj.cj_status === 'pending') && (
                          <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                            🚚 Preparando pedido...
                          </span>
                        )}
                      </div>
                      <span className="order-total">
                        ${(order.total || 0).toLocaleString('es-MX', {
                          minimumFractionDigits: 2, maximumFractionDigits: 2
                        })}
                      </span>
                      {cj && (cj.cj_order_number || cj.logistic_name || cj.tracking_number) && (
                        <div style={{
                          width: '100%', marginTop: '8px', paddingTop: '8px',
                          borderTop: '1px solid var(--gray-200)', fontSize: '12px', color: 'var(--gray-400)'
                        }}>
                          {cj.cj_order_number && <div>CJ Order #: {cj.cj_order_number}</div>}
                          {cj.logistic_name && <div>Logística: {cj.logistic_name}</div>}
                          {cj.tracking_number && (
                            <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                              style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: 600 }}>
                              📬 Rastrear Paquete
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
