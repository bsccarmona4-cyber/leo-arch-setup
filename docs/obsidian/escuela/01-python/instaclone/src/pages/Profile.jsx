import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import PostGrid from '../components/PostGrid';

export default function Profile() {
  const { username } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    profileData,
    userPosts,
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
  } = useProfile(username);

  const [selectedPost, setSelectedPost] = useState(null);

  const isOwnProfile = user?.id === profileData?.id;
  const avatarLetter = profileData?.username?.[0]?.toUpperCase() || '?';

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="skeleton skeleton-circle profile-avatar" />
          </div>
          <div className="profile-info" style={{ width: '100%' }}>
            <div className="skeleton skeleton-text" style={{ width: 150, height: 24, marginBottom: 'var(--space-md)' }} />
            <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
              <div className="skeleton skeleton-text" style={{ width: 60, height: 18 }} />
              <div className="skeleton skeleton-text" style={{ width: 80, height: 18 }} />
              <div className="skeleton skeleton-text" style={{ width: 80, height: 18 }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Usuario no encontrado</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
            El usuario @{username} no existe.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-avatar-container">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.username}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {avatarLetter}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-top-row">
            <h1 className="profile-username">{profileData.username}</h1>

            {isOwnProfile ? (
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Link to="/edit-profile" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 'var(--font-size-sm)' }}>
                  Editar perfil
                </Link>
                <button
                  className="btn btn-ghost"
                  onClick={handleLogout}
                  style={{ padding: '8px 16px', fontSize: 'var(--font-size-sm)' }}
                >
                  🚪
                </button>
              </div>
            ) : (
              <button
                className={`btn-follow ${isFollowing ? 'following' : ''}`}
                onClick={toggleFollow}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{userPosts.length}</span>
              <span className="profile-stat-label"> publicaciones</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{followersCount}</span>
              <span className="profile-stat-label"> seguidores</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{followingCount}</span>
              <span className="profile-stat-label"> seguidos</span>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-bio">
            {profileData.full_name && (
              <span className="full-name">{profileData.full_name}</span>
            )}
            {profileData.bio && (
              <span className="bio-text">{profileData.bio}</span>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className="profile-tab active">
          📷 Publicaciones
        </button>
      </div>

      {/* Post Grid */}
      <PostGrid
        posts={userPosts}
        onPostClick={(post) => setSelectedPost(post)}
      />

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <button className="modal-overlay-close" onClick={() => setSelectedPost(null)}>
            ✕
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image">
              <img src={selectedPost.image_url} alt={selectedPost.caption || 'Post'} />
            </div>
            <div className="modal-details">
              <div className="post-header">
                {profileData.avatar_url ? (
                  <img src={profileData.avatar_url} alt={profileData.username} className="post-avatar" />
                ) : (
                  <div className="post-avatar" style={{
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {avatarLetter}
                  </div>
                )}
                <div className="post-user-info">
                  <span className="post-username">{profileData.username}</span>
                </div>
              </div>

              <div className="modal-comments-list">
                {selectedPost.caption && (
                  <div className="comment-item">
                    <div className="comment-body">
                      <p className="comment-text">
                        <span className="comment-username">{profileData.username}</span>
                        {selectedPost.caption}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                  <span>❤️ {selectedPost.likesCount || 0}</span>
                  <span>💬 {selectedPost.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
