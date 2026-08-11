import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CreatePost from './components/CreatePost';
import './App.css';

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="app">
      {user && <Navbar />}
      <main className={`app-content ${!user ? 'no-nav' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/" replace /> : <Register />
          } />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute><Feed /></ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute><Explore /></ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute><CreatePost /></ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute><EditProfile /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
