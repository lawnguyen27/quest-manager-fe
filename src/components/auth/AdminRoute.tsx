import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const AdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.roleName !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
