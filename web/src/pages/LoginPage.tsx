import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/auth";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setError = useAuthStore((s) => s.setError);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [schoolIdentifier, setSchoolIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const identifier = schoolIdentifier.trim();
      // If identifier is all digits, treat as schoolId, else as schoolCode
      const isId = /^\d+$/.test(identifier);
      const payload: any = {
        email,
        password,
      };
      if (isId) {
        payload.schoolId = identifier;
      } else {
        payload.schoolCode = identifier;
      }
      const response = await axios.post("/api/v1/auth/login", payload);

      const { user, tokens } = response.data;
      setAuth(user, tokens);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>EduCore SMS - Admin Login</h1>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="login-form-group">
          <label>School ID or Code:</label>
          <input
            type="text"
            value={schoolIdentifier}
            onChange={(e) => setSchoolIdentifier(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <div className="login-form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <div className="login-form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`login-button${isLoading ? " login-button-disabled" : ""}`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
