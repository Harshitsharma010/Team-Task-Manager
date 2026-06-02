import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Auth.css";

const AVATAR_COLORS = [
  "#317a4f",
  "#a36a00",
  "#b64958",
  "#8253a6",
  "#3f6f92",
  "#7b604c",
];

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    avatar_color: AVATAR_COLORS[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        avatar_color: form.avatar_color,
      });
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
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
          <span className="eyebrow">Create workspace access</span>
          <h1>Start with projects, roles, and real task ownership.</h1>
          <p>Build a workspace, invite members, assign tasks, and track delivery from a focused command center.</p>
        </div>
        <div className="auth-signal-grid">
          <span>Protected routes</span>
          <span>Member roles</span>
          <span>Workload</span>
          <span>Due dates</span>
        </div>
      </section>

      <main className="auth-form-panel page-enter">
        <div className="auth-card">
          <div className="auth-form-header">
            <span className="eyebrow">New workspace</span>
            <h2>Create account</h2>
            <p>Create your admin profile and start a workspace.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" name="name" placeholder="Alex Johnson" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="signup-email">Email address</label>
              <input id="signup-email" type="email" name="email" placeholder="alex@company.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="auth-two">
              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <input id="signup-password" type="password" name="password" placeholder="Min. 6 chars" value={form.password} onChange={handleChange} required minLength={6} />
              </div>
              <div className="field">
                <label htmlFor="signup-confirm">Confirm</label>
                <input id="signup-confirm" type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <p className="field-label">Avatar color</p>
              <div className="color-swatch-group auth-swatches">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${form.avatar_color === color ? "active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setForm((current) => ({ ...current, avatar_color: color }))}
                    aria-label={`Select avatar color ${color}`}
                  />
                ))}
                <span className="avatar" style={{ background: form.avatar_color }}>
                  {form.name ? form.name[0].toUpperCase() : "N"}
                </span>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
