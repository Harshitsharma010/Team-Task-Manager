import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const finishLogin = (data) => {
    login(data.user, data.token);
    navigate("/dashboard");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      finishLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setDemoLoading(true);
    try {
      const { data } = await api.post("/auth/demo");
      finishLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || "Demo workspace is not available right now.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <section className="auth-brand-panel">
        <Link className="auth-brand-logo" to="/">
          <span className="brand-mark">N</span>
          <span>Nexus Command Center</span>
        </Link>
        <div className="auth-brand-copy">
          <span className="eyebrow">Protected workspace</span>
          <h1>Sign into the team execution layer.</h1>
          <p>Projects, members, role-aware controls, task workflow, comments, and analytics in one polished workspace.</p>
        </div>
        <div className="auth-signal-grid">
          <span>JWT auth</span>
          <span>RBAC</span>
          <span>Kanban</span>
          <span>Analytics</span>
        </div>
      </section>

      <main className="auth-form-panel page-enter">
        <div className="auth-card">
          <div className="auth-form-header">
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in</h2>
            <p>Use your account or jump into the seeded recruiter demo.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button className="btn-primary auth-demo" onClick={handleDemo} disabled={demoLoading || loading}>
            {demoLoading ? <span className="spinner" /> : "Try demo workspace"}
          </button>

          <div className="auth-divider"><span>or use credentials</span></div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-action">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-ghost auth-submit" disabled={loading || demoLoading}>
              {loading ? <span className="spinner" /> : "Continue"}
            </button>
          </form>

          <p className="auth-switch">
            New to Nexus? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
