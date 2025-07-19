// File: UserLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./UserLayout.css";

export default function UserLayout() {
  return (
    <div className="user-layout">
      {/* Header */}
      <header className="user-header">
        <h2>StreamHub</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search videos..."
          />
        </div>
        <button className="search-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="user-profile">
          <div className="profile-circle">U</div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="user-main" style={{ float: "left" }}>
        {/* Sidebar */}
        <aside className="user-sidebar" style={{ paddingTop: "30px" }}>
          <ul className="nav-links">
            <li>
              <NavLink to="/user/home" className="link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore" className="link">
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink to="/subscriptions" className="link">
                Subscriptions
              </NavLink>
            </li>
          </ul>

          <div className="premium-box animate-pop">
            <p className="premium-title">👑 Go Premium</p>
            <p className="premium-desc">
              Enjoy ad-free videos, offline downloads & exclusive content
            </p>
            <button className="premium-btn">Upgrade Now</button>
          </div>

          <h4 className="section-title">Library</h4>
          <ul className="nav-links">
            <li>
              <NavLink to="/library" className="link">
                Library
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" className="link">
                History
              </NavLink>
            </li>
            <li>
              <NavLink to="/liked" className="link">
                Liked Videos
              </NavLink>
            </li>
            <li>
              <NavLink to="/downloads" className="link">
                Downloads
              </NavLink>
            </li>
          </ul>

          <h4 className="section-title">Subscriptions</h4>
          <ul className="nav-links">
            <li>
              <NavLink to="/tech-reviews" className="link">
                Tech Reviews
              </NavLink>
            </li>
            <li>
              <NavLink to="/music-zone" className="link">
                Music Zone
              </NavLink>
            </li>
            <li>
              <NavLink to="/gaming-hub" className="link">
                Gaming Hub
              </NavLink>
            </li>
            <li>
              <NavLink to="/movie-trailers" className="link">
                Movie Trailers
              </NavLink>
            </li>
          </ul>

          <ul className="nav-links">
            <li>
              <NavLink to="/settings" className="link">
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink to="/help" className="link">
                Help
              </NavLink>
            </li>
            <li>
              <NavLink to="/feedback" className="link">
                Feedback
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Outlet (Main Content) */}
        <main
          className="user-content"
          style={{ float: "right", padding: "0px", paddingTop: "55px" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
