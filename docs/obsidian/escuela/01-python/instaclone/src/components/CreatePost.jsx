import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';

export default function CreatePost() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { createPost } = usePosts();

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }

    setImage(file);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) {
      setError('Selecciona una imagen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createPost(image, caption);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <h1>Nueva publicación</h1>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!image || loading}
        >
          {loading ? <div className="spinner spinner-sm" /> : 'Compartir'}
        </button>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 'var(--space-md)' }}>
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`create-upload-area ${preview ? 'has-image' : ''}`}
        onClick={() => !preview && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files[0];
          if (file) {
            const fakeEvent = { target: { files: [file] } };
            handleFileSelect(fakeEvent);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="create-file-input"
        />

        {preview ? (
          <>
            <img src={preview} alt="Preview" className="create-preview" />
            <button
              className="create-preview-overlay"
              onClick={(e) => { e.stopPropagation(); clearImage(); }}
              aria-label="Quitar imagen"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div className="create-upload-icon">📸</div>
            <p className="create-upload-text">
              Arrastra una foto aquí o haz clic para seleccionar
            </p>
            <p className="create-upload-hint">
              JPG, PNG, GIF • Máx 5MB
            </p>
          </>
        )}
      </div>

      {/* Caption */}
      <form className="create-form" onSubmit={handleSubmit}>
        <textarea
          placeholder="Escribe un pie de foto..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={2200}
          rows={4}
        />
        <p style={{
          textAlign: 'right',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--font-size-xs)',
        }}>
          {caption.length}/2200
        </p>
      </form>
    </div>
  );
}
