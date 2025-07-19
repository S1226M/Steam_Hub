import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./Layout/Admin/AdminLayout";
import UserLayout from "./Layout/User/UserLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* OutletCode Here */}
        </Route>

        <Route path="/user" element={<UserLayout />}>
          {/* OutletCode */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
