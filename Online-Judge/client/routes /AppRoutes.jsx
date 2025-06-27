import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import Home from "../components/Home";
import ProblemPage from "../components/ProblemPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/home" element={<Home />} />
       <Route path="/problems/:id" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
