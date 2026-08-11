import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
  const { profile, user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    setAvatarFile(file);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = profile?.avatar_url || '';

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
      });

      setSuccess('¡Perfil actualizado correctamente!');
      setTimeout(() => {
        navigate(`/profile/${formData.username}`, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  }

  const avatarLetter = formData.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          style={{ fontSize: '1.2rem' }}
        >
          ←
        </button>
        <h1>Editar perfil</h1>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          color: 'var(--color-success)',
          fontSize: 'var(--font-size-sm)',
          textAlign: 'center',
          padding: 'var(--space-sm) var(--space-md)',
          background: 'rgba(0, 210, 255, 0.1)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          marginBottom: 'var(--space-md)',
        }}>
          {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="edit-profile-avatar-section">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar" className="edit-profile-avatar" />
        ) : (
          <div className="edit-profile-avatar" style={{
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>
            {avatarLetter}
          </div>
        )}

        <div className="edit-profile-avatar-info">
          <div className="edit-profile-avatar-name">{profile?.username}</div>
          <button
            className="btn btn-ghost"
            onClick={() => fileInputRef.current?.click()}
            style={{ color: 'var(--color-primary)', padding: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}
          >
            Cambiar foto de perfil
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Form */}
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="edit-profile-field">
          <label htmlFor="edit-fullname">Nombre</label>
          <input
            id="edit-fullname"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
          />
        </div>

        <div className="edit-profile-field">
          <label htmlFor="edit-username">Nombre de usuario</label>
          <input
            id="edit-username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="nombre_de_usuario"
            required
          />
        </div>

        <div className="edit-profile-field">
          <label htmlFor="edit-bio">Biografía</label>
          <textarea
            id="edit-bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Cuéntanos sobre ti..."
            maxLength={150}
            rows={3}
          />
          <p style={{
            textAlign: 'right',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-xs)',
          }}>
            {formData.bio.length}/150
          </p>
        </div>

        <div className="edit-profile-actions">
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-sm" /> : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
