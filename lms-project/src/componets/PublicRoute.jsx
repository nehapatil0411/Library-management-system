// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    // If logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default PublicRoute;
