import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Auth.css";

const AVATAR_COLORS = [
  "#00d4aa", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#10b981",
];

function Signup(props) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  return <SignupClass login={login} navigate={navigate} {...props} />;
}

class SignupClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        name: "", email: "", password: "", confirm: "",
        avatar_color: AVATAR_COLORS[0],
      },
      error: "", loading: false, showPassword: false,
    };
    this.handleChange      = this.handleChange.bind(this);
    this.handleSubmit      = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState(prev => ({
      form: { ...prev.form, [e.target.name]: e.target.value },
    }));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ error: "" });
    const { form } = this.state;
    if (form.password !== form.confirm)
      return this.setState({ error: "Passwords don't match." });
    if (form.password.length < 6)
      return this.setState({ error: "Password must be at least 6 characters." });
    this.setState({ loading: true });
    try {
      const { data } = await api.post("/auth/signup", {
        name: form.name, email: form.email,
        password: form.password, avatar_color: form.avatar_color,
      });
      this.props.login(data.user, data.token);
      this.props.navigate("/dashboard");
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Signup failed. Try again." });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { form, error, loading, showPassword } = this.state;

    return (
      <div className="auth-root">
        {/* ── Left brand panel ── */}
        <div className="auth-brand" aria-hidden="true">
          <div className="auth-brand__content">
            <div className="auth-brand__logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
                <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="var(--accent)" opacity="0.3"/>
              </svg>
              <span className="auth-brand__name">Nexus</span>
            </div>
            <div className="auth-brand__headline">
              <h1>Ship faster<br/><em>as a team.</em></h1>
              <p>Set up your workspace in minutes. Invite your team and start moving.</p>
            </div>
            <div className="auth-brand__features">
              {["Unlimited projects", "Kanban & list views", "Team roles & permissions", "Deadline tracking"].map(f => (
                <div key={f} className="auth-brand__feature">
                  <div className="auth-brand__feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-brand__grid" aria-hidden="true" />
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-form-panel page-enter">
          <div className="auth-form-box">
            <div className="auth-form-header">
              <h2>Create account</h2>
              <p>Join Nexus and start collaborating with your team</p>
            </div>

            {error && (
              <div className="error-banner">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M7 4v3.5M7 10h0" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={this.handleSubmit} className="auth-form" noValidate>
              {/* Full name */}
              <div className="field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text" name="name"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={this.handleChange}
                  required autoFocus autoComplete="name"
                />
              </div>

              {/* Email */}
              <div className="field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email" name="email"
                  placeholder="alex@company.com"
                  value={form.email}
                  onChange={this.handleChange}
                  required autoComplete="email"
                />
              </div>

              {/* Password row */}
              <div className="auth-name-row">
                <div className="field">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-with-action">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 chars"
                      value={form.password}
                      onChange={this.handleChange}
                      required minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="input-action-btn"
                      onClick={() => this.setState(p => ({ showPassword: !p.showPassword }))}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 2l11 11M6.4 6.5A2 2 0 009.5 9.5"/>
                          <path d="M5 3.2C5.9 2.8 6.7 2.5 7.5 2.5c3.3 0 6 4 6 5s-2.7 5-6 5c-.8 0-1.6-.3-2.5-.7"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <ellipse cx="7.5" cy="7.5" rx="6" ry="5"/>
                          <circle cx="7.5" cy="7.5" r="2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="signup-confirm">Confirm</label>
                  <input
                    id="signup-confirm"
                    type="password" name="confirm"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={this.handleChange}
                    required autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Avatar color */}
              <div>
                <p className="avatar-color-label">Avatar color</p>
                <div className="color-swatch-group">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c} type="button"
                      className={`color-swatch ${form.avatar_color === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => this.setState(prev => ({ form: { ...prev.form, avatar_color: c } }))}
                      aria-label={`Select avatar color ${c}`}
                    />
                  ))}
                  <div
                    className="avatar-preview"
                    style={{ background: form.avatar_color }}
                    aria-hidden="true"
                  >
                    {form.name ? form.name[0].toUpperCase() : "?"}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : (
                  <>
                    Create Account
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 7h10M8 3l4 4-4 4"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Signup;
