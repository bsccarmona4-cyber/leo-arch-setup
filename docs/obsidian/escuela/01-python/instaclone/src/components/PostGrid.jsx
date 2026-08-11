import { useState } from 'react';

export default function PostGrid({ posts = [], onPostClick }) {
  return (
    <div className="post-grid">
      {posts.length === 0 && (
        <div className="post-grid-empty">
          <div className="post-grid-empty-icon">📷</div>
          <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--space-sm)' }}>
            No hay publicaciones aún
          </h3>
          <p>Cuando compartas fotos, aparecerán aquí.</p>
        </div>
      )}

      {posts.map((post) => (
        <PostGridItem
          key={post.id}
          post={post}
          onClick={() => onPostClick?.(post)}
        />
      ))}
    </div>
  );
}

function PostGridItem({ post, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="post-grid-item" onClick={onClick}>
      {!imageLoaded && (
        <div className="skeleton" style={{ width: '100%', height: '100%', position: 'absolute' }} />
      )}
      <img
        src={post.image_url}
        alt={post.caption || 'Post'}
        onLoad={() => setImageLoaded(true)}
        style={{ opacity: imageLoaded ? 1 : 0 }}
        loading="lazy"
      />
      <div className="post-grid-overlay">
        <span className="post-grid-stat">
          ❤️ {post.likesCount || 0}
        </span>
        <span className="post-grid-stat">
          💬 {post.commentsCount || 0}
        </span>
      </div>
    </div>
  );
}
