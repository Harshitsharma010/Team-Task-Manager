import React, { Component } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

/* ── Skeleton Block ── */
function SkeletonBlock({ h = 18, w = "100%" }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: 4 }} />;
}

/* ── Metric Tile ── */
function MetricTile({ label, value, delta, accent, mono }) {
  return (
    <div className={`metric-tile ${accent ? "metric-tile--accent" : ""}`}>
      <span className="metric-tile__label mono">{label}</span>
      <span className={`metric-tile__value ${mono ? "mono" : ""}`}>{value ?? "—"}</span>
      {delta && <span className="metric-tile__delta">{delta}</span>}
    </div>
  );
}

/* ── Segmented Progress ── */
function SegmentBar({ todo, inprogress, done }) {
  const total = todo + inprogress + done || 1;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  return (
    <div className="seg-bar">
      <div className="seg-bar__track">
        <div className="seg-bar__fill seg-todo"     style={{ width: pct(todo) }} />
        <div className="seg-bar__fill seg-progress" style={{ width: pct(inprogress) }} />
        <div className="seg-bar__fill seg-done"     style={{ width: pct(done) }} />
      </div>
      <div className="seg-bar__legend">
        <span><i className="seg-dot seg-todo" />{todo} todo</span>
        <span><i className="seg-dot seg-progress" />{inprogress} active</span>
        <span><i className="seg-dot seg-done" />{done} done</span>
      </div>
    </div>
  );
}

function Dashboard(props) {
  const { user } = useAuth();
  return <DashboardInner user={user} {...props} />;
}

class DashboardInner extends Component {
  state = { stats: null, loading: true, error: "" };

  componentDidMount() {
    api.get("/dashboard")
      .then(r => this.setState({ stats: r.data }))
      .catch(() => this.setState({ error: "Failed to load overview." }))
      .finally(() => this.setState({ loading: false }));
  }

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return "GOOD MORNING";
    if (h < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  }

  renderSkeletons() {
    return (
      <div className="dash-skeletons">
        <div className="metrics-grid">
          {[0,1,2,3].map(i => (
            <div key={i} className="metric-tile">
              <SkeletonBlock h={12} w={80} />
              <SkeletonBlock h={36} w={60} />
            </div>
          ))}
        </div>
        <div className="dash-row">
          <div className="dash-panel"><SkeletonBlock h={80} /></div>
          <div className="dash-panel"><SkeletonBlock h={80} /></div>
        </div>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { stats, loading, error } = this.state;
    const firstName = user?.name?.split(" ")[0] || "there";

    const doneRate = stats
      ? stats.totalTasks > 0
        ? Math.round((stats.done / stats.totalTasks) * 100)
        : 0
      : null;

    return (
      <div className="dashboard page-enter">
        {/* ── Header ── */}
        <div className="dash-header">
          <div className="dash-header__text">
            <span className="dash-header__eyebrow mono">{this.greeting()} ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
            <h1 className="dash-header__title">{firstName}<span className="dash-header__dot">.</span></h1>
          </div>
          <Link to="/projects" className="btn-accent">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New project
          </Link>
        </div>

        {loading ? this.renderSkeletons()
         : error ? <div className="alert-error">{error}</div>
         : (
          <>
            {/* ── Metrics grid ── */}
            <div className="metrics-grid">
              <MetricTile label="total_tasks"   value={stats.totalTasks} accent mono />
              <MetricTile label="completed"     value={stats.done}        delta={doneRate + "% rate"} mono />
              <MetricTile label="in_progress"   value={stats.inProgress} mono />
              <MetricTile label="overdue"       value={stats.overdue}    accent={stats.overdue > 0} mono />
            </div>

            {/* ── Two-col layout ── */}
            <div className="dash-grid">
              {/* Left: breakdown */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title mono">task_breakdown</span>
                  <span className="chip">{stats.totalTasks} total</span>
                </div>
                <SegmentBar todo={stats.todo || 0} inprogress={stats.inProgress || 0} done={stats.done || 0} />
                <div className="completion-ring-wrap">
                  <svg viewBox="0 0 100 100" className="completion-ring">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--rim)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--cyan)" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - doneRate / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s var(--ease)", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                    <text x="50" y="46" textAnchor="middle" fill="var(--fg)" fontSize="18" fontFamily="Syne, sans-serif" fontWeight="700">{doneRate}%</text>
                    <text x="50" y="60" textAnchor="middle" fill="var(--fg-3)" fontSize="8" fontFamily="DM Mono, monospace">complete</text>
                  </svg>
                </div>
              </div>

              {/* Right: team workload */}
              {stats.perUser?.length > 0 && (
                <div className="dash-panel">
                  <div className="dash-panel__header">
                    <span className="dash-panel__title mono">team_workload</span>
                    <span className="chip">{stats.perUser.length} members</span>
                  </div>
                  <div className="workload-list">
                    {stats.perUser.sort((a,b) => b.task_count - a.task_count).map((u) => {
                      const pct = Math.min((u.task_count / (stats.totalTasks || 1)) * 100, 100);
                      return (
                        <div key={u.id} className="workload-row">
                          <div className="avatar" style={{ background: u.avatar_color }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="workload-name">{u.name.split(" ")[0]}</span>
                          <div className="workload-track">
                            <div className="workload-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="workload-count mono">{u.task_count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Overdue alert panel ── */}
            {stats.overdueTasks?.length > 0 && (
              <div className="dash-panel dash-panel--alert">
                <div className="dash-panel__header">
                  <span className="dash-panel__title mono" style={{ color: "var(--rose)" }}>overdue_tasks</span>
                  <span className="chip" style={{ borderColor: "var(--rose)", color: "var(--rose)" }}>{stats.overdueTasks.length}</span>
                </div>
                <div className="overdue-grid">
                  {stats.overdueTasks.map((t) => (
                    <div key={t.id} className="overdue-card">
                      <div className="overdue-card__top">
                        <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                        <span className="overdue-card__date mono">
                          {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="overdue-card__title">{t.title}</p>
                      <p className="overdue-card__project">{t.project_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quick links ── */}
            <div className="dash-links">
              <Link to="/projects" className="dash-link-card">
                <span className="dash-link-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </span>
                <span className="dash-link-card__text">
                  <strong>Projects</strong>
                  <span>Browse all workspaces</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="dash-link-card__arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/tasks" className="dash-link-card">
                <span className="dash-link-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                </span>
                <span className="dash-link-card__text">
                  <strong>My Tasks</strong>
                  <span>Everything assigned to you</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="dash-link-card__arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default Dashboard;
