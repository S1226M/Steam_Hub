import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./Layout/Admin/AdminLayout";
import UserLayout from "./Layout/User/UserLayout";
import Home from "./components/User/Home";
import Explore from "./components/User/Explore";
import Subscriptions from "./components/User/Subscriptions";
import Library from "./components/User/Library";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* User routes */}
        <Route path="/user/*" element={<UserLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="library" element={<Library />} />
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

        {/* Default redirect to user home */}
        <Route path="/" element={<Navigate to="/user/home" replace />} />
        <Route path="*" element={<Navigate to="/user/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
