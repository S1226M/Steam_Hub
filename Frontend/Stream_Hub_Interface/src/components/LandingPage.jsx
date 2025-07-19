import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">
            Welcome to <span className="brand-gradient">StreamHub</span>
          </h1>
          <p className="landing-subtitle">
            Your ultimate destination for streaming videos, music, and entertainment
          </p>
        </div>

        <div className="landing-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.828 14.828A4 4 0 0 1 9.172 9.172a4 4 0 0 1 5.656 5.656z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.172 14.828A4 4 0 0 1 14.828 9.172a4 4 0 0 1-5.656 5.656z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Discover Content</h3>
            <p>Explore thousands of videos across all categories</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Premium Experience</h3>
            <p>Ad-free streaming with exclusive content</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Personal Library</h3>
            <p>Save and organize your favorite content</p>
          </div>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="landing-btn primary">
            Sign In
          </Link>
          <Link to="/signup" className="landing-btn secondary">
            Create Account
          </Link>
        </div>

        <div className="landing-footer">
          <p>Join millions of users worldwide</p>
        </div>
      </div>
    </div>
  );
} 