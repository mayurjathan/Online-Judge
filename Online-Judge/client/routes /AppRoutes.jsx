import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import RegisterPage from "../components/RegisterPage";
import Home from "../components/Home";
import ProblemPage from "../components/ProblemPage";
import Contests from "../components/Contests";
import Leaderboard from "../components/Leaderboard";
import Profile from "../components/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/home" element={<Home />} />
         <Route path="/contests" element={<Contests/>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
           <Route path="/profile" element={<Profile />} />
       <Route path="/problems/:id" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
