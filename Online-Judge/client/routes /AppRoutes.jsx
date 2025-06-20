import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage"; // ⬅️ Import this

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* ⬅️ Add this */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
