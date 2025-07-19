import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import UserLayout from "./Layout/User/UserLayout";
import Home from "./components/User/Home";
import Explore from "./components/User/Explore";
import Subscriptions from "./components/User/Subscriptions";
import Library from "./components/User/Library";
import VideoPlayer from "./components/User/VideoPlayer";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ff5e62, #ff9966)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h1>🚨 Error Detected</h1>
            <p>Component failed to render properly</p>
            <p>Error: {this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid white',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            } />
            <Route path="/signup" element={
              <ErrorBoundary>
                <Signup />
              </ErrorBoundary>
            } />

            {/* Protected user routes */}
            <Route path="/user/*" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              } />
              <Route path="explore" element={
                <ErrorBoundary>
                  <Explore />
                </ErrorBoundary>
              } />
              <Route path="subscriptions" element={
                <ErrorBoundary>
                  <Subscriptions />
                </ErrorBoundary>
              } />
              <Route path="library" element={
                <ErrorBoundary>
                  <Library />
                </ErrorBoundary>
              } />
              <Route path="video/:videoId" element={
                <ErrorBoundary>
                  <VideoPlayer />
                </ErrorBoundary>
              } />
              <Route
                path="history"
                element={
                  <div className="coming-soon">History page coming soon!</div>
                }
              />
              <Route
                path="liked"
                element={
                  <div className="coming-soon">Liked videos page coming soon!</div>
                }
              />
              <Route
                path="downloads"
                element={
                  <div className="coming-soon">Downloads page coming soon!</div>
                }
              />
              <Route
                path="settings"
                element={
                  <div className="coming-soon">Settings page coming soon!</div>
                }
              />
              <Route
                path="help"
                element={<div className="coming-soon">Help page coming soon!</div>}
              />
              <Route
                path="feedback"
                element={
                  <div className="coming-soon">Feedback page coming soon!</div>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
