import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// roleAllowed is a string or array of allowed roles for the route
const ProtectedRoute = ({ roleAllowed }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // No token → not logged in
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(roleAllowed)) {
    if (!roleAllowed.includes(role)) {
      // Logged in but wrong role
      return <Navigate to="/login" replace />;
    }
  } else {
    if (role !== roleAllowed) {
      return <Navigate to="/login" replace />;
    }
  }

  // Authorized, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
