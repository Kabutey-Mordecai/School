import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: string[];
};

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().restoreFromStorage();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
