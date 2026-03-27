import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { StudentsPage } from "./pages/StudentsPage";
import { FinancePage } from "./pages/FinancePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import "./App.css";

function App() {
  useEffect(() => {
    useAuthStore.getState().restoreFromStorage();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "TEACHER", "ACCOUNTANT"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "TEACHER"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "TEACHER"]}>
              <div style={{ padding: "20px" }}>
                <h2>Attendance (Coming Soon)</h2>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "TEACHER"]}>
              <div style={{ padding: "20px" }}>
                <h2>Grades (Coming Soon)</h2>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "ACCOUNTANT"]}>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute requiredRoles={["ADMIN", "TEACHER", "ACCOUNTANT"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;