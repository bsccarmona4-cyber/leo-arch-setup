import { useAuth } from '../context/AuthContext';

export default function Story({ users = [] }) {
  const { profile } = useAuth();
  const avatarLetter = profile?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="stories-bar">
      {/* Your story (Add) */}
      <div className="story-item story-add">
        <div className="story-ring">
          <div className="story-ring-inner">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Tu historia"
                className="story-avatar"
              />
            ) : (
              <div className="story-avatar" style={{
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                {avatarLetter}
              </div>
            )}
          </div>
        </div>
        <div className="story-add-icon">+</div>
        <span className="story-username">Tu historia</span>
      </div>

      {/* Other users' stories */}
      {users.map((user) => {
        const letter = user.username?.[0]?.toUpperCase() || '?';
        return (
          <div key={user.id} className="story-item">
            <div className="story-ring">
              <div className="story-ring-inner">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="story-avatar"
                  />
                ) : (
                  <div className="story-avatar" style={{
                    background: `hsl(${user.username.charCodeAt(0) * 7 % 360}, 65%, 55%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                  }}>
                    {letter}
                  </div>
                )}
              </div>
            </div>
            <span className="story-username">{user.username}</span>
          </div>
        );
      })}
    </div>
  );
}
