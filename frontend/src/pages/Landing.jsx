import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Landing.css";

function MiniMetric({ label, value, tone }) {
  return (
    <div className="landing-metric">
      <span className={`status-pill ${tone}`}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Nexus dashboard preview">
      <div className="preview-toolbar">
        <span className="traffic" aria-hidden="true"><i /><i /><i /></span>
        <span className="mono">DEMO WORKSPACE / SPRINT CONTROL</span>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar">
          <div className="preview-workspace">
            <span className="avatar" style={{ background: "#67d8ff" }}>NX</span>
            <div>
              <strong>Nexus</strong>
              <span>Admin workspace</span>
            </div>
          </div>
          <span className="preview-nav active">Dashboard</span>
          <span className="preview-nav">Projects</span>
          <span className="preview-nav">Kanban</span>
          <span className="preview-nav">My Tasks</span>
        </aside>
        <main className="preview-main">
          <div className="preview-metrics">
            <MiniMetric tone="green" label="Healthy" value="82%" />
            <MiniMetric tone="amber" label="Due soon" value="07" />
            <MiniMetric tone="rose" label="Risk" value="03" />
            <MiniMetric tone="blue" label="RBAC" value="04" />
          </div>
          <div className="preview-grid">
            <section className="preview-panel">
              <div>
                <span className="eyebrow">Team workload</span>
                <h3>Risk by owner</h3>
              </div>
              {[
                ["Aisha", "82%", "#67d8ff"],
                ["Dev", "64%", "#fbbf24"],
                ["Maya", "47%", "#4ade80"],
              ].map(([name, pct, color]) => (
                <div className="preview-bar" key={name}>
                  <span>{name}</span>
                  <div><i style={{ width: pct, background: color }} /></div>
                  <b>{pct}</b>
                </div>
              ))}
            </section>
            <section className="preview-panel">
              <span className="eyebrow">Recent activity</span>
              <div className="preview-activity">
                <span />
                <div>
                  <strong>Protected project created</strong>
                  <p>Admin invited two members.</p>
                </div>
              </div>
              <div className="preview-activity">
                <span />
                <div>
                  <strong>Task moved to review</strong>
                  <p>Due date risk resolved.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startDemo = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/demo");
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Demo workspace is not available right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" to="/">
          <span className="brand-mark">N</span>
          <span>Nexus Command Center</span>
        </Link>
        <nav aria-label="Public navigation">
          <a href="#features">Features</a>
          <Link to="/login">Login</Link>
          <button className="btn-primary" onClick={startDemo} disabled={loading}>
            {loading ? <span className="spinner" /> : "Try demo workspace"}
          </button>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="eyebrow">Recruiter-ready full-stack SaaS</span>
            <h1>Nexus Command Center</h1>
            <p>
              A production-minded team task manager with protected workspaces, role-aware collaboration,
              Kanban workflow, task analytics, comments, and overdue risk tracking.
            </p>
            <div className="landing-actions">
              <button className="btn-primary" onClick={startDemo} disabled={loading}>
                {loading ? <span className="spinner" /> : "Try demo workspace"}
              </button>
              <Link className="btn-ghost" to="/login">Sign in</Link>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <div className="landing-proof" aria-label="Engineering signals">
              <div><strong>JWT + RBAC</strong><span>Protected routes, admin/member controls</span></div>
              <div><strong>Workflow</strong><span>Kanban, review state, comments, task ownership</span></div>
              <div><strong>Analytics</strong><span>Workload, overdue risk, completion health</span></div>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section className="landing-section" id="features">
          <div className="section-heading">
            <span className="eyebrow">What evaluators see</span>
            <h2>Product evidence, not portfolio filler.</h2>
            <p>
              The demo puts real feature depth above the fold, then lets recruiters inspect the actual app.
            </p>
          </div>
          <div className="landing-feature-grid">
            <article>
              <span className="status-pill blue">Auth</span>
              <h3>Protected workspace model</h3>
              <p>JWT auth, persistent sessions, protected app routes, and project-scoped membership.</p>
            </article>
            <article>
              <span className="status-pill green">Analytics</span>
              <h3>Operational dashboard</h3>
              <p>Completion rate, overdue risk, due-soon work, workload distribution, and activity.</p>
            </article>
            <article>
              <span className="status-pill amber">Workflow</span>
              <h3>Kanban with real state</h3>
              <p>Priority, owners, comments, review state, due dates, and persisted status updates.</p>
            </article>
            <article>
              <span className="status-pill rose">Polish</span>
              <h3>States that matter</h3>
              <p>Empty, loading, disabled, error, and mobile layouts treated as first-class product surfaces.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
