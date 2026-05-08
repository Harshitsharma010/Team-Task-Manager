import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Auth.css";

function Login(props) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  return <LoginClass login={login} navigate={navigate} {...props} />;
}

class LoginClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { email: "", password: "" },
      error: "", loading: false, showPassword: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState(prev => ({
      form: { ...prev.form, [e.target.name]: e.target.value },
    }));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ error: "", loading: true });
    try {
      const { data } = await api.post("/auth/login", this.state.form);
      this.props.login(data.user, data.token);
      this.props.navigate("/dashboard");
    } catch (err) {
      this.setState({ error: err.response?.data?.message || "Invalid credentials." });
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
              <h1>Your team's<br/><em>command center.</em></h1>
              <p>Organize work, track progress, and ship faster — without the noise.</p>
            </div>
            <div className="auth-brand__features">
              {["Kanban boards", "Team workload", "Smart deadlines", "Real-time sync"].map(f => (
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
              <h2>Sign in</h2>
              <p>Enter your credentials to access your workspace</p>
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
              <div className="field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email" name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={this.handleChange}
                  required autoComplete="email" autoFocus
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
                    onChange={this.handleChange}
                    required autoComplete="current-password"
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

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : (
                  <>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 7h10M8 3l4 4-4 4"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              New to Nexus? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
