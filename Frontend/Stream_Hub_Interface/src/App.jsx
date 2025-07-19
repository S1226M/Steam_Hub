import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./Layout/Admin/AdminLayout";
import UserLayout from "./Layout/User/UserLayout";
import Home from "./components/User/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* OutletCode Here */}
        </Route>

        <Route path="/user" element={<UserLayout />}>
          <Route path="home" element={<Home />} />
          {/* <Route path="explore" element={<Explore />} /> */}
          {/* <Route path="subscriptions" element={<Subscriptions />} /> */}
          {/* <Route path="library" element={<Library />} /> */}
        {/* More nested pages */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
