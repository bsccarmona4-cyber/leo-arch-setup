import { Link } from 'react-router-dom';

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

export default function Comment({ comment }) {
  const profile = comment.profiles;
  const avatarLetter = profile?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="comment-item">
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="comment-avatar"
        />
      ) : (
        <div className="comment-avatar" style={{
          background: `hsl(${(profile?.username || '').charCodeAt(0) * 7 % 360}, 65%, 55%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.75rem',
        }}>
          {avatarLetter}
        </div>
      )}

      <div className="comment-body">
        <p className="comment-text">
          <Link
            to={`/profile/${profile?.username}`}
            className="comment-username"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {profile?.username}
          </Link>
          {comment.content}
        </p>
        <span className="comment-time">{timeAgo(comment.created_at)}</span>
      </div>
    </div>
  );
}
