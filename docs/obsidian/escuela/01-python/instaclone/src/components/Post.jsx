import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}sem`;
}

export default function Post({ post, onLike, onComment, onDelete }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastTapRef = useRef(0);

  const profile = post.profiles;
  const avatarLetter = profile?.username?.[0]?.toUpperCase() || '?';

  function handleDoubleClick() {
    if (!post.isLiked) {
      onLike?.(post.id);
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 1000);
  }

  function handleTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleClick();
    }
    lastTapRef.current = now;
  }

  function handleSubmitComment(e) {
    e.preventDefault();
    if (commentText.trim()) {
      onComment?.(post.id, commentText);
      setCommentText('');
    }
  }

  const recentComments = post.comments
    ? (showAllComments ? post.comments : post.comments.slice(0, 2))
    : [];

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="post-avatar"
          />
        ) : (
          <div className="post-avatar" style={{
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            {avatarLetter}
          </div>
        )}

        <div className="post-user-info">
          <Link to={`/profile/${profile?.username}`} className="post-username">
            {profile?.username}
          </Link>
          <div className="post-time">{timeAgo(post.created_at)}</div>
        </div>

        {user?.id === post.user_id && (
          <div style={{ position: 'relative' }}>
            <button
              className="post-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Opciones del post"
            >
              ⋯
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm)',
                zIndex: 10,
                minWidth: 120,
                animation: 'fadeIn 0.2s ease',
              }}>
                <button
                  onClick={() => { onDelete?.(post.id); setShowMenu(false); }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    color: 'var(--color-danger)',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,71,87,0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div
        className="post-image-container"
        onClick={handleTap}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={post.image_url}
          alt={post.caption || 'Post'}
          className="post-image"
          loading="lazy"
        />
        {showDoubleTapHeart && (
          <span className="post-double-tap-heart">❤️</span>
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
          onClick={() => onLike?.(post.id)}
          aria-label={post.isLiked ? 'Quitar like' : 'Dar like'}
        >
          {post.isLiked ? '❤️' : '🤍'}
        </button>
        <button
          className="post-action-btn"
          aria-label="Comentar"
          onClick={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
        >
          💬
        </button>
        <button className="post-action-btn" aria-label="Compartir">
          📤
        </button>
        <div className="post-action-spacer" />
        <button className="post-action-btn" aria-label="Guardar">
          🔖
        </button>
      </div>

      {/* Likes count */}
      {post.likesCount > 0 && (
        <div className="post-likes">
          {post.likesCount} {post.likesCount === 1 ? 'Me gusta' : 'Me gusta'}
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="post-caption">
          <Link to={`/profile/${profile?.username}`} className="post-caption-username">
            {profile?.username}
          </Link>
          {post.caption}
        </div>
      )}

      {/* Comments preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="post-comments-preview">
          {post.comments.length > 2 && !showAllComments && (
            <button
              className="post-view-comments"
              onClick={() => setShowAllComments(true)}
            >
              Ver los {post.comments.length} comentarios
            </button>
          )}
          {recentComments.map(comment => (
            <div key={comment.id} className="post-comment-item">
              <strong>
                <Link to={`/profile/${comment.profiles?.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {comment.profiles?.username}
                </Link>
              </strong>
              {comment.content}
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      <form className="post-add-comment" onSubmit={handleSubmitComment}>
        <input
          id={`comment-input-${post.id}`}
          type="text"
          placeholder="Agrega un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
        >
          Publicar
        </button>
      </form>
    </article>
  );
}
