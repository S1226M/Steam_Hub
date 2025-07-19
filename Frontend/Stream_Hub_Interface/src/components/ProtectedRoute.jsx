import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Debug:', {
    isLoading,
    isAuthenticated: isAuthenticated(),
    user: !!user,
    token: !!token,
    pathname: location.pathname
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  console.log('Authenticated, rendering children');
  return children;
} 