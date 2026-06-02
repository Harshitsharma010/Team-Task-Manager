import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Dashboard.css";

function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton dash-skeleton ${className}`} />;
}

function MetricTile({ label, value, helper, tone = "blue" }) {
  return (
    <article className="metric-tile">
      <span className={`status-pill ${tone}`}>{label}</span>
      <strong className="metric-value">{value ?? "--"}</strong>
      <p>{helper}</p>
    </article>
  );
}

function SegmentBar({ todo = 0, inProgress = 0, review = 0, done = 0 }) {
  const totalTasks = todo + inProgress + review + done;
  const total = totalTasks || 1;
  const pct = (value) => `${(value / total) * 100}%`;

  return (
    <div className="segment-card">
      {totalTasks ? (
        <>
          <div className="segment-track" aria-label="Task status breakdown">
            <span className="seg-todo" style={{ width: pct(todo) }} />
            <span className="seg-progress" style={{ width: pct(inProgress) }} />
            <span className="seg-review" style={{ width: pct(review) }} />
            <span className="seg-done" style={{ width: pct(done) }} />
          </div>
          <div className="segment-legend">
            <span><i className="seg-todo" />{todo} todo</span>
            <span><i className="seg-progress" />{inProgress} active</span>
            <span><i className="seg-review" />{review} review</span>
            <span><i className="seg-done" />{done} done</span>
          </div>
        </>
      ) : (
        <div className="segment-empty">
          <strong>No tasks yet</strong>
          <span>Create a project task to start tracking delivery state.</span>
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/dashboard")
      .then((response) => alive && setStats(response.data))
      .catch(() => alive && setError("Failed to load workspace overview."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const health = useMemo(() => {
    if (!stats?.totalTasks) return 0;
    return Math.round((stats.done / stats.totalTasks) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="dashboard page-enter">
        <div className="dash-hero">
          <SkeletonBlock className="dash-skeleton-title" />
          <SkeletonBlock className="dash-skeleton-copy" />
        </div>
        <div className="metrics-grid">
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </div>
      </div>
    );
  }

  if (error) return <div className="alert-error">{error}</div>;

  const firstName = user?.name?.split(" ")[0] || "there";
  const totalTasks = stats.totalTasks || 0;

  return (
    <div className="dashboard page-enter">
      <section className="dash-hero">
        <div>
          <span className="eyebrow">Workspace command center</span>
          <h2>Good to see you, {firstName}.</h2>
          <p>Track delivery health, owner load, overdue risk, and recent collaboration across every project you can access.</p>
        </div>
        <div className="dash-hero-actions">
          <Link className="btn-ghost" to="/tasks">Review my queue</Link>
          <Link className="btn-primary" to="/projects">New project</Link>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Workspace metrics">
        <MetricTile label="Completion" value={`${health}%`} helper={totalTasks ? `${stats.done} of ${totalTasks} tasks done` : "No tasks created yet"} tone="green" />
        <MetricTile label="Due soon" value={stats.dueSoon || 0} helper={stats.dueSoon ? "Due in the next 7 days" : "No upcoming deadlines"} tone="amber" />
        <MetricTile label="Overdue" value={stats.overdue || 0} helper={stats.overdue ? "Needs owner attention" : "Everything is on schedule"} tone={stats.overdue ? "rose" : "green"} />
        <MetricTile label="Review" value={stats.review || 0} helper={stats.review ? "Waiting for final pass" : "No items in review"} tone="blue" />
      </section>

      <section className="dash-grid">
        <article className="dash-panel dash-panel-large">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Task breakdown</span>
              <h3>Delivery state</h3>
            </div>
            <span className="chip">{stats.totalTasks} total</span>
          </div>
          <SegmentBar
            todo={stats.todo || 0}
            inProgress={stats.inProgress || 0}
            review={stats.review || 0}
            done={stats.done || 0}
          />
          <div className={`health-ring${totalTasks ? "" : " health-ring-empty"}`}>
            <svg viewBox="0 0 120 120" role="img" aria-label={`${health}% completion rate`}>
              <circle cx="60" cy="60" r="48" />
              <circle
                cx="60"
                cy="60"
                r="48"
                className="health-ring-fill"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - health / 100)}
              />
            </svg>
            <div className="health-ring-label">
              <strong>{health}%</strong>
              <span>{totalTasks ? "complete" : "not started"}</span>
            </div>
          </div>
        </article>

        <article className="dash-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Team workload</span>
              <h3>Risk by owner</h3>
            </div>
            <span className="chip">{stats.perUser?.length || 0} members</span>
          </div>
          <div className="workload-list">
            {stats.perUser?.length ? stats.perUser
              .slice()
              .sort((a, b) => b.task_count - a.task_count)
              .map((member) => {
                const pct = Math.min((member.task_count / (stats.totalTasks || 1)) * 100, 100);
                return (
                  <div className="workload-row" key={member.id}>
                    <span className="avatar" style={{ background: member.avatar_color }}>{member.name[0]}</span>
                    <div>
                      <strong>{member.name.split(" ")[0]}</strong>
                      <span>{member.task_count} assigned</span>
                    </div>
                    <div className="workload-track"><i style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              }) : <p className="empty-copy">No assigned work yet.</p>}
          </div>
        </article>

        <article className="dash-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Overdue risk</span>
              <h3>Needs attention</h3>
            </div>
            <span className={`status-pill ${stats.overdue ? "rose" : "green"}`}>{stats.overdue || 0}</span>
          </div>
          <div className="overdue-list">
            {stats.overdueTasks?.length ? stats.overdueTasks.slice(0, 4).map((task) => (
              <div className="risk-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.project_name}</span>
                </div>
                <span className="status-pill rose">{formatDate(task.due_date)}</span>
              </div>
            )) : <p className="empty-copy">No overdue work right now.</p>}
          </div>
        </article>

        <article className="dash-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Recent activity</span>
              <h3>Team context</h3>
            </div>
          </div>
          <div className="activity-list">
            {stats.recentActivity?.length ? stats.recentActivity.map((item) => (
              <div className="activity-row" key={item.id}>
                <span className="activity-dot" />
                <div>
                  <strong>{item.author_name}</strong>
                  <p>{item.body}</p>
                  <small>{item.task_title}</small>
                </div>
              </div>
            )) : <p className="empty-copy">Comments will appear here as the team collaborates.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
