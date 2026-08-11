import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, username, avatar_url),
            likes (id, user_id),
            comments (id)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const enriched = (data || []).map(post => ({
          ...post,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
        }));

        setPosts(enriched);
      } catch (err) {
        console.error('Error fetching explore posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="explore-page">
        <div className="explore-header">
          <h1>Explorar</h1>
        </div>
        <div className="explore-grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="post-grid-item">
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explorar</h1>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌍</div>
          <h3>No hay publicaciones aún</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
            ¡Sé el primero en compartir algo!
          </p>
        </div>
      ) : (
        <div className="explore-grid">
          {posts.map(post => (
            <div
              key={post.id}
              className="post-grid-item"
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={post.image_url}
                alt={post.caption || 'Post'}
                loading="lazy"
              />
              <div className="post-grid-overlay">
                <span className="post-grid-stat">❤️ {post.likesCount}</span>
                <span className="post-grid-stat">💬 {post.commentsCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
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
                {selectedPost.profiles?.avatar_url ? (
                  <img
                    src={selectedPost.profiles.avatar_url}
                    alt={selectedPost.profiles.username}
                    className="post-avatar"
                  />
                ) : (
                  <div className="post-avatar" style={{
                    background: `hsl(${(selectedPost.profiles?.username || '').charCodeAt(0) * 7 % 360}, 65%, 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {selectedPost.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="post-user-info">
                  <a
                    href={`/profile/${selectedPost.profiles?.username}`}
                    className="post-username"
                  >
                    {selectedPost.profiles?.username}
                  </a>
                </div>
              </div>

              <div className="modal-comments-list">
                {selectedPost.caption && (
                  <div className="comment-item">
                    <div className="comment-body">
                      <p className="comment-text">
                        <span className="comment-username">{selectedPost.profiles?.username}</span>
                        {selectedPost.caption}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                  <span>❤️ {selectedPost.likesCount}</span>
                  <span>💬 {selectedPost.commentsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
