import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth";

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div style={{ padding: "20px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #ccc",
        }}
      >
        <h1>EduCore SMS Dashboard</h1>
        <div>
          <span>Welcome, {user?.firstName}!</span>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "20px",
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <h2>School Dashboard</h2>

        <nav style={{ marginBottom: "30px" }}>
          <button
            onClick={() => navigate("/students")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Students
          </button>
          <button
            onClick={() => navigate("/attendance")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Attendance
          </button>
          <button
            onClick={() => navigate("/grades")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Grades
          </button>
          {(user?.role === "ADMIN" || user?.role === "ACCOUNTANT") && (
            <button
              onClick={() => navigate("/finance")}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor: "#0a7d32",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Finance
            </button>
          )}
          {(user?.role === "ADMIN" ||
            user?.role === "TEACHER" ||
            user?.role === "ACCOUNTANT") && (
            <button
              onClick={() => navigate("/notifications")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#8a3ffc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Notifications
            </button>
          )}
        </nav>

        <section
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "4px",
          }}
        >
          <h3>Quick Stats</h3>
          <p>Role: {user?.role}</p>
          <p>School: {user?.schoolId}</p>
        </section>
      </main>
    </div>
  );
}
