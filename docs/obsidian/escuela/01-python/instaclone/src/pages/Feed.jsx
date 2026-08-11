import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import Post from '../components/Post';
import Story from '../components/Story';

export default function Feed() {
  const { posts, loading, toggleLike, addComment, deletePost } = usePosts('feed');
  const [storyUsers, setStoryUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch some users for the stories bar
    async function fetchStoryUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', user?.id || '')
        .limit(10);

      setStoryUsers(data || []);
    }

    fetchStoryUsers();
  }, [user]);

  if (loading) {
    return (
      <div className="feed-page">
        <div className="feed-header">
          <h1>InstaClone</h1>
        </div>

        {/* Skeleton Stories */}
        <div className="stories-bar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="story-item">
              <div className="skeleton skeleton-circle" style={{ width: 66, height: 66 }} />
              <div className="skeleton skeleton-text" style={{ width: 50, height: 10 }} />
            </div>
          ))}
        </div>

        {/* Skeleton Posts */}
        {[1, 2].map(i => (
          <div key={i} className="post-card" style={{ padding: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div className="skeleton skeleton-circle" style={{ width: 36, height: 36 }} />
              <div>
                <div className="skeleton skeleton-text" style={{ width: 120 }} />
                <div className="skeleton skeleton-text" style={{ width: 60, height: 10 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '100%', height: 350, marginBottom: 'var(--space-md)' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="feed-page">
      {/* Mobile header */}
      <div className="feed-header">
        <h1>InstaClone</h1>
        <Link to="/create" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>
          ➕
        </Link>
      </div>

      {/* Stories */}
      <Story users={storyUsers} />

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="feed-empty">
          <div className="feed-empty-icon">📸</div>
          <h2>¡Bienvenido a InstaClone!</h2>
          <p>
            Sigue a otros usuarios para ver sus publicaciones aquí,
            o explora contenido nuevo.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary">
              🔍 Explorar
            </Link>
            <Link to="/create" className="btn btn-secondary">
              📸 Crear publicación
            </Link>
          </div>
        </div>
      ) : (
        posts.map(post => (
          <Post
            key={post.id}
            post={post}
            onLike={toggleLike}
            onComment={addComment}
            onDelete={deletePost}
          />
        ))
      )}
    </div>
  );
}
